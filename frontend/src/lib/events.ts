import type { NetworkEvent } from '../types/domain';

export function registrationOpen(event: NetworkEvent, now = Date.now()) {
  return event.status === 'published' && event.registration_enabled && new Date(event.registration_opens_at).getTime() <= now && new Date(event.registration_closes_at).getTime() > now && new Date(event.starts_at).getTime() > now;
}
// datetime-local displays and accepts the browser's local timezone; persist UTC.
export function localDateInput(date: string) {
  const value = new Date(date);
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
