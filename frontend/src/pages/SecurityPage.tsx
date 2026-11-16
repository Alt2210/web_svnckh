import { useEffect, useState, type FormEvent } from 'react';
import { Notice, PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { verifiedTotpFactor, enrollTotp, verifyTotp, updatePassword, signOutSession, requestReauthentication } from '../services/auth.service';
import { readableError } from '../lib/errors';

export default function SecurityPage() {
  const auth = useAuth();
  const [factorId, setFactorId] = useState('');
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    void verifiedTotpFactor().then((id) => { if (alive) setFactorId(id); }).catch((err) => { if (alive) setError(readableError(err)); });
    return () => { alive = false; };
  }, []);
  async function enroll() {
    setBusy(true); setError('');
    try {
      const result = await enrollTotp();
      setFactorId(result.id);
      setQr(result.totp.qr_code.startsWith('data:') ? result.totp.qr_code : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.totp.qr_code)}`);
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const code = String(new FormData(event.currentTarget).get('code'));
    try {
      await verifyTotp(factorId, code);
      setQr(''); await auth.refresh(); setMessage('Đã xác thực hai bước cho phiên hiện tại.');
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function password(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      if (data.get('password') !== data.get('confirm')) throw new Error('Hai mật khẩu chưa trùng nhau.');
      await updatePassword(String(data.get('password')), String(data.get('nonce') || '') || undefined);
      await signOutSession(true);
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  return <PortalLayout title="Bảo mật tài khoản" subtitle="Bảo vệ tài khoản bằng mật khẩu riêng và xác thực hai bước.">{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}<div className="security-grid"><section className="p-card"><h2>Xác thực hai bước</h2><p>Bắt buộc khi truy cập quản trị, thẩm định hoặc phê duyệt. Sử dụng ứng dụng tạo mã như Google Authenticator.</p>{auth.aal2 ? <Notice tone="success">Phiên hiện tại đã được xác thực hai bước.</Notice> : !factorId ? <button className="p-btn" disabled={busy} onClick={() => { void enroll(); }}>Thiết lập xác thực hai bước</button> : <><p>{qr ? 'Quét mã bằng ứng dụng xác thực rồi nhập mã 6 chữ số để hoàn tất.' : 'Nhập mã 6 chữ số từ ứng dụng xác thực đã liên kết.'}</p>{qr && <img className="mfa-qr" src={qr} alt="Mã QR thiết lập xác thực hai bước cho tài khoản của bạn" />}<form className="p-form" onSubmit={(e) => { void verify(e); }}><label>Mã xác thực<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></label><button className="p-btn" disabled={busy}>{busy ? 'Đang xác minh…' : 'Xác thực'}</button></form></>}</section><section className="p-card"><h2>Đổi mật khẩu</h2><p>Các phiên đăng nhập sẽ được đăng xuất sau khi cập nhật mật khẩu.</p><form className="p-form" onSubmit={(e) => { void password(e); }}><label>Mật khẩu mới<input type="password" name="password" minLength={10} maxLength={128} autoComplete="new-password" required /></label><label>Nhập lại mật khẩu mới<input type="password" name="confirm" minLength={10} maxLength={128} autoComplete="new-password" required /></label><label>Mã xác nhận email (nếu được yêu cầu)<input name="nonce" autoComplete="one-time-code" /></label><button type="button" className="p-btn secondary" disabled={busy} onClick={() => { void requestReauthentication().then(() => setMessage('Đã gửi yêu cầu xác nhận đến email của bạn.')).catch((err) => setError(readableError(err))); }}>Gửi mã xác nhận</button><button className="p-btn" disabled={busy}>{busy ? 'Đang lưu…' : 'Đổi mật khẩu'}</button></form></section></div></PortalLayout>;
}
