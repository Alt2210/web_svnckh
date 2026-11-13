import { useRef } from 'react';
import { Icon } from '../common/Icon';
import { useMobileMenu } from '../../hooks/useMobileMenu';
import { useActiveSection } from '../../hooks/useActiveSection';

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menu = useMobileMenu(headerRef);
  const activeId = useActiveSection();
  return (
<header ref={headerRef} className={"fixed top-0 left-0 right-0 z-50 bg-deep-navy-anchor/95 backdrop-blur-xl border-b border-cyan-core/20 shadow-[0_4px_24px_rgba(2,27,69,0.4)] site-header"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter h-20 flex items-center justify-between gap-space-md"}>
<div className={"flex items-center gap-space-md shrink-0"}>
<a className={"flex items-center gap-space-sm group"} data-path={"trang-chu"} href={"#trang-chu"} aria-current={activeId === "trang-chu" ? "location" : undefined}>
<div className={"w-11 h-11 rounded-none border border-cyan-core/40 bg-gradient-to-br from-royal-blue via-deep-navy-base to-deep-navy-anchor flex items-center justify-center text-accent-gold-light shadow-[0_0_14px_rgba(55,184,248,0.35)] relative overflow-hidden"}>
<div className={"absolute -top-6 -right-6 w-10 h-10 bg-accent-gold-light/30 blur-sm pointer-events-none"}>
</div>
<img alt={"Biểu trưng Mạng lưới SVNCKH"} className={"brand-symbol"} height={"44"} src={"/assets/logo-color.svg"} width={"44"} />
</div>
<div className={"flex flex-col"}>
<span className={"font-headline-sm text-headline-sm text-surface tracking-tight leading-none group-hover:text-accent-gold-light transition-colors uppercase font-extrabold"}>{" SVNCKH-NET "}</span>
<span className={"font-label-badge text-[10px] text-cyan-core tracking-widest uppercase mt-1 font-semibold"}>{" Mạng lưới NCKH Sinh viên Toàn quốc "}</span>
</div>
</a>
</div>
<nav data-active-classes={"bg-gradient-to-r from-royal-blue to-deep-navy-base text-surface border-b-2 border-accent-gold-light font-headline-sm text-label-lg rounded-none"} id={"primary-navigation"} className={`hidden xl:flex items-center gap-1.5 ${menu.isOpen ? "is-open" : ""}`} onClick={menu.close}>
<a className={"px-3.5 py-2 transition-all bg-gradient-to-r from-royal-blue/90 to-deep-navy-base border-b-2 border-accent-gold-light text-surface font-headline-sm text-label-lg rounded-none uppercase text-[13px] tracking-wider"} data-path={"trang-chu"} href={"#trang-chu"} aria-current={activeId === "trang-chu" ? "location" : undefined}>{" Trang chủ "}</a>
<a className={"px-3.5 py-2 font-label-lg text-[13px] text-surface-container-high/90 hover:text-cyan-core hover:bg-white/5 transition-colors uppercase tracking-wider rounded-none"} data-path={"ve-mang-luoi"} href={"#ve-mang-luoi"} aria-current={activeId === "ve-mang-luoi" ? "location" : undefined}>{" Về Mạng lưới "}</a>
<a className={"px-3.5 py-2 font-label-lg text-[13px] text-surface-container-high/90 hover:text-cyan-core hover:bg-white/5 transition-colors uppercase tracking-wider rounded-none"} data-path={"danh-ba-clb"} href={"#tra-cuu-danh-ba"} aria-current={activeId === "tra-cuu-danh-ba" ? "location" : undefined}>{" Danh bạ CLB "}</a>
<a className={"px-3.5 py-2 font-label-lg text-[13px] text-surface-container-high/90 hover:text-cyan-core hover:bg-white/5 transition-colors uppercase tracking-wider rounded-none"} data-path={"dot-tuyen-gia-nhap"} href={"#dang-ky-dot-1"} aria-current={activeId === "dang-ky-dot-1" ? "location" : undefined}>{" Đợt tuyển & Gia nhập "}</a>
<a className={"px-3.5 py-2 font-label-lg text-[13px] text-surface-container-high/90 hover:text-cyan-core hover:bg-white/5 transition-colors uppercase tracking-wider rounded-none"} data-path={"hoat-dong-su-kien"} href={"#hoat-dong-su-kien"} aria-current={activeId === "hoat-dong-su-kien" ? "location" : undefined}>{" Hoạt động & Sự kiện "}</a>
<a className={"px-3.5 py-2 font-label-lg text-[13px] text-surface-container-high/90 hover:text-cyan-core hover:bg-white/5 transition-colors uppercase tracking-wider rounded-none"} data-path={"tin-tuc-truyen-thong"} href={"#tin-tuc"} aria-current={activeId === "tin-tuc" ? "location" : undefined}>{" Tin tức - Truyền thông "}</a>
</nav>
<div className={"flex items-center gap-space-sm shrink-0"}>
<a className={"hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 font-label-lg text-label-lg text-surface-container-high hover:text-surface hover:bg-white/10 rounded-none border border-white/15 transition-all text-[12px] uppercase tracking-wider"} data-path={"danh-ba-clb"} href={"#tra-cuu-danh-ba"} aria-current={activeId === "tra-cuu-danh-ba" ? "location" : undefined}>
<Icon name="search" className="text-[17px] text-cyan-core" />
<span>{" Tra cứu CLB "}</span>
</a>
<a className={"inline-flex items-center gap-1.5 px-4 py-2 font-label-lg text-label-lg rounded-none bg-gradient-to-r from-tertiary-fixed-dim via-accent-gold-light to-tertiary-fixed-dim text-deep-navy-anchor bca-gold-glow hover:brightness-105 transition-all font-bold tracking-wider uppercase text-[12px] border border-accent-gold-light/60"} data-path={"dang-ky-gia-nhap"} href={"#dang-ky-dot-1"} aria-current={activeId === "dang-ky-dot-1" ? "location" : undefined}>
<Icon name="group_add" className="text-[17px]" />
<span>{" Đăng ký gia nhập "}</span>
</a>
<a className={"hidden md:inline-flex items-center px-3.5 py-2 font-label-lg text-label-lg text-surface hover:text-accent-gold-light transition-colors uppercase text-[12px] tracking-wider"} data-action={"login"} data-path={"dang-nhap"} href={"#dang-ky-dot-1"} aria-current={activeId === "dang-ky-dot-1" ? "location" : undefined}>
<Icon name="login" className="mr-1 text-[17px]" />
<span>{" Đăng nhập "}</span>
</a>
<div className={"w-8 h-8 rounded-none border border-cyan-core/30 bg-royal-blue/60 flex items-center justify-center shrink-0"}>
<Icon name="person" className="text-cyan-core text-[18px]" />
</div>
</div>
<button aria-controls={"primary-navigation"} className={"menu-toggle"} type={"button"} aria-expanded={menu.isOpen} aria-label={menu.isOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"} onClick={menu.toggle}>
<Icon name="menu" className="" />
</button>
</div>
</header>
  );
}
