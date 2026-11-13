import { useEffect, useState } from 'react';

export function useActiveSection() {
  const [activeId, setActiveId] = useState('trang-chu');
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveId(visible.target.id);
    }, { rootMargin: '-90px 0px -45% 0px', threshold: [0, 0.1, 0.5] });
    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return activeId;
}
