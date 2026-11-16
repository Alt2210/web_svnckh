import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const ids = Object.fromEntries(['owner', 'other', 'admin', 'reviewer', 'approver', 'unverified'].map((name, i) => [name, `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`]));
let clubId, roundId, closedRoundId, applicationId;
const payload = { name: 'CLB Khoa học trẻ', abbreviation: 'KHT', university: 'Đại học Thử nghiệm', province: 'Hà Nội', field: 'Công nghệ', contact_email: 'club@example.com', description: 'Câu lạc bộ nghiên cứu khoa học và chia sẻ phương pháp học thuật.' };
async function user(name, sql, params = [], aal = 'aal1') {
  await db.exec('set role authenticated');
  try {
    await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: ids[name], aal })]);
    return await db.query(sql, params);
  } finally { await db.exec('reset role'); }
}
const rpc = (name, fn, params, aal) => user(name, `select public.${fn}(${params.map((_, i) => `$${i + 1}`).join(',')}) as value`, params, aal);

before(async () => {
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,metadata jsonb);
    alter table storage.objects enable row level security;
    grant usage on schema public,auth,storage to anon,authenticated;
    grant select,insert on storage.objects to authenticated;
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/202611160001_initial.sql', import.meta.url), 'utf8'));
  for (const [name, id] of Object.entries(ids)) {
    await db.query('insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,$2,$3,$4)', [id, `${name}@example.com`, name === 'unverified' ? null : new Date(), JSON.stringify({ full_name: `${name} User` })]);
  }
  for (const role of ['admin', 'reviewer', 'approver']) await db.query('insert into public.access_roles(user_id,role) values($1,$2)', [ids[role], role]);
});
after(async () => { await db.close(); });

test('migration enables RLS and does not grant direct writes to the browser', async () => {
  const result = await db.query("select count(*)::int as count from pg_tables where schemaname='public' and rowsecurity");
  assert.equal(result.rows[0].count, 10);
  await assert.rejects(() => user('owner', "update public.profiles set status='locked' where id=$1", [ids.other]), /permission denied/);
  await assert.rejects(() => user('owner', "insert into public.access_roles values($1,'admin')", [ids.owner]), /permission denied/);
});
test('email must be verified and club creation never self-recognizes', async () => {
  await assert.rejects(() => rpc('unverified', 'save_club', [null, payload]), /xác minh/);
  const r = await rpc('owner', 'save_club', [null, { ...payload, membership: 'recognized', owner_id: ids.admin }]);
  clubId = r.rows[0].value;
  const club = await user('owner', 'select * from public.clubs');
  assert.equal(club.rows[0].membership, 'not_recognized');
  assert.equal(club.rows[0].owner_id, ids.owner);
});
test('object-level isolation protects other clubs, profiles and privileges', async () => {
  assert.equal((await user('other', 'select * from public.clubs')).rows.length, 0);
  assert.equal((await user('other', 'select * from public.profiles where id=$1', [ids.owner])).rows.length, 0);
  await assert.rejects(() => rpc('other', 'save_club', [clubId, { ...payload, name: 'Changed by another user' }]), /không có quyền/);
  await assert.rejects(() => user('owner', "update public.clubs set membership='recognized' where id=$1", [clubId]), /permission denied/);
});
test('admin requires MFA and locking a user blocks data access with an old JWT', async () => {
  assert.equal((await user('admin', 'select * from public.profiles')).rows.length, 1);
  await assert.rejects(() => rpc('admin', 'set_user_status', [ids.other, 'locked', 'Kiểm thử khóa tài khoản']), /hai bước/);
  assert.equal((await user('admin', 'select * from public.profiles', [], 'aal2')).rows.length, 6);
  await rpc('admin', 'set_user_status', [ids.other, 'locked', 'Kiểm thử khóa tài khoản'], 'aal2');
  await assert.rejects(() => rpc('other', 'save_club', [null, { ...payload, name: 'CLB B' }]), /xác minh/);
  await assert.rejects(() => rpc('admin', 'set_user_status', [ids.admin, 'locked', 'Khóa chính tài khoản'], 'aal2'), /chính tài khoản/);
  await rpc('admin', 'set_user_status', [ids.other, 'active', 'Khôi phục tài khoản'], 'aal2');
});
test('submission requires an open round and evidence, and stores an immutable snapshot', async () => {
  roundId = (await rpc('admin', 'save_round', ['Đợt kiểm thử mở', '2020-01-01T00:00:00Z', '2099-01-01T00:00:00Z', 'Hướng dẫn', true], 'aal2')).rows[0].value;
  closedRoundId = (await rpc('admin', 'save_round', ['Đợt kiểm thử đóng', '2020-01-01T00:00:00Z', '2099-01-01T00:00:00Z', 'Hướng dẫn', false], 'aal2')).rows[0].value;
  await assert.rejects(() => rpc('owner', 'submit_club', [clubId, roundId]), /PDF/);
  const path = `${ids.owner}/${clubId}/evidence.pdf`;
  await assert.rejects(() => user('other', "insert into storage.objects(bucket_id,name) values('club-evidence',$1)", [path]), /row-level security/);
  await user('owner', "insert into storage.objects(bucket_id,name) values('club-evidence',$1)", [path]);
  await rpc('owner', 'attach_club_document', [clubId, path, 'evidence.pdf']);
  await assert.rejects(() => rpc('other', 'attach_club_document', [clubId, path, 'stolen.pdf']), /không có quyền/);
  await assert.rejects(() => rpc('owner', 'submit_club', [clubId, closedRoundId]), /chưa mở/);
  applicationId = (await rpc('owner', 'submit_club', [clubId, roundId])).rows[0].value;
  await assert.rejects(() => rpc('owner', 'submit_club', [clubId, roundId]), /đã nộp/);
  await assert.rejects(() => rpc('owner', 'save_club', [clubId, { ...payload, name: 'Changed while pending' }]), /đang được xử lý/);
  await assert.rejects(() => user('owner', "update public.application_versions set snapshot='{}'"), /permission denied/);
});
test('revision preserves earlier versions and requires delegated review permission', async () => {
  await assert.rejects(() => rpc('admin', 'review_application', [applicationId, 'under_review', 'Bắt đầu xem xét', null, '', null], 'aal2'), /quyền thẩm định/);
  await rpc('reviewer', 'review_application', [applicationId, 'under_review', 'Bắt đầu xem xét', null, '', null], 'aal2');
  await assert.rejects(() => rpc('reviewer', 'review_application', [applicationId, 'need_revision', 'Bổ sung hồ sơ', null, '', null], 'aal2'), /hạn bổ sung/);
  await rpc('reviewer', 'review_application', [applicationId, 'need_revision', 'Bổ sung giới thiệu hoạt động', '2098-01-01T00:00:00Z', '', null], 'aal2');
  await rpc('owner', 'save_club', [clubId, { ...payload, description: `${payload.description} Đã bổ sung thông tin.` }]);
  await rpc('owner', 'submit_club', [clubId, roundId]);
  const versions = await user('owner', 'select * from public.application_versions order by version');
  assert.equal(versions.rows.length, 2);
  assert.equal(versions.rows[0].snapshot.club.description, payload.description);
  assert.match(versions.rows[1].snapshot.club.description, /Đã bổ sung/);
  assert.equal((await user('other', 'select * from public.application_versions')).rows.length, 0);
});
test('recognition requires delegated approver, recommendation, MFA and decision metadata', async () => {
  await rpc('reviewer', 'review_application', [applicationId, 'under_review', 'Kiểm tra phiên bản bổ sung', null, '', null], 'aal2');
  await rpc('reviewer', 'review_application', [applicationId, 'recommended', 'Đủ điều kiện trình phê duyệt', null, '', null], 'aal2');
  await assert.rejects(() => rpc('admin', 'review_application', [applicationId, 'approved', 'Phê duyệt thử nghiệm', null, 'TEST-01', '2020-01-01'], 'aal2'), /thẩm quyền phê duyệt/);
  await assert.rejects(() => rpc('approver', 'review_application', [applicationId, 'approved', 'Phê duyệt thử nghiệm', null, 'TEST-01', '2020-01-01']), /thẩm quyền phê duyệt/);
  await assert.rejects(() => rpc('approver', 'review_application', [applicationId, 'approved', 'Phê duyệt thử nghiệm', null, '', null], 'aal2'), /số quyết định/);
  await rpc('approver', 'review_application', [applicationId, 'approved', 'Phê duyệt thử nghiệm hợp lệ', null, 'TEST-01', '2020-01-01'], 'aal2');
  assert.equal((await user('owner', 'select membership from public.clubs where id=$1', [clubId])).rows[0].membership, 'recognized');
  assert.equal((await user('owner', 'select * from public.decisions')).rows.length, 1);
  assert.equal((await user('admin', 'select * from public.audit_logs', [], 'aal2')).rows.some((log) => log.action === 'application.reviewed'), true);
  assert.equal((await user('owner', 'select * from public.audit_logs')).rows.length, 0);
});
test('archiving retains history, and role/ownership changes cannot be forged', async () => {
  await rpc('admin', 'archive_club', [clubId, true, 'Lưu trữ kiểm thử'], 'aal2');
  assert.equal((await user('owner', 'select * from public.application_versions')).rows.length, 2);
  await assert.rejects(() => user('owner', 'update public.clubs set owner_id=$1', [ids.other]), /permission denied/);
  await rpc('admin', 'set_user_status', [ids.owner, 'locked', 'Khóa kiểm thử cuối cùng'], 'aal2');
  assert.equal((await user('owner', 'select * from public.clubs')).rows.length, 0);
  assert.equal((await user('owner', 'select * from storage.objects')).rows.length, 0);
});
