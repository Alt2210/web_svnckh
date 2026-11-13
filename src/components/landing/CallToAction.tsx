import { Icon } from '../common/Icon';

export function CallToAction() {
  return (
<section className={"w-full bg-gradient-to-br from-[#010e28] via-deep-navy-anchor to-[#022a69] text-surface py-20 relative overflow-hidden border-t border-cyan-core/30"} id={"ket-noi"}>

<div className={"absolute right-0 top-0 w-1/2 h-full opacity-15 pointer-events-none"}>
<svg className={"w-full h-full"} fill={"none"} viewBox={"0 0 400 400"} xmlns={"http://www.w3.org/2000/svg"}>
<rect height={"300"} stroke={"#37B8F8"} strokeWidth={"1"} width={"300"} x={"50"} y={"50"}>
</rect>
<rect height={"200"} stroke={"#F8D437"} stroke-dasharray={"6 6"} strokeWidth={"1"} width={"200"} x={"100"} y={"100"}>
</rect>
<path d={"M0 200 H400"} stroke={"#ffffff"} strokeWidth={"0.8"}>
</path>
<path d={"M200 0 V400"} stroke={"#ffffff"} strokeWidth={"0.8"}>
</path>
</svg>
</div>

<div className={"absolute bottom-0 left-1/3 w-96 h-48 bg-cyan-core/20 blur-[100px] pointer-events-none"}>
</div>
<div className={"relative max-w-7xl mx-auto px-gutter-mobile lg:px-gutter text-center flex flex-col items-center"}>
<div className={"w-16 h-16 rounded-none bg-surface-container-lowest/10 backdrop-blur-xl border border-cyan-core/50 flex items-center justify-center text-accent-gold-light mb-6 shadow-2xl bca-cyan-glow"}>
<Icon name="rocket_launch" className="text-[36px]" />
</div>
<h2 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl font-black max-w-3xl mb-4 uppercase tracking-tight"}>{" Đưa Câu Lạc Bộ Nghiên Cứu Khoa Học Của Trường Bạn Vươn Tầm Quốc Gia! "}</h2>
<p className={"font-body-lg text-body-md md:text-body-lg text-surface-container-high/90 max-w-2xl mb-10 leading-relaxed font-light"}>{" Gia nhập Mạng lưới SVNCKH-NET ngay hôm nay để nhận quyết định công nhận chính thức, kết nối cộng đồng nghiên cứu và khẳng định vị thế học thuật sinh viên Việt Nam. "}</p>
<div className={"flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"}>
<a className={"w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-none bg-gradient-to-r from-tertiary-fixed-dim via-accent-gold-light to-tertiary-fixed-dim text-deep-navy-anchor font-headline-sm text-headline-sm font-black bca-gold-glow hover:brightness-110 transition-all uppercase tracking-wider border border-accent-gold-light"} href={"#dang-ky-dot-1"}>
<Icon name="how_to_reg" className="text-[20px]" />
<span>{" Khởi tạo hồ sơ CLB (Đợt 1/2026) "}</span>
</a>
<a className={"w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-none bg-surface-container-lowest/10 backdrop-blur-md border border-cyan-core/50 text-surface hover:bg-cyan-core/15 transition-all font-headline-sm text-headline-sm uppercase tracking-wider"} href={"mailto:svnckh@tainangtre.org.vn"}>
<Icon name="support_agent" className="text-[20px] text-cyan-core" />
<span>{" Tư vấn hồ sơ: 024. 3784 5163 "}</span>
</a>
</div>
<div className={"mt-8 flex items-center gap-6 text-[12px] text-surface-container-high/80 uppercase tracking-widest font-semibold"}>
<span className={"flex items-center gap-1.5"}>
<Icon name="shield" className="text-[16px] text-cyan-core" />{" Tôn trọng quyền riêng tư "}</span>
<span className={"flex items-center gap-1.5"}>
<Icon name="task_alt" className="text-[16px] text-accent-gold-light" />{" Chuẩn đặc tả SRS v2.1 "}</span>
</div>
</div>
</section>
  );
}
