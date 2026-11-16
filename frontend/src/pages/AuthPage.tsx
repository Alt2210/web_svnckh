import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isConfigured, signUp, signIn, requestPasswordReset, updatePassword, signOutSession } from '../services/auth.service';
import { readableError } from '../lib/errors';
import { navigate, useRoute } from '../lib/navigation';
import { Notice } from '../components/PortalLayout';

type Mode = 'login' | 'register' | 'forgot' | 'reset';
const content: Record<Mode, [string, string, string]> = {
  login: ['Chào mừng trở lại.', 'Đăng nhập để quản lý hồ sơ và kết nối câu lạc bộ của bạn.', 'Đăng nhập'],
  register: ['Bắt đầu một kết nối mới.', 'Tạo tài khoản bằng email cá nhân. Bạn không cần sử dụng email của trường.', 'Tạo tài khoản'],
  forgot: ['Tìm lại kết nối.', 'Nhập email để nhận hướng dẫn đặt lại mật khẩu.', 'Gửi hướng dẫn'],
  reset: ['Đặt mật khẩu mới.', 'Sử dụng mật khẩu riêng cho tài khoản Mạng lưới của bạn.', 'Lưu mật khẩu mới'],
};

export default function AuthPage({ mode }: { mode: Mode }) {
  const auth = useAuth();
  const nextClub = new URLSearchParams(useRoute().split('?')[1] || '').get('next') === 'clb';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [title, description, button] = content[mode];
  useEffect(() => {
    if (auth.session && !auth.loading && ['login', 'register'].includes(mode)) navigate(nextClub ? '/clb' : auth.roles.includes('admin') ? '/admin/ho-so' : '/clb', true);
  }, [auth.session, auth.loading, auth.roles, mode, nextClub]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') || '');
    try {
      if (mode === 'register') {
        if (password !== data.get('confirm')) throw new Error('Hai mật khẩu chưa trùng nhau.');
        await signUp(email.trim(), password, String(data.get('full_name')).trim());
        setMessage('Vui lòng kiểm tra email và mở liên kết xác minh để hoàn tất đăng ký. Nếu đã có tài khoản, bạn có thể đăng nhập hoặc đặt lại mật khẩu.');
      } else if (mode === 'forgot') {
        await requestPasswordReset(email.trim());
        setMessage('Nếu email đủ điều kiện, bạn sẽ nhận được liên kết đặt lại mật khẩu. Vui lòng kiểm tra cả thư mục thư rác.');
      } else if (mode === 'reset') {
        if (!auth.session) throw new Error('Vui lòng mở liên kết khôi phục còn hiệu lực từ email.');
        if (password !== data.get('confirm')) throw new Error('Hai mật khẩu chưa trùng nhau.');
        await updatePassword(password);
        await signOutSession(true);
        setMessage('Đã cập nhật mật khẩu và đăng xuất các phiên. Bạn có thể đăng nhập lại.');
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }

  return <div className="auth-page">
    <aside className="auth-story"><a className="auth-logo" href="#/"><img src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="" />SVNCKH-NET</a><div><span className="portal-eyebrow">KẾT NỐI TRI THỨC TRẺ</span><h2>Mỗi tài khoản.<br />Một khởi đầu<br /><em>nhiều khả năng.</em></h2><p>Cùng xây dựng một cộng đồng nghiên cứu sinh viên minh bạch, kết nối và không ngừng phát triển.</p></div><span className="auth-story-foot"><ShieldCheck size={18} />Hồ sơ riêng tư. Kết nối có trách nhiệm.</span></aside>
    <main className="auth-panel"><a className="auth-back" href="#/"><ArrowLeft size={17} />Trang chủ</a><div className="auth-form-wrap"><span className="portal-eyebrow">TÀI KHOẢN MẠNG LƯỚI</span><h1>{title}</h1><p>{description}</p>
      {!isConfigured && <Notice>Cổng tài khoản đang được chuẩn bị. Biểu mẫu sẽ được mở sau khi hoàn tất kết nối hệ thống.</Notice>}{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}
      <form onSubmit={(e) => { void submit(e); }} className="p-form">
        {mode === 'register' && <label>Họ và tên<input name="full_name" autoComplete="name" minLength={2} maxLength={120} placeholder="Nguyễn Văn An" required /></label>}
        {mode !== 'reset' && <label>Email cá nhân<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="ban@example.com" maxLength={254} required /></label>}
        {mode !== 'forgot' && <label>Mật khẩu<span className="password-field"><input type={visible ? 'text' : 'password'} name="password" autoComplete={['register', 'reset'].includes(mode) ? 'new-password' : 'current-password'} minLength={['register', 'reset'].includes(mode) ? 10 : 1} maxLength={128} required /><button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span>{['register', 'reset'].includes(mode) && <small>Tối thiểu 10 ký tự; nên kết hợp chữ, số và ký tự đặc biệt.</small>}</label>}
        {['register', 'reset'].includes(mode) && <label>Nhập lại mật khẩu<input type={visible ? 'text' : 'password'} name="confirm" autoComplete="new-password" minLength={10} maxLength={128} required /></label>}
        {mode === 'register' && <label className="p-checkbox"><input type="checkbox" required /><span>Tôi đồng ý để hệ thống xử lý thông tin tài khoản phục vụ hoạt động Mạng lưới. Thông tin liên hệ cá nhân không công khai mặc định.</span></label>}
        <button className="p-btn" disabled={!isConfigured || busy || (mode === 'reset' && !auth.session)}>{busy ? 'Đang xử lý…' : button}<ArrowUpRight size={18} /></button>
      </form>
      {mode === 'login' && <div className="auth-links"><a href="#/quen-mat-khau">Quên mật khẩu?</a><a href={nextClub ? "#/dang-ky?next=clb" : "#/dang-ky"}>Tạo tài khoản</a></div>}
      {['register', 'forgot', 'reset'].includes(mode) && <p className="auth-switch">Đã có tài khoản? <a href={nextClub ? "#/dang-nhap?next=clb" : "#/dang-nhap"}>Đăng nhập</a></p>}
    </div></main>
  </div>;
}
