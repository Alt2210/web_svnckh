import { useState, type FormEvent } from 'react';
import { EmptyState, Notice, PortalLayout } from '../components/PortalLayout';
import { StatusBadge } from '../components/StatusBadge';
import { useAsyncData } from '../hooks/useAsyncData';
import { listUsers, setUserStatus, listAdminClubs, archiveClub, listRounds, saveRound, toggleRound, listApplications, reviewApplication, listAuditLogs } from '../services/admin.service';
import { readableError } from '../lib/errors';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationHistory } from './ClubsPage';
import { dateLabel, type Club, type Profile, type Round } from '../types/domain';

export function UsersAdminPage() {
  const auth = useAuth();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const result = useAsyncData(() => listUsers(page, query), `${page}:${query}`);
  async function changeStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError('');
    try {
      await setUserStatus(selected.id, selected.status === 'active' ? 'locked' : 'active', String(new FormData(event.currentTarget).get('reason') || ''));
      setSelected(null); result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  return <PortalLayout title="Quản lý người dùng" subtitle="Tra cứu tài khoản, kiểm tra thông tin và quản lý trạng thái truy cập."><div className="table-toolbar"><label>Tìm theo họ tên<input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Nhập tên người dùng…" /></label><span>{result.data?.total || 0} tài khoản</span></div>{error && <Notice tone="error">{error}</Notice>}{result.error && <Notice tone="error">{result.error}</Notice>}{selected && <section className="p-card action-panel"><h2>{selected.status === 'active' ? 'Khóa' : 'Mở khóa'} tài khoản {selected.full_name}</h2><p>Thao tác được ghi vào nhật ký. Tài khoản bị khóa sẽ không truy cập được dữ liệu dù phiên đăng nhập còn tồn tại.</p><form className="p-form" onSubmit={(e) => { void changeStatus(e); }}><label>Lý do<textarea name="reason" minLength={5} maxLength={1000} required rows={3} /></label><div className="form-actions"><button className="p-btn" disabled={busy}>Xác nhận thay đổi</button><button className="p-btn secondary" type="button" onClick={() => setSelected(null)}>Hủy</button></div></form></section>}
    <div className="p-table-wrap"><table className="p-table"><thead><tr><th>Người dùng</th><th>Trường / đơn vị</th><th>Ngày tạo</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{result.loading ? <tr><td colSpan={5}>Đang tải tài khoản…</td></tr> : result.data?.users.map((user) => <tr key={user.id}><td><strong>{user.full_name}</strong><small>{user.email}</small></td><td>{user.university || 'Chưa cập nhật'}</td><td>{dateLabel(user.created_at)}</td><td><StatusBadge status={user.status} /></td><td><button className="text-button" disabled={user.id === auth.session?.user.id} onClick={() => setSelected(user)}>{user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}</button></td></tr>)}</tbody></table>{!result.loading && !result.data?.users.length && <EmptyState title="Không tìm thấy người dùng" description="Thử lại với tên khác." />}</div><Pagination page={page} total={result.data?.total || 0} setPage={setPage} />
  </PortalLayout>;
}

export function ClubsAdminPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Club | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const result = useAsyncData(() => listAdminClubs(page, query, status), `${query}:${status}:${page}`);
  async function archive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError('');
    try {
      await archiveClub(selected.id, selected.status !== 'archived', String(new FormData(event.currentTarget).get('reason') || ''));
      setSelected(null); result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  return <PortalLayout title="Quản lý câu lạc bộ" subtitle="Thông tin tổ chức và tư cách thành viên được theo dõi độc lập."><div className="table-toolbar"><label>Tên CLB<input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Tìm câu lạc bộ…" /></label><label>Trạng thái tổ chức<select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}><option value="">Tất cả</option><option value="active">Đang hoạt động</option><option value="archived">Đã lưu trữ</option></select></label><span>{result.data?.total || 0} CLB</span></div>{result.error && <Notice tone="error">{result.error}</Notice>}{error && <Notice tone="error">{error}</Notice>}{selected && <section className="p-card action-panel"><h2>{selected.status === 'archived' ? 'Khôi phục' : 'Lưu trữ'} CLB</h2><p>{selected.name}. Lịch sử hồ sơ và quyết định vẫn được giữ lại.</p><form className="p-form" onSubmit={(e) => { void archive(e); }}><label>Lý do<textarea name="reason" minLength={5} maxLength={1000} rows={3} required /></label><div className="form-actions"><button className="p-btn" disabled={busy}>Xác nhận</button><button className="p-btn secondary" type="button" onClick={() => setSelected(null)}>Hủy</button></div></form></section>}<div className="p-table-wrap"><table className="p-table"><thead><tr><th>Câu lạc bộ</th><th>Trường / đơn vị</th><th>Tư cách thành viên</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{result.loading ? <tr><td colSpan={5}>Đang tải câu lạc bộ…</td></tr> : result.data?.clubs.map((club) => <tr key={club.id}><td><strong>{club.name}</strong><small>{club.province} · {club.field}</small></td><td>{club.university}</td><td><StatusBadge status={club.membership} /></td><td><StatusBadge status={club.status} /></td><td><div className="row-actions"><a href={`#/clb/${club.id}`}>Xem hồ sơ</a><button className="text-button" onClick={() => setSelected(club)}>{club.status === 'archived' ? 'Khôi phục' : 'Lưu trữ'}</button></div></td></tr>)}</tbody></table>{!result.loading && !result.data?.clubs.length && <EmptyState title="Chưa có CLB phù hợp" description="Hồ sơ tổ chức sẽ xuất hiện khi người đại diện đăng ký." />}</div><Pagination page={page} total={result.data?.total || 0} setPage={setPage} /></PortalLayout>;
}

export function RoundsAdminPage() {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const result = useAsyncData(listRounds, 'rounds');
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget); const form = event.currentTarget;
    try {
      await saveRound({ title: String(data.get('title') || ''), opens_at: new Date(String(data.get('opens_at'))).toISOString(), closes_at: new Date(String(data.get('closes_at'))).toISOString(), instructions: String(data.get('instructions') || ''), is_open: data.get('is_open') === 'on' });
      form.reset(); result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function toggle(round: Round) {
    setBusy(true); setError('');
    try { await toggleRound(round.id, !round.is_open); result.reload(); }
    catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  return <PortalLayout title="Đợt tiếp nhận hồ sơ" subtitle="Chỉ các đợt đang mở và còn trong thời hạn mới nhận hồ sơ.">{error && <Notice tone="error">{error}</Notice>}{result.error && <Notice tone="error">{result.error}</Notice>}<section className="p-card"><h2>Tạo đợt tiếp nhận</h2><form className="p-form" onSubmit={(e) => { void create(e); }}><label>Tên đợt<input name="title" minLength={5} maxLength={180} required /></label><div className="form-grid"><label>Mở từ (giờ trên thiết bị)<input type="datetime-local" name="opens_at" required /></label><label>Đóng lúc (giờ trên thiết bị)<input type="datetime-local" name="closes_at" required /></label></div><label>Điều kiện và hướng dẫn<textarea name="instructions" rows={4} maxLength={5000} required /></label><label className="p-checkbox"><input type="checkbox" name="is_open" /><span>Kích hoạt tiếp nhận trong thời hạn đã chọn</span></label><button className="p-btn" disabled={busy}>Tạo đợt tiếp nhận</button></form></section><div className="round-list">{result.data?.map((round) => <article className="p-card" key={round.id}><div className="section-toolbar"><div><h2>{round.title}</h2><p>{dateLabel(round.opens_at)} — {dateLabel(round.closes_at)}</p></div><button className="p-btn secondary" disabled={busy} onClick={() => { void toggle(round); }}>{round.is_open ? 'Tạm đóng tiếp nhận' : 'Kích hoạt đợt'}</button></div><p className="round-instructions">{round.instructions}</p></article>)}</div></PortalLayout>;
}

export function ApplicationsAdminPage() {
  const auth = useAuth();
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const result = useAsyncData(listApplications, 'applications');
  const application = result.data?.apps.find((a) => a.id === selectedId);
  const own = result.data?.clubs.find((c) => c.id === application?.club_id)?.owner_id === auth.session?.user.id;
  const review = auth.roles.includes('reviewer') && application && ['submitted', 'resubmitted', 'under_review'].includes(application.status);
  const approve = auth.roles.includes('approver') && application?.status === 'recommended';
  async function process(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!application) return; setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      await reviewApplication(application.id, { status: String(data.get('status') || ''), note: String(data.get('note') || ''), deadline: data.get('deadline') ? new Date(String(data.get('deadline'))).toISOString() : null, document_no: String(data.get('document_no') || ''), effective_at: String(data.get('effective_at') || '') || null });
      result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  return <PortalLayout title="Hồ sơ gia nhập" subtitle="100 hồ sơ gần nhất. Quyền quản trị hệ thống không tự bao gồm quyền thẩm định hay phê duyệt.">{result.error && <Notice tone="error">{result.error}</Notice>}{error && <Notice tone="error">{error}</Notice>}<div className="p-table-wrap"><table className="p-table"><thead><tr><th>Mã hồ sơ</th><th>Câu lạc bộ</th><th>Trạng thái</th><th>Ngày nộp</th><th /></tr></thead><tbody>{result.data?.apps.map((app) => <tr key={app.id}><td><strong>{app.code}</strong></td><td>{result.data?.clubs.find((c) => c.id === app.club_id)?.name}</td><td><StatusBadge status={app.status} /></td><td>{dateLabel(app.submitted_at)}</td><td><button className="text-button" onClick={() => setSelectedId(app.id)}>Xem chi tiết</button></td></tr>)}</tbody></table>{!result.loading && !result.data?.apps.length && <EmptyState title="Chưa có hồ sơ" description="Hồ sơ sẽ xuất hiện khi đại diện CLB gửi đăng ký trong đợt tiếp nhận." />}</div>
    {application && <div className="application-detail"><a className="p-btn secondary" href={`#/clb/${application.club_id}`}>Xem thông tin và minh chứng CLB</a><ApplicationHistory application={application} />{own ? <Notice>Bạn không được tự xử lý hồ sơ do mình nộp.</Notice> : (review || approve) ? <section className="p-card"><h2>Xử lý hồ sơ</h2><form className="p-form" onSubmit={(e) => { void process(e); }}><label>Thao tác<select name="status" required>{review && ['submitted', 'resubmitted'].includes(application.status) && <option value="under_review">Bắt đầu thẩm định</option>}{review && application.status === 'under_review' && <><option value="need_revision">Yêu cầu bổ sung</option><option value="recommended">Đề xuất công nhận</option></>}{approve && <><option value="approved">Phê duyệt công nhận</option><option value="rejected">Từ chối hồ sơ</option></>}</select></label><label>Nhận xét / căn cứ<textarea name="note" minLength={5} maxLength={3000} rows={4} required /></label>{review && application.status === 'under_review' && <label>Hạn bổ sung (bắt buộc khi yêu cầu bổ sung)<input type="datetime-local" name="deadline" /></label>}{approve && <div className="form-grid"><label>Số quyết định (bắt buộc khi công nhận)<input name="document_no" maxLength={120} /></label><label>Ngày hiệu lực<input type="date" name="effective_at" max={new Date().toLocaleDateString('en-CA')} /></label></div>}<button className="p-btn" disabled={busy}>{busy ? 'Đang xử lý…' : 'Ghi nhận kết quả'}</button></form></section> : <Notice>Không có thao tác phù hợp với vai trò của bạn hoặc trạng thái hiện tại.</Notice>}</div>}
  </PortalLayout>;
}

export function AuditAdminPage() {
  const result = useAsyncData(listAuditLogs, 'audit');
  return <PortalLayout title="Nhật ký hệ thống" subtitle="100 thao tác gần nhất. Nhật ký chỉ đọc và không thể chỉnh sửa từ giao diện.">{result.error && <Notice tone="error">{result.error}</Notice>}<div className="p-table-wrap"><table className="p-table"><thead><tr><th>Thời điểm</th><th>Thao tác</th><th>Người thực hiện</th><th>Chi tiết</th></tr></thead><tbody>{result.data?.map((item) => <tr key={item.id}><td>{dateLabel(item.created_at)}</td><td>{item.action}</td><td><small>{item.actor_id}</small></td><td><details><summary>Xem</summary><pre>{JSON.stringify(item.detail, null, 2)}</pre></details></td></tr>)}</tbody></table></div></PortalLayout>;
}

function Pagination({ page, total, setPage }: { page: number; total: number; setPage: (page: number) => void }) { return <div className="pagination"><span>Trang {page + 1} / {Math.max(1, Math.ceil(total / 25))}</span><button className="p-btn secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button><button className="p-btn secondary" disabled={(page + 1) * 25 >= total} onClick={() => setPage(page + 1)}>Sau</button></div>; }
