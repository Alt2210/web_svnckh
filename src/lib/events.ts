import { database } from './supabase';
import type { Club, NetworkEvent } from '../types/domain';

export async function eligibleClubs(userId: string) {
  const { data, error } = await database().from('clubs').select('*').eq('owner_id', userId).eq('status', 'active').eq('membership', 'recognized').order('name');
  if (error) throw error;
  return (data || []) as Club[];
}
export async function loadEvent(id: string) {
  const { data, error } = await database().from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Không tìm thấy hoạt động hoặc bạn chưa được cấp quyền xem.');
  return data as NetworkEvent;
}
export async function eventRpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await database().rpc(name, args);
  if (error) throw error;
  return data;
}
export function registrationOpen(event: NetworkEvent, now = Date.now()) {
  return event.status === 'published' && event.registration_enabled && new Date(event.registration_opens_at).getTime() <= now && new Date(event.registration_closes_at).getTime() > now && new Date(event.starts_at).getTime() > now;
}
// datetime-local displays and accepts the browser's local timezone; persist UTC.
export function localDateInput(date: string) {
  const value = new Date(date);
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
