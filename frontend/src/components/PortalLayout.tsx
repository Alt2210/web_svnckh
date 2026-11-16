import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Building2, CircleUserRound, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X, CalendarDays, ScrollText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRoute } from '../lib/navigation';
import { readableError } from '../lib/errors';

export function PortalLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const auth = useAuth();
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const admin = auth.roles.includes('admin');
  const staff = auth.roles.length > 0;
  const links = [
    { path: '/tai-khoan', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/ho-so', label: 'Hồ sơ cá nhân', icon: CircleUserRound },
    { path: '/clb', label: 'Câu lạc bộ của tôi', icon: Building2 },
    { path: '/hoat-dong', label: 'Khám phá hoạt động', icon: CalendarDays },
    { path: '/dang-ky-hoat-dong', label: 'Đăng ký hoạt động', icon: ScrollText },
    { path: '/quan-ly-hoat-dong', label: 'Tổ chức hoạt động', icon: Users },
    { path: '/bao-mat', label: 'Bảo mật tài khoản', icon: ShieldCheck },
    ...(admin ? [{ path: '/admin/nguoi-dung', label: 'Quản lý người dùng', icon: Users }, { path: '/admin/clb', label: 'Quản lý câu lạc bộ', icon: Building2 }, { path: '/admin/dot-tuyen', label: 'Đợt tiếp nhận', icon: CalendarDays }] : []),
    ...(staff ? [{ path: '/admin/ho-so', label: 'Hồ sơ gia nhập', icon: ScrollText }, { path: '/admin/nhat-ky', label: 'Nhật ký hệ thống', icon: ShieldCheck }] : []),
  ];
  return <div className="portal">
    <header className="portal-header"><a className="portal-brand" href="#/"><img src={`${import.meta.env.BASE_URL}assets/logo.svg`} alt="" /><span>SVNCKH<span>NETWORK</span></span></a><a className="portal-back" href="#/">Về trang chủ <ArrowUpRight size={17} /></a><button className="portal-menu" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>
    <aside className={`portal-sidebar ${open ? 'open' : ''}`}><div className="portal-user"><span className="avatar">{auth.profile?.full_name.charAt(0) || 'S'}</span><strong>{auth.profile?.full_name || 'Thành viên'}</strong><span>{admin ? 'Quản trị hệ thống' : staff ? 'Cán bộ được phân công' : 'Thành viên cộng đồng'}</span></div><nav aria-label="Điều hướng tài khoản">{links.map(({ path, label, icon: Icon }) => <a key={path} href={`#${path}`} aria-current={route === path ? 'page' : undefined} onClick={() => setOpen(false)}><Icon size={19} />{label}</a>)}</nav><button className="portal-signout" onClick={() => { void auth.signOut().catch((err) => setError(readableError(err))); }}><LogOut size={18} />Đăng xuất</button></aside>
    <main className="portal-main"><div className="portal-heading"><div><span className="portal-eyebrow">KHÔNG GIAN MẠNG LƯỚI</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div><span className="portal-edition">SVNCKH-NET</span></div>{error && <Notice tone="error">{error}</Notice>}{children}</main>
  </div>;
}
export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' | 'success' }) { return <div className={`notice ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="empty-state"><Building2 size={32} /><h3>{title}</h3><p>{description}</p>{action}</div>; }
