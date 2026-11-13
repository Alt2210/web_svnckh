import { Icon } from '../common/Icon';

export function ProcessSection() {
  return (
<section className={"w-full py-20 bg-slate-surface border-y border-slate-border relative overflow-hidden"} id={"quy-trinh"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter"}>
<div className={"text-center max-w-3xl mx-auto mb-16"}>
<div className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-secondary-fixed/50 text-secondary font-label-badge text-label-badge uppercase tracking-wider mb-2 border border-secondary/30"}>
<Icon name="account_tree" className="text-[16px]" />{" Hành trình gia nhập mạng lưới "}</div>
<h2 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-slate-text-main mb-3 uppercase font-extrabold tracking-tight"}>{" Tiến Trình 7 Bước Công Nhận CLB Thành Viên Chính Thức "}</h2>
<p className={"font-body-md text-body-md text-slate-text-muted"}>{" Quy trình độc lập, minh bạch, bảo đảm dữ liệu phiên bản hồ sơ và quyết định công nhận có giá trị đối chiếu pháp lý học thuật. "}</p>
</div>

<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5"}>

<div className={"p-4 rounded-none bg-surface-container-lowest border border-slate-border shadow-sm flex flex-col justify-between relative group hover:border-royal-blue transition-all"}>
<div className={"h-0.5 w-full bg-slate-border group-hover:bg-royal-blue transition-colors mb-3"}>
</div>
<div>
<div className={"w-7 h-7 rounded-none bg-primary text-surface font-headline-sm text-[12px] flex items-center justify-center mb-3 font-bold"}>{" 01 "}</div>
<h4 className={"font-headline-sm text-[14px] leading-snug text-slate-text-main mb-2 font-bold"}>{" Khởi tạo hồ sơ "}</h4>
<p className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Xác minh email người đại diện và khai báo dữ liệu CLB ban đầu. "}</p>
</div>
<div className={"mt-4 pt-2 border-t border-slate-border/50 text-[10px] font-label-badge text-slate-text-muted uppercase tracking-wider"}>{" Status: "}<span className={"text-primary font-bold"}>{" Draft "}</span>
</div>
</div>

<div className={"p-4 rounded-none bg-surface-container-lowest border border-slate-border shadow-sm flex flex-col justify-between relative group hover:border-vivid-sky transition-all"}>
<div className={"h-0.5 w-full bg-slate-border group-hover:bg-vivid-sky transition-colors mb-3"}>
</div>
<div>
<div className={"w-7 h-7 rounded-none bg-primary text-surface font-headline-sm text-[12px] flex items-center justify-center mb-3 font-bold"}>{" 02 "}</div>
<h4 className={"font-headline-sm text-[14px] leading-snug text-slate-text-main mb-2 font-bold"}>{" Nộp quyết định & Minh chứng "}</h4>
<p className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Tải văn bản thành lập của Trường/Đoàn-Hội & bản giới thiệu. "}</p>
</div>
<div className={"mt-4 pt-2 border-t border-slate-border/50 text-[10px] font-label-badge text-slate-text-muted uppercase tracking-wider"}>{" Status: "}<span className={"text-vivid-sky font-bold"}>{" Submitted "}</span>
</div>
</div>

<div className={"p-4 rounded-none bg-surface-container-lowest border border-slate-border shadow-sm flex flex-col justify-between relative group hover:border-secondary transition-all"}>
<div className={"h-0.5 w-full bg-slate-border group-hover:bg-secondary transition-colors mb-3"}>
</div>
<div>
<div className={"w-7 h-7 rounded-none bg-primary text-surface font-headline-sm text-[12px] flex items-center justify-center mb-3 font-bold"}>{" 03 "}</div>
<h4 className={"font-headline-sm text-[14px] leading-snug text-slate-text-main mb-2 font-bold"}>{" Rà soát tính hợp lệ "}</h4>
<p className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Cán bộ Phòng Tài năng trẻ kiểm tra thể thức, yêu cầu bổ sung nếu cần. "}</p>
</div>
<div className={"mt-4 pt-2 border-t border-slate-border/50 text-[10px] font-label-badge text-slate-text-muted uppercase tracking-wider"}>{" Status: "}<span className={"text-secondary font-bold"}>{" UnderReview "}</span>
</div>
</div>

<div className={"p-4 rounded-none bg-surface-container-lowest border border-slate-border shadow-sm flex flex-col justify-between relative group hover:border-cyan-core transition-all"}>
<div className={"h-0.5 w-full bg-slate-border group-hover:bg-cyan-core transition-colors mb-3"}>
</div>
<div>
<div className={"w-7 h-7 rounded-none bg-primary text-surface font-headline-sm text-[12px] flex items-center justify-center mb-3 font-bold"}>{" 04 "}</div>
<h4 className={"font-headline-sm text-[14px] leading-snug text-slate-text-main mb-2 font-bold"}>{" Ban Điều hành thẩm định "}</h4>
<p className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Đánh giá chuyên môn, hoạt động thực tế và gửi phiếu đề xuất. "}</p>
</div>
<div className={"mt-4 pt-2 border-t border-slate-border/50 text-[10px] font-label-badge text-slate-text-muted uppercase tracking-wider"}>{" Status: "}<span className={"text-cyan-core font-bold"}>{" Recommended "}</span>
</div>
</div>

<div className={"p-4 rounded-none bg-surface-container-lowest border border-slate-border shadow-sm flex flex-col justify-between relative group hover:border-emerald-500 transition-all"}>
<div className={"h-0.5 w-full bg-slate-border group-hover:bg-emerald-500 transition-colors mb-3"}>
</div>
<div>
<div className={"w-7 h-7 rounded-none bg-primary text-surface font-headline-sm text-[12px] flex items-center justify-center mb-3 font-bold"}>{" 05 "}</div>
<h4 className={"font-headline-sm text-[14px] leading-snug text-slate-text-main mb-2 font-bold"}>{" Phê duyệt chính thức "}</h4>
<p className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Cơ quan thường trực ký duyệt và ban hành số quyết định pháp quy. "}</p>
</div>
<div className={"mt-4 pt-2 border-t border-slate-border/50 text-[10px] font-label-badge text-slate-text-muted uppercase tracking-wider"}>{" Status: "}<span className={"text-emerald-600 font-bold"}>{" Approved "}</span>
</div>
</div>

<div className={"p-4 rounded-none bg-surface-container-lowest border border-slate-border shadow-sm flex flex-col justify-between relative group hover:border-cyan-core transition-all"}>
<div className={"h-0.5 w-full bg-slate-border group-hover:bg-cyan-core transition-colors mb-3"}>
</div>
<div>
<div className={"w-7 h-7 rounded-none bg-primary text-surface font-headline-sm text-[12px] flex items-center justify-center mb-3 font-bold"}>{" 06 "}</div>
<h4 className={"font-headline-sm text-[14px] leading-snug text-slate-text-main mb-2 font-bold"}>{" Cấp mã định danh & Công bố "}</h4>
<p className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Tự động gắn mã ID Mạng lưới và xuất hiện trên Danh bạ Quốc gia. "}</p>
</div>
<div className={"mt-4 pt-2 border-t border-slate-border/50 text-[10px] font-label-badge text-slate-text-muted uppercase tracking-wider"}>{" Status: "}<span className={"text-cyan-core font-bold"}>{" Public Node "}</span>
</div>
</div>

<div className={"p-4 rounded-none bg-gradient-to-b from-deep-navy-anchor to-[#011438] text-surface shadow-md flex flex-col justify-between relative border border-accent-gold-light/60 bca-gold-glow"}>
<div className={"h-0.5 w-full bg-gradient-to-r from-accent-gold-light to-tertiary-fixed-dim mb-3"}>
</div>
<div>
<div className={"w-7 h-7 rounded-none bg-accent-gold-light text-deep-navy-anchor font-headline-sm text-[12px] flex items-center justify-center mb-3 font-black"}>{" 07 "}</div>
<h4 className={"font-headline-sm text-[14px] leading-snug text-surface mb-2 font-bold text-accent-gold-light"}>{" Kích hoạt Đặc quyền CLB "}</h4>
<p className={"font-body-sm text-[12px] text-surface-container-high/90"}>{" Tham gia hoạt động học thuật, nhận bảo trợ và tham gia hội nghị toàn quốc. "}</p>
</div>
<div className={"mt-4 pt-2 border-t border-white/20 text-[10px] font-label-badge text-accent-gold-light uppercase tracking-wider"}>{" Status: "}<span className={"font-bold"}>{" Recognized "}</span>
</div>
</div>
</div>
</div>
</section>
  );
}
