import { database } from '../integrations/supabase/client';
import { callRpc } from './request';
import type { Application, ApplicationEvent, ApplicationVersion, Club, ClubDocument, ClubInput, Round } from '../types/domain';

export async function listMyClubs(userId: string) {
  const { data, error } = await database().from('clubs').select('*').eq('owner_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as Club[];
}
export async function eligibleClubs(userId: string) {
  const { data, error } = await database().from('clubs').select('*').eq('owner_id', userId).eq('status', 'active').eq('membership', 'recognized').order('name');
  if (error) throw error;
  return (data || []) as Club[];
}
export async function loadClubDetails(id?: string) {
  const client = database();
  const [club, documents, applications, rounds] = await Promise.all([
    id ? client.from('clubs').select('*').eq('id', id).single() : Promise.resolve({ data: null, error: null }),
    id ? client.from('club_documents').select('*').eq('club_id', id).order('created_at') : Promise.resolve({ data: [], error: null }),
    id ? client.from('applications').select('*').eq('club_id', id).order('submitted_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    client.from('application_rounds').select('*').eq('is_open', true).order('opens_at', { ascending: false }),
  ]);
  for (const result of [club, documents, applications, rounds]) if (result.error) throw result.error;
  return { club: club.data as Club | null, documents: documents.data as ClubDocument[], applications: applications.data as Application[], rounds: rounds.data as Round[] };
}
export const saveClub = (id: string | undefined, club: ClubInput) => callRpc<string>('save_club', { p_id: id || null, p_payload: club });
export const submitClub = (id: string, roundId: string) => callRpc('submit_club', { p_club: id, p_round: roundId });

export async function uploadClubDocument(userId: string, clubId: string, file: File | null) {
  if (!file || !file.name.toLowerCase().endsWith('.pdf') || file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) throw new Error('Chỉ chấp nhận PDF có dung lượng tối đa 10 MB.');
  const path = `${userId}/${clubId}/${crypto.randomUUID()}.pdf`;
  const { error } = await database().storage.from('club-evidence').upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (error) throw error;
  await callRpc('attach_club_document', { p_club: clubId, p_path: path, p_file_name: file.name });
}
export async function clubDocumentUrl(path: string) {
  const { data, error } = await database().storage.from('club-evidence').createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
export async function loadApplicationHistory(id: string) {
  const [events, versions] = await Promise.all([
    database().from('application_events').select('*').eq('application_id', id).order('created_at'),
    database().from('application_versions').select('*').eq('application_id', id).order('version'),
  ]);
  for (const result of [events, versions]) if (result.error) throw result.error;
  return { events: events.data as ApplicationEvent[], versions: versions.data as ApplicationVersion[] };
}
