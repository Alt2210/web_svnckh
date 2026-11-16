-- Requested AUTH / ORG / JOIN / ADMIN subset of SRS v2.1.
-- Run once in the Supabase SQL Editor. No service-role key is used by the browser.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  university text not null default '', field text not null default '', bio text not null default '',
  status text not null default 'active' check (status in ('active','locked')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.access_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('admin','reviewer','approver')),
  primary key (user_id, role)
);
create table public.clubs (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id),
  name text not null check (char_length(name) between 3 and 180), abbreviation text not null default '',
  university text not null, province text not null, field text not null,
  contact_email text not null, description text not null default '',
  status text not null default 'active' check (status in ('active','archived')),
  membership text not null default 'not_recognized' check (membership in ('not_recognized','recognized','suspended','revoked')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, owner_id)
);
create unique index clubs_unique_name_school on public.clubs(lower(trim(name)),lower(trim(university)));
create index clubs_owner_idx on public.clubs(owner_id);
create table public.application_rounds (
  id uuid primary key default gen_random_uuid(), title text not null,
  opens_at timestamptz not null, closes_at timestamptz not null,
  instructions text not null default '', is_open boolean not null default false,
  check (closes_at > opens_at)
);
create table public.applications (
  id uuid primary key default gen_random_uuid(), club_id uuid not null references public.clubs(id),
  round_id uuid not null references public.application_rounds(id),
  code text not null unique default ('SV-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  status text not null default 'submitted' check (status in ('submitted','under_review','need_revision','resubmitted','recommended','approved','rejected')),
  version integer not null default 1, submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique (club_id,round_id)
);
create index applications_club_idx on public.applications(club_id);
create table public.application_versions (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id),
  version integer not null, snapshot jsonb not null, created_at timestamptz not null default now(),
  unique(application_id,version)
);
create table public.application_events (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id),
  actor_id uuid not null references public.profiles(id), status text not null, note text not null default '',
  deadline timestamptz, created_at timestamptz not null default now()
);
create table public.decisions (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id),
  approver_id uuid not null references public.profiles(id), document_no text not null,
  effective_at date not null, reason text not null, created_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid,
  action text not null, resource_id uuid, detail jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.club_documents (
  id uuid primary key default gen_random_uuid(), club_id uuid not null references public.clubs(id),
  path text not null unique, file_name text not null, created_at timestamptz not null default now()
);

create function private.active_user() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p join auth.users u on u.id=p.id
    where p.id=(select auth.uid()) and p.status='active' and u.email_confirmed_at is not null);
$$;
create function private.has_role(p_role text) returns boolean language sql stable security definer set search_path='' as $$
  select private.active_user() and coalesce(auth.jwt()->>'aal','aal1')='aal2'
    and exists(select 1 from public.access_roles where user_id=(select auth.uid()) and role=p_role);
$$;
create function private.staff() returns boolean language sql stable security definer set search_path='' as $$
  select private.has_role('admin') or private.has_role('reviewer') or private.has_role('approver');
$$;
create function private.can_read_club(p_club uuid) returns boolean language sql stable security definer set search_path='' as $$
  select private.active_user() and exists(select 1 from public.clubs where id=p_club and (owner_id=(select auth.uid()) or private.staff()));
$$;
create function private.can_read_application(p_app uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.applications where id=p_app and private.can_read_club(club_id));
$$;
create function private.log_action(p_action text,p_id uuid,p_detail jsonb default '{}') returns void language sql security definer set search_path='' as $$
  insert into public.audit_logs(actor_id,action,resource_id,detail) values(auth.uid(),p_action,p_id,p_detail);
$$;
create function private.ensure_club_editable(p_club uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.active_user() or not exists(select 1 from public.clubs where id=p_club and (owner_id=auth.uid() or private.has_role('admin'))) then
    raise exception 'Bạn không có quyền sửa câu lạc bộ này.';
  end if;
  if exists(select 1 from public.applications where club_id=p_club and status in ('submitted','resubmitted','under_review','recommended')) then
    raise exception 'Hồ sơ đang được xử lý. Chỉ chỉnh sửa khi được yêu cầu bổ sung.';
  end if;
end;
$$;

create function private.new_user_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,full_name,email) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''),'Thành viên'),120),new.email);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.new_user_profile();

-- Preserve existing Auth accounts when the project predates this application.
-- Roles are deliberately not copied from user-controlled metadata.
insert into public.profiles(id,full_name,email)
select id, case when char_length(trim(coalesce(raw_user_meta_data->>'full_name','')))>=2
  then left(trim(raw_user_meta_data->>'full_name'),120) else 'Thành viên' end, coalesce(email,'')
from auth.users on conflict(id) do nothing;

alter table public.profiles enable row level security;
alter table public.access_roles enable row level security;
alter table public.clubs enable row level security;
alter table public.application_rounds enable row level security;
alter table public.applications enable row level security;
alter table public.application_versions enable row level security;
alter table public.application_events enable row level security;
alter table public.decisions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.club_documents enable row level security;
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or private.has_role('admin'));
create policy roles_read on public.access_roles for select to authenticated using(user_id=(select auth.uid()) or private.has_role('admin'));
create policy clubs_read on public.clubs for select to authenticated using(private.can_read_club(id));
create policy rounds_read on public.application_rounds for select to authenticated using(private.active_user());
create policy applications_read on public.applications for select to authenticated using(private.can_read_club(club_id));
create policy versions_read on public.application_versions for select to authenticated using(private.can_read_application(application_id));
create policy events_read on public.application_events for select to authenticated using(private.can_read_application(application_id));
create policy decisions_read on public.decisions for select to authenticated using(private.can_read_application(application_id));
create policy audit_read on public.audit_logs for select to authenticated using(private.staff());
create policy documents_read on public.club_documents for select to authenticated using(private.can_read_club(club_id));
-- Every mutation goes through a checked RPC; clients cannot alter roles/status/ownership directly.
revoke all on public.profiles, public.access_roles, public.clubs, public.application_rounds, public.applications,
  public.application_versions, public.application_events, public.decisions, public.audit_logs, public.club_documents from anon,authenticated;
grant select on public.profiles, public.access_roles, public.clubs, public.application_rounds, public.applications,
  public.application_versions, public.application_events, public.decisions, public.audit_logs, public.club_documents to authenticated;

create function public.save_profile(p_full_name text,p_university text,p_field text,p_bio text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.active_user() then raise exception 'Tài khoản cần xác minh email và còn hoạt động.'; end if;
  if char_length(trim(p_full_name)) not between 2 and 120 or char_length(p_bio)>2000 then raise exception 'Thông tin hồ sơ không hợp lệ.'; end if;
  update public.profiles set full_name=trim(p_full_name),university=left(p_university,180),field=left(p_field,120),bio=p_bio,updated_at=now() where id=auth.uid();
  perform private.log_action('profile.updated',auth.uid());
end;
$$;
create function public.save_club(p_id uuid,p_payload jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  if not private.active_user() then raise exception 'Vui lòng xác minh email trước khi đăng ký CLB.'; end if;
  if char_length(trim(coalesce(p_payload->>'name',''))) not between 3 and 180
    or char_length(trim(coalesce(p_payload->>'university',''))) not between 3 and 180
    or char_length(trim(coalesce(p_payload->>'province',''))) not between 2 and 120
    or char_length(trim(coalesce(p_payload->>'field',''))) not between 2 and 120
    or coalesce(p_payload->>'contact_email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(coalesce(p_payload->>'description','')) not between 20 and 5000 then raise exception 'Vui lòng điền đầy đủ và hợp lệ thông tin CLB.'; end if;
  if p_id is null then
    insert into public.clubs(owner_id,name,abbreviation,university,province,field,contact_email,description)
      values(auth.uid(),trim(p_payload->>'name'),left(coalesce(p_payload->>'abbreviation',''),30),trim(p_payload->>'university'),trim(p_payload->>'province'),trim(p_payload->>'field'),trim(p_payload->>'contact_email'),p_payload->>'description') returning id into v_id;
    perform private.log_action('club.created',v_id);
  else
    perform 1 from public.clubs where id=p_id for update;
    perform private.ensure_club_editable(p_id);
    update public.clubs set name=trim(p_payload->>'name'),abbreviation=left(coalesce(p_payload->>'abbreviation',''),30),university=trim(p_payload->>'university'),province=trim(p_payload->>'province'),field=trim(p_payload->>'field'),contact_email=trim(p_payload->>'contact_email'),description=p_payload->>'description',updated_at=now() where id=p_id;
    v_id:=p_id; perform private.log_action('club.updated',v_id);
  end if;
  return v_id;
exception when unique_violation then raise exception 'Tên CLB và trường chủ quản đã tồn tại.';
end;
$$;
create function public.set_user_status(p_user uuid,p_status text,p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.has_role('admin') then raise exception 'Chỉ quản trị hệ thống đã xác thực hai bước được thực hiện.'; end if;
  if p_user=auth.uid() then raise exception 'Không thể khóa chính tài khoản đang sử dụng.'; end if;
  if p_status not in ('active','locked') or length(trim(p_reason))<5 then raise exception 'Cần trạng thái hợp lệ và lý do ít nhất 5 ký tự.'; end if;
  if exists(select 1 from public.access_roles where user_id=p_user) then raise exception 'Tài khoản có quyền quản trị cần được xử lý bởi người vận hành hệ thống.'; end if;
  update public.profiles set status=p_status,updated_at=now() where id=p_user;
  if not found then raise exception 'Không tìm thấy người dùng.'; end if;
  perform private.log_action('user.status_changed',p_user,jsonb_build_object('status',p_status,'reason',p_reason));
end;
$$;
create function public.archive_club(p_club uuid,p_archive boolean,p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.has_role('admin') or length(trim(p_reason))<5 then raise exception 'Cần quyền admin, xác thực hai bước và lý do hợp lệ.'; end if;
  update public.clubs set status=case when p_archive then 'archived' else 'active' end,updated_at=now() where id=p_club;
  if not found then raise exception 'Không tìm thấy CLB.'; end if;
  perform private.log_action('club.archived_changed',p_club,jsonb_build_object('archived',p_archive,'reason',p_reason));
end;
$$;
create function public.save_round(p_title text,p_opens timestamptz,p_closes timestamptz,p_instructions text,p_open boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  if not private.has_role('admin') then raise exception 'Cần quyền admin và xác thực hai bước.'; end if;
  if length(trim(p_title)) not between 5 and 180 or length(p_instructions)>5000 or p_closes<=p_opens then raise exception 'Tên và thời hạn đợt đăng ký không hợp lệ.'; end if;
  insert into public.application_rounds(title,opens_at,closes_at,instructions,is_open) values(p_title,p_opens,p_closes,p_instructions,p_open) returning id into v_id;
  perform private.log_action('round.created',v_id); return v_id;
end;
$$;
create function public.toggle_round(p_round uuid,p_open boolean) returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.has_role('admin') then raise exception 'Cần quyền admin và xác thực hai bước.'; end if;
  update public.application_rounds set is_open=p_open where id=p_round;
  perform private.log_action('round.toggled',p_round,jsonb_build_object('open',p_open));
end;
$$;
create function public.attach_club_document(p_club uuid,p_path text,p_file_name text) returns void language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.clubs where id=p_club for update;
  perform private.ensure_club_editable(p_club);
  if split_part(p_path,'/',1)<>auth.uid()::text or split_part(p_path,'/',2)<>p_club::text
    or not exists(select 1 from storage.objects where bucket_id='club-evidence' and name=p_path) then raise exception 'Tệp minh chứng không hợp lệ.'; end if;
  insert into public.club_documents(club_id,path,file_name) values(p_club,p_path,left(p_file_name,200));
  perform private.log_action('document.attached',p_club);
end;
$$;
create function public.submit_club(p_club uuid,p_round uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_app public.applications; v_id uuid; v_version integer; v_status text; v_club public.clubs;
begin
  select * into v_club from public.clubs where id=p_club for update;
  if not private.active_user() or v_club.owner_id is distinct from auth.uid() or v_club.status<>'active' then raise exception 'Chỉ đại diện CLB đang hoạt động, đã xác minh email được nộp.'; end if;
  if v_club.membership='recognized' then raise exception 'CLB đã được công nhận.'; end if;
  if not exists(select 1 from public.application_rounds where id=p_round and is_open and opens_at<=now() and closes_at>now()) then raise exception 'Đợt đăng ký chưa mở hoặc đã hết hạn.'; end if;
  if not exists(select 1 from public.club_documents where club_id=p_club) then raise exception 'Vui lòng đính kèm ít nhất một tệp PDF minh chứng.'; end if;
  if exists(select 1 from public.applications where club_id=p_club and round_id<>p_round and status in ('submitted','under_review','resubmitted','recommended','need_revision')) then raise exception 'CLB đang có hồ sơ xử lý ở đợt khác.'; end if;
  select * into v_app from public.applications where club_id=p_club and round_id=p_round for update;
  if v_app.id is not null and v_app.status<>'need_revision' then raise exception 'CLB đã nộp hồ sơ trong đợt này.'; end if;
  if v_app.id is not null and (select deadline from public.application_events where application_id=v_app.id and status='need_revision' order by created_at desc limit 1)<=now() then raise exception 'Hạn bổ sung hồ sơ đã hết.'; end if;
  if v_app.id is null then
    insert into public.applications(club_id,round_id) values(p_club,p_round) returning id,version,status into v_id,v_version,v_status;
  else
    update public.applications set status='resubmitted',version=version+1,updated_at=now() where id=v_app.id returning id,version,status into v_id,v_version,v_status;
  end if;
  insert into public.application_versions(application_id,version,snapshot) values(v_id,v_version,
    jsonb_build_object('club',to_jsonb(v_club),'documents',(select jsonb_agg(to_jsonb(d)) from public.club_documents d where club_id=p_club)));
  insert into public.application_events(application_id,actor_id,status,note) values(v_id,auth.uid(),v_status,'Đại diện CLB nộp hồ sơ.');
  perform private.log_action('application.submitted',v_id,jsonb_build_object('version',v_version)); return v_id;
end;
$$;
create function public.review_application(p_application uuid,p_status text,p_note text,p_deadline timestamptz default null,p_document_no text default '',p_effective_at date default null) returns void language plpgsql security definer set search_path='' as $$
declare v_app public.applications; v_club public.clubs;
begin
  select * into v_app from public.applications where id=p_application for update;
  select * into v_club from public.clubs where id=v_app.club_id for update;
  if v_app.id is null then raise exception 'Không tìm thấy hồ sơ.'; end if;
  if v_club.status<>'active' or v_club.owner_id=auth.uid() then raise exception 'Không được tự xử lý hồ sơ của mình hoặc CLB đã lưu trữ.'; end if;
  if length(trim(p_note)) not between 5 and 3000 or length(p_document_no)>120 then raise exception 'Vui lòng ghi rõ nhận xét hoặc căn cứ (5 đến 3000 ký tự).'; end if;
  if p_status in ('approved','rejected') then
    if not private.has_role('approver') or v_app.status<>'recommended' then raise exception 'Cần thẩm quyền phê duyệt và hồ sơ đã được đề xuất.'; end if;
    if p_status='approved' and (length(trim(p_document_no))<3 or p_effective_at is null or p_effective_at>current_date) then raise exception 'Cần số quyết định và ngày hiệu lực không sau hôm nay.'; end if;
  elsif p_status in ('under_review','need_revision','recommended') then
    if not private.has_role('reviewer') then raise exception 'Cần quyền thẩm định được giao.'; end if;
    if p_status='under_review' and v_app.status not in ('submitted','resubmitted') then raise exception 'Hồ sơ chưa ở trạng thái tiếp nhận.'; end if;
    if p_status in ('need_revision','recommended') and v_app.status<>'under_review' then raise exception 'Chỉ xử lý sau khi bắt đầu thẩm định.'; end if;
    if p_status='need_revision' and (p_deadline is null or p_deadline<=now()) then raise exception 'Cần hạn bổ sung trong tương lai.'; end if;
  else raise exception 'Trạng thái xử lý không hợp lệ.'; end if;
  update public.applications set status=p_status,updated_at=now() where id=p_application;
  if p_status='approved' then
    update public.clubs set membership='recognized',updated_at=now() where id=v_app.club_id;
    insert into public.decisions(application_id,approver_id,document_no,effective_at,reason) values(p_application,auth.uid(),p_document_no,p_effective_at,p_note);
  end if;
  insert into public.application_events(application_id,actor_id,status,note,deadline) values(p_application,auth.uid(),p_status,p_note,p_deadline);
  perform private.log_action('application.reviewed',p_application,jsonb_build_object('status',p_status,'note',p_note));
end;
$$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('club-evidence','club-evidence',false,10485760,array['application/pdf']);
create policy evidence_upload on storage.objects for insert to authenticated with check(
  bucket_id='club-evidence' and private.active_user() and split_part(storage.objects.name,'/',1)=auth.uid()::text
  and exists(select 1 from public.clubs where id::text=split_part(storage.objects.name,'/',2) and owner_id=auth.uid() and status='active')
);
create policy evidence_read on storage.objects for select to authenticated using(
  bucket_id='club-evidence' and private.active_user() and (
    split_part(storage.objects.name,'/',1)=auth.uid()::text or (private.staff() and exists(select 1 from public.club_documents where path=storage.objects.name))
  )
);
-- Do not make evidence public or allow clients to delete files referenced by historical versions.
revoke all on all functions in schema private from public,anon;
grant execute on function private.active_user(),private.has_role(text),private.staff(),private.can_read_club(uuid),private.can_read_application(uuid) to authenticated;
revoke all on function public.save_profile(text,text,text,text), public.save_club(uuid,jsonb),public.set_user_status(uuid,text,text),public.archive_club(uuid,boolean,text),public.save_round(text,timestamptz,timestamptz,text,boolean),public.toggle_round(uuid,boolean),public.attach_club_document(uuid,text,text),public.submit_club(uuid,uuid),public.review_application(uuid,text,text,timestamptz,text,date) from public,anon;
grant execute on function public.save_profile(text,text,text,text), public.save_club(uuid,jsonb),public.set_user_status(uuid,text,text),public.archive_club(uuid,boolean,text),public.save_round(text,timestamptz,timestamptz,text,boolean),public.toggle_round(uuid,boolean),public.attach_club_document(uuid,text,text),public.submit_club(uuid,uuid),public.review_application(uuid,text,text,timestamptz,text,date) to authenticated;
commit;
