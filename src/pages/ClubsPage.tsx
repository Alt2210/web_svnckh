import { useState, type FormEvent } from 'react';
import { ArrowUpRight, FileText, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState, Notice, PortalLayout } from '../components/PortalLayout';
import { StatusBadge } from '../components/StatusBadge';
import { useAsyncData } from '../hooks/useAsyncData';
import { database, readableError } from '../lib/supabase';
import { navigate } from '../lib/navigation';
import { dateLabel, statusLabels, type Application, type ApplicationEvent, type ApplicationVersion, type Club, type ClubDocument, type ClubInput, type Round } from '../types/domain';

export function ClubsPage() {
  const { session } = useAuth();
  const result = useAsyncData(async () => {
    const r = await database().from('clubs').select('*').eq('owner_id', session!.user.id).order('created_at', { ascending: false });
    if (r.error) throw r.error;
    return r.data as Club[];
  }, session!.user.id);
  return <PortalLayout title="Câu lạc bộ của tôi" subtitle="Khai báo thông tin, chuẩn bị minh chứng và theo dõi hồ sơ gia nhập."><div className="page-actions"><p>Chỉ những câu lạc bộ do bạn đại diện được hiển thị tại đây.</p><a className="p-btn" href="#/clb/tao"><Plus size={18} />Đăng ký CLB</a></div>{result.error && <Notice tone="error">{result.error}</Notice>}{result.loading ? <p role="status">Đang tải câu lạc bộ…</p> : !result.data?.length ? <EmptyState title="Bắt đầu với câu lạc bộ của bạn" description="Khai báo hồ sơ tổ chức trước khi nộp đăng ký gia nhập Mạng lưới." action={<a className="p-btn" href="#/clb/tao">Tạo hồ sơ CLB</a>} /> : <div className="club-list">{result.data.map((club) => <article className="p-card club-card" key={club.id}><div className="club-monogram">{club.abbreviation.slice(0, 4) || 'CLB'}</div><div><StatusBadge status={club.membership} /> <StatusBadge status={club.status} /><h2>{club.name}</h2><p>{club.university}</p><span>{club.province} · {club.field}</span></div><a href={`#/clb/${club.id}`} className="p-btn secondary">Mở hồ sơ <ArrowUpRight size={17} /></a></article>)}</div>}</PortalLayout>;
}

export function ClubDetailPage({ id }: { id?: string }) {
  const { session, roles } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [roundId, setRoundId] = useState('');
  const result = useAsyncData(async () => {
    const client = database();
    const [club, documents, applications, rounds] = await Promise.all([
      id ? client.from('clubs').select('*').eq('id', id).single() : Promise.resolve({ data: null, error: null }),
      id ? client.from('club_documents').select('*').eq('club_id', id).order('created_at') : Promise.resolve({ data: [], error: null }),
      id ? client.from('applications').select('*').eq('club_id', id).order('submitted_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
      client.from('application_rounds').select('*').eq('is_open', true).order('opens_at', { ascending: false }),
    ]);
    for (const r of [club, documents, applications, rounds]) if (r.error) throw r.error;
    return { club: club.data as Club | null, documents: documents.data as ClubDocument[], applications: applications.data as Application[], rounds: rounds.data as Round[] };
  }, id || 'create');
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
      const r = await database().rpc('save_club', { p_id: id || null, p_payload: payload });
      if (r.error) throw r.error;
      if (!id) navigate(`/clb/${r.data as string}`);
      else { setMessage('Đã lưu thông tin CLB.'); result.reload(); }
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const file = new FormData(event.currentTarget).get('evidence') as File | null;
    try {
      if (!file || !file.name.toLowerCase().endsWith('.pdf') || file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) throw new Error('Chỉ chấp nhận PDF có dung lượng tối đa 10 MB.');
      const path = `${session!.user.id}/${id}/${crypto.randomUUID()}.pdf`;
      const uploaded = await database().storage.from('club-evidence').upload(path, file, { contentType: 'application/pdf', upsert: false });
      if (uploaded.error) throw uploaded.error;
      const attached = await database().rpc('attach_club_document', { p_club: id, p_path: path, p_file_name: file.name });
      if (attached.error) throw attached.error;
      setMessage('Đã tải lên minh chứng. Tệp được lưu riêng tư.'); result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function submit() {
    setBusy(true); setError(''); setMessage('');
    try {
      if (!roundId) throw new Error('Vui lòng chọn đợt tiếp nhận.');
      const r = await database().rpc('submit_club', { p_club: id, p_round: roundId });
      if (r.error) throw r.error;
      setMessage('Đã nộp hồ sơ. Bạn có thể xem mã tiếp nhận và lịch sử bên dưới.'); result.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function viewDocument(path: string) {
    try {
      const r = await database().storage.from('club-evidence').createSignedUrl(path, 60);
      if (r.error) throw r.error;
      window.open(r.data.signedUrl, '_blank', 'noopener,noreferrer');
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

export function ApplicationHistory({ application }: { application: Application }) {
  const [expanded, setExpanded] = useState(false);
  const result = useAsyncData(async () => {
    const [events, versions] = await Promise.all([database().from('application_events').select('*').eq('application_id', application.id).order('created_at'), database().from('application_versions').select('*').eq('application_id', application.id).order('version')]);
    if (events.error) throw events.error;
    if (versions.error) throw versions.error;
    return { events: events.data as ApplicationEvent[], versions: versions.data as ApplicationVersion[] };
  }, `${application.id}:${application.status}:${application.version}`);
  return <section className="p-card"><div className="section-toolbar"><div><h2>Hồ sơ {application.code}</h2><p>Nộp lúc {dateLabel(application.submitted_at)} · Phiên bản {application.version}</p></div><StatusBadge status={application.status} /></div>{result.error && <Notice tone="error">{result.error}</Notice>}<ol className="history-list">{result.data?.events.map((event) => <li key={event.id}><span>{statusLabels[event.status] || event.status}</span><p>{event.note}</p>{event.deadline && <strong>Hạn bổ sung: {dateLabel(event.deadline)}</strong>}<small>{dateLabel(event.created_at)}</small></li>)}</ol><button className="text-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Ẩn phiên bản đã nộp' : 'Xem các phiên bản đã nộp'}</button>{expanded && <div className="version-list">{result.data?.versions.map((version) => <details key={version.id}><summary>Phiên bản {version.version} · {dateLabel(version.created_at)}</summary><dl><dt>Tên CLB</dt><dd>{version.snapshot.club.name}</dd><dt>Đơn vị chủ quản</dt><dd>{version.snapshot.club.university}</dd><dt>Lĩnh vực</dt><dd>{version.snapshot.club.field}</dd><dt>Giới thiệu</dt><dd>{version.snapshot.club.description}</dd><dt>Tệp tại thời điểm nộp</dt><dd>{version.snapshot.documents.map((d) => d.file_name).join(', ')}</dd></dl></details>)}</div>}</section>;
}
