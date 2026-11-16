import { useEffect, useRef } from 'react';

export function SubmissionNotice({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <dialog ref={dialogRef} className="submission-notice" aria-labelledby="submission-title" aria-describedby="submission-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <h2 id="submission-title">Tính năng đang cập nhật</h2>
      <p id="submission-description">Cổng nộp hồ sơ đang được hoàn thiện. Vui lòng theo dõi thông báo chính thức của Mạng lưới để biết thời gian và hướng dẫn đăng ký.</p>
      <button type="button" className="button button-dark" onClick={onClose}>Đã hiểu</button>
    </dialog>
  );
}
