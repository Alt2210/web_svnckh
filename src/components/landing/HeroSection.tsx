import { Icon } from '../common/Icon';
import type { FormEvent } from 'react';
import type { ClubFilters } from '../../types/club';

interface HeroSectionProps { draft: ClubFilters; setDraft: (filters: ClubFilters) => void; onSearch: () => void }

export function HeroSection({ draft, setDraft, onSearch }: HeroSectionProps) {
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch();
    document.getElementById("tra-cuu-danh-ba")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
<section className={"relative w-full overflow-hidden bg-gradient-to-b from-[#010e28] via-deep-navy-anchor to-deep-navy-base text-surface pt-16 pb-24 md:pb-32 border-b border-cyan-core/20"} id={"trang-chu"}>

<div className={"absolute inset-0 opacity-20 pointer-events-none"}>
<div className={"absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-core/30 via-royal-blue/10 to-transparent"}>
</div>
<div className={"absolute w-[800px] h-[400px] -top-40 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-core/30 via-accent-gold-light/20 to-vivid-sky/30 blur-[130px]"}>
</div>
<svg className={"w-full h-full"} xmlns={"http://www.w3.org/2000/svg"}>
<defs>
<pattern height={"60"} id={"hero-sharp-grid"} patternUnits={"userSpaceOnUse"} width={"60"}>
<path d={"M 60 0 L 0 0 0 60"} fill={"none"} stroke={"#37B8F8"} strokeOpacity={"0.18"} strokeWidth={"0.75"}>
</path>
<rect fill={"#F8D437"} height={"1.5"} opacity={"0.4"} width={"1.5"} x={"0"} y={"0"}>
</rect>
</pattern>
</defs>
<rect fill={"url(#hero-sharp-grid)"} height={"100%"} width={"100%"}>
</rect>
</svg>
</div>

<div className={"absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-core/40 to-transparent pointer-events-none transform -skew-x-12"}>
</div>
<div className={"absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-accent-gold-light/30 to-transparent pointer-events-none transform skew-x-12"}>
</div>
<div className={"relative max-w-7xl mx-auto px-gutter-mobile lg:px-gutter flex flex-col items-center text-center"}>

<div className={"inline-flex items-center gap-2.5 px-4 py-1.5 rounded-none bg-deep-navy-anchor/80 backdrop-blur-md border border-cyan-core/50 text-cyan-core mb-8 bca-cyan-glow relative"}>
<span className={"w-2 h-2 rounded-none bg-accent-gold-light animate-ping"}>
</span>
<Icon name="verified_user" className="text-[16px] text-accent-gold-light" />
<span className={"font-label-badge text-label-badge tracking-widest uppercase font-bold text-[11px]"}>{" Cổng tiếp nhận hồ sơ Mạng lưới Quốc gia v2.1 — Đợt tuyển sinh viên NCKH 2026 "}</span>
<div className={"absolute top-0 right-0 w-2 h-2 border-t border-r border-accent-gold-light"}>
</div>
<div className={"absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-core"}>
</div>
</div>

<h1 className={"font-display-hero text-display-hero-mobile md:text-display-hero tracking-tight text-surface max-w-5xl mb-6 uppercase font-black"}>{" Kết nối Tri thức Trẻ "}<br className={"hidden sm:inline"} />
<span className={"text-transparent bg-clip-text bg-gradient-to-r from-accent-gold-light via-cyan-core to-secondary-fixed filter drop-shadow-[0_0_25px_rgba(55,184,248,0.45)]"}>{" Kiến tạo Tương lai "}</span>{" Khoa học Việt Nam "}</h1>

<p className={"font-body-lg text-body-md md:text-body-lg text-surface-container-high/90 max-w-4xl mb-10 leading-relaxed font-light tracking-wide"}>{" Hệ thống Quản lý Mạng lưới Câu lạc bộ Sinh viên Nghiên cứu Khoa học Toàn quốc (SVNCKH-NET) — Nền tảng số hóa tiếp nhận, thẩm định, công nhận và đồng hành cùng các CLB học thuật, nghiên cứu sinh viên trên cả nước dưới sự chỉ đạo của Trung ương Đoàn TNCS Hồ Chí Minh và Trung tâm Phát triển Khoa học, Công nghệ và Tài năng trẻ (CYSTAC). "}</p>

<div className={"flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"}>
<a className={"w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-none bg-gradient-to-r from-tertiary-fixed-dim via-accent-gold-light to-tertiary-fixed-dim text-deep-navy-anchor font-headline-sm text-headline-sm bca-gold-glow hover:brightness-110 active:scale-[0.99] transition-all font-black uppercase tracking-wider border border-accent-gold-light"} href={"#dang-ky-dot-1"}>
<Icon name="assignment_turned_in" className="text-[22px]" />
<span>{" Tìm hiểu gia nhập Mạng lưới "}</span>
</a>
<a className={"w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-none bg-gradient-to-r from-royal-blue/40 to-deep-navy-anchor/60 backdrop-blur-xl border border-cyan-core/60 text-surface hover:bg-cyan-core/15 hover:border-cyan-core bca-cyan-glow transition-all font-headline-sm text-headline-sm uppercase tracking-wider"} href={"#tra-cuu-danh-ba"}>
<Icon name="account_tree" className="text-[22px] text-cyan-core" />
<span>{" Tra cứu Danh bạ CLB chính thức "}</span>
</a>
</div>

<div className={"w-full max-w-4xl p-4 md:p-5 rounded-none bg-gradient-to-b from-deep-navy-anchor/95 to-[#011438]/95 backdrop-blur-2xl border border-cyan-core/30 shadow-[0_12px_45px_rgba(2,27,69,0.8)] relative"}>
<div className={"absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-core to-transparent"}>
</div>
<form className={"grid grid-cols-1 md:grid-cols-12 gap-3 text-left"} id={"club-search"} role={"search"} onSubmit={submitSearch}>
<div className={"md:col-span-4 relative"}>
<label className={"block font-label-badge text-label-badge text-cyan-core uppercase px-1 mb-1 tracking-wider"} htmlFor={"club-query"}>{" Tên CLB / Đơn vị "}</label>
<div className={"relative flex items-center"}>
<Icon name="search" className="absolute left-3 text-cyan-core text-[20px]" />
<input className={"w-full pl-9 pr-3 py-2.5 rounded-none bg-surface/5 border border-white/20 text-surface placeholder:text-surface-container-high/40 font-body-sm text-body-sm focus:outline-none focus:border-cyan-core focus:ring-1 focus:ring-cyan-core"} id={"club-query"} name={"query"} placeholder={"VD: CLB Trí tuệ Nhân tạo BK..."} type={"text"} value={draft.query} onChange={(event) => setDraft({ ...draft, query: event.target.value })} />
</div>
</div>
<div className={"md:col-span-3"}>
<label className={"block font-label-badge text-label-badge text-cyan-core uppercase px-1 mb-1 tracking-wider"} htmlFor={"club-university"}>{" Trường ĐH / Viện "}</label>
<div className={"relative flex items-center"}>
<Icon name="school" className="absolute left-3 text-cyan-core text-[20px]" />
<select className={"w-full pl-9 pr-8 py-2.5 rounded-none bg-[#011438] border border-white/20 text-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:border-cyan-core cursor-pointer"} id={"club-university"} name={"club-university"} value={draft.university} onChange={(event) => setDraft({ ...draft, university: event.target.value })}>
<option value={""}>{" Tất cả các cơ sở "}</option>
<option value={"dhqg-hn"}>{" ĐHQG Hà Nội "}</option>
<option value={"dhqg-hcm"}>{" ĐHQG TP. Hồ Chí Minh "}</option>
<option value={"hcm-med"}>{" ĐH Y Dược TP. Hồ Chí Minh "}</option>
<option value={"hust"}>{" ĐH Bách Khoa Hà Nội "}</option>
<option value={"hmu"}>{" ĐH Y Hà Nội "}</option>
<option value={"ftu"}>{" ĐH Ngoại Thương "}</option>
</select>
<Icon name="expand_more" className="absolute right-2 text-surface-container-high pointer-events-none text-[18px]" />
</div>
</div>
<div className={"md:col-span-3"}>
<label className={"block font-label-badge text-label-badge text-cyan-core uppercase px-1 mb-1 tracking-wider"} htmlFor={"club-field"}>{" Lĩnh vực nghiên cứu "}</label>
<div className={"relative flex items-center"}>
<Icon name="science" className="absolute left-3 text-cyan-core text-[20px]" />
<select className={"w-full pl-9 pr-8 py-2.5 rounded-none bg-[#011438] border border-white/20 text-surface font-body-sm text-body-sm appearance-none focus:outline-none focus:border-cyan-core cursor-pointer"} id={"club-field"} name={"club-field"} value={draft.field} onChange={(event) => setDraft({ ...draft, field: event.target.value })}>
<option value={""}>{" Tất cả chuyên ngành "}</option>
<option value={"ai-iot"}>{" AI, Khoa học dữ liệu & IoT "}</option>
<option value={"biotech"}>{" Y Dược & Công nghệ sinh học "}</option>
<option value={"green"}>{" Năng lượng xanh & Vật liệu mới "}</option>
<option value={"social"}>{" Kinh tế số & Khoa học xã hội "}</option>
</select>
<Icon name="expand_more" className="absolute right-2 text-surface-container-high pointer-events-none text-[18px]" />
</div>
</div>
<div className={"md:col-span-2 flex items-end"}>
<button className={"w-full h-[42px] inline-flex items-center justify-center gap-1.5 rounded-none bg-gradient-to-r from-cyan-core to-vivid-sky hover:brightness-110 text-deep-navy-anchor font-headline-sm text-label-lg transition-all font-bold uppercase tracking-wider"} type={"submit"}>
<Icon name="travel_explore" className="text-[18px]" />
<span>{" Lọc ngay "}</span>
</button>
</div>
</form>
</div>
</div>
</section>
  );
}
