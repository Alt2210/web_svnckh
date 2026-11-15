import type { ReactNode } from 'react';

const symbols: Record<string, ReactNode> = {
  '↗': <path d="M5 19 19 5M5 5h14v14" />,
  '→': <path d="M3 12h18m-7-7 7 7-7 7" />,
  '←': <path d="M21 12H3m7-7-7 7 7 7" />,
  '↓': <path d="M12 3v18m-7-7 7 7 7-7" />,
  '↑': <path d="M12 21V3m-7 7 7-7 7 7" />,
  '↔': <path d="M3 12h18M8 7l-5 5 5 5m8-10 5 5-5 5" />,
  '+': <path d="M12 3v18M3 12h18" />,
  '−': <path d="M3 12h18" />,
  '✳': <path d="M12 1v22M1 12h22M4.22 4.22l15.56 15.56M4.22 19.78 19.78 4.22" />,
  '◎': <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
};

/** Fixed vector geometry prevents platform emoji and fallback-font substitutions. */
export function SymbolIcon({ glyph }: { glyph: string }) {
  const shape = symbols[glyph];
  if (!shape) return <span aria-hidden="true">{glyph}</span>;
  return <svg className="symbol-icon" width="24" height="24" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shape}</svg>;
}
