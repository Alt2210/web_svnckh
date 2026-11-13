import { Icon } from '../common/Icon';
import { ClubCard } from './ClubCard';
import type { Club } from '../../types/club';

interface ClubDirectoryProps { clubs: Club[]; total: number; onReset: () => void }

export function ClubDirectory({ clubs, total, onReset }: ClubDirectoryProps) {
  return (
<section className={"w-full py-20 bg-surface"} id={"tra-cuu-danh-ba"}>
<div className={"max-w-7xl mx-auto px-gutter-mobile lg:px-gutter"}>
<div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"}>
<div>
<div className={"inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 text-royal-blue font-label-badge text-label-badge uppercase tracking-wider mb-2 border-l-2 border-royal-blue"}>
<Icon name="verified" className="text-[16px]" />{" Khám phá danh bạ Mạng lưới · Dữ liệu mẫu "}</div>
<h2 className={"font-headline-xl text-headline-xl-mobile md:text-headline-xl text-slate-text-main uppercase font-extrabold tracking-tight"}>{" Các Câu Lạc Bộ Sinh Viên NCKH Tiêu Biểu "}</h2>
</div>
<a className={"inline-flex items-center gap-1 text-royal-blue font-headline-sm text-label-lg hover:underline uppercase text-[12px] tracking-wider"} data-action={"all-clubs"} href={"#ve-mang-luoi"}>
<span>{" Xem tất cả 150+ CLB trên toàn quốc "}</span>
<Icon name="arrow_forward" className="text-[18px]" />
</a>
</div>

<div className={"search-feedback"}>
<p id="search-status" role="status" aria-live="polite">Hiển thị {clubs.length} / {total} CLB minh họa</p>
<button id={"reset-search"} type={"button"} onClick={onReset}>{" Xóa bộ lọc "}</button>
</div>
<div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"} id={"club-results"}>{clubs.map((club) => <ClubCard key={club.id} club={club} />)}</div>
<p className={"empty-results"} id={"empty-results"} hidden={clubs.length > 0}>{" Không có CLB phù hợp. Hãy thử tên khác hoặc xóa bộ lọc. "}</p>

<div className={"mt-12 p-6 md:p-8 rounded-none bg-surface-container-low border border-slate-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"}>
<div className={"absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-royal-blue via-cyan-core to-accent-gold-light"}>
</div>
<div className={"flex items-center gap-4"}>
<div className={"w-12 h-12 rounded-none bg-gradient-to-br from-primary to-royal-blue text-surface flex items-center justify-center shrink-0 border border-cyan-core/30"}>
<Icon name="public" className="text-[26px]" />
</div>
<div>
<h4 className={"font-headline-sm text-headline-sm text-slate-text-main font-bold"}>{" Hệ Thống Bản Đồ Số Hóa Các CLB Nghiên Cứu 3 Miền "}</h4>
<p className={"font-body-sm text-body-sm text-slate-text-muted"}>{" Trực quan hóa vị trí địa lý, quy mô đề tài và phân bố lĩnh vực nghiên cứu sinh viên trên toàn quốc. "}</p>
</div>
</div>
<div className={"shrink-0 flex items-center gap-3"}>
<button className={"px-5 py-2.5 rounded-none bg-primary hover:bg-royal-blue text-surface font-headline-sm text-label-lg transition-all inline-flex items-center gap-2 uppercase tracking-wider text-[12px] border border-cyan-core/40"} data-action={"regions"} type={"button"}>
<Icon name="explore" className="text-[18px]" />
<span>{" Mở Bản đồ Tương tác "}</span>
</button>
</div>
</div>
</div>
</section>
  );
}
