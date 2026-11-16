import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { Notice } from '../../components/PortalLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { ApplicationHistory } from './ApplicationHistory';
import { loadClubDetails, saveClub, uploadClubDocument, submitClubBasic, clubDocumentUrl } from '../../services/clubs.service';
import { readableError } from '../../lib/errors';
import { dateLabel, type ClubInput } from '../../types/domain';

export function ClubApplicationForm({ initialId, onBack }: { initialId?: string; onBack: () => void }) {
  const auth = useAuth();
  const [id, setId] = useState(initialId);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const query = useAsyncData(() => loadClubDetails(id), id || 'new');
  const club = query.data?.club, latest = query.data?.applications[0];
  const pending = latest && ['submitted', 'resubmitted', 'under_review', 'recommended'].includes(latest.status);
  const editable = !pending && club?.membership !== 'recognized' && club?.status !== 'archived' && latest?.status !== 'rejected';
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const send = submitter?.value === 'send';
    const form = new FormData(event.currentTarget);
    const file = form.get('evidence') as File | null;
    const attachment = file?.size ? file : null;
    setBusy(true); setError(''); setMessage('');
    try {
      if (attachment && (!attachment.name.toLowerCase().endsWith('.pdf') || attachment.type !== 'application/pdf' || attachment.size > 10 * 1024 * 1024)) throw new Error('Minh chứng cần là PDF, tối đa 10 MB.');
      if (send && !attachment && !query.data?.documents.length) throw new Error('Bạn cần đính kèm ít nhất một minh chứng PDF trước khi gửi.');
      const payload = Object.fromEntries(['name', 'abbreviation', 'university', 'province', 'field', 'contact_email', 'description'].map((key) => [key, String(form.get(key) || '').trim()])) as ClubInput;
      const savedId = await saveClub(id, payload);
      setId(savedId);
      if (attachment) await uploadClubDocument(auth.session!.user.id, savedId, attachment);
      if (send) await submitClubBasic(savedId);
      setMessage(send ? 'Đã gửi hồ sơ. Bạn có thể mở lại trang hồ sơ để theo dõi kết quả và phản hồi của admin.' : 'Đã lưu nháp. Bạn có thể mở lại để hoàn thiện và gửi sau.');
      query.reload();
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function viewDocument(path: string) {
    try { const url = await clubDocumentUrl(path); window.open(url, '_blank', 'noopener,noreferrer'); }
    catch (err) { setError(readableError(err)); }
  }
  return <div className="club-application-content"><button className="text-button" onClick={onBack} disabled={busy}>← Danh sách hồ sơ của tôi</button>{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}{query.error && <Notice tone="error">{query.error}</Notice>}{query.loading ? <p role="status">Đang tải hồ sơ…</p> : query.data && <>
    <div className="application-status-row"><h3>{club ? club.name : 'Nộp hồ sơ câu lạc bộ'}</h3><StatusBadge status={latest?.status || 'draft'} /></div>
    {pending && <Notice>Hồ sơ đã được gửi và đang chờ xử lý. Bạn sẽ thấy kết quả hoặc yêu cầu bổ sung tại đây.</Notice>}
    <form className="p-form" onSubmit={(event) => { void save(event); }}><fieldset disabled={busy || !editable}>
      <div className="form-grid"><label>Tên câu lạc bộ<input name="name" defaultValue={club?.name} required minLength={3} maxLength={180} /></label><label>Tên viết tắt<input name="abbreviation" defaultValue={club?.abbreviation} maxLength={30} /></label><label>Trường / đơn vị chủ quản<input name="university" defaultValue={club?.university} required minLength={3} maxLength={180} /></label><label>Tỉnh / thành phố<input name="province" defaultValue={club?.province} required minLength={2} maxLength={120} /></label><label>Lĩnh vực nghiên cứu<input name="field" defaultValue={club?.field} required minLength={2} maxLength={120} /></label><label>Email liên hệ CLB<input type="email" name="contact_email" defaultValue={club?.contact_email || auth.session?.user.email} required maxLength={254} /></label></div>
      <label>Giới thiệu và hoạt động tiêu biểu<textarea name="description" defaultValue={club?.description} required minLength={20} maxLength={5000} rows={4} /></label>
      {editable && <label>Minh chứng PDF<input type="file" name="evidence" accept="application/pdf,.pdf" /><small>Văn bản thành lập / xác nhận hoặc minh chứng hoạt động, tối đa 10 MB mỗi tệp.</small></label>}
      {editable && <div className="form-actions"><button className="p-btn" name="intent" value="send" disabled={busy}>{busy ? 'Đang xử lý…' : latest?.status === 'need_revision' ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ xét duyệt'}</button><button className="p-btn secondary" name="intent" value="draft" disabled={busy}>Lưu nháp</button></div>}
    </fieldset></form>
    {Boolean(query.data.documents.length) && <section className="application-documents"><h4>Minh chứng đã đính kèm</h4><ul className="document-list">{query.data.documents.map((document) => <li key={document.id}><button className="text-button" onClick={() => { void viewDocument(document.path); }}>{document.file_name}</button><small>{dateLabel(document.created_at)}</small></li>)}</ul></section>}
    {query.data.applications.map((application) => <ApplicationHistory key={application.id} application={application} />)}
  </>}</div>;
}
