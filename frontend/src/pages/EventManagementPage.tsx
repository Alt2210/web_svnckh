import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState, Notice, PortalLayout } from '../components/PortalLayout';
import { useAsyncData } from '../hooks/useAsyncData';
import { readableError } from '../lib/errors';
import { loadOrganizerEvents, loadEventEditor, loadEventAttendees, eventRpc, type EventOperation } from '../services/events.service';
import { localDateInput } from '../lib/events';
import { navigate } from '../lib/navigation';
import { downloadCsv } from '../lib/csv';
import { dateLabel, eventLabels, type EventAttendee } from '../types/domain';
import { EventCard, EventTag } from './EventsPage';

function useOrganizerData() {
  const auth = useAuth();
  const admin = auth.roles.includes('admin');
  const query = useAsyncData(() => loadOrganizerEvents(auth.session!.user.id, admin && auth.aal2), `${auth.session!.user.id}:${admin}:${auth.aal2}`);
  return { ...query, admin: admin && auth.aal2, needsMfa: admin && !auth.aal2 };
}

export default function EventManagementPage() {
  const query = useOrganizerData();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState<string | null>(null), [reason, setReason] = useState('');
  async function act(fn: EventOperation, args: Record<string, unknown>, success: string) {
    setBusy(true); setError(''); setMessage('');
    try { await eventRpc(fn, args); setMessage(success); setCancelling(null); setReason(''); query.reload(); }
    catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  const canCreate = query.admin || Boolean(query.data?.clubs.length);
  const events = query.data?.events.filter((e) => filter === 'all' || e.status === filter);
  return <PortalLayout title="Tổ chức hoạt động" subtitle="Chuẩn bị chương trình, công bố đăng ký và theo dõi người tham gia.">
    {query.needsMfa && <Notice>Quản lý hoạt động cấp Mạng lưới cần xác thực hai bước. <a href="#/bao-mat">Mở bảo mật tài khoản →</a></Notice>}
    <div className="page-actions"><p>Admin tổ chức hoạt động cấp Mạng lưới; đại diện CLB đã được công nhận tổ chức hoạt động của CLB.</p>{canCreate && <a className="p-btn" href="#/quan-ly-hoat-dong/tao">+ Tạo hoạt động</a>}</div>
    {error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}{query.error && <Notice tone="error">{query.error}</Notice>}
    <div className="table-toolbar event-filters"><label className="p-label">Trạng thái<select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Tất cả</option>{['draft', 'published', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{eventLabels[s]}</option>)}</select></label><button className="p-btn secondary" disabled={busy || query.loading} onClick={query.reload}>Làm mới</button></div>
    {query.loading ? <Notice>Đang tải hoạt động…</Notice> : events?.length ? <div className="events-grid">{events.map((event) => <div key={event.id}><EventCard event={event} /><div className="event-management-actions">
      <a className="p-btn secondary" href={`#/quan-ly-hoat-dong/${event.id}/nguoi-tham-gia`}>Người tham gia</a>
      {!['cancelled', 'completed'].includes(event.status) && <><a className="p-btn secondary" href={`#/quan-ly-hoat-dong/${event.id}/sua`}>Chỉnh sửa</a>
        {event.status === 'draft' && <button className="p-btn" disabled={busy} onClick={() => { void act('set_event_status', { p_event: event.id, p_status: 'published', p_reason: '' }, 'Đã công bố hoạt động.'); }}>Công bố hoạt động</button>}
        {event.status === 'published' && <><button className="p-btn secondary" disabled={busy} onClick={() => { void act('toggle_event_registration', { p_event: event.id, p_open: !event.registration_enabled }, event.registration_enabled ? 'Đã tạm dừng nhận đăng ký.' : 'Đã bật nhận đăng ký trong thời hạn.'); }}>{event.registration_enabled ? 'Tạm dừng đăng ký' : 'Bật nhận đăng ký'}</button>
          {new Date(event.ends_at).getTime() <= Date.now() && <button className="p-btn" disabled={busy} onClick={() => { void act('set_event_status', { p_event: event.id, p_status: 'completed', p_reason: '' }, 'Đã kết thúc hoạt động.'); }}>Đánh dấu kết thúc</button>}</>}
        <button className="text-button" disabled={busy} onClick={() => { setCancelling(event.id); setReason(''); }}>Hủy hoạt động…</button></>}
    </div>{cancelling === event.id && <form className="p-card p-form event-cancel-form" onSubmit={(e) => { e.preventDefault(); void act('set_event_status', { p_event: event.id, p_status: 'cancelled', p_reason: reason }, 'Đã hủy hoạt động và các lượt đăng ký còn hiệu lực.'); }}><Notice>Người tham gia sẽ thấy lý do hủy. Lịch sử đăng ký được giữ lại.</Notice><label>Lý do hủy<textarea required minLength={5} maxLength={1000} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></label><div className="form-actions"><button className="p-btn danger" disabled={busy}>Xác nhận hủy hoạt động</button><button type="button" className="p-btn secondary" disabled={busy} onClick={() => setCancelling(null)}>Quay lại</button></div></form>}</div>)}</div> : !query.error && <EmptyState title={canCreate ? 'Chưa có hoạt động phù hợp' : 'Chưa có quyền tổ chức hoạt động'} description={canCreate ? 'Tạo bản nháp và kiểm tra thông tin trước khi công bố.' : 'Bạn cần là đại diện của CLB đang hoạt động đã được công nhận, hoặc admin đã xác thực hai bước.'} />}
  </PortalLayout>;
}

export function EventEditorPage({ id }: { id?: string }) {
  const auth = useAuth();
  const admin = auth.roles.includes('admin') && auth.aal2;
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const query = useAsyncData(() => loadEventEditor(id, auth.session!.user.id, admin), `${id || 'new'}:${auth.session!.user.id}:${admin}`);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget); setError('');
    const payload: Record<string, unknown> = Object.fromEntries(form.entries());
    payload.capacity = Number(payload.capacity);
    for (const name of ['starts_at', 'ends_at', 'registration_opens_at', 'registration_closes_at']) payload[name] = new Date(String(payload[name])).toISOString();
    if (id) payload.organizer_club_id = query.data?.event?.organizer_club_id || '';
    if (new Date(String(payload.ends_at)) <= new Date(String(payload.starts_at)) || new Date(String(payload.registration_closes_at)) > new Date(String(payload.starts_at)) || new Date(String(payload.registration_closes_at)) <= new Date(String(payload.registration_opens_at))) { setError('Kiểm tra lại lịch: kết thúc sau bắt đầu; đóng đăng ký sau mở và không muộn hơn giờ bắt đầu.'); return; }
    setBusy(true);
    try { await eventRpc('save_event', { p_id: id || null, p_payload: payload }); navigate('/quan-ly-hoat-dong'); }
    catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  const data = query.data, event = data?.event;
  const locked = Boolean(event && (event.registered_count || event.waitlist_count));
  const finished = event && ['cancelled', 'completed'].includes(event.status);
  const defaultDate = (hours: number) => localDateInput(new Date(Date.now() + hours * 3600000).toISOString());
  return <PortalLayout title={id ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động'} subtitle="Lưu bản nháp trước. Chỉ sau khi công bố, chương trình mới hiển thị trong danh sách hoạt động."><a className="p-back" href="#/quan-ly-hoat-dong">← Quản lý hoạt động</a>{query.error && <Notice tone="error">{query.error}</Notice>}{error && <Notice tone="error">{error}</Notice>}{query.loading && <Notice>Đang tải biểu mẫu…</Notice>}{data && (finished ? <Notice>Hoạt động đã kết thúc hoặc bị hủy; thông tin được giữ để tra cứu.</Notice> : !id && !admin && !data.clubs.length ? <Notice>Bạn chưa có quyền tổ chức hoạt động. <a href="#/bao-mat">Admin có thể xác thực hai bước tại đây.</a></Notice> : <section className="p-card"><form className="p-form" onSubmit={(e) => { void save(e); }}>
    <label>Đơn vị tổ chức<select name="organizer_club_id" required={!admin} defaultValue={event?.organizer_club_id || (admin ? '' : data.clubs[0]?.id)} disabled={Boolean(id)}>{admin && <option value="">Mạng lưới SVNCKH</option>}{data.clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}{event?.organizer_club_id && !data.clubs.some((c) => c.id === event.organizer_club_id) && <option value={event.organizer_club_id}>CLB tổ chức</option>}</select></label>
    <label>Tên hoạt động<input name="title" defaultValue={event?.title} required minLength={5} maxLength={180} /></label>
    <div className="form-grid"><label>Loại chương trình<select name="category" defaultValue={event?.category || 'Workshop'}>{['Workshop', 'Webinar', 'Tọa đàm', 'Hội thảo', 'Cuộc thi', 'Hoạt động cộng đồng'].map((c) => <option key={c}>{c}</option>)}{event?.category && !['Workshop', 'Webinar', 'Tọa đàm', 'Hội thảo', 'Cuộc thi', 'Hoạt động cộng đồng'].includes(event.category) && <option>{event.category}</option>}</select></label><label>Hình thức<select name="mode" defaultValue={event?.mode || 'onsite'}><option value="onsite">Trực tiếp</option><option value="online">Trực tuyến</option><option value="hybrid">Kết hợp</option></select></label></div>
    <label>Nội dung & đối tượng phù hợp<textarea name="description" defaultValue={event?.description} required minLength={20} maxLength={10000} rows={7} placeholder="Mục tiêu, nội dung, lịch trình, đối tượng và những điều người tham gia cần chuẩn bị…" /></label>
    <div className="form-grid"><label>Địa điểm<input name="location" defaultValue={event?.location} maxLength={500} placeholder="Bắt buộc khi trực tiếp / kết hợp" /></label><label>Link tham gia trực tuyến<input name="meeting_url" type="url" defaultValue={data.url} pattern="https://.*" maxLength={2000} placeholder="https://…" /><small>Chỉ ban tổ chức và người đã xác nhận được xem. Bắt buộc khi trực tuyến / kết hợp.</small></label></div>
    {locked && <Notice>Đã có người đăng ký: lịch và phạm vi hiển thị được giữ cố định. Muốn đổi lịch, hãy hủy kèm lý do và tạo hoạt động mới.</Notice>}
    <Notice>Nhập giờ theo múi giờ thiết bị: {Intl.DateTimeFormat().resolvedOptions().timeZone}. Trang chi tiết hiển thị theo giờ Việt Nam.</Notice>
    <div className="form-grid">{(['starts_at', 'ends_at', 'registration_opens_at', 'registration_closes_at'] as const).map((name, index) => <label key={name}>{['Bắt đầu chương trình', 'Kết thúc chương trình', 'Mở đăng ký', 'Đóng đăng ký'][index]}<input type="datetime-local" name={name} required readOnly={locked} defaultValue={event ? localDateInput(event[name]) : defaultDate([48, 50, 0, 47][index])} /></label>)}</div>
    <div className="form-grid"><label>Số chỗ xác nhận<input name="capacity" type="number" required min={Math.max(1, event?.registered_count || 1)} max={100000} defaultValue={event?.capacity || 50} /><small>Vượt số chỗ sẽ vào danh sách chờ. Tăng số chỗ tự động chuyển các lượt chờ hợp lệ.</small></label><label>Phạm vi hiển thị<select name="visibility" defaultValue={event?.visibility || 'public'} disabled={locked}><option value="public">Công khai</option><option value="authenticated">Tài khoản đã xác minh</option></select>{locked && <input type="hidden" name="visibility" value={event!.visibility} />}<small>Phạm vi tài khoản gồm các tài khoản đã xác minh, không giới hạn theo thành viên từng CLB.</small></label></div>
    <div className="form-actions"><button className="p-btn" disabled={busy}>{busy ? 'Đang lưu…' : id ? 'Lưu thay đổi' : 'Lưu bản nháp'}</button><a className="p-btn secondary" href="#/quan-ly-hoat-dong">Quay lại</a></div>
  </form></section>)}</PortalLayout>;
}

export function EventAttendeesPage({ id }: { id: string }) {
  const auth = useAuth();
  const [search, setSearch] = useState(''), [filter, setFilter] = useState('all'), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const query = useAsyncData(() => loadEventAttendees(id), `${id}:${auth.session!.user.id}:${auth.aal2}`);
  const rows = query.data?.rows.filter((r) => (filter === 'all' || r.status === filter) && `${r.full_name} ${r.email}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  async function attendance(row: EventAttendee) {
    setBusy(true); setError('');
    try { await eventRpc('mark_event_attendance', { p_registration: row.registration_id, p_present: row.status !== 'attended' }); query.reload(); }
    catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  function exportRows() {
    if (!rows) return;
    downloadCsv(`nguoi-tham-gia-${id}.csv`, [['Họ tên', 'Email', 'Trạng thái', 'Thời gian đăng ký', 'Điểm danh', 'Đánh giá /5', 'Phản hồi'], ...rows.map((r) => [r.full_name, r.email, eventLabels[r.status], dateLabel(r.queue_at), r.attended_at ? dateLabel(r.attended_at) : '', r.rating ?? '', r.feedback || ''])]);
  }
  const event = query.data?.event, feedback = query.data?.rows.filter((r) => r.rating !== null) || [];
  const canCheckIn = event && ['published', 'completed'].includes(event.status) && Date.now() >= new Date(event.starts_at).getTime() - 1800000;
  return <PortalLayout title="Người tham gia & tổng kết" subtitle={event?.title}><a className="p-back" href="#/quan-ly-hoat-dong">← Quản lý hoạt động</a>{query.error && <Notice tone="error">{query.error}</Notice>}{error && <Notice tone="error">{error}</Notice>}{query.loading && <Notice>Đang tải danh sách…</Notice>}{event && <><div className="event-report"><article className="p-card"><span>Đã xác nhận</span><strong>{event.registered_count}/{event.capacity}</strong></article><article className="p-card"><span>Danh sách chờ</span><strong>{event.waitlist_count}</strong></article><article className="p-card"><span>Đã tham dự</span><strong>{query.data!.rows.filter((r) => r.status === 'attended').length}</strong></article><article className="p-card"><span>{feedback.length} phản hồi</span><strong>{feedback.length ? `${(feedback.reduce((sum, row) => sum + row.rating!, 0) / feedback.length).toFixed(1)}/5` : '—'}</strong></article></div><Notice>Chỉ ban tổ chức được xem thông tin này. Điểm danh mở từ 30 phút trước giờ bắt đầu. File CSV xuất theo bộ lọc hiện tại.</Notice><div className="table-toolbar event-filters"><label className="p-label">Tìm người tham gia<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tên hoặc email…" /></label><label className="p-label">Trạng thái<select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Tất cả</option>{['registered', 'waitlisted', 'attended', 'cancelled'].map((s) => <option key={s} value={s}>{eventLabels[s]}</option>)}</select></label><button className="p-btn secondary" disabled={!rows?.length || busy} onClick={exportRows}>Xuất CSV ({rows?.length || 0})</button><button className="p-btn secondary" disabled={busy || query.loading} onClick={query.reload}>Làm mới</button></div>{rows?.length ? <div className="p-table-wrap"><table className="p-table"><thead><tr><th>Người tham gia</th><th>Trạng thái</th><th>Đăng ký / điểm danh</th><th>Phản hồi</th><th>Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr key={row.registration_id}><td><strong>{row.full_name}</strong><small>{row.email}</small></td><td><EventTag value={row.status} /></td><td>{dateLabel(row.queue_at)}{row.attended_at && <small>Tham dự: {dateLabel(row.attended_at)}</small>}</td><td>{row.rating !== null ? <><strong>{row.rating}/5</strong><span className="event-feedback-text">{row.feedback}</span></> : '—'}</td><td>{canCheckIn && ['registered', 'attended'].includes(row.status) ? <button className="text-button" disabled={busy} onClick={() => { void attendance(row); }}>{row.status === 'attended' ? 'Bỏ điểm danh' : 'Xác nhận tham dự'}</button> : '—'}</td></tr>)}</tbody></table></div> : <EmptyState title="Chưa có người tham gia phù hợp" description="Thay đổi bộ lọc hoặc chờ các lượt đăng ký mới." />}</>}</PortalLayout>;
}
