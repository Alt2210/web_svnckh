import { Icon } from '../common/Icon';

export function EventsSection() {
  return (
<section className={"w-full py-20 bg-slate-surface"} id={"hoat-dong-su-kien"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter"}>
<div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"}>
<div>
<div className={"inline-flex items-center gap-2 px-3 py-1 rounded-none bg-secondary-fixed/60 text-secondary font-label-badge text-label-badge uppercase tracking-wider mb-2 border-l-2 border-secondary"}>
<Icon name="event_note" className="text-[16px]" />{" Kết nối cộng đồng nghiên cứu "}</div>
<h2 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-slate-text-main uppercase font-extrabold tracking-tight"}>{" Sự Kiện & Diễn Đàn Khoa Học Thường Niên "}</h2>
</div>
<p className={"font-body-md text-body-md text-slate-text-muted max-w-sm"}>{" Không gian trao đổi học thuật, kết nối nhà khoa học đầu ngành và sinh viên nghiên cứu xuất sắc toàn quốc. "}</p>
</div>
<div className={"grid grid-cols-1 md:grid-cols-3 gap-6"}>

<div className={"rounded-none bg-surface-container-lowest border border-slate-border overflow-hidden hover:border-royal-blue bca-card-glow transition-all flex flex-col justify-between group"}>
<div className={"relative h-48 bg-cover bg-center"} data-alt={"A grand national academic science ceremony in a modern convention hall in Vietnam, prestigious blue atmospheric stage lighting, university student researchers and professors, high tech podium"} style={{ backgroundImage: "linear-gradient(135deg, #021b45, #0448a5 55%, #37b8f8)" }}>
<div className={"absolute inset-0 bg-gradient-to-t from-deep-navy-anchor/90 via-deep-navy-anchor/30 to-transparent"}>
</div>
<div className={"absolute bottom-3 left-4 right-4 flex items-center justify-between text-surface"}>
<span className={"px-2.5 py-1 rounded-none bg-accent-gold-light text-deep-navy-anchor font-label-badge text-[10px] font-black uppercase tracking-wider"}>{" Sự kiện cấp Quốc gia "}</span>
<span className={"font-label-badge text-[11px] bg-black/60 px-2 py-0.5 rounded-none backdrop-blur-sm border border-white/20 uppercase"}>{" Tháng 4/2026 "}</span>
</div>
</div>
<div className={"p-6 flex flex-col justify-between flex-1"}>
<div>
<h3 className={"font-headline-sm text-headline-sm text-slate-text-main mb-2 group-hover:text-royal-blue transition-colors font-bold"}>{" Lễ Ra Mắt Mạng Lưới & Diễn Đàn Khoa Học Sinh Viên Việt Nam 2026 "}</h3>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed line-clamp-2"}>{" Sự kiện đánh dấu bước ngoặt quy tụ hơn 150 CLB NCKH sinh viên toàn quốc dưới sự chủ trì của Ban Bí thư Trung ương Đoàn và Lãnh đạo Bộ KH&CN. "}</p>
</div>
<div className={"pt-5 mt-6 border-t border-slate-border flex items-center justify-between"}>
<div className={"text-[12px] text-slate-text-muted flex items-center gap-1"}>
<Icon name="pin_drop" className="text-[16px] text-royal-blue" />
<span>{" Hà Nội (Trực tiếp & Trực tuyến) "}</span>
</div>
<button className={"text-royal-blue font-headline-sm text-label-lg hover:underline inline-flex items-center gap-1 uppercase text-[11px] tracking-wider"} data-action={"event"} data-title={"Lễ Ra Mắt Mạng Lưới & Diễn Đàn Khoa Học Sinh Viên Việt Nam 2026"} type={"button"}>
<span>{" Chi tiết "}</span>
<Icon name="chevron_right" className="text-[16px]" />
</button>
</div>
</div>
</div>

<div className={"rounded-none bg-surface-container-lowest border border-slate-border overflow-hidden hover:border-cyan-core bca-card-glow transition-all flex flex-col justify-between group"}>
<div className={"relative h-48 bg-cover bg-center"} data-alt={"University laboratory and modern research workshop with students analyzing data on digital interactive displays, clean glass aesthetics, cool cyan light accents"} style={{ backgroundImage: "linear-gradient(135deg, #021b45, #0448a5 55%, #37b8f8)" }}>
<div className={"absolute inset-0 bg-gradient-to-t from-deep-navy-anchor/90 via-deep-navy-anchor/30 to-transparent"}>
</div>
<div className={"absolute bottom-3 left-4 right-4 flex items-center justify-between text-surface"}>
<span className={"px-2.5 py-1 rounded-none bg-cyan-core text-deep-navy-anchor font-label-badge text-[10px] font-black uppercase tracking-wider"}>{" Chuỗi Workshop "}</span>
<span className={"font-label-badge text-[11px] bg-black/60 px-2 py-0.5 rounded-none backdrop-blur-sm border border-white/20 uppercase"}>{" Hằng tháng "}</span>
</div>
</div>
<div className={"p-6 flex flex-col justify-between flex-1"}>
<div>
<h3 className={"font-headline-sm text-headline-sm text-slate-text-main mb-2 group-hover:text-royal-blue transition-colors font-bold"}>{" Khóa Tập Huấn: Phương Pháp Luận NCKH & Viết Bài Báo Chuẩn ISI/Scopus "}</h3>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed line-clamp-2"}>{" Chuyên đề nâng cao kỹ năng xử lý dữ liệu thực nghiệm, trích dẫn học thuật liêm chính và quy trình gửi bài đến các tạp chí khoa học uy tín thế giới. "}</p>
</div>
<div className={"pt-5 mt-6 border-t border-slate-border flex items-center justify-between"}>
<div className={"text-[12px] text-slate-text-muted flex items-center gap-1"}>
<Icon name="computer" className="text-[16px] text-royal-blue" />
<span>{" Hệ thống Hội nghị Số Mạng lưới "}</span>
</div>
<button className={"text-royal-blue font-headline-sm text-label-lg hover:underline inline-flex items-center gap-1 uppercase text-[11px] tracking-wider"} data-action={"event"} data-title={"Khóa Tập Huấn: Phương Pháp Luận NCKH & Viết Bài Báo Chuẩn ISI/Scopus"} type={"button"}>
<span>{" Đăng ký "}</span>
<Icon name="chevron_right" className="text-[16px]" />
</button>
</div>
</div>
</div>

<div className={"rounded-none bg-surface-container-lowest border border-slate-border overflow-hidden hover:border-secondary bca-card-glow transition-all flex flex-col justify-between group"}>
<div className={"relative h-48 bg-cover bg-center"} data-alt={"A round table discussion with passionate young Vietnamese university scholars and researchers interacting with scientific mentors in a high tech symposium room"} style={{ backgroundImage: "linear-gradient(135deg, #021b45, #0448a5 55%, #37b8f8)" }}>
<div className={"absolute inset-0 bg-gradient-to-t from-deep-navy-anchor/90 via-deep-navy-anchor/30 to-transparent"}>
</div>
<div className={"absolute bottom-3 left-4 right-4 flex items-center justify-between text-surface"}>
<span className={"px-2.5 py-1 rounded-none bg-secondary-fixed text-deep-navy-anchor font-label-badge text-[10px] font-black uppercase tracking-wider"}>{" Tọa đàm Thủ lĩnh "}</span>
<span className={"font-label-badge text-[11px] bg-black/60 px-2 py-0.5 rounded-none backdrop-blur-sm border border-white/20 uppercase"}>{" Quý II/2026 "}</span>
</div>
</div>
<div className={"p-6 flex flex-col justify-between flex-1"}>
<div>
<h3 className={"font-headline-sm text-headline-sm text-slate-text-main mb-2 group-hover:text-royal-blue transition-colors font-bold"}>{" Tọa Đàm Kết Nối Chủ Nhiệm CLB Sinh Viên NCKH Bắc - Trung - Nam "}</h3>
<p className={"font-body-sm text-body-sm text-slate-text-muted leading-relaxed line-clamp-2"}>{" Diễn đàn chia sẻ mô hình vận hành CLB học thuật hiệu quả, thu hút sinh viên tham gia và cơ chế phối hợp nghiên cứu liên trường đại học. "}</p>
</div>
<div className={"pt-5 mt-6 border-t border-slate-border flex items-center justify-between"}>
<div className={"text-[12px] text-slate-text-muted flex items-center gap-1"}>
<Icon name="hub" className="text-[16px] text-royal-blue" />
<span>{" Đà Nẵng & Hybrid Hub "}</span>
</div>
<button className={"text-royal-blue font-headline-sm text-label-lg hover:underline inline-flex items-center gap-1 uppercase text-[11px] tracking-wider"} data-action={"event"} data-title={"Tọa Đàm Kết Nối Chủ Nhiệm CLB Sinh Viên NCKH Bắc - Trung - Nam"} type={"button"}>
<span>{" Xem lịch "}</span>
<Icon name="chevron_right" className="text-[16px]" />
</button>
</div>
</div>
</div>
</div>
</div>
</section>
  );
}
