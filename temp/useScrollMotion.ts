import { useEffect, type RefObject } from 'react';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Scrub scene progress without rerendering React or intercepting native scrolling. */
export function useScrollMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};

    function setup() {
      dispose();
      if (!root) return;
      if (preference.matches) {
        root.classList.remove('motion-ready');
        return;
      }
      const scenes = [...root.querySelectorAll<HTMLElement>('[data-scene]')];
      const reveals = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
      const rail = root.querySelector<HTMLElement>('.activity-grid');
      let frame = 0;
      let alive = true;
      let currentY = window.scrollY;
      let targetY = currentY;
      let viewport = window.innerHeight;
      let compact = window.innerWidth <= 680;
      let documentHeight = document.documentElement.scrollHeight;
      let measurements: { element: HTMLElement; top: number; height: number }[] = [];

      const measure = () => {
        viewport = window.innerHeight;
        compact = window.innerWidth <= 680;
        documentHeight = document.documentElement.scrollHeight;
        measurements = scenes.map((element) => ({
          element,
          top: element.getBoundingClientRect().top + window.scrollY,
          height: element.offsetHeight,
        }));
        if (rail) root.style.setProperty('--rail-travel', `${Math.max(0, rail.scrollWidth - rail.clientWidth)}px`);
      };

      const render = () => {
        currentY += (targetY - currentY) * 0.13;
        if (Math.abs(targetY - currentY) < 0.2) currentY = targetY;
        root.style.setProperty('--page-progress', String(clamp(currentY / Math.max(1, documentHeight - viewport))));
        root.classList.toggle('is-scrolled', targetY > 50);
        for (const { element, top, height } of measurements) {
          const pinned = element.hasAttribute('data-pinned') && !compact;
          const progress = pinned
            ? clamp((currentY - top) / Math.max(1, height - viewport))
            : clamp((currentY + viewport - top) / (height + viewport));
          element.style.setProperty('--scene-progress', progress.toFixed(5));
        }
        frame = currentY !== targetY ? requestAnimationFrame(render) : 0;
      };
      const requestFrame = () => { if (!frame) frame = requestAnimationFrame(render); };
      const onScroll = () => { targetY = window.scrollY; requestFrame(); };
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-visible', 'true');
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });

      // Observe before enabling reveals so unsupported or reduced-motion states stay readable.
      reveals.forEach((element) => observer.observe(element));
      root.classList.add('motion-ready');
      measure();
      requestFrame();
      window.addEventListener('scroll', onScroll, { passive: true });
      const resize = new ResizeObserver(() => { measure(); requestFrame(); });
      resize.observe(root);
      window.addEventListener('resize', measure);
      void document.fonts.ready.then(() => { if (alive) { measure(); requestFrame(); } });

      dispose = () => {
        alive = false;
        cancelAnimationFrame(frame);
        observer.disconnect();
        resize.disconnect();
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', measure);
        root.classList.remove('motion-ready');
      };
    }
    setup();
    preference.addEventListener('change', setup);
    return () => { dispose(); preference.removeEventListener('change', setup); };
  }, [rootRef]);
}
