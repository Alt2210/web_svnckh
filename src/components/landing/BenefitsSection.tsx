import { Icon } from '../common/Icon';

export function BenefitsSection() {
  return (
<section className={"w-full py-20 bg-slate-surface"} id={"quyen-loi"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter"}>
<div className={"max-w-3xl mb-14"}>
<div className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-accent-gold-light/20 text-amber-800 font-label-badge text-label-badge uppercase tracking-wider mb-2 border-l-2 border-accent-gold-light"}>
<Icon name="stars" className="text-[16px]" />{" Đồng hành cùng CLB thành viên "}</div>
<h2 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-slate-text-main mb-3 uppercase font-extrabold tracking-tight"}>{" Đặc Quyền Dành Cho CLB Được Công Nhận "}</h2>
<p className={"font-body-md text-body-md text-slate-text-muted"}>{" Khi hoàn tất thẩm định và có quyết định công nhận từ Cơ quan thường trực Mạng lưới Quốc gia, CLB và các thành viên được thụ hưởng đầy đủ các cơ chế hỗ trợ tối đa. "}</p>
</div>
<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"}>

<div className={"relative p-6 rounded-none bg-surface-container-lowest border border-slate-border hover:border-royal-blue flex flex-col justify-between bca-card-glow transition-all"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-royal-blue"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-primary/10 text-royal-blue border border-royal-blue/30 flex items-center justify-center mb-5"}>
<Icon name="verified" className="text-[28px]" />
</div>
<h4 className={"font-headline-sm text-headline-sm text-slate-text-main mb-2 font-bold"}>{" Dấu bảo trợ Quốc gia "}</h4>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Được bảo trợ danh nghĩa truyền thông, gắn huy hiệu xác thực số trên hệ sinh thái NCKH và cấp mã định danh thành viên vĩnh viễn. "}</p>
</div>
<div className={"mt-6 pt-4 border-t border-slate-border text-slate-text-muted font-body-sm text-[12px] flex items-center gap-1"}>
<Icon name="done_all" className="text-[16px] text-emerald-600" />
<span>{" Bảo chứng uy tín học thuật "}</span>
</div>
</div>

<div className={"relative p-6 rounded-none bg-surface-container-lowest border border-slate-border hover:border-accent-gold-light flex flex-col justify-between bca-card-glow transition-all"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-accent-gold-light"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-accent-gold-light/20 text-tertiary-container border border-accent-gold-light/40 flex items-center justify-center mb-5"}>
<Icon name="handshake" className="text-[28px]" />
</div>
<h4 className={"font-headline-sm text-headline-sm text-slate-text-main mb-2 font-bold"}>{" Tài trợ & Nguồn lực "}</h4>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Ưu tiên tiếp cận gói tài trợ nghiên cứu từ các doanh nghiệp công nghệ, viện nghiên cứu liên kết và quỹ ươm tạo tài năng trẻ. "}</p>
</div>
<div className={"mt-6 pt-4 border-t border-slate-border text-slate-text-muted font-body-sm text-[12px] flex items-center gap-1"}>
<Icon name="done_all" className="text-[16px] text-emerald-600" />
<span>{" Kết nối quỹ hạt giống R&D "}</span>
</div>
</div>

<div className={"relative p-6 rounded-none bg-surface-container-lowest border border-slate-border hover:border-vivid-sky flex flex-col justify-between bca-card-glow transition-all"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-vivid-sky"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-vivid-sky/15 text-vivid-sky border border-vivid-sky/30 flex items-center justify-center mb-5"}>
<Icon name="military_tech" className="text-[28px]" />
</div>
<h4 className={"font-headline-sm text-headline-sm text-slate-text-main mb-2 font-bold"}>{" Đề cử Giải thưởng Lớn "}</h4>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Đặc quyền giới thiệu công trình tham gia Giải thưởng Khoa học Công nghệ Quả Cầu Vàng, Nữ sinh KHCN tiêu biểu và Hội nghị Sinh viên Toàn quốc. "}</p>
</div>
<div className={"mt-6 pt-4 border-t border-slate-border text-slate-text-muted font-body-sm text-[12px] flex items-center gap-1"}>
<Icon name="done_all" className="text-[16px] text-emerald-600" />
<span>{" Bảo trợ hồ sơ cấp Quốc gia "}</span>
</div>
</div>

<div className={"relative p-6 rounded-none bg-surface-container-lowest border border-slate-border hover:border-secondary flex flex-col justify-between bca-card-glow transition-all"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-secondary"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-secondary-container/20 text-secondary border border-secondary/30 flex items-center justify-center mb-5"}>
<Icon name="admin_panel_settings" className="text-[28px]" />
</div>
<h4 className={"font-headline-sm text-headline-sm text-slate-text-main mb-2 font-bold"}>{" Cổng Quản trị Số hóa "}</h4>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Cấp tài khoản Admin chuyên biệt: quản lý phân quyền thành viên, quản trị nhóm trực thuộc, lưu trữ hồ sơ và báo cáo hoạt động trực tuyến. "}</p>
</div>
<div className={"mt-6 pt-4 border-t border-slate-border text-slate-text-muted font-body-sm text-[12px] flex items-center gap-1"}>
<Icon name="done_all" className="text-[16px] text-emerald-600" />
<span>{" Phần mềm quản lý theo SRS v2.1 "}</span>
</div>
</div>
</div>
</div>
</section>
  );
}
