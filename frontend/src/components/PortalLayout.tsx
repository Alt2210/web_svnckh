import { useState, type ReactNode } from 'react';
import { ArrowUpRight, LogOut } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { readableError } from '../lib/errors';

export function PortalLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const auth = useAuth();
  const [error, setError] = useState('');
  return <div className="portal compact-portal"><header className="portal-header"><a className="portal-brand" href="#/"><img src={`${import.meta.env.BASE_URL}assets/logo.svg`} alt="" /><span>SVNCKH<span>NETWORK</span></span></a><nav className="compact-header-actions" aria-label="Điều hướng"><a className="portal-back" href="#/">Trang chủ <ArrowUpRight size={16} /></a>{auth.roles.includes('admin') && <a href="#/admin/ho-so">Hồ sơ CLB</a>}<button className="text-button" onClick={() => { void auth.signOut().catch((err) => setError(readableError(err))); }}><LogOut size={17} />Đăng xuất</button></nav></header><main className="portal-main"><div className="portal-heading"><div><span className="portal-eyebrow">SVNCKH NETWORK</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div></div>{error && <Notice tone="error">{error}</Notice>}{children}</main></div>;
}
export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' | 'success' }) { return <div className={`notice ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="empty-state"><Building2 size={32} /><h3>{title}</h3><p>{description}</p>{action}</div>; }
