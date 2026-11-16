import { useEffect, useState, type FormEvent } from 'react';
import { Notice, PortalLayout } from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { database, readableError } from '../lib/supabase';

export default function SecurityPage() {
  const auth = useAuth();
  const [factorId, setFactorId] = useState('');
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    void database().auth.mfa.listFactors().then(({ data, error: err }) => {
      if (!alive) return;
      if (err) setError(readableError(err));
      else setFactorId(data.totp.find((f) => f.status === 'verified')?.id || '');
    });
    return () => { alive = false; };
  }, []);
  async function enroll() {
    setBusy(true); setError('');
    try {
      const client = database();
      const factors = await client.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
      // Clear only unfinished setup attempts owned by this account.
      for (const factor of factors.data.all.filter((f) => f.factor_type === 'totp' && f.status === 'unverified')) {
        const removed = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (removed.error) throw removed.error;
      }
      const result = await client.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'SVNCKH-NET' });
      if (result.error) throw result.error;
      setFactorId(result.data.id);
      setQr(result.data.totp.qr_code.startsWith('data:') ? result.data.totp.qr_code : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.data.totp.qr_code)}`);
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const code = String(new FormData(event.currentTarget).get('code'));
    try {
      const result = await database().auth.mfa.challengeAndVerify({ factorId, code });
      if (result.error) throw result.error;
      setQr(''); await auth.refresh(); setMessage('Đã xác thực hai bước cho phiên hiện tại.');
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  async function password(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      if (data.get('password') !== data.get('confirm')) throw new Error('Hai mật khẩu chưa trùng nhau.');
      const result = await database().auth.updateUser({ password: String(data.get('password')), nonce: String(data.get('nonce') || '') || undefined });
      if (result.error) throw result.error;
      const signedOut = await database().auth.signOut({ scope: 'global' });
      if (signedOut.error) throw signedOut.error;
    } catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  return <PortalLayout title="Bảo mật tài khoản" subtitle="Bảo vệ tài khoản bằng mật khẩu riêng và xác thực hai bước.">{error && <Notice tone="error">{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}<div className="security-grid"><section className="p-card"><h2>Xác thực hai bước</h2><p>Bắt buộc khi truy cập quản trị, thẩm định hoặc phê duyệt. Sử dụng ứng dụng tạo mã như Google Authenticator.</p>{auth.aal2 ? <Notice tone="success">Phiên hiện tại đã được xác thực hai bước.</Notice> : !factorId ? <button className="p-btn" disabled={busy} onClick={() => { void enroll(); }}>Thiết lập xác thực hai bước</button> : <><p>{qr ? 'Quét mã bằng ứng dụng xác thực rồi nhập mã 6 chữ số để hoàn tất.' : 'Nhập mã 6 chữ số từ ứng dụng xác thực đã liên kết.'}</p>{qr && <img className="mfa-qr" src={qr} alt="Mã QR thiết lập xác thực hai bước cho tài khoản của bạn" />}<form className="p-form" onSubmit={(e) => { void verify(e); }}><label>Mã xác thực<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></label><button className="p-btn" disabled={busy}>{busy ? 'Đang xác minh…' : 'Xác thực'}</button></form></>}</section><section className="p-card"><h2>Đổi mật khẩu</h2><p>Các phiên đăng nhập sẽ được đăng xuất sau khi cập nhật mật khẩu.</p><form className="p-form" onSubmit={(e) => { void password(e); }}><label>Mật khẩu mới<input type="password" name="password" minLength={10} maxLength={128} autoComplete="new-password" required /></label><label>Nhập lại mật khẩu mới<input type="password" name="confirm" minLength={10} maxLength={128} autoComplete="new-password" required /></label><label>Mã xác nhận email (nếu được yêu cầu)<input name="nonce" autoComplete="one-time-code" /></label><button type="button" className="p-btn secondary" disabled={busy} onClick={() => { void database().auth.reauthenticate().then(({ error: err }) => err ? setError(readableError(err)) : setMessage('Đã gửi yêu cầu xác nhận đến email của bạn.')); }}>Gửi mã xác nhận</button><button className="p-btn" disabled={busy}>{busy ? 'Đang lưu…' : 'Đổi mật khẩu'}</button></form></section></div></PortalLayout>;
}
