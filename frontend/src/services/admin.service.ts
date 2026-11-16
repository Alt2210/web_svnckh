import { database } from '../integrations/supabase/client';
import { callRpc } from './request';
import type { Application, AuditLog, Club, Profile, Round } from '../types/domain';

export async function listUsers(page: number, search: string) {
  let query = database().from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(page * 25, page * 25 + 24);
  if (search.trim()) query = query.ilike('full_name', `%${search.replace(/[%_]/g, '')}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  return { users: data as Profile[], total: count || 0 };
}
export const setUserStatus = (id: string, status: Profile['status'], reason: string) => callRpc('set_user_status', { p_user: id, p_status: status, p_reason: reason });
export async function listAdminClubs(page: number, search: string, status: string) {
  let query = database().from('clubs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(page * 25, page * 25 + 24);
  if (search) query = query.ilike('name', `%${search.replace(/[%_]/g, '')}%`);
  if (status) query = query.eq('status', status);
  const { data, error, count } = await query;
  if (error) throw error;
  return { clubs: data as Club[], total: count || 0 };
}
export const archiveClub = (id: string, archive: boolean, reason: string) => callRpc('archive_club', { p_club: id, p_archive: archive, p_reason: reason });
export async function listRounds() {
  const { data, error } = await database().from('application_rounds').select('*').order('opens_at', { ascending: false });
  if (error) throw error;
  return data as Round[];
}
export interface RoundInput { title: string; opens_at: string; closes_at: string; instructions: string; is_open: boolean }
export const saveRound = (round: RoundInput) => callRpc('save_round', { p_title: round.title, p_opens: round.opens_at, p_closes: round.closes_at, p_instructions: round.instructions, p_open: round.is_open });
export const toggleRound = (id: string, open: boolean) => callRpc('toggle_round', { p_round: id, p_open: open });
export async function listApplications() {
  const [apps, clubs] = await Promise.all([database().from('applications').select('*').order('submitted_at', { ascending: false }).limit(100), database().from('clubs').select('*').order('name')]);
  for (const result of [apps, clubs]) if (result.error) throw result.error;
  return { apps: apps.data as Application[], clubs: clubs.data as Club[] };
}
export interface ReviewInput { status: string; note: string; deadline: string | null; document_no: string; effective_at: string | null }
export const reviewApplication = (id: string, review: ReviewInput) => callRpc('review_application', { p_application: id, p_status: review.status, p_note: review.note, p_deadline: review.deadline, p_document_no: review.document_no, p_effective_at: review.effective_at });
export const reviewClubApplication = (id: string, review: ReviewInput) => callRpc('admin_review_club_application', { p_application: id, p_status: review.status, p_note: review.note, p_deadline: review.deadline, p_document_no: review.document_no, p_effective_at: review.effective_at });
export async function listAuditLogs() {
  const { data, error } = await database().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data as AuditLog[];
}
