import { useMemo, useState } from 'react';
import { sampleClubs } from '../data/clubs';
import type { ClubFilters } from '../types/club';
import { normalizeSearch } from '../utils/search';

const emptyFilters: ClubFilters = { query: '', university: '', field: '' };

export function useClubSearch() {
  const [draft, setDraft] = useState<ClubFilters>(emptyFilters);
  const [filters, setFilters] = useState<ClubFilters>(emptyFilters);
  const clubs = useMemo(() => sampleClubs.filter((club) => {
    const text = [club.name, club.university, club.description, ...club.tags].join(' ');
    return normalizeSearch(text).includes(normalizeSearch(filters.query))
      && (!filters.university || club.universityId === filters.university)
      && (!filters.field || club.field === filters.field);
  }), [filters]);

  return {
    draft, setDraft, clubs, total: sampleClubs.length,
    search: () => setFilters({ ...draft }),
    reset: () => { setDraft(emptyFilters); setFilters(emptyFilters); },
  };
}
