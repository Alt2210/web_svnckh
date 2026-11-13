import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

interface Activity {
  tag: string;
  title: string;
  text: string;
  mark: string;
  details: string[];
}

export function ActivityCarousel({ items }: { items: Activity[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: false, index: 1, progress: 0 });

  function updatePosition() {
    const rail = railRef.current;
    if (!rail) return;
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const cards = [...rail.querySelectorAll<HTMLElement>('.activity-card')];
    const left = rail.getBoundingClientRect().left;
    const nearest = cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left - left) < Math.abs(cards[best].getBoundingClientRect().left - left) ? index : best, 0);
    setPosition({ start: rail.scrollLeft <= 2, end: rail.scrollLeft >= max - 2, index: rail.scrollLeft >= max - 2 ? items.length : nearest + 1, progress: max ? rail.scrollLeft / max : 1 });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [items.length]);

  function move(direction: number) {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>('.activity-card');
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  return (
    <>
      <div className="activity-controls">
        <p id="activity-instructions">Vuốt ngang, kéo thanh cuộn hoặc dùng nút mũi tên.</p>
        <div className="activity-arrows">
          <button type="button" aria-label="Xem hoạt động trước" aria-controls="activity-rail" disabled={position.start} onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Xem hoạt động tiếp theo" aria-controls="activity-rail" disabled={position.end} onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div ref={railRef} id="activity-rail" className="activity-grid" role="region" aria-label="Các hoạt động của Mạng lưới" aria-describedby="activity-instructions" tabIndex={0} onScroll={updatePosition} onKeyDown={onKeyDown}>
        {items.map((item, index) => (
          <article className={`activity-card activity-${index + 1}`} key={item.tag}>
            <div className="activity-art"><span className="activity-art-index">0{index + 1} / 0{items.length}</span><span className="activity-art-mark">{item.mark}</span><span className="activity-art-label">{item.tag}</span></div>
            <div className="activity-card-copy"><span className="card-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><ul className="activity-details">{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><a href="#tham-gia" aria-label={`Tìm hiểu về ${item.tag.toLowerCase()}`}><span aria-hidden="true">↗</span></a></div>
          </article>
        ))}
      </div>
      <div className="activity-progress"><span>KHÁM PHÁ CÁC KHẢ NĂNG</span><i aria-hidden="true"><b style={{ transform: `scaleX(${0.05 + position.progress * 0.95})` }} /></i><span aria-live="polite">0{position.index} / 0{items.length}</span></div>
    </>
  );
}
