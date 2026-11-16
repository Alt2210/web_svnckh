import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const ids = Object.fromEntries(['admin', 'owner', 'other', 'third', 'unverified'].map((name, i) => [name, `10000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`]));
let eventId, clubEventId, privateId, clubId;
const time = (hours) => new Date(Date.now() + hours * 3600000).toISOString();
const payload = { title: 'Hội thảo nghiên cứu khoa học', category: 'Hội thảo', description: 'Trao đổi kinh nghiệm nghiên cứu và phương pháp xây dựng hoạt động học thuật.', mode: 'online', meeting_url: 'https://meet.example.com/private-room', location: '', visibility: 'public', starts_at: time(48), ends_at: time(50), registration_opens_at: time(-24), registration_closes_at: time(47), capacity: 1, organizer_club_id: '' };
async function user(name, sql, params = [], aal = 'aal1') {
  await db.exec(`set role ${name === 'anon' ? 'anon' : 'authenticated'}`);
  try { await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: ids[name], aal })]); return await db.query(sql, params); }
  finally { await db.exec('reset role'); }
}
const rpc = (name, fn, params, aal) => user(name, `select public.${fn}(${params.map((_, i) => `$${i + 1}`).join(',')}) as value`, params, aal);
before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,metadata jsonb);
    alter table storage.objects enable row level security;
    grant usage on schema public,auth,storage to anon,authenticated; grant select,insert on storage.objects to authenticated;`);
  for (const name of ['202611160001_initial.sql', '202611160002_events.sql']) await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
  for (const [name, id] of Object.entries(ids)) await db.query('insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,$2,$3,$4)', [id, `${name}@example.com`, name === 'unverified' ? null : new Date(), JSON.stringify({ full_name: `${name} Event User` })]);
  await db.query("insert into public.access_roles values($1,'admin')", [ids.admin]);
  clubId = (await rpc('owner', 'save_club', [null, { name: 'CLB Hoạt động', abbreviation: 'HD', university: 'Đại học Kiểm thử', province: 'Hà Nội', field: 'Khoa học', contact_email: 'club@example.com', description: 'Câu lạc bộ thử nghiệm tổ chức các hoạt động khoa học.' }])).rows[0].value;
});
after(() => db.close());

test('event creation respects admin MFA and recognized club ownership', async () => {
  await assert.rejects(() => rpc('admin', 'save_event', [null, payload]), /hai bước/);
  await assert.rejects(() => rpc('other', 'save_event', [null, payload]), /hai bước/);
  await assert.rejects(() => rpc('owner', 'save_event', [null, { ...payload, organizer_club_id: clubId }]), /công nhận/);
  await db.query("update public.clubs set membership='recognized' where id=$1", [clubId]);
  clubEventId = (await rpc('owner', 'save_event', [null, { ...payload, organizer_club_id: clubId, title: 'Hoạt động cấp câu lạc bộ' }])).rows[0].value;
  eventId = (await rpc('admin', 'save_event', [null, payload], 'aal2')).rows[0].value;
  assert.equal((await user('anon', 'select * from public.events')).rows.length, 0);
  assert.equal((await user('owner', 'select * from public.events')).rows.length, 1);
  await assert.rejects(() => rpc('other', 'save_event', [eventId, payload]), /không có quyền/);
});
test('publication exposes only intended audiences and never leaks meeting links or participant lists', async () => {
  await rpc('admin', 'set_event_status', [eventId, 'published', ''], 'aal2');
  privateId = (await rpc('admin', 'save_event', [null, { ...payload, title: 'Hoạt động dành cho tài khoản', visibility: 'authenticated' }], 'aal2')).rows[0].value;
  await rpc('admin', 'set_event_status', [privateId, 'published', ''], 'aal2');
  assert.equal((await user('anon', 'select * from public.events')).rows.length, 1);
  assert.equal((await user('other', 'select * from public.events')).rows.length, 2);
  assert.equal((await user('other', 'select * from public.event_access')).rows.length, 0);
  await assert.rejects(() => user('anon', 'select * from public.event_access'), /permission denied/);
  await assert.rejects(() => rpc('other', 'event_attendees', [eventId]), /ban tổ chức/);
});
test('registration is idempotent, enforces capacity and places excess users on a waitlist', async () => {
  await assert.rejects(() => rpc('unverified', 'register_event', [eventId]), /xác minh/);
  assert.equal((await rpc('owner', 'register_event', [eventId])).rows[0].value, 'registered');
  assert.equal((await rpc('owner', 'register_event', [eventId])).rows[0].value, 'registered');
  assert.equal((await rpc('other', 'register_event', [eventId])).rows[0].value, 'waitlisted');
  const e = (await user('anon', 'select registered_count,waitlist_count from public.events where id=$1', [eventId])).rows[0];
  assert.equal(e.registered_count, 1); assert.equal(e.waitlist_count, 1);
  assert.equal((await user('owner', 'select * from public.event_registrations')).rows.length, 1);
  assert.equal((await user('owner', 'select * from public.event_access where event_id=$1', [eventId])).rows.length, 1);
  assert.equal((await user('other', 'select * from public.event_access')).rows.length, 0);
  await assert.rejects(() => rpc('owner', 'save_event_feedback', [eventId, 5, 'Phản hồi trước hoạt động']), /sau hoạt động/);
});
test('cancelling promotes the earliest eligible waitlisted registration and removes private link access', async () => {
  await rpc('owner', 'cancel_event_registration', [eventId]);
  const row = (await user('other', 'select status from public.event_registrations')).rows[0];
  assert.equal(row.status, 'registered');
  assert.equal((await user('owner', 'select * from public.event_access where event_id=$1', [eventId])).rows.length, 0);
  assert.equal((await user('other', 'select * from public.event_access')).rows.length, 1);
  await assert.rejects(() => rpc('owner', 'cancel_event_registration', [eventId]), /Không có/);
  assert.equal((await rpc('owner', 'register_event', [eventId])).rows[0].value, 'waitlisted');
});
test('capacity increases promote waiting users, while shrinking below confirmed seats or changing an agreed schedule is blocked', async () => {
  await rpc('admin', 'save_event', [eventId, { ...payload, capacity: 2 }], 'aal2');
  assert.equal((await user('owner', 'select status from public.event_registrations')).rows[0].status, 'registered');
  await assert.rejects(() => rpc('admin', 'save_event', [eventId, { ...payload, capacity: 1 }], 'aal2'), /ít hơn/);
  await assert.rejects(() => rpc('admin', 'save_event', [eventId, { ...payload, capacity: 2, starts_at: time(49) }], 'aal2'), /Đã có người/);
  await assert.rejects(() => rpc('admin', 'save_event', [eventId, { ...payload, capacity: 2, organizer_club_id: clubId }], 'aal2'), /đơn vị tổ chức/);
});
test('manual closure and registration deadlines are enforced by RPC, not only the UI', async () => {
  await rpc('admin', 'toggle_event_registration', [eventId, false], 'aal2');
  await assert.rejects(() => rpc('third', 'register_event', [eventId]), /đã đóng/);
  await rpc('admin', 'toggle_event_registration', [eventId, true], 'aal2');
  assert.equal((await rpc('third', 'register_event', [eventId])).rows[0].value, 'waitlisted');
  await db.query('update public.events set registration_closes_at=$1 where id=$2', [time(-1), eventId]);
  await assert.rejects(() => rpc('third', 'register_event', [eventId]), /đã đóng/);
  await assert.rejects(() => rpc('admin', 'set_event_status', [eventId, 'draft', ''], 'aal2'), /đã có người/);
  await assert.rejects(() => rpc('admin', 'set_event_status', [eventId, 'completed', ''], 'aal2'), /kết thúc/);
});
test('only organizers can check in confirmed participants and read participant contact details', async () => {
  const registrations = await user('admin', 'select * from public.event_registrations where event_id=$1 order by queue_at', [eventId], 'aal2');
  const registration = registrations.rows.find((r) => r.user_id === ids.other);
  await assert.rejects(() => rpc('admin', 'mark_event_attendance', [registration.id, true], 'aal2'), /30 phút/);
  await db.query('update public.events set starts_at=$1,ends_at=$2,registration_closes_at=$4 where id=$3', [time(-0.5), time(-0.1), eventId, time(-1)]);
  await assert.rejects(() => rpc('owner', 'mark_event_attendance', [registration.id, true]), /ban tổ chức/);
  await rpc('admin', 'mark_event_attendance', [registration.id, true], 'aal2');
  const list = await user('admin', 'select * from public.event_attendees($1)', [eventId], 'aal2');
  assert.equal(list.rows.find((r) => r.user_id === ids.other).email, 'other@example.com');
  assert.equal(list.rows.find((r) => r.user_id === ids.other).status, 'attended');
  await assert.rejects(() => rpc('owner', 'cancel_event_registration', [eventId]), /đã bắt đầu/);
});
test('feedback is private, limited to confirmed participants after an event, and updateable without duplication', async () => {
  await rpc('owner', 'save_event_feedback', [eventId, 4, 'Nội dung thiết thực.']);
  await rpc('owner', 'save_event_feedback', [eventId, 5, 'Đã cập nhật góp ý.']);
  await assert.rejects(() => rpc('third', 'save_event_feedback', [eventId, 5, 'Tôi đang ở danh sách chờ']), /đăng ký xác nhận/);
  assert.equal((await user('owner', 'select * from public.event_feedback')).rows.length, 1);
  assert.equal((await user('other', 'select * from public.event_feedback')).rows.length, 0);
  await rpc('admin', 'set_event_status', [eventId, 'completed', ''], 'aal2');
  await assert.rejects(() => rpc('admin', 'save_event', [eventId, payload], 'aal2'), /đã kết thúc/);
});
test('cancelling an event preserves history, stops registration and requires a reason', async () => {
  await rpc('owner', 'set_event_status', [clubEventId, 'published', '']);
  await rpc('third', 'register_event', [clubEventId]);
  await assert.rejects(() => rpc('owner', 'set_event_status', [clubEventId, 'cancelled', '']), /lý do hủy/);
  await rpc('owner', 'set_event_status', [clubEventId, 'cancelled', 'Thay đổi kế hoạch tổ chức']);
  await assert.rejects(() => rpc('third', 'register_event', [clubEventId]), /đã đóng/);
  assert.equal((await user('third', 'select status from public.event_registrations where event_id=$1', [clubEventId])).rows[0].status, 'cancelled');
});
test('direct writes, attendance forgery and unverified or locked accounts cannot bypass RPC policies', async () => {
  await assert.rejects(() => user('owner', "update public.events set status='published'"), /permission denied/);
  await assert.rejects(() => user('other', "update public.event_registrations set status='attended'"), /permission denied/);
  await assert.rejects(() => user('other', "insert into public.event_access values($1,'https://forged.example')", [eventId]), /permission denied/);
  await rpc('admin', 'set_user_status', [ids.other, 'locked', 'Khóa kiểm thử tài khoản'], 'aal2');
  assert.equal((await user('other', 'select * from public.event_registrations')).rows.length, 0);
  assert.equal((await user('other', 'select * from public.event_access')).rows.length, 0);
  await assert.rejects(() => rpc('other', 'register_event', [privateId]), /xác minh/);
});
