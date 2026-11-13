import { Icon } from '../common/Icon';

export function MetricsSection() {
  return (
<section className={"relative z-10 -mt-10 max-w-7xl mx-auto px-gutter-mobile lg:px-gutter w-full"} id={"thong-ke"}>
<div className={"grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 rounded-none bg-surface-container-lowest shadow-[0_16px_40px_rgba(2,27,69,0.12)] border border-slate-border"}>

<div className={"relative p-4 md:p-5 rounded-none bg-gradient-to-br from-surface-container-low/70 via-surface-container-lowest to-surface-container-low/30 border border-slate-border/80 bca-card-glow transition-all overflow-hidden group"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-blue to-cyan-core"}>
</div>
<div className={"flex items-center gap-4"}>
<div className={"w-13 h-13 md:w-14 md:h-14 rounded-none bg-gradient-to-br from-primary/15 to-royal-blue/25 text-royal-blue flex items-center justify-center shrink-0 border border-royal-blue/30"}>
<Icon name="hub" className="text-[28px] md:text-[32px]" />
</div>
<div>
<div className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-deep-navy-base leading-none font-black tracking-tight"}>{" 150+ "}</div>
<div className={"font-label-lg text-label-lg text-slate-text-main mt-1 uppercase text-[12px] tracking-wider"}>{" CLB Thành viên "}</div>
<div className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Đã phê duyệt công nhận "}</div>
</div>
</div>
</div>

<div className={"relative p-4 md:p-5 rounded-none bg-gradient-to-br from-surface-container-low/70 via-surface-container-lowest to-surface-container-low/30 border border-slate-border/80 bca-card-glow transition-all overflow-hidden group"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-vivid-sky"}>
</div>
<div className={"flex items-center gap-4"}>
<div className={"w-13 h-13 md:w-14 md:h-14 rounded-none bg-gradient-to-br from-secondary-container/20 to-vivid-sky/20 text-secondary flex items-center justify-center shrink-0 border border-secondary/30"}>
<Icon name="map" className="text-[28px] md:text-[32px]" />
</div>
<div>
<div className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-deep-navy-base leading-none font-black tracking-tight"}>{" 3 "}</div>
<div className={"font-label-lg text-label-lg text-slate-text-main mt-1 uppercase text-[12px] tracking-wider"}>{" Miền kết nối "}</div>
<div className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Bắc · Trung · Nam "}</div>
</div>
</div>
</div>

<div className={"relative p-4 md:p-5 rounded-none bg-gradient-to-br from-surface-container-low/70 via-surface-container-lowest to-surface-container-low/30 border border-slate-border/80 bca-card-glow transition-all overflow-hidden group"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-core to-accent-gold-light"}>
</div>
<div className={"flex items-center gap-4"}>
<div className={"w-13 h-13 md:w-14 md:h-14 rounded-none bg-gradient-to-br from-cyan-core/15 to-accent-gold-light/20 text-vivid-sky flex items-center justify-center shrink-0 border border-cyan-core/30"}>
<Icon name="groups" className="text-[28px] md:text-[32px]" />
</div>
<div>
<div className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-deep-navy-base leading-none font-black tracking-tight"}>{" 45.000+ "}</div>
<div className={"font-label-lg text-label-lg text-slate-text-main mt-1 uppercase text-[12px] tracking-wider"}>{" Sinh viên NCKH "}</div>
<div className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Hạt nhân tài năng trẻ toàn quốc "}</div>
</div>
</div>
</div>

<div className={"relative p-4 md:p-5 rounded-none bg-gradient-to-br from-surface-container-low/70 via-surface-container-lowest to-surface-container-low/30 border border-slate-border/80 bca-card-glow transition-all overflow-hidden group"}>
<div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary-fixed-dim to-accent-gold-light"}>
</div>
<div className={"flex items-center gap-4"}>
<div className={"w-13 h-13 md:w-14 md:h-14 rounded-none bg-gradient-to-br from-accent-gold-light/20 to-tertiary-fixed-dim/20 text-tertiary-container flex items-center justify-center shrink-0 border border-accent-gold-light/40"}>
<Icon name="emoji_events" className="text-[28px] md:text-[32px]" />
</div>
<div>
<div className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-deep-navy-base leading-none font-black tracking-tight"}>{" 1.200+ "}</div>
<div className={"font-label-lg text-label-lg text-slate-text-main mt-1 uppercase text-[12px] tracking-wider"}>{" Đề tài & Sáng kiến "}</div>
<div className={"font-body-sm text-[12px] text-slate-text-muted"}>{" Nghiệm thu đạt chuẩn mỗi năm "}</div>
</div>
</div>
</div>
</div>
</section>
  );
}
