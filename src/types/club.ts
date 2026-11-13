export interface Club {
  id: string;
  initials: string;
  name: string;
  university: string;
  universityId: string;
  field: string;
  region: string;
  description: string;
  tags: string[];
  members: string;
  publications: string;
}

export interface ClubFilters {
  query: string;
  university: string;
  field: string;
}
