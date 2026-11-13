import { Icon } from '../common/Icon';

export function Footer() {
  return (
<footer className={"w-full bg-[#010c22] text-surface-container-high border-t border-cyan-core/20"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter pt-space-2xl pb-space-lg"}>
<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-xl pb-space-2xl"}>
<div className={"lg:col-span-5 flex flex-col gap-space-md"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-10 h-10 rounded-none bg-gradient-to-br from-royal-blue to-deep-navy-base border border-cyan-core/40 flex items-center justify-center text-accent-gold-light"}>
<img alt={"Biểu trưng Mạng lưới SVNCKH"} className={"brand-symbol"} height={"44"} src={"/assets/logo-color.svg"} width={"44"} />
</div>
<div className={"flex flex-col"}>
<span className={"font-headline-sm text-headline-sm text-surface tracking-tight uppercase font-extrabold"}>{" SVNCKH-NET "}</span>
<span className={"font-label-badge text-label-badge text-cyan-core uppercase tracking-widest text-[10px]"}>{" Cổng Tri thức Sáng tạo Trẻ Toàn quốc "}</span>
</div>
</div>
<div className={"font-body-sm text-body-sm text-surface-container-high/90 space-y-1.5"}>
<p className={"font-headline-sm text-label-lg text-surface uppercase tracking-wider text-[12px]"}>{" Cơ quan chủ quản: "}</p>
<p className={"font-headline-sm text-body-sm text-surface-bright font-bold"}>{" Trung tâm Phát triển Khoa học, Công nghệ và Tài năng trẻ (CYSTAC) "}</p>
<p>{" Trung ương Đoàn Thanh niên Cộng sản Hồ Chí Minh "}</p>
<p className={"flex items-start gap-2 pt-1"}>
<Icon name="location_on" className="text-[18px] text-cyan-core shrink-0 mt-0.5" />
<span>{" Số 7 Xã Đàn, Phường Phương Liên, Quận Đống Đa, TP. Hà Nội "}</span>
</p>
</div>
</div>
<div className={"lg:col-span-2 flex flex-col gap-space-sm"}>
<p className={"font-headline-sm text-label-lg text-surface uppercase tracking-widest text-[12px] border-b border-cyan-core/30 pb-1 font-bold"}>{" Điều hướng "}</p>
<ul className={"space-y-2 font-body-sm text-body-sm"}>
<li className={"flex items-center gap-1.5"}>
<Icon name="chevron_right" className="text-[16px] text-accent-gold-light" />
<a className={"hover:text-cyan-core transition-colors"} data-path={"ve-mang-luoi"} href={"#ve-mang-luoi"}>{" Về Mạng lưới "}</a>
</li>
<li className={"flex items-center gap-1.5"}>
<Icon name="chevron_right" className="text-[16px] text-accent-gold-light" />
<a className={"hover:text-cyan-core transition-colors"} data-path={"danh-ba-clb"} href={"#tra-cuu-danh-ba"}>{" Danh bạ CLB Toàn quốc "}</a>
</li>
<li className={"flex items-center gap-1.5"}>
<Icon name="chevron_right" className="text-[16px] text-accent-gold-light" />
<a className={"hover:text-cyan-core transition-colors"} data-path={"dot-tuyen-gia-nhap"} href={"#dang-ky-dot-1"}>{" Đợt tuyển thành viên "}</a>
</li>
<li className={"flex items-center gap-1.5"}>
<Icon name="chevron_right" className="text-[16px] text-accent-gold-light" />
<a className={"hover:text-cyan-core transition-colors"} data-path={"hoat-dong-su-kien"} href={"#hoat-dong-su-kien"}>{" Hội nghị & Sự kiện NCKH "}</a>
</li>
<li className={"flex items-center gap-1.5"}>
<Icon name="chevron_right" className="text-[16px] text-accent-gold-light" />
<a className={"hover:text-cyan-core transition-colors"} data-path={"tin-tuc-truyen-thong"} href={"#tin-tuc"}>{" Bản tin Khoa học Trẻ "}</a>
</li>
</ul>
</div>
<div className={"lg:col-span-2 flex flex-col gap-space-sm"}>
<p className={"font-headline-sm text-label-lg text-surface uppercase tracking-widest text-[12px] border-b border-cyan-core/30 pb-1 font-bold"}>{" Văn bản & Hỗ trợ "}</p>
<ul className={"space-y-2 font-body-sm text-body-sm"}>
<li className={"flex items-center gap-1.5"}>
<Icon name="description" className="text-[16px] text-cyan-core" />
<a className={"hover:text-surface transition-colors"} data-path={"quy-che-hoat-dong"} href={"#dang-ky-dot-1"}>{" Quy chế Mạng lưới "}</a>
</li>
<li className={"flex items-center gap-1.5"}>
<Icon name="menu_book" className="text-[16px] text-cyan-core" />
<a className={"hover:text-surface transition-colors"} data-path={"tai-lieu-huong-dan"} href={"#dang-ky-dot-1"}>{" Tài liệu hướng dẫn CLB "}</a>
</li>
<li className={"flex items-center gap-1.5"}>
<Icon name="verified" className="text-[16px] text-cyan-core" />
<a className={"hover:text-surface transition-colors"} data-path={"tieu-chuan-xep-loai"} href={"#dang-ky-dot-1"}>{" Tiêu chuẩn đánh giá sao "}</a>
</li>
<li className={"flex items-center gap-1.5"}>
<Icon name="download" className="text-[16px] text-cyan-core" />
<a className={"hover:text-surface transition-colors"} data-path={"bieu-mau-dang-ky"} href={"#dang-ky-dot-1"}>{" Hồ sơ & Biểu mẫu "}</a>
</li>
</ul>
</div>
<div className={"lg:col-span-3 flex flex-col gap-space-sm"}>
<p className={"font-headline-sm text-label-lg text-surface uppercase tracking-widest text-[12px] border-b border-cyan-core/30 pb-1 font-bold"}>{" Liên hệ thường trực "}</p>
<div className={"font-body-sm text-body-sm space-y-2.5"}>
<div className={"flex items-center gap-2"}>
<Icon name="call" className="text-[18px] text-accent-gold-light shrink-0" />
<div>
<p className={"font-label-badge text-label-badge text-surface-container-high/70 uppercase text-[10px]"}>{" Đường dây nóng hỗ trợ: "}</p>
<a className={"font-headline-sm text-label-lg text-surface hover:text-accent-gold-light transition-colors font-bold"} href={"tel:02437845163"}>{" 024. 3784 5163 "}</a>
</div>
</div>
<div className={"flex items-center gap-2"}>
<Icon name="mail" className="text-[18px] text-cyan-core shrink-0" />
<div>
<p className={"font-label-badge text-label-badge text-surface-container-high/70 uppercase text-[10px]"}>{" Hòm thư điện tử: "}</p>
<a className={"font-headline-sm text-label-lg text-surface hover:text-cyan-core transition-colors font-bold"} href={"mailto:svnckh@tainangtre.org.vn"}>{" svnckh@tainangtre.org.vn "}</a>
</div>
</div>
<div className={"pt-2"}>
<p className={"font-label-badge text-label-badge text-surface-container-high/70 mb-2 uppercase text-[10px]"}>{" Kết nối mạng xã hội: "}</p>
<div className={"flex items-center gap-2"}>
<a aria-label={"Kênh thông tin trực tuyến"} className={"w-8 h-8 rounded-none border border-white/20 bg-surface-container-highest/10 hover:bg-royal-blue text-surface flex items-center justify-center transition-colors"} data-action={"info"} data-title={"public"} href={"#ve-mang-luoi"}>
<Icon name="public" className="text-[18px]" />
</a>
<a aria-label={"Kênh video khoa học"} className={"w-8 h-8 rounded-none border border-white/20 bg-surface-container-highest/10 hover:bg-royal-blue text-surface flex items-center justify-center transition-colors"} data-action={"info"} data-title={"play_circle"} href={"#ve-mang-luoi"}>
<Icon name="play_circle" className="text-[18px]" />
</a>
<a aria-label={"Nhóm cộng đồng sinh viên NCKH"} className={"w-8 h-8 rounded-none border border-white/20 bg-surface-container-highest/10 hover:bg-royal-blue text-surface flex items-center justify-center transition-colors"} data-action={"info"} data-title={"forum"} href={"#ve-mang-luoi"}>
<Icon name="forum" className="text-[18px]" />
</a>
<a aria-label={"Hệ thống thông báo mạng lưới"} className={"w-8 h-8 rounded-none border border-white/20 bg-surface-container-highest/10 hover:bg-royal-blue text-surface flex items-center justify-center transition-colors"} data-action={"info"} data-title={"notifications"} href={"#ve-mang-luoi"}>
<Icon name="notifications" className="text-[18px]" />
</a>
</div>
</div>
</div>
</div>
</div>
<div className={"pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm text-surface-container-high/70 border-t border-white/10"}>
<p>{" © 2026 Mạng lưới CLB Sinh viên NCKH Toàn quốc (SVNCKH-NET) - CYSTAC. Bảo lưu mọi quyền. "}</p>
<div className={"flex items-center gap-space-md text-[12px] uppercase tracking-wider"}>
<a className={"hover:text-surface transition-colors"} data-path={"chinh-sach-bao-mat"} href={"#dang-ky-dot-1"}>{" Chính sách bảo mật "}</a>
<a className={"hover:text-surface transition-colors"} data-path={"dieu-khoan-su-dung"} href={"#dang-ky-dot-1"}>{" Điều khoản dịch vụ "}</a>
<a className={"hover:text-surface transition-colors"} data-path={"so-do-trang"} href={"#dang-ky-dot-1"}>{" Sơ đồ cổng "}</a>
</div>
</div>
</div>
</footer>
  );
}
