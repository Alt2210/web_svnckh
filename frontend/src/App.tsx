import { lazy, Suspense, useEffect } from 'react';
import { navigate, useRoute } from './lib/navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ApplicationAdminPage = lazy(() => import('./pages/ApplicationAdminPage'));

function Redirect({ to }: { to: string }) {
  useEffect(() => { navigate(to, true); }, [to]);
  return null;
}

export default function App() {
  const auth = useAuth();
  const route = useRoute().split('?')[0];
  let page;
  if (route === '/') page = <LandingPage />;
  else if (route === '/dang-nhap') page = <AuthPage key="login" mode="login" />;
  else if (route === '/admin/dang-nhap') page = <Redirect to="/dang-nhap" />;
  else if (route === '/dang-ky') page = <AuthPage key="register" mode="register" />;
  else if (route === '/quen-mat-khau') page = <AuthPage key="forgot" mode="forgot" />;
  else if (route === '/dat-lai-mat-khau') page = <AuthPage key="reset" mode="reset" />;
  else if (route === '/admin' || route.startsWith('/admin/')) page = <ProtectedRoute><ApplicationAdminPage /></ProtectedRoute>;
  else if (route === '/clb' || route.startsWith('/clb/')) page = <Redirect to="/?ho-so=clb" />;
  else if (['/tai-khoan', '/ho-so', '/bao-mat', '/hoat-dong', '/dang-ky-hoat-dong', '/quan-ly-hoat-dong'].includes(route) || route.startsWith('/hoat-dong/') || route.startsWith('/quan-ly-hoat-dong/')) page = <Redirect to="/" />;
  else page = <div className="auth-page"><main className="auth-card"><h1>Không tìm thấy trang</h1><a className="p-btn" href="#/">Quay về trang chủ</a></main></div>;
  return <>{auth.callbackError && <aside className="auth-callback-notice" role="alert"><p>{auth.callbackError}</p><button onClick={auth.dismissCallbackError} aria-label="Đóng thông báo xác thực">×</button></aside>}<Suspense fallback={<div className="portal-loading" role="status">Đang tải trang…</div>}>{page}</Suspense></>;
}
