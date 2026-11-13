import { useEffect, useRef, type RefObject } from 'react';
import type { DialogContent } from '../../types/dialog';

interface DetailDialogProps {
  content: DialogContent | null;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}

export function DetailDialog({ content, onClose, triggerRef }: DetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialogRef.current;
    if (!content || !element) return;
    const trigger = triggerRef.current;
    element.showModal();
    document.body.classList.add('dialog-open');
    return () => {
      element.close();
      document.body.classList.remove('dialog-open');
      trigger?.focus();
    };
  }, [content, triggerRef]);

  return (
    <dialog ref={dialogRef} className="detail-dialog" aria-labelledby="dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="dialog-topline">SVNCKH-NET
        <button type="button" className="dialog-close" aria-label="Đóng hộp thoại" onClick={onClose}>✕</button>
      </div>
      <h2 id="dialog-title">{content?.title}</h2>
      <div>{content?.paragraphs.map((text) => <p key={text}>{text}</p>)}</div>
      <button type="button" className="dialog-confirm" onClick={onClose}>Đã hiểu</button>
    </dialog>
  );
}
