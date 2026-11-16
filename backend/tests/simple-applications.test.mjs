import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
const ids = Object.fromEntries(['owner','other','admin','unverified'].map((name,i) => [name,`50000000-2026-4000-8000-${String(i+1).padStart(12,'0')}`]));
const payload = {name:'CLB Hồ sơ đơn giản',abbreviation:'HS',university:'Đại học Kiểm thử',province:'Hà Nội',field:'Khoa học',contact_email:'club@example.com',description:'Câu lạc bộ nghiên cứu khoa học và thực hành phương pháp nghiên cứu.'};
let club, application;
async function user(name, sql, params=[], aal='aal1') {
  await db.exec(`set role ${name==='anon'?'anon':'authenticated'}`);
  try { await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:ids[name],aal})]); return await db.query(sql,params); }
  finally { await db.exec('reset role'); }
}
const rpc=(name,fn,params,aal)=>user(name,`select public.${fn}(${params.map((_,i)=>`$${i+1}`).join(',')}) as value`,params,aal);
async function draft(name,title) {
  const id=(await rpc(name,'save_club',[null,{...payload,name:title}])).rows[0].value;
  const path=`${ids[name]}/${id}/evidence.pdf`;
  await db.query("insert into storage.objects(bucket_id,name) values('club-evidence',$1)",[path]);
  await rpc(name,'attach_club_document',[id,path,'evidence.pdf']); return id;
}
before(async()=>{
  await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,metadata jsonb);
    alter table storage.objects enable row level security;
    grant usage on schema public,auth,storage to anon,authenticated;grant select,insert on storage.objects to authenticated;`);
  for(const file of ['202611160001_initial.sql','202611160002_events.sql','202611160003_simple_applications.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  for(const [name,id]of Object.entries(ids))await db.query('insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,$2,$3,$4)',[id,`${name}@example.com`,name==='unverified'?null:new Date(),JSON.stringify({full_name:name+' User'})]);
  await db.query("insert into public.access_roles values($1,'admin')",[ids.admin]);
});
after(()=>db.close());

test('basic intake enforces authentication, verified email, ownership and PDF evidence',async()=>{
  await assert.rejects(()=>rpc('anon','submit_club_basic',['00000000-0000-4000-8000-000000000000']),/permission denied/);
  club=(await rpc('owner','save_club',[null,payload])).rows[0].value;
  await assert.rejects(()=>rpc('other','submit_club_basic',[club]),/không có quyền/);
  await assert.rejects(()=>rpc('unverified','submit_club_basic',[club]),/không có quyền/);
  await assert.rejects(()=>rpc('owner','submit_club_basic',[club]),/minh chứng/);
  const path=`${ids.owner}/${club}/evidence.pdf`;
  await db.query("insert into storage.objects(bucket_id,name) values('club-evidence',$1)",[path]);
  await rpc('owner','attach_club_document',[club,path,'evidence.pdf']);
  application=(await rpc('owner','submit_club_basic',[club])).rows[0].value;
  const row=(await user('owner','select * from public.applications where id=$1',[application])).rows[0];
  assert.equal(row.round_id,'ca000000-2026-4000-8000-000000000001');
  assert.equal((await user('other','select * from public.applications')).rows.length,0);
  await assert.rejects(()=>rpc('owner','submit_club_basic',[club]),/đã được gửi/);
});
test('admin direct approval still requires MFA, decision metadata, a pending application and independent ownership',async()=>{
  const args=[application,'approved','Hồ sơ đáp ứng điều kiện.',null,'QD-001',new Date().toISOString().slice(0,10)];
  await assert.rejects(()=>rpc('other','admin_review_club_application',args,'aal2'),/quyền admin/);
  await assert.rejects(()=>rpc('admin','admin_review_club_application',args),/hai bước/);
  await assert.rejects(()=>rpc('admin','admin_review_club_application',[...args.slice(0,4),'',null],'aal2'),/số quyết định/);
  await rpc('admin','admin_review_club_application',args,'aal2');
  assert.equal((await user('owner','select membership from public.clubs where id=$1',[club])).rows[0].membership,'recognized');
  assert.equal((await db.query('select * from public.decisions where application_id=$1',[application])).rows.length,1);
  assert.equal((await db.query("select * from public.audit_logs where action='application.admin_reviewed'")).rows.length,1);
  await assert.rejects(()=>rpc('admin','admin_review_club_application',args,'aal2'),/đã có kết quả/);
  const ownClub=await draft('admin','CLB Admin tự nộp');
  const own=(await rpc('admin','submit_club_basic',[ownClub])).rows[0].value;
  await assert.rejects(()=>rpc('admin','admin_review_club_application',[own,...args.slice(1)],'aal2'),/tự duyệt/);
});
test('revision and re-submission preserve snapshots, comments and terminal decisions',async()=>{
  const id=await draft('owner','CLB Cần bổ sung');
  const app=(await rpc('owner','submit_club_basic',[id])).rows[0].value;
  await assert.rejects(()=>rpc('admin','admin_review_club_application',[app,'need_revision','Bổ sung thông tin minh chứng.',null,'',null],'aal2'),/Hạn bổ sung/);
  await rpc('admin','admin_review_club_application',[app,'need_revision','Bổ sung thông tin minh chứng.',new Date(Date.now()+86400000).toISOString(),'',null],'aal2');
  await rpc('owner','save_club',[id,{...payload,name:'CLB Cần bổ sung',description:'Đã bổ sung thông tin hoạt động và nội dung giải trình của câu lạc bộ.'}]);
  assert.equal((await rpc('owner','submit_club_basic',[id])).rows[0].value,app);
  const versions=(await user('owner','select version,snapshot from public.application_versions where application_id=$1 order by version',[app])).rows;
  assert.equal(versions.length,2);assert.notEqual(versions[0].snapshot.club.description,versions[1].snapshot.club.description);
  await rpc('admin','admin_review_club_application',[app,'rejected','Không đáp ứng điều kiện xét duyệt.',null,'',null],'aal2');
  await assert.rejects(()=>rpc('owner','submit_club_basic',[id]),/đã có kết quả/);
});
test('old round applications can be revised from the simplified popup without moving history',async()=>{
  const round=(await rpc('admin','save_round',['Đợt trước khi rút gọn',new Date(Date.now()-86400000).toISOString(),new Date(Date.now()+86400000*5).toISOString(),'Hướng dẫn hồ sơ.',true],'aal2')).rows[0].value;
  const id=await draft('owner','CLB Hồ sơ đợt cũ');
  const app=(await rpc('owner','submit_club',[id,round])).rows[0].value;
  await rpc('admin','admin_review_club_application',[app,'need_revision','Bổ sung theo hướng dẫn.',new Date(Date.now()+86400000).toISOString(),'',null],'aal2');
  await rpc('owner','submit_club_basic',[id]);
  assert.equal((await user('owner','select round_id from public.applications where id=$1',[app])).rows[0].round_id,round);
});

test('temporary password-only admin policy preserves assigned roles, verification, account status and independent approval',async()=>{
  await db.exec(await readFile(new URL('../supabase/migrations/202611160004_admin_password_only.sql',import.meta.url),'utf8'));
  assert.equal((await user('admin',"select private.has_role('admin') as allowed")).rows[0].allowed,true);
  assert.equal((await user('other',"select private.has_role('admin') as allowed")).rows[0].allowed,false);
  await db.query("insert into public.access_roles values($1,'reviewer')",[ids.other]);
  assert.equal((await user('other',"select private.has_role('reviewer') as allowed")).rows[0].allowed,false);
  assert.equal((await user('other',"select private.has_role('reviewer') as allowed",[],'aal2')).rows[0].allowed,true);
  await db.query("insert into public.access_roles values($1,'admin')",[ids.unverified]);
  assert.equal((await user('unverified',"select private.has_role('admin') as allowed")).rows[0].allowed,false);
  const id=await draft('owner','CLB Admin duyệt bằng mật khẩu');
  const app=(await rpc('owner','submit_club_basic',[id])).rows[0].value;
  const args=[app,'approved','Hồ sơ đáp ứng điều kiện xét duyệt.',null,'QD-PASSWORD',new Date().toISOString().slice(0,10)];
  await assert.rejects(()=>rpc('other','admin_review_club_application',args),/quyền admin/);
  await rpc('admin','admin_review_club_application',args);
  assert.equal((await user('owner','select membership from public.clubs where id=$1',[id])).rows[0].membership,'recognized');
  await db.query("update public.profiles set status='locked' where id=$1",[ids.admin]);
  assert.equal((await user('admin',"select private.has_role('admin') as allowed")).rows[0].allowed,false);
  await assert.rejects(()=>rpc('admin','admin_review_club_application',args),/quyền admin/);
});
