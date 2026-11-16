import { database } from '../integrations/supabase/client';
import { callRpc } from './request';
import { eligibleClubs } from './clubs.service';
import type { EventAttendee, EventFeedback, EventRegistration, NetworkEvent } from '../types/domain';

export type EventOperation = 'save_event' | 'set_event_status' | 'toggle_event_registration' | 'register_event' | 'cancel_event_registration' | 'event_attendees' | 'mark_event_attendance' | 'save_event_feedback';
export const eventRpc = (name: EventOperation, args: Record<string, unknown>) => callRpc<unknown>(name, args);

export async function listEvents() {
  const { data, error } = await database().from('events').select('*').in('status', ['published', 'completed', 'cancelled']).order('starts_at').limit(200);
  if (error) throw error;
  return (data || []) as NetworkEvent[];
}
export async function loadEvent(id: string) {
  const { data, error } = await database().from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Không tìm thấy hoạt động hoặc bạn chưa được cấp quyền xem.');
  return data as NetworkEvent;
}
export async function eventMeetingUrl(id: string) {
  const { data, error } = await database().from('event_access').select('meeting_url').eq('event_id', id).maybeSingle();
  if (error) throw error;
  return String(data?.meeting_url || '');
}
export async function loadEventDetails(id: string, userId?: string, admin = false) {
  const event = await loadEvent(id);
  if (!userId) return { event, registration: null, access: '', feedback: null, manager: false };
  const [registration, access, feedback, clubs] = await Promise.all([
    database().from('event_registrations').select('*').eq('event_id', id).eq('user_id', userId).maybeSingle(),
    eventMeetingUrl(id),
    database().from('event_feedback').select('rating,comment').eq('event_id', id).eq('user_id', userId).maybeSingle(),
    eligibleClubs(userId),
  ]);
  for (const result of [registration, feedback]) if (result.error) throw result.error;
  return { event, registration: registration.data as EventRegistration | null, access, feedback: feedback.data as EventFeedback | null, manager: admin || clubs.some((club) => club.id === event.organizer_club_id) };
}
export async function listMyEventRegistrations(userId: string) {
  const { data, error } = await database().from('event_registrations').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) throw error;
  const registrations = (data || []) as EventRegistration[];
  if (!registrations.length) return [];
  const result = await database().from('events').select('*').in('id', registrations.map((registration) => registration.event_id));
  if (result.error) throw result.error;
  return registrations.map((registration) => ({ registration, event: (result.data as NetworkEvent[]).find((event) => event.id === registration.event_id) }));
}
export async function loadOrganizerEvents(userId: string, admin: boolean) {
  const clubs = await eligibleClubs(userId);
  let request = database().from('events').select('*').order('starts_at', { ascending: false });
  if (!admin) {
    if (!clubs.length) return { clubs, events: [] as NetworkEvent[] };
    request = request.in('organizer_club_id', clubs.map((club) => club.id));
  }
  const { data, error } = await request.limit(200);
  if (error) throw error;
  return { clubs, events: (data || []) as NetworkEvent[] };
}
export async function loadEventEditor(id: string | undefined, userId: string, admin: boolean) {
  const clubs = await eligibleClubs(userId);
  if (!id) return { clubs, event: null, url: '' };
  const event = await loadEvent(id);
  if (!(admin || clubs.some((club) => club.id === event.organizer_club_id))) throw new Error('Bạn không có quyền chỉnh sửa hoạt động này.');
  return { clubs, event, url: await eventMeetingUrl(id) };
}
export async function loadEventAttendees(id: string) {
  const event = await loadEvent(id);
  const rows = await callRpc<EventAttendee[]>('event_attendees', { p_event: id });
  return { event, rows };
}
