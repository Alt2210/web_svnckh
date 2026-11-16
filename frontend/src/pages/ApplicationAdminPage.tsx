import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PortalLayout, Notice, EmptyState } from '../components/PortalLayout';
import { StatusBadge } from '../components/StatusBadge';
import { ApplicationHistory } from '../features/applications/ApplicationHistory';
import { useAsyncData } from '../hooks/useAsyncData';
import { listApplications, reviewClubApplication } from '../services/admin.service';
import { loadClubDetails, clubDocumentUrl } from '../services/clubs.service';
import { verifiedTotpFactor, enrollTotp, verifyTotp } from '../services/auth.service';
import { readableError } from '../lib/errors';
import { dateLabel, type Application } from '../types/domain';

export default function ApplicationAdminPage() {
  const auth = useAuth();
  if (!auth.roles.includes('admin')) return <PortalLayout title="Quản lý hồ sơ"><Notice tone="error">Khu vực này dành cho admin.</Notice></PortalLayout>;
  return auth.aal2 ? <ApplicationWorkspace /> : <AdminVerification />;
}

function AdminVerification() {
  const auth = useAuth();
  const [factor, setFactor] = useState(''), [qr, setQr] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  useEffect(() => { let alive = true; void verifiedTotpFactor().then((id) => { if (alive) setFactor(id); }).catch((err) => { if (alive) setError(readableError(err)); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, []);
  async function enroll() { setBusy(true); setError(''); try { const result = await enrollTotp(); setFactor(result.id); setQr(result.totp.qr_code.startsWith('data:') ? result.totp.qr_code : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.totp.qr_code)}`); } catch (err) { setError(readableError(err)); } finally { setBusy(false); } }
  async function verify(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const code = String(new FormData(event.currentTarget).get('code')); setBusy(true); setError(''); try { await verifyTotp(factor, code); await auth.refresh(); } catch (err) { setError(readableError(err)); } finally { setBusy(false); } }
  return <PortalLayout title="Xác thực quản trị"><section className="p-card form-card"><p>Xác thực hai bước để xem và xử lý hồ sơ.</p>{error && <Notice tone="error">{error}</Notice>}{loading ? <p role="status">Đang kiểm tra bảo mật…</p> : factor ? <>{qr && <><p>Quét mã bằng ứng dụng xác thực của bạn.</p><img className="mfa-qr" src={qr} alt="Mã thiết lập xác thực hai bước" /></>}<form className="p-form" onSubmit={(event) => { void verify(event); }}><label>Mã xác thực<input name="code" required pattern="[0-9]{6}" inputMode="numeric" autoComplete="one-time-code" maxLength={6} /></label><button className="p-btn" disabled={busy}>Xác thực</button></form></> : <button className="p-btn" disabled={busy} onClick={() => { void enroll(); }}>Thiết lập xác thực hai bước</button>}</section></PortalLayout>;
}

function ApplicationWorkspace() {
  const [search, setSearch] = useState(''), [status, setStatus] = useState(''), [selected, setSelected] = useState<string | null>(null);
  const query = useAsyncData(listApplications, 'applications');
  const rows = query.data?.apps.filter((application) => (!status || application.status === status) && `${application.code} ${query.data?.clubs.find((club) => club.id === application.club_id)?.name || ''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  const application = query.data?.apps.find((item) => item.id === selected);
  return <PortalLayout title="Quản lý & duyệt hồ sơ" subtitle="Xem thông tin CLB, minh chứng và trả kết quả cho người nộp.">{query.error && <Notice tone="error">{query.error}</Notice>}{application ? <><button className="text-button" onClick={() => setSelected(null)}>← Tất cả hồ sơ</button><ApplicationReview key={application.id} application={application} onReviewed={query.reload} /></> : <><div className="table-toolbar"><label>Tìm hồ sơ<input type="search" placeholder="Tên CLB hoặc mã hồ sơ…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label>Trạng thái<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả</option><option value="submitted">Mới gửi</option><option value="resubmitted">Gửi lại</option><option value="need_revision">Chờ bổ sung</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option></select></label><button className="p-btn secondary" onClick={query.reload} disabled={query.loading}>Cập nhật</button></div>{query.loading ? <Notice>Đang tải hồ sơ…</Notice> : rows?.length ? <div className="p-table-wrap"><table className="p-table"><thead><tr><th>Hồ sơ / câu lạc bộ</th><th>Ngày gửi</th><th>Trạng thái</th><th /></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{query.data?.clubs.find((club) => club.id === item.club_id)?.name}</strong><small>{item.code}</small></td><td>{dateLabel(item.submitted_at)}</td><td><StatusBadge status={item.status} /></td><td><button className="text-button" onClick={() => setSelected(item.id)}>Xem hồ sơ →</button></td></tr>)}</tbody></table></div> : !query.error && <EmptyState title="Chưa có hồ sơ phù hợp" description="Hồ sơ sẽ xuất hiện khi người dùng gửi từ popup trên trang chủ." />}</>}</PortalLayout>;
}

function ApplicationReview({ application, onReviewed }: { application: Application; onReviewed: () => void }) {
  const auth = useAuth();
  const query = useAsyncData(() => loadClubDetails(application.club_id), application.club_id);
  const [result, setResult] = useState('approved'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const club = query.data?.club;
  const canReview = club?.owner_id !== auth.session!.user.id && club?.status === 'active' && ['submitted', 'resubmitted', 'under_review', 'recommended'].includes(application.status);
  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setError(''); setMessage('');
    try { await reviewClubApplication(application.id, { status: result, note: String(data.get('note') || ''), deadline: result === 'need_revision' ? new Date(String(data.get('deadline'))).toISOString() : null, document_no: String(data.get('document_no') || ''), effective_at: String(data.get('effective_at') || '') || null }); setMessage('Đã ghi nhận kết quả và cập nhật hồ sơ người nộp.'); onReviewed(); }
    catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function openDocument(path: string) { try { window.open(await clubDocumentUrl(path), '_blank', 'noopener,noreferrer'); } catch (err) { setError(readableError(err)); } }
  return <div className="application-review">{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}{query.error && <Notice tone="error">{query.error}</Notice>}{query.loading && <Notice>Đang tải chi tiết…</Notice>}{club && <><section className="p-card"><div className="section-toolbar"><h2>{club.name}</h2><StatusBadge status={application.status} /></div><dl className="application-facts"><dt>Đơn vị</dt><dd>{club.university}</dd><dt>Địa phương</dt><dd>{club.province}</dd><dt>Lĩnh vực</dt><dd>{club.field}</dd><dt>Liên hệ</dt><dd>{club.contact_email}</dd></dl><p className="application-description">{club.description}</p><h3>Minh chứng</h3><ul className="document-list">{query.data?.documents.map((document) => <li key={document.id}><button className="text-button" onClick={() => { void openDocument(document.path); }}>{document.file_name} ↗</button></li>)}</ul></section><ApplicationHistory application={application} />{canReview ? <section className="p-card"><h2>Trả kết quả</h2><form className="p-form" onSubmit={(event) => { void review(event); }}><label>Kết quả<select value={result} onChange={(event) => setResult(event.target.value)}><option value="approved">Duyệt hồ sơ</option><option value="need_revision">Yêu cầu bổ sung</option><option value="rejected">Từ chối hồ sơ</option></select></label><label>Nhận xét / căn cứ<textarea name="note" required minLength={5} maxLength={3000} rows={4} /></label>{result === 'need_revision' && <label>Hạn bổ sung<input name="deadline" type="datetime-local" required /></label>}{result === 'approved' && <div className="form-grid"><label>Số quyết định<input name="document_no" required minLength={3} maxLength={120} /></label><label>Ngày hiệu lực<input name="effective_at" type="date" required max={new Date().toLocaleDateString('en-CA')} /></label></div>}<button className="p-btn" disabled={busy}>{busy ? 'Đang lưu…' : 'Xác nhận kết quả'}</button></form></section> : club.owner_id === auth.session!.user.id && <Notice>Bạn không được tự duyệt hồ sơ của mình.</Notice>}</>}</div>;
}
