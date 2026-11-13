import { Icon } from '../common/Icon';

export function AboutSection() {
  return (
<section className={"w-full py-20 bg-surface"} id={"ve-mang-luoi"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter"}>

<div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"}>
<div>
<div className={"inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 text-royal-blue font-label-badge text-label-badge uppercase tracking-wider mb-2 border-l-2 border-royal-blue"}>
<Icon name="account_balance" className="text-[16px]" />{" Căn cứ thành lập & Cơ quan bảo trợ Mạng lưới "}</div>
<h2 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-slate-text-main uppercase font-extrabold tracking-tight"}>{" Sứ Mệnh Xây Dựng Hệ Sinh Thái Nghiên Cứu Chuẩn Mực "}</h2>
</div>
<p className={"font-body-md text-body-md text-slate-text-muted max-w-md"}>{" Chỉ đạo trực tiếp bởi Trung ương Đoàn TNCS Hồ Chí Minh, thường trực điều hành bởi Trung tâm CYSTAC phối hợp Phòng Tài năng trẻ và Ban Điều hành Mạng lưới. "}</p>
</div>

<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"}>

<div className={"relative p-6 rounded-none bg-gradient-to-b from-surface-container-lowest to-surface-container-low/40 border border-slate-border hover:border-royal-blue bca-card-glow transition-all flex flex-col justify-between group overflow-hidden"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-blue via-vivid-sky to-cyan-core"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-gradient-to-br from-primary/15 to-royal-blue/20 text-royal-blue border border-royal-blue/30 flex items-center justify-center mb-5 group-hover:bg-gradient-to-r group-hover:from-royal-blue group-hover:to-cyan-core group-hover:text-surface transition-all"}>
<Icon name="how_to_reg" className="text-[26px]" />
</div>
<span className={"font-label-badge text-label-badge text-secondary font-black uppercase tracking-widest text-[10px]"}>{" Trụ cột 01 "}</span>
<h3 className={"font-headline-sm text-headline-sm text-slate-text-main mt-1 mb-3"}>{" Tiếp nhận & Thẩm định Minh bạch "}</h3>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Quy trình số hóa toàn diện việc tiếp nhận hồ sơ CLB, thẩm định theo phân công chuyên môn và phê duyệt văn bản công nhận chính thức theo chuẩn quốc gia. "}</p>
</div>
<div className={"pt-5 mt-5 border-t border-slate-border/80 flex items-center text-royal-blue font-label-md text-label-md uppercase tracking-wider text-[11px]"}>
<span>{" Tiếp nhận · Thẩm định · Công nhận "}</span>
</div>
</div>

<div className={"relative p-6 rounded-none bg-gradient-to-b from-surface-container-lowest to-surface-container-low/40 border border-slate-border hover:border-cyan-core bca-card-glow transition-all flex flex-col justify-between group overflow-hidden"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-core via-vivid-sky to-secondary"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-gradient-to-br from-cyan-core/15 to-vivid-sky/20 text-vivid-sky border border-cyan-core/30 flex items-center justify-center mb-5 group-hover:bg-gradient-to-r group-hover:from-vivid-sky group-hover:to-cyan-core group-hover:text-surface transition-all"}>
<Icon name="lan" className="text-[26px]" />
</div>
<span className={"font-label-badge text-label-badge text-vivid-sky font-black uppercase tracking-widest text-[10px]"}>{" Trụ cột 02 "}</span>
<h3 className={"font-headline-sm text-headline-sm text-slate-text-main mt-1 mb-3"}>{" Cơ cấu & Đơn vị Trực thuộc "}</h3>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Hỗ trợ quản trị cấu trúc tổ chức sâu: nhóm nghiên cứu, ban chuyên môn, phân nhiệm kỳ đại diện và quản lý cơ sở dữ liệu sinh viên thành viên độc lập, an toàn. "}</p>
</div>
<div className={"pt-5 mt-5 border-t border-slate-border/80 flex items-center text-vivid-sky font-label-md text-label-md uppercase tracking-wider text-[11px]"}>
<span>{" Cơ cấu · Thành viên · Phân quyền "}</span>
</div>
</div>

<div className={"relative p-6 rounded-none bg-gradient-to-b from-surface-container-lowest to-surface-container-low/40 border border-slate-border hover:border-secondary bca-card-glow transition-all flex flex-col justify-between group overflow-hidden"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-secondary-container to-accent-gold-light"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-gradient-to-br from-secondary-container/20 to-secondary/20 text-secondary border border-secondary/30 flex items-center justify-center mb-5 group-hover:bg-gradient-to-r group-hover:from-secondary group-hover:to-secondary-container group-hover:text-surface transition-all"}>
<Icon name="forum" className="text-[26px]" />
</div>
<span className={"font-label-badge text-label-badge text-secondary font-black uppercase tracking-widest text-[10px]"}>{" Trụ cột 03 "}</span>
<h3 className={"font-headline-sm text-headline-sm text-slate-text-main mt-1 mb-3"}>{" Điều phối Sự kiện & Hội nghị "}</h3>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Tổ chức diễn đàn học thuật thường niên, chuỗi hội thảo phương pháp luận khoa học, công bố bài báo quốc tế và các cuộc thi sáng tạo công nghệ sinh viên. "}</p>
</div>
<div className={"pt-5 mt-5 border-t border-slate-border/80 flex items-center text-secondary font-label-md text-label-md uppercase tracking-wider text-[11px]"}>
<span>{" Kết nối · Học thuật · Sáng tạo "}</span>
</div>
</div>

<div className={"relative p-6 rounded-none bg-gradient-to-b from-surface-container-lowest to-surface-container-low/40 border border-slate-border hover:border-accent-gold-light bca-card-glow transition-all flex flex-col justify-between group overflow-hidden"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold-light via-tertiary-fixed-dim to-amber-500"}>
</div>
<div>
<div className={"w-12 h-12 rounded-none bg-gradient-to-br from-accent-gold-light/20 to-tertiary-fixed-dim/20 text-tertiary-container border border-accent-gold-light/40 flex items-center justify-center mb-5 group-hover:bg-gradient-to-r group-hover:from-tertiary-fixed-dim group-hover:to-accent-gold-light group-hover:text-deep-navy-anchor transition-all"}>
<Icon name="workspace_premium" className="text-[26px]" />
</div>
<span className={"font-label-badge text-label-badge text-amber-700 font-black uppercase tracking-widest text-[10px]"}>{" Trụ cột 04 "}</span>
<h3 className={"font-headline-sm text-headline-sm text-slate-text-main mt-1 mb-3"}>{" Tuyên dương & Nâng tầm Tài năng "}</h3>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed"}>{" Chứng thực số hóa năng lực nghiên cứu, bảo trợ truyền thông Mạng lưới Quốc gia và kết nối nguồn tài trợ phát triển công trình từ quỹ khoa học, doanh nghiệp. "}</p>
</div>
<div className={"pt-5 mt-5 border-t border-slate-border/80 flex items-center text-amber-700 font-label-md text-label-md uppercase tracking-wider text-[11px]"}>
<span>{" Dành cho CLB được công nhận "}</span>
</div>
</div>
</div>
</div>
</section>
  );
}
