import type { Club } from '../../types/club';
import { Icon } from '../common/Icon';

export function ClubCard({ club }: { club: Club }) {
  return (
    <article data-club-card className="relative p-6 bg-white border border-slate-border hover:border-royal-blue bca-card-glow transition-all flex flex-col justify-between group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-blue via-cyan-core to-royal-blue" />
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-royal-blue/20 text-royal-blue border border-royal-blue/30 flex items-center justify-center font-bold text-headline-sm">{club.initials}</div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-royal-blue text-[10px] border border-sky-200 uppercase tracking-wider font-bold">CLB minh họa</span>
        </div>
        <h3 className="text-headline-sm text-slate-text-main group-hover:text-royal-blue font-bold">{club.name}</h3>
        <div className="flex items-center gap-1.5 text-slate-text-muted text-[13px] mt-1 mb-3"><Icon name="school" className="text-[16px]" /><span>{club.university}</span></div>
        <p className="text-body-sm text-slate-text-muted line-clamp-2 leading-relaxed">{club.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-4">{club.tags.map((tag) => <span key={tag} className="px-2 py-0.5 bg-surface-container-high text-slate-text-main text-[11px] font-bold uppercase tracking-wider border border-slate-border">{tag}</span>)}</div>
      </div>
      <div className="pt-5 mt-6 border-t border-slate-border flex items-center justify-between text-[12px] text-slate-text-muted">
        <span className="flex items-center gap-1"><Icon name="person" className="text-[16px]" />{club.members}</span>
        <span className="flex items-center gap-1 text-royal-blue font-bold"><Icon name="article" className="text-[16px]" />{club.publications}</span>
      </div>
    </article>
  );
}
