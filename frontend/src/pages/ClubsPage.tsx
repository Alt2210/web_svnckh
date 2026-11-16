import { useState, type FormEvent } from 'react';
import { ArrowUpRight, FileText, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState, Notice, PortalLayout } from '../components/PortalLayout';
import { StatusBadge } from '../components/StatusBadge';
import { useAsyncData } from '../hooks/useAsyncData';
import { listMyClubs, loadClubDetails, saveClub, uploadClubDocument, submitClub, clubDocumentUrl } from '../services/clubs.service';
import { readableError } from '../lib/errors';
import { navigate } from '../lib/navigation';
import { ApplicationHistory } from '../features/applications/ApplicationHistory';
import { dateLabel, type ClubInput } from '../types/domain';

export function ClubsPage() {
  const { session } = useAuth();
  const result = useAsyncData(() => listMyClubs(session!.user.id), session!.user.id);
  return <PortalLayout title="Câu lạc bộ của tôi" subtitle="Khai báo thông tin, chuẩn bị minh chứng và theo dõi hồ sơ gia nhập."><div className="page-actions"><p>Chỉ những câu lạc bộ do bạn đại diện được hiển thị tại đây.</p><a className="p-btn" href="#/clb/tao"><Plus size={18} />Đăng ký CLB</a></div>{result.error && <Notice tone="error">{result.error}</Notice>}{result.loading ? <p role="status">Đang tải câu lạc bộ…</p> : !result.data?.length ? <EmptyState title="Bắt đầu với câu lạc bộ của bạn" description="Khai báo hồ sơ tổ chức trước khi nộp đăng ký gia nhập Mạng lưới." action={<a className="p-btn" href="#/clb/tao">Tạo hồ sơ CLB</a>} /> : <div className="club-list">{result.data.map((club) => <article className="p-card club-card" key={club.id}><div className="club-monogram">{club.abbreviation.slice(0, 4) || 'CLB'}</div><div><StatusBadge status={club.membership} /> <StatusBadge status={club.status} /><h2>{club.name}</h2><p>{club.university}</p><span>{club.province} · {club.field}</span></div><a href={`#/clb/${club.id}`} className="p-btn secondary">Mở hồ sơ <ArrowUpRight size={17} /></a></article>)}</div>}</PortalLayout>;
}

export function ClubDetailPage({ id }: { id?: string }) {
  const { session, roles } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [roundId, setRoundId] = useState('');
  const result = useAsyncData(() => loadClubDetails(id), id || 'create');
  const club = result.data?.club;
  const owner = !club || club.owner_id === session!.user.id;
  const pending = result.data?.applications.some((app) => ['submitted', 'resubmitted', 'under_review', 'recommended'].includes(app.status));
  const editable = (!club || owner || roles.includes('admin')) && !pending && club?.status !== 'archived';
  const availableRounds = result.data?.rounds.filter((round) => Date.parse(round.opens_at) <= Date.now() && Date.parse(round.closes_at) > Date.now()) || [];

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(['name', 'abbreviation', 'university', 'province', 'field', 'contact_email', 'description'].map((key) => [key, String(form.get(key) || '').trim()])) as ClubInput;
    try {
      const clubId = await saveClub(id, payload);
      if (!id) navigate(`/clb/${clubId}`);
      else { setMessage('Đã lưu thông tin CLB.'); result.reload(); }
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const file = new FormData(event.currentTarget).get('evidence') as File | null;
    try {
      await uploadClubDocument(session!.user.id, id!, file);
      setMessage('Đã tải lên minh chứng. Tệp được lưu riêng tư.'); result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function submit() {
    setBusy(true); setError(''); setMessage('');
    try {
      if (!roundId) throw new Error('Vui lòng chọn đợt tiếp nhận.');
      await submitClub(id!, roundId);
      setMessage('Đã nộp hồ sơ. Bạn có thể xem mã tiếp nhận và lịch sử bên dưới.'); result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function viewDocument(path: string) {
    try {
      const url = await clubDocumentUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) { setError(readableError(err)); }
  }
  return <PortalLayout title={id ? 'Hồ sơ câu lạc bộ' : 'Đăng ký câu lạc bộ'} subtitle="Tạo hồ sơ tổ chức chưa đồng nghĩa với việc được công nhận là thành viên Mạng lưới.">
    <a className="p-back" href={owner ? '#/clb' : '#/admin/clb'}>← Quay lại danh sách</a>
    {error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}{result.error && <Notice tone="error">{result.error}</Notice>}
    {result.loading ? <p role="status">Đang tải hồ sơ…</p> : result.data && <>
      {club && <div className="detail-status"><StatusBadge status={club.membership} /><StatusBadge status={club.status} /></div>}
      {pending && <Notice>Hồ sơ đang được xử lý. Thông tin đã nộp được giữ nguyên theo phiên bản; bạn chỉ chỉnh sửa khi được yêu cầu bổ sung.</Notice>}
      <section className="p-card"><h2>Thông tin tổ chức</h2><form className="p-form" onSubmit={(e) => { void save(e); }}><fieldset disabled={busy || !editable}><div className="form-grid"><label>Tên CLB<input name="name" defaultValue={club?.name} minLength={3} maxLength={180} required /></label><label>Tên viết tắt<input name="abbreviation" defaultValue={club?.abbreviation} maxLength={30} /></label><label>Trường / đơn vị chủ quản<input name="university" defaultValue={club?.university} minLength={3} maxLength={180} required /></label><label>Tỉnh / thành phố<input name="province" defaultValue={club?.province} minLength={2} maxLength={120} required /></label><label>Lĩnh vực nghiên cứu<input name="field" defaultValue={club?.field} minLength={2} maxLength={120} required /></label><label>Email liên hệ CLB<input type="email" name="contact_email" defaultValue={club?.contact_email || session?.user.email} maxLength={254} required /></label></div><label>Giới thiệu và hoạt động tiêu biểu<textarea name="description" defaultValue={club?.description} minLength={20} maxLength={5000} rows={5} required /></label>{editable && <button className="p-btn" disabled={busy}>{busy ? 'Đang lưu…' : id ? 'Lưu thay đổi' : 'Tạo hồ sơ CLB'}</button>}</fieldset></form></section>
      {id && <section className="p-card"><h2>Hồ sơ minh chứng</h2><p>Đính kèm văn bản thành lập hoặc xác nhận và minh chứng theo hướng dẫn của đợt tuyển. Chỉ tài khoản có quyền mới được xem tệp.</p><ul className="document-list">{result.data.documents.map((doc) => <li key={doc.id}><FileText size={18} /><button className="text-button" onClick={() => { void viewDocument(doc.path); }}>{doc.file_name}</button><small>{dateLabel(doc.created_at)}</small></li>)}</ul>{owner && editable && <form className="upload-form" onSubmit={(e) => { void upload(e); }}><label>Tệp PDF, tối đa 10 MB<input type="file" name="evidence" accept="application/pdf,.pdf" required /></label><button className="p-btn secondary" disabled={busy}>Tải minh chứng</button></form>}</section>}
      {id && owner && !pending && club?.status === 'active' && club.membership !== 'recognized' && <section className="p-card"><h2>Nộp hồ sơ gia nhập</h2>{!availableRounds.length ? <Notice>Hiện chưa có đợt tiếp nhận đang mở. Bạn có thể tiếp tục chuẩn bị hồ sơ.</Notice> : <><label className="p-label">Đợt tiếp nhận<select value={roundId} onChange={(e) => setRoundId(e.target.value)}><option value="">Chọn đợt tiếp nhận</option>{availableRounds.map((r) => <option key={r.id} value={r.id}>{r.title} · đến {dateLabel(r.closes_at)}</option>)}</select></label>{roundId && <p className="round-instructions">{availableRounds.find((r) => r.id === roundId)?.instructions}</p>}<p>Thông tin và minh chứng hiện tại sẽ được lưu thành một phiên bản hồ sơ khi nộp.</p><button className="p-btn" disabled={busy || !roundId || !result.data.documents.length} onClick={() => { void submit(); }}>Nộp hồ sơ xét duyệt</button></>}</section>}
      {result.data.applications.map((app) => <ApplicationHistory key={app.id} application={app} />)}
    </>}
  </PortalLayout>;
}

export { ApplicationHistory } from '../features/applications/ApplicationHistory';
