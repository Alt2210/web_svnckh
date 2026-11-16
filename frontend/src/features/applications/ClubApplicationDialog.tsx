import { useEffect, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { listMyClubs } from '../../services/clubs.service';
import { resendConfirmation } from '../../services/auth.service';
import { readableError } from '../../lib/errors';
import { Notice } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { ClubApplicationForm } from './ClubApplicationForm';

export default function ClubApplicationDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const auth = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; element.showModal();
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const query = useAsyncData(() => auth.session && auth.profile ? listMyClubs(auth.session.user.id) : Promise.resolve([]), `${auth.session?.user.id}:${auth.loading}:${auth.profile?.id}`);
  const back = () => { setSelected(null); query.reload(); };
  return <dialog className="club-application-dialog portal" ref={dialog} aria-labelledby="application-dialog-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }}>
    <header className="application-dialog-header"><div><span className="portal-eyebrow">THAM GIA MẠNG LƯỚI</span><h2 id="application-dialog-title">Hồ sơ câu lạc bộ</h2></div><button type="button" className="application-dialog-close" aria-label="Đóng hồ sơ câu lạc bộ" onClick={onClose}><X size={22} /></button></header>
    <div className="application-dialog-body">{auth.loading ? <p role="status">Đang tải tài khoản…</p> : !auth.session ? <><p>Đăng nhập để nộp hồ sơ và theo dõi kết quả ngay tại trang chủ.</p><a className="p-btn" href="#/dang-nhap?next=clb">Đăng nhập để nộp hồ sơ</a><p>Chưa có tài khoản? <a className="text-button" href="#/dang-ky?next=clb">Đăng ký</a></p></> : !auth.session.user.email_confirmed_at ? <><Notice>Vui lòng xác minh email trước khi nộp hồ sơ.</Notice>{message && <Notice>{message}</Notice>}<button className="p-btn secondary" onClick={() => { void resendConfirmation(auth.session!.user.email!).then(() => setMessage('Đã yêu cầu gửi lại email xác minh.')).catch((error) => setMessage(readableError(error))); }}>Gửi lại email xác minh</button></> : auth.error || !auth.profile || auth.profile.status === 'locked' ? <Notice tone="error">{auth.error || 'Tài khoản hiện chưa thể nộp hồ sơ. Vui lòng đăng nhập lại hoặc liên hệ quản trị.'}</Notice> : selected !== null ? <ClubApplicationForm key={selected} initialId={selected || undefined} onBack={back} /> : <>
      <p>Khai báo thông tin, đính kèm minh chứng và gửi hồ sơ. Kết quả và yêu cầu bổ sung sẽ được lưu trong từng hồ sơ.</p>
      <div className="page-actions"><button className="p-btn" onClick={() => setSelected('')}><Plus size={17} />Nộp hồ sơ mới</button><button className="text-button" onClick={query.reload} disabled={query.loading}>Cập nhật</button></div>
      {query.error && <Notice tone="error">{query.error}</Notice>}{query.loading ? <p role="status">Đang tải hồ sơ…</p> : query.data?.length ? <div className="application-picker">{query.data.map((club) => <button key={club.id} onClick={() => setSelected(club.id)}><span><strong>{club.name}</strong><small>{club.university}</small></span><StatusBadge status={club.membership} /><span aria-hidden="true">→</span></button>)}</div> : !query.error && <div className="empty-state"><h3>Bắt đầu với câu lạc bộ của bạn</h3><p>Hồ sơ đã lưu và đã gửi sẽ xuất hiện ở đây.</p></div>}
    </>}</div>
  </dialog>;
}
