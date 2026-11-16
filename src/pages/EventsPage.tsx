import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState, Notice, PortalLayout } from '../components/PortalLayout';
import { useAsyncData } from '../hooks/useAsyncData';
import { database, readableError } from '../lib/supabase';
import { eligibleClubs, eventRpc, loadEvent, registrationOpen } from '../lib/events';
import { dateLabel, eventLabels, type EventFeedback, type EventRegistration, type NetworkEvent } from '../types/domain';

export function EventShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const auth = useAuth();
  if (auth.session) return <PortalLayout title={title} subtitle={subtitle}>{children}</PortalLayout>;
  return <div className="portal events-public"><header className="portal-header"><a className="portal-brand" href="#/">SVNCKH NETWORK</a><a className="p-btn secondary" href="#/dang-nhap">Đăng nhập</a></header><main className="events-public-main"><a className="p-back" href="#/">← Trang chủ</a><div className="portal-heading"><div><span className="portal-eyebrow">CÙNG NHAU HOẠT ĐỘNG</span><h1>{title}</h1><p>{subtitle}</p></div></div>{children}</main></div>;
}
export function EventTag({ value }: { value: string }) { return <span className={`event-tag event-tag-${value}`}>{eventLabels[value] || value}</span>; }
export function EventCard({ event, children }: { event: NetworkEvent; children?: ReactNode }) {
  return <article className="event-card"><div className="event-card-top"><span>{event.category}</span><EventTag value={event.status} /></div><h2><a href={`#/hoat-dong/${event.id}`}>{event.title}</a></h2><div className="event-meta"><span><CalendarDays size={17} />{dateLabel(event.starts_at)}</span><span><MapPin size={17} />{eventLabels[event.mode]}{event.location ? ` · ${event.location}` : ''}</span><span><Users size={17} />{event.registered_count}/{event.capacity} chỗ · {event.waitlist_count} đang chờ</span></div><p className="event-summary">{event.description}</p><div className="event-card-bottom"><a className="text-button" href={`#/hoat-dong/${event.id}`}>Xem chi tiết <ArrowUpRight size={15} /></a>{children}</div></article>;
}
export default function EventsPage() {
  const auth = useAuth();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('upcoming');
  const query = useAsyncData(async () => {
    const { data, error } = await database().from('events').select('*').in('status', ['published', 'completed', 'cancelled']).order('starts_at').limit(200);
    if (error) throw error; return (data || []) as NetworkEvent[];
  }, `events:${auth.session?.user.id || ''}:${auth.aal2}`);
  const events = query.data?.filter((e) => `${e.title} ${e.category} ${e.location}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')) && (period === 'all' || (period === 'upcoming' ? new Date(e.ends_at).getTime() > Date.now() && e.status !== 'cancelled' : new Date(e.ends_at).getTime() <= Date.now() || e.status === 'cancelled')));
  return <EventShell title="Hoạt động & sự kiện" subtitle="Gặp gỡ, học hỏi và cùng tạo nên những kết nối mới."><div className="page-actions"><p>Đăng ký một chỗ cho bạn. Khi đủ chỗ, bạn có thể tham gia danh sách chờ.</p>{auth.session && <a className="p-btn secondary" href="#/dang-ky-hoat-dong">Đăng ký của tôi</a>}</div><div className="table-toolbar event-filters"><label className="p-label">Tìm hoạt động<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tên, chủ đề hoặc địa điểm…" type="search" /></label><label className="p-label">Thời gian<select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="upcoming">Sắp diễn ra</option><option value="past">Đã kết thúc / đã hủy</option><option value="all">Tất cả</option></select></label><button className="p-btn secondary" onClick={query.reload} disabled={query.loading}>Làm mới</button></div>{query.error && <Notice tone="error">{query.error}</Notice>}{query.loading ? <Notice>Đang tải hoạt động…</Notice> : events?.length ? <div className="events-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : !query.error && <EmptyState title="Chưa có hoạt động phù hợp" description="Bạn có thể thay đổi bộ lọc hoặc quay lại sau khi ban tổ chức công bố chương trình mới." />}</EventShell>;
}

export function EventDetailPage({ id }: { id: string }) {
  const auth = useAuth();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState(''), [confirmCancel, setConfirmCancel] = useState(false);
  const query = useAsyncData(async () => {
    const event = await loadEvent(id);
    if (!auth.session) return { event, registration: null, access: '', feedback: null, manager: false };
    const [registration, access, feedback, clubs] = await Promise.all([
      database().from('event_registrations').select('*').eq('event_id', id).eq('user_id', auth.session.user.id).maybeSingle(),
      database().from('event_access').select('meeting_url').eq('event_id', id).maybeSingle(),
      database().from('event_feedback').select('rating,comment').eq('event_id', id).eq('user_id', auth.session.user.id).maybeSingle(),
      eligibleClubs(auth.session.user.id),
    ]);
    for (const result of [registration, access, feedback]) if (result.error) throw result.error;
    return { event, registration: registration.data as EventRegistration | null, access: String(access.data?.meeting_url || ''), feedback: feedback.data as EventFeedback | null, manager: (auth.roles.includes('admin') && auth.aal2) || clubs.some((club) => club.id === event.organizer_club_id) };
  }, `${id}:${auth.session?.user.id}:${auth.aal2}`);
  async function act(name: string, args: Record<string, unknown>, success: string) {
    setBusy(true); setError(''); setMessage('');
    try { const result = await eventRpc(name, args); setMessage(result === 'waitlisted' ? 'Bạn đã vào danh sách chờ. Khi có chỗ trống, hệ thống sẽ chuyển lượt theo thứ tự đăng ký.' : success); setConfirmCancel(false); query.reload(); }
    catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  function feedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void act('save_event_feedback', { p_event: id, p_rating: Number(form.get('rating')), p_comment: form.get('comment') }, 'Đã lưu phản hồi. Cảm ơn bạn!');
  }
  const data = query.data, event = data?.event, registration = data?.registration;
  const active = registration && ['registered', 'waitlisted', 'attended'].includes(registration.status);
  return <EventShell title={event?.title || 'Chi tiết hoạt động'} subtitle="Thời gian hiển thị theo giờ Việt Nam (GMT+7)."><a className="p-back" href="#/hoat-dong">← Tất cả hoạt động</a>{query.error && <Notice tone="error">{query.error}</Notice>}{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}{query.loading && <Notice>Đang tải thông tin…</Notice>}{event && <><div className="event-detail-grid"><article className="p-card"><div className="detail-status"><EventTag value={event.status} /><EventTag value={event.mode} /><EventTag value={event.visibility} /></div><span className="portal-eyebrow">{event.category} · {event.organizer_club_id ? 'HOẠT ĐỘNG CẤP CLB' : 'HOẠT ĐỘNG CẤP MẠNG LƯỚI'}</span><h2>Về chương trình</h2><p className="event-description">{event.description}</p>{event.cancellation_reason && <Notice tone="error">Lý do hủy: {event.cancellation_reason}</Notice>}<dl className="event-facts"><dt>Bắt đầu</dt><dd>{dateLabel(event.starts_at)}</dd><dt>Kết thúc</dt><dd>{dateLabel(event.ends_at)}</dd><dt>Địa điểm</dt><dd>{event.location || 'Trực tuyến · link dành cho người được xác nhận'}</dd><dt>Nhận đăng ký</dt><dd>{dateLabel(event.registration_opens_at)} — {dateLabel(event.registration_closes_at)}</dd></dl>{data?.access && <a className="p-btn secondary" href={data.access} target="_blank" rel="noopener noreferrer">Mở phòng tham gia <ArrowUpRight size={17} /></a>}</article><aside className="p-card event-register"><CalendarDays size={32} /><h2>Hẹn bạn tại chương trình</h2><p><strong>{event.registered_count} / {event.capacity}</strong> chỗ đã xác nhận</p><progress value={event.registered_count} max={event.capacity} aria-label="Số chỗ đã đăng ký" /><p>{event.waitlist_count} người đang chờ. Có chỗ trống, lượt chờ được chuyển theo thứ tự.</p>{registration && <p>Đăng ký của bạn: <EventTag value={registration.status} /></p>}{!auth.session ? <><p>Đăng nhập và xác minh email để đăng ký.</p><a className="p-btn" href="#/dang-nhap">Đăng nhập để tham gia</a></> : active ? <>{registration.status === 'waitlisted' && <Notice>Lượt chờ chưa xác nhận chỗ tham gia. Bấm “Cập nhật trạng thái” để kiểm tra.</Notice>}{['registered', 'waitlisted'].includes(registration.status) && new Date(event.starts_at).getTime() > Date.now() && event.status === 'published' && (confirmCancel ? <div className="event-confirm"><p>Bạn muốn hủy lượt đăng ký này? Chỗ trống sẽ dành cho lượt chờ tiếp theo.</p><button className="p-btn danger" disabled={busy} onClick={() => { void act('cancel_event_registration', { p_event: id }, 'Đã hủy đăng ký.'); }}>Xác nhận hủy</button><button className="text-button" onClick={() => setConfirmCancel(false)}>Giữ đăng ký</button></div> : <button className="p-btn secondary" disabled={busy} onClick={() => setConfirmCancel(true)}>Hủy đăng ký</button>)}</> : registrationOpen(event) ? <button className="p-btn" disabled={busy || !auth.profile} onClick={() => { void act('register_event', { p_event: id }, 'Đăng ký thành công. Chỗ của bạn đã được xác nhận.'); }}>{busy ? 'Đang xử lý…' : event.registered_count >= event.capacity ? 'Tham gia danh sách chờ' : 'Đăng ký tham gia'}</button> : <Notice>Hoạt động chưa mở hoặc đã đóng đăng ký.</Notice>}<button className="text-button" disabled={busy || query.loading} onClick={query.reload}>Cập nhật trạng thái</button>{data?.manager && <a className="p-btn secondary" href={`#/quan-ly-hoat-dong/${id}/nguoi-tham-gia`}>Quản lý người tham gia</a>}</aside></div>{registration && ['registered', 'attended'].includes(registration.status) && new Date(event.ends_at).getTime() <= Date.now() && ['published', 'completed'].includes(event.status) && <section className="p-card form-card"><h2>Chia sẻ sau chương trình</h2><p>Phản hồi của bạn chỉ được ban tổ chức và bạn xem.</p><form className="p-form" onSubmit={feedback} key={`${id}:${data?.feedback?.rating}:${data?.feedback?.comment}`}><label>Đánh giá<select name="rating" defaultValue={data?.feedback?.rating || 5}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label><label>Góp ý<textarea name="comment" defaultValue={data?.feedback?.comment || ''} rows={4} maxLength={2000} /></label><button className="p-btn" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu phản hồi'}</button></form></section>}</>}</EventShell>;
}

export function MyEventRegistrationsPage() {
  const auth = useAuth();
  const query = useAsyncData(async () => {
    const { data, error } = await database().from('event_registrations').select('*').eq('user_id', auth.session!.user.id).order('updated_at', { ascending: false });
    if (error) throw error;
    const registrations = (data || []) as EventRegistration[];
    if (!registrations.length) return [];
    const result = await database().from('events').select('*').in('id', registrations.map((r) => r.event_id));
    if (result.error) throw result.error;
    return registrations.map((registration) => ({ registration, event: (result.data as NetworkEvent[]).find((e) => e.id === registration.event_id) }));
  }, auth.session!.user.id);
  return <PortalLayout title="Đăng ký hoạt động của tôi" subtitle="Theo dõi chỗ đã xác nhận, danh sách chờ và các chương trình bạn đã tham dự."><div className="page-actions"><a className="p-btn" href="#/hoat-dong">Khám phá hoạt động</a><button className="p-btn secondary" disabled={query.loading} onClick={query.reload}>Cập nhật trạng thái</button></div>{query.error && <Notice tone="error">{query.error}</Notice>}{query.loading && <Notice>Đang tải đăng ký…</Notice>}{query.data?.length ? <div className="events-grid">{query.data.map(({ event, registration }) => event ? <EventCard key={registration.id} event={event}><EventTag value={registration.status} /></EventCard> : <article className="p-card" key={registration.id}><p>Hoạt động hiện không thể hiển thị.</p><EventTag value={registration.status} /></article>)}</div> : !query.loading && !query.error && <EmptyState title="Bạn chưa đăng ký hoạt động nào" description="Tìm một chủ đề quan tâm và bắt đầu kết nối với cộng đồng." />}</PortalLayout>;
}
