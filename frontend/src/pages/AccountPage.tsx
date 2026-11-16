import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Building2, CircleCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Notice, PortalLayout } from '../components/PortalLayout';
import { saveProfile } from '../services/profiles.service';
import { readableError } from '../lib/errors';

export function AccountPage() {
  const { profile, roles, aal2 } = useAuth();
  return <PortalLayout title={`Xin chào, ${profile?.full_name.split(' ').at(-1) || 'bạn'}.`} subtitle="Một nơi để quản lý hồ sơ và bắt đầu hành trình cùng Mạng lưới.">
    <div className="welcome-panel"><div><span>KHỞI ĐẦU TỪ MỘT KẾT NỐI</span><h2>Đưa câu lạc bộ của bạn<br />đến gần cộng đồng hơn.</h2><p>Hoàn thiện hồ sơ tổ chức, chuẩn bị minh chứng và gửi đăng ký trong đợt tiếp nhận phù hợp.</p><a className="p-btn gold" href="#/clb/tao">Đăng ký câu lạc bộ<ArrowUpRight size={18} /></a></div><Building2 size={110} strokeWidth={1} aria-hidden="true" /></div>
    <div className="account-grid"><article className="p-card"><CircleCheck /><h3>Tài khoản đã xác minh</h3><p>Email của bạn đã được xác minh. Bạn có thể khai báo hồ sơ câu lạc bộ.</p></article><article className="p-card"><Building2 /><h3>Hồ sơ và tư cách thành viên</h3><p>Tạo hồ sơ CLB là bước chuẩn bị. Tư cách thành viên chỉ được cập nhật sau quyết định phê duyệt.</p></article><article className="p-card"><ShieldCheck /><h3>Bảo mật tài khoản</h3><p>{aal2 ? 'Phiên hiện tại đã xác thực hai bước.' : 'Bạn có thể bật xác thực hai bước để tăng bảo vệ tài khoản.'}</p><a href="#/bao-mat">Mở cài đặt bảo mật →</a></article></div>
    <section className="p-card"><h2>Cùng tham gia hoạt động</h2><p>Khám phá workshop, hội thảo và chương trình từ Mạng lưới. Theo dõi chỗ đã xác nhận và các lượt đang chờ ngay trong tài khoản.</p><div className="form-actions"><a className="p-btn" href="#/hoat-dong">Khám phá hoạt động</a><a className="p-btn secondary" href="#/dang-ky-hoat-dong">Đăng ký của tôi</a></div></section>
    {roles.length > 0 && <Notice>Bạn đã được phân công quyền: {roles.map((r) => ({ admin: 'Quản trị hệ thống', reviewer: 'Thẩm định', approver: 'Phê duyệt' })[r]).join(', ')}. Khu vực quản trị yêu cầu xác thực hai bước.</Notice>}
  </PortalLayout>;
}
export function ProfilePage() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      await saveProfile({ full_name: String(data.get('full_name') || ''), university: String(data.get('university') || ''), field: String(data.get('field') || ''), bio: String(data.get('bio') || '') });
      await auth.refresh(); setMessage('Đã lưu hồ sơ cá nhân.');
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  return <PortalLayout title="Hồ sơ cá nhân" subtitle="Giới thiệu đôi nét về bạn và mối quan tâm nghiên cứu."><section className="p-card form-card">{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}<form className="p-form" onSubmit={(e) => { void save(e); }}><label>Họ và tên<input name="full_name" defaultValue={auth.profile?.full_name} required minLength={2} maxLength={120} autoComplete="name" /></label><label>Email đã xác minh<input value={auth.profile?.email || ''} disabled /><small>Email và thông tin cá nhân không hiển thị trong danh bạ công khai.</small></label><label>Trường / đơn vị<input name="university" defaultValue={auth.profile?.university} maxLength={180} /></label><label>Lĩnh vực quan tâm<input name="field" defaultValue={auth.profile?.field} maxLength={120} /></label><label>Giới thiệu<textarea name="bio" defaultValue={auth.profile?.bio} maxLength={2000} rows={5} /></label><button className="p-btn" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></form></section></PortalLayout>;
}
