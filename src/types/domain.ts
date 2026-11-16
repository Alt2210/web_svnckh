export type StaffRole = 'admin' | 'reviewer' | 'approver';
export interface Profile { id: string; full_name: string; email: string; university: string; field: string; bio: string; status: 'active' | 'locked'; created_at: string }
export interface Club { id: string; owner_id: string; name: string; abbreviation: string; university: string; province: string; field: string; contact_email: string; description: string; status: 'active' | 'archived'; membership: string; created_at: string }
export type ClubInput = Pick<Club, 'name' | 'abbreviation' | 'university' | 'province' | 'field' | 'contact_email' | 'description'>;
export interface Round { id: string; title: string; opens_at: string; closes_at: string; instructions: string; is_open: boolean }
export interface Application { id: string; club_id: string; round_id: string; code: string; status: string; version: number; submitted_at: string }
export interface ApplicationEvent { id: string; application_id: string; status: string; note: string; deadline: string | null; created_at: string }
export interface ApplicationVersion { id: string; application_id: string; version: number; snapshot: { club: Club; documents: ClubDocument[] }; created_at: string }
export interface ClubDocument { id: string; club_id: string; path: string; file_name: string; created_at: string }
export interface AuditLog { id: number; actor_id: string; action: string; resource_id: string; detail: Record<string, unknown>; created_at: string }
export const statusLabels: Record<string, string> = { active: 'Đang hoạt động', locked: 'Đã khóa', archived: 'Đã lưu trữ', not_recognized: 'Chưa công nhận', recognized: 'Được công nhận', suspended: 'Tạm đình chỉ', revoked: 'Đã thu hồi', draft: 'Bản nháp', submitted: 'Đã nộp', under_review: 'Đang thẩm định', need_revision: 'Cần bổ sung', resubmitted: 'Đã nộp lại', recommended: 'Đề xuất công nhận', approved: 'Đã phê duyệt', rejected: 'Từ chối' };
export const dateLabel = (date: string) => new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });
export interface NetworkEvent {
  id: string; creator_id: string; organizer_club_id: string | null; title: string; category: string;
  description: string; location: string; mode: 'onsite' | 'online' | 'hybrid'; visibility: 'public' | 'authenticated';
  status: 'draft' | 'published' | 'cancelled' | 'completed'; starts_at: string; ends_at: string;
  registration_opens_at: string; registration_closes_at: string; capacity: number; registration_enabled: boolean;
  registered_count: number; waitlist_count: number; cancellation_reason: string;
}
export interface EventRegistration { id: string; event_id: string; user_id: string; status: 'registered' | 'waitlisted' | 'cancelled' | 'attended'; queue_at: string; attended_at: string | null }
export interface EventFeedback { rating: number; comment: string }
export interface EventAttendee { registration_id: string; user_id: string; full_name: string; email: string; status: EventRegistration['status']; queue_at: string; attended_at: string | null; rating: number | null; feedback: string | null }
export const eventLabels: Record<string, string> = { draft: 'Bản nháp', published: 'Đã công bố', completed: 'Đã kết thúc', cancelled: 'Đã hủy', registered: 'Đã xác nhận', waitlisted: 'Danh sách chờ', attended: 'Đã tham dự', onsite: 'Trực tiếp', online: 'Trực tuyến', hybrid: 'Kết hợp', public: 'Công khai', authenticated: 'Tài khoản đã xác minh' };
