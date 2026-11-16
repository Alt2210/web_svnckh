import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoute } from '../lib/navigation';
import { readableError } from '../lib/errors';

/** Consistent guest/member/admin navigation on landing and application pages. */
export function HeaderAccount({ variant = 'portal', onNavigate }: { variant?: 'landing' | 'portal'; onNavigate?: () => void }) {
  const auth = useAuth();
  const route = useRoute().split('?')[0];
  const menu = useRef<HTMLDetailsElement>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const admin = auth.roles.includes('admin');
  const destination = admin ? '/admin/ho-so' : '/clb';
  const current = admin ? route === '/admin' || route.startsWith('/admin/') : route === '/clb';
  const name = auth.profile?.full_name.trim() || 'Tài khoản';
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false; };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && menu.current?.open) { menu.current.open = false; menu.current.querySelector('summary')?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);
  async function signOut() {
    setBusy(true); setError('');
    try { await auth.signOut(); if (menu.current) menu.current.open = false; onNavigate?.(); }
    catch (err) { setError(readableError(err)); } finally { setBusy(false); }
  }
  if (auth.loading && !auth.profile) return <span className="header-session-loading" role="status">Đang tải tài khoản…</span>;
  return <div className={`header-account header-account-${variant}`}>
    {!auth.session && <a className="header-signin" href="#/dang-nhap" onClick={onNavigate}>Đăng nhập</a>}
    {!current && <a className="header-primary" href={`#${destination}`} onClick={onNavigate}>{auth.session ? admin ? 'Quản lý hồ sơ' : 'Hồ sơ của tôi' : 'Nộp hồ sơ CLB'}<ArrowUpRight size={16} aria-hidden="true" /></a>}
    {auth.session && <details className="header-user-menu" ref={menu}><summary aria-label={`Tài khoản ${name}`}><span className="header-avatar" aria-hidden="true">{name.charAt(0).toLocaleUpperCase('vi')}</span><span className="header-user-name">{name}</span><ChevronDown className="header-menu-chevron" size={15} aria-hidden="true" /></summary><div className="header-menu-panel"><div className="header-menu-identity"><strong>{name}</strong><span>{admin ? 'Quản trị viên' : 'Đã đăng nhập'}</span></div><button type="button" disabled={busy} onClick={() => { void signOut(); }}><LogOut size={16} />{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>{error && <p role="alert">{error}</p>}</div></details>}
  </div>;
}
