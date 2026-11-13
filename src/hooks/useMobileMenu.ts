import { useCallback, useEffect, useState, type RefObject } from 'react';

export function useMobileMenu(header: RefObject<HTMLElement | null>) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) close();
    };
    const breakpoint = window.matchMedia('(min-width: 1280px)');
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    breakpoint.addEventListener('change', close);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
      breakpoint.removeEventListener('change', close);
    };
  }, [isOpen, close, header]);
  return { isOpen, close, toggle: () => setIsOpen((open) => !open) };
}
