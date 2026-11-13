import { Icon } from '../common/Icon';
import { RoundStatus } from './RoundStatus';

export function RecruitmentSection() {
  return (
<section className={"w-full py-20 bg-surface"} id={"dang-ky-dot-1"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter"}>
<div className={"relative rounded-none bg-gradient-to-r from-[#010e28] via-deep-navy-anchor to-deep-navy-base p-8 md:p-12 overflow-hidden shadow-2xl border border-cyan-core/40"}>

<div className={"absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent-gold-light"}>
</div>
<div className={"absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-core"}>
</div>
<div className={"absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-core"}>
</div>
<div className={"absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent-gold-light"}>
</div>

<div className={"absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-core/10 blur-[90px] pointer-events-none"}>
</div>
<div className={"relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"}>
<div className={"lg:col-span-8 text-surface"}>
<div className={"inline-flex items-center gap-2 px-3 py-1 rounded-none bg-accent-gold-light/15 text-accent-gold-light font-label-badge text-label-badge uppercase tracking-widest mb-4 border border-accent-gold-light/40"}>
<span className={"w-2 h-2 rounded-none bg-accent-gold-light animate-pulse"}>
</span>{" Đợt tiếp nhận hồ sơ thường niên — Đợt 1 / 2026 "}</div>
<h3 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl font-black mb-4 uppercase tracking-tight"}>{" Chương trình Kết nạp & Công nhận CLB Nghiên cứu Khoa học Sinh viên Toàn quốc "}</h3>
<p className={"font-body-lg text-body-md md:text-body-lg text-surface-container-high/90 mb-6 leading-relaxed font-light"}>{" Mở cổng đăng ký trực tuyến dành cho Ban Chủ nhiệm các Câu lạc bộ, Đội, Nhóm học thuật trực thuộc các Đại học, Học viện, Trường Đại học và Cao đẳng trên khắp các tỉnh, thành phố. "}</p>

<div className={"flex flex-wrap gap-3 text-surface-container-high font-body-sm text-body-sm mb-8"}>
<div className={"flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-surface/10 backdrop-blur-md border border-white/15"}>
<Icon name="calendar_today" className="text-[18px] text-cyan-core" />
<span>{" Thời hạn tiếp nhận: "}<strong>{" 01/03/2026 — 31/03/2026 "}</strong>
</span>
</div>
<div className={"flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-surface/10 backdrop-blur-md border border-white/15"}>
<Icon name="policy" className="text-[18px] text-cyan-core" />
<span>{" Căn cứ pháp lý: "}<strong>{" Thông tin minh họa, chờ xác nhận "}</strong>
</span>
</div>
</div>

<div className={"flex flex-wrap items-center gap-4"}>
<a className={"inline-flex items-center gap-2 px-7 py-3.5 rounded-none bg-gradient-to-r from-tertiary-fixed-dim via-accent-gold-light to-tertiary-fixed-dim text-deep-navy-anchor font-headline-sm text-label-lg bca-gold-glow hover:brightness-110 transition-all font-black uppercase tracking-wider border border-accent-gold-light"} data-action={"join"} data-title={"send Nộp hồ sơ trực tuyến ngay"} href={"#dang-ky-dot-1"}>
<Icon name="send" className="text-[20px]" />
<span>{" Tìm hiểu hồ sơ gia nhập "}</span>
</a>
<a className={"inline-flex items-center gap-2 px-6 py-3.5 rounded-none bg-surface/10 border border-white/20 text-surface hover:bg-surface/20 transition-all font-headline-sm text-label-lg uppercase tracking-wider"} download={"huong-dan-ho-so-mau.md"} href={"/documents/huong-dan-ho-so-mau.md"}>
<Icon name="download" className="text-[20px] text-cyan-core" />
<span>{" Tải hướng dẫn chuẩn bị hồ sơ (bản mẫu) "}</span>
</a>
</div>
</div>

<div className={"lg:col-span-4 flex justify-center"}>
<RoundStatus />
</div>
</div>
</div>
</div>
</section>
  );
}
