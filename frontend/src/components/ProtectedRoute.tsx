import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { navigate } from '../lib/navigation';
import { isConfigured, resendConfirmation } from '../services/auth.service';
import { readableError } from '../lib/errors';
import { Notice, PortalLayout } from './PortalLayout';

export function ProtectedRoute({ children, staff = false, admin = false, loginPath = '/dang-nhap' }: { children: ReactNode; staff?: boolean; admin?: boolean; loginPath?: string }) {
  const auth = useAuth();
  const [message, setMessage] = useState('');
  useEffect(() => { if (isConfigured && !auth.loading && !auth.session) navigate(loginPath, true); }, [auth.loading, auth.session, loginPath]);
  if (!isConfigured) return <Unavailable />;
  if (auth.loading) return <div className="portal-loading" role="status">Đang tải tài khoản…</div>;
  if (!auth.session) return null;
  if (!auth.session.user.email_confirmed_at) return <PortalLayout title="Vui lòng xác minh email"><Notice>Kiểm tra hộp thư và mở liên kết xác minh trước khi sử dụng chức năng tài khoản và đăng ký câu lạc bộ.</Notice>{message && <Notice>{message}</Notice>}<button className="p-btn" onClick={() => { void resendConfirmation(auth.session!.user.email!).then(() => setMessage('Đã yêu cầu gửi lại email xác minh.')).catch((err) => setMessage(readableError(err))); }}>Gửi lại email xác minh</button></PortalLayout>;
  if (auth.error || !auth.profile) return <PortalLayout title="Không tải được tài khoản"><Notice tone="error">{auth.error || 'Vui lòng đăng nhập lại.'}</Notice><button className="p-btn" onClick={() => { void auth.refresh(); }}>Thử lại</button></PortalLayout>;
  if (auth.profile.status === 'locked') return <PortalLayout title="Tài khoản đã bị khóa"><Notice tone="error">Tài khoản tạm thời không thể sử dụng các chức năng. Vui lòng liên hệ đơn vị quản lý.</Notice></PortalLayout>;
  if ((admin && !auth.roles.includes('admin')) || (staff && !auth.roles.length)) return <PortalLayout title="Không có quyền truy cập"><Notice tone="error">Mục này dành cho cán bộ được phân công. Quyền truy cập được kiểm tra tại cơ sở dữ liệu.</Notice></PortalLayout>;
  if ((staff || admin) && !auth.roles.includes('admin') && !auth.aal2) return <PortalLayout title="Cần xác thực hai bước"><Notice>Vui lòng xác thực hai bước trước khi truy cập khu vực quản trị.</Notice><a className="p-btn" href="#/bao-mat">Mở bảo mật tài khoản</a></PortalLayout>;
  return children;
}
export function Unavailable() { return <div className="auth-page"><div className="auth-card"><span className="portal-eyebrow">SVNCKH-NET</span><h1>Cổng tài khoản đang được chuẩn bị</h1><p>Chức năng tài khoản và đăng ký câu lạc bộ sẽ được mở sau khi hoàn tất thiết lập hệ thống.</p><a className="p-btn" href="#/">Quay lại trang chủ</a></div></div>; }
