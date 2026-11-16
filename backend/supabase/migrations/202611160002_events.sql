-- Apply once AFTER 202611160001_initial.sql. Adds EVENT-01/02/03 without resetting existing data.
begin;
create table public.events (
  id uuid primary key default gen_random_uuid(), creator_id uuid not null references public.profiles(id),
  organizer_club_id uuid references public.clubs(id), title text not null, category text not null,
  description text not null, location text not null default '', mode text not null check(mode in ('onsite','online','hybrid')),
  visibility text not null default 'public' check(visibility in ('public','authenticated')),
  status text not null default 'draft' check(status in ('draft','published','cancelled','completed')),
  starts_at timestamptz not null, ends_at timestamptz not null,
  registration_opens_at timestamptz not null, registration_closes_at timestamptz not null,
  capacity integer not null check(capacity between 1 and 100000), registration_enabled boolean not null default true,
  registered_count integer not null default 0, waitlist_count integer not null default 0,
  cancellation_reason text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(ends_at>starts_at and registration_closes_at<=starts_at and registration_closes_at>registration_opens_at)
);
create index events_schedule_idx on public.events(status,starts_at);
create index events_club_idx on public.events(organizer_club_id);
create table public.event_access (
  event_id uuid primary key references public.events(id), meeting_url text not null default ''
);
create table public.event_registrations (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id),
  user_id uuid not null references public.profiles(id), status text not null check(status in ('registered','waitlisted','cancelled','attended')),
  queue_at timestamptz not null default now(), attended_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(event_id,user_id)
);
create index registrations_event_idx on public.event_registrations(event_id,status,queue_at);
create index registrations_user_idx on public.event_registrations(user_id);
create table public.event_feedback (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id), user_id uuid not null references public.profiles(id),
  rating integer not null check(rating between 1 and 5), comment text not null default '' check(length(comment)<=2000),
  updated_at timestamptz not null default now(), unique(event_id,user_id)
);

create function private.can_manage_event(p_event uuid) returns boolean language sql stable security definer set search_path='' as $$
  select private.active_user() and exists(select 1 from public.events e where e.id=p_event and (
    private.has_role('admin') or (e.organizer_club_id is not null and exists(select 1 from public.clubs c where c.id=e.organizer_club_id and c.owner_id=auth.uid() and c.status='active' and c.membership='recognized'))
  ));
$$;
create function private.can_read_event(p_event uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.events e where e.id=p_event and (
    (e.status in ('published','cancelled','completed') and (e.visibility='public' or private.active_user())) or private.can_manage_event(e.id)
  ));
$$;
create function private.sync_event_counts(p_event uuid) returns void language sql security definer set search_path='' as $$
  update public.events set registered_count=(select count(*) from public.event_registrations where event_id=p_event and status in ('registered','attended')),
    waitlist_count=(select count(*) from public.event_registrations where event_id=p_event and status='waitlisted'),updated_at=now() where id=p_event;
$$;
create function private.promote_event_waitlist(p_event uuid) returns void language plpgsql security definer set search_path='' as $$
declare e public.events; v_next uuid;
begin
  select * into e from public.events where id=p_event for update;
  if e.status<>'published' or e.starts_at<=now() then return; end if;
  loop
    exit when (select count(*) from public.event_registrations where event_id=p_event and status in ('registered','attended'))>=e.capacity;
    select r.id into v_next from public.event_registrations r join public.profiles p on p.id=r.user_id join auth.users u on u.id=p.id
      where r.event_id=p_event and r.status='waitlisted' and p.status='active' and u.email_confirmed_at is not null order by r.queue_at,r.id limit 1 for update of r;
    exit when v_next is null;
    update public.event_registrations set status='registered',updated_at=now() where id=v_next;
    perform private.log_action('event.waitlist_promoted',v_next,jsonb_build_object('event_id',p_event,'automatic',true));
  end loop;
end;
$$;

alter table public.events enable row level security;
alter table public.event_access enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_feedback enable row level security;
create policy events_read on public.events for select to anon,authenticated using(private.can_read_event(id));
create policy event_access_read on public.event_access for select to authenticated using(private.active_user() and (
  private.can_manage_event(event_id) or exists(select 1 from public.event_registrations r join public.events e on e.id=r.event_id
    where r.event_id=event_access.event_id and r.user_id=auth.uid() and r.status in ('registered','attended') and e.status in ('published','completed'))
));
create policy registrations_read on public.event_registrations for select to authenticated using(private.active_user() and (user_id=auth.uid() or private.can_manage_event(event_id)));
create policy feedback_read on public.event_feedback for select to authenticated using(private.active_user() and (user_id=auth.uid() or private.can_manage_event(event_id)));
revoke all on public.events,public.event_access,public.event_registrations,public.event_feedback from anon,authenticated;
grant select on public.events to anon,authenticated;
grant select on public.event_access,public.event_registrations,public.event_feedback to authenticated;

create function public.save_event(p_id uuid,p_payload jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare e public.events; v_id uuid; v_club uuid; v_start timestamptz; v_end timestamptz; v_open timestamptz; v_close timestamptz; v_capacity integer; v_url text;
begin
  if not private.active_user() then raise exception 'Vui lòng đăng nhập bằng tài khoản đã xác minh.'; end if;
  v_club:=nullif(p_payload->>'organizer_club_id','')::uuid;
  v_start:=(p_payload->>'starts_at')::timestamptz; v_end:=(p_payload->>'ends_at')::timestamptz;
  v_open:=(p_payload->>'registration_opens_at')::timestamptz; v_close:=(p_payload->>'registration_closes_at')::timestamptz;
  v_capacity:=(p_payload->>'capacity')::integer; v_url:=coalesce(trim(p_payload->>'meeting_url'),'');
  if coalesce(length(trim(p_payload->>'title')),0) not between 5 and 180 or coalesce(length(trim(p_payload->>'description')),0) not between 20 and 10000
    or coalesce(length(trim(p_payload->>'category')),0) not between 2 and 80
    or coalesce(p_payload->>'mode','') not in ('onsite','online','hybrid') or coalesce(p_payload->>'visibility','') not in ('public','authenticated')
    or v_start is null or v_end is null or v_open is null or v_close is null or v_end<=v_start or v_close>v_start or v_close<=v_open
    or v_capacity is null or v_capacity not between 1 and 100000 or length(coalesce(p_payload->>'location',''))>500
    or (v_url<>'' and (v_url !~ '^https://[^[:space:]]+$' or length(v_url)>2000))
    or (p_payload->>'mode' in ('online','hybrid') and v_url='')
    or (p_payload->>'mode' in ('onsite','hybrid') and length(trim(coalesce(p_payload->>'location','')))<3)
    then raise exception 'Vui lòng kiểm tra nội dung, thời gian, địa điểm/link HTTPS và số chỗ của hoạt động.'; end if;
  if p_id is null then
    if v_club is null then
      if not private.has_role('admin') then raise exception 'Chỉ admin đã xác thực hai bước được tạo hoạt động cấp Mạng lưới.'; end if;
    elsif not exists(select 1 from public.clubs where id=v_club and status='active' and membership='recognized' and owner_id=auth.uid()) then
      raise exception 'Bạn cần là đại diện của CLB đã được công nhận để tổ chức hoạt động cấp CLB.';
    end if;
    insert into public.events(creator_id,organizer_club_id,title,category,description,location,mode,visibility,starts_at,ends_at,registration_opens_at,registration_closes_at,capacity)
      values(auth.uid(),v_club,trim(p_payload->>'title'),trim(p_payload->>'category'),trim(p_payload->>'description'),trim(coalesce(p_payload->>'location','')),p_payload->>'mode',p_payload->>'visibility',v_start,v_end,v_open,v_close,v_capacity) returning id into v_id;
    insert into public.event_access(event_id,meeting_url) values(v_id,v_url);
    perform private.log_action('event.created',v_id);
  else
    select * into e from public.events where id=p_id for update;
    if not private.can_manage_event(p_id) then raise exception 'Bạn không có quyền quản lý hoạt động này.'; end if;
    if e.status in ('cancelled','completed') then raise exception 'Hoạt động đã kết thúc hoặc bị hủy; không thể chỉnh sửa.'; end if;
    if v_club is distinct from e.organizer_club_id then raise exception 'Không được thay đổi đơn vị tổ chức của hoạt động đã tạo.'; end if;
    if v_capacity<(select count(*) from public.event_registrations where event_id=p_id and status in ('registered','attended')) then raise exception 'Số chỗ không được ít hơn số người đã xác nhận.'; end if;
    if exists(select 1 from public.event_registrations where event_id=p_id and status in ('registered','attended','waitlisted')) and
      (v_start is distinct from e.starts_at or v_end is distinct from e.ends_at or v_open is distinct from e.registration_opens_at or v_close is distinct from e.registration_closes_at or (p_payload->>'visibility') is distinct from e.visibility) then
      raise exception 'Đã có người đăng ký; không thay đổi lịch hoặc phạm vi hiển thị. Hãy hủy và tạo hoạt động mới nếu cần.';
    end if;
    update public.events set title=trim(p_payload->>'title'),category=trim(p_payload->>'category'),description=trim(p_payload->>'description'),location=trim(coalesce(p_payload->>'location','')),mode=p_payload->>'mode',visibility=p_payload->>'visibility',starts_at=v_start,ends_at=v_end,registration_opens_at=v_open,registration_closes_at=v_close,capacity=v_capacity,updated_at=now() where id=p_id;
    update public.event_access set meeting_url=v_url where event_id=p_id;
    v_id:=p_id;
    perform private.promote_event_waitlist(p_id);
    perform private.sync_event_counts(p_id);
    perform private.log_action('event.updated',p_id);
  end if;
  return v_id;
end;
$$;
create function public.set_event_status(p_event uuid,p_status text,p_reason text default '') returns void language plpgsql security definer set search_path='' as $$
declare e public.events;
begin
  select * into e from public.events where id=p_event for update;
  if not private.can_manage_event(p_event) then raise exception 'Bạn không có quyền quản lý hoạt động này.'; end if;
  if p_status is null or p_status not in ('draft','published','cancelled','completed') or e.status in ('cancelled','completed') then raise exception 'Không thể chuyển trạng thái này.'; end if;
  if p_status='published' and e.registration_closes_at<=now() then raise exception 'Hoạt động đã hết thời gian tiếp nhận.'; end if;
  if p_status='draft' and exists(select 1 from public.event_registrations where event_id=p_event) then raise exception 'Không thể ẩn hoạt động đã có người đăng ký. Bạn có thể hủy kèm lý do.'; end if;
  if p_status='completed' and e.ends_at>now() then raise exception 'Chỉ tổng kết sau thời gian kết thúc hoạt động.'; end if;
  if p_status='cancelled' and length(trim(coalesce(p_reason,''))) not between 5 and 1000 then raise exception 'Cần lý do hủy từ 5 đến 1000 ký tự.'; end if;
  update public.events set status=p_status,cancellation_reason=case when p_status='cancelled' then p_reason else '' end,updated_at=now() where id=p_event;
  if p_status='cancelled' then update public.event_registrations set status='cancelled',updated_at=now() where event_id=p_event and status in ('registered','waitlisted'); end if;
  perform private.sync_event_counts(p_event);
  perform private.log_action('event.status_changed',p_event,jsonb_build_object('before',e.status,'after',p_status,'reason',p_reason));
end;
$$;
create function public.toggle_event_registration(p_event uuid,p_open boolean) returns void language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.events where id=p_event for update;
  if not private.can_manage_event(p_event) then raise exception 'Bạn không có quyền quản lý hoạt động này.'; end if;
  if p_open is null then raise exception 'Trạng thái tiếp nhận không hợp lệ.'; end if;
  update public.events set registration_enabled=p_open,updated_at=now() where id=p_event;
  perform private.log_action('event.registration_toggled',p_event,jsonb_build_object('open',p_open));
end;
$$;
create function public.register_event(p_event uuid) returns text language plpgsql security definer set search_path='' as $$
declare e public.events; r public.event_registrations; v_status text;
begin
  select * into e from public.events where id=p_event for update;
  if not private.active_user() then raise exception 'Cần đăng nhập và xác minh email để đăng ký.'; end if;
  if e.id is null or e.status<>'published' or not e.registration_enabled or e.registration_opens_at>now() or e.registration_closes_at<=now() or e.starts_at<=now() then raise exception 'Hoạt động chưa mở hoặc đã đóng đăng ký.'; end if;
  select * into r from public.event_registrations where event_id=p_event and user_id=auth.uid();
  if r.status in ('registered','waitlisted','attended') then return r.status; end if;
  perform private.promote_event_waitlist(p_event);
  v_status:=case when (select count(*) from public.event_registrations where event_id=p_event and status in ('registered','attended'))<e.capacity then 'registered' else 'waitlisted' end;
  insert into public.event_registrations(event_id,user_id,status) values(p_event,auth.uid(),v_status)
    on conflict(event_id,user_id) do update set status=excluded.status,queue_at=now(),attended_at=null,updated_at=now();
  perform private.sync_event_counts(p_event);
  perform private.log_action('event.registered',p_event,jsonb_build_object('status',v_status)); return v_status;
end;
$$;
create function public.cancel_event_registration(p_event uuid) returns void language plpgsql security definer set search_path='' as $$
declare e public.events;
begin
  select * into e from public.events where id=p_event for update;
  if not private.active_user() or e.id is null then raise exception 'Tài khoản không có quyền thực hiện.'; end if;
  if e.starts_at<=now() then raise exception 'Không thể hủy sau khi hoạt động đã bắt đầu.'; end if;
  update public.event_registrations set status='cancelled',updated_at=now() where event_id=p_event and user_id=auth.uid() and status in ('registered','waitlisted');
  if not found then raise exception 'Không có lượt đăng ký hợp lệ để hủy.'; end if;
  perform private.promote_event_waitlist(p_event); perform private.sync_event_counts(p_event);
  perform private.log_action('event.registration_cancelled',p_event);
end;
$$;
create function public.event_attendees(p_event uuid) returns table(registration_id uuid,user_id uuid,full_name text,email text,status text,queue_at timestamptz,attended_at timestamptz,rating integer,feedback text) language plpgsql security definer set search_path='' as $$
begin
  if not private.can_manage_event(p_event) then raise exception 'Chỉ ban tổ chức được xem danh sách người tham gia.'; end if;
  return query select r.id,r.user_id,p.full_name,p.email,r.status,r.queue_at,r.attended_at,f.rating,f.comment from public.event_registrations r join public.profiles p on p.id=r.user_id
    left join public.event_feedback f on f.event_id=r.event_id and f.user_id=r.user_id where r.event_id=p_event order by r.queue_at,r.id;
end;
$$;
create function public.mark_event_attendance(p_registration uuid,p_present boolean) returns void language plpgsql security definer set search_path='' as $$
declare r public.event_registrations; e public.events;
begin
  select * into r from public.event_registrations where id=p_registration;
  select * into e from public.events where id=r.event_id for update;
  if not private.can_manage_event(e.id) then raise exception 'Chỉ ban tổ chức được điểm danh.'; end if;
  select * into r from public.event_registrations where id=p_registration for update;
  if e.status not in ('published','completed') or r.status not in ('registered','attended') or now()<e.starts_at-interval '30 minutes' or p_present is null then raise exception 'Chỉ điểm danh người đã xác nhận, từ 30 phút trước giờ bắt đầu.'; end if;
  update public.event_registrations set status=case when p_present then 'attended' else 'registered' end,attended_at=case when p_present then now() else null end,updated_at=now() where id=p_registration;
  perform private.sync_event_counts(e.id); perform private.log_action('event.attendance_changed',p_registration,jsonb_build_object('present',p_present));
end;
$$;
create function public.save_event_feedback(p_event uuid,p_rating integer,p_comment text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.active_user() or not exists(select 1 from public.events e join public.event_registrations r on r.event_id=e.id where e.id=p_event and e.ends_at<=now() and e.status in ('published','completed') and r.user_id=auth.uid() and r.status in ('registered','attended')) then raise exception 'Chỉ người có đăng ký xác nhận được gửi phản hồi sau hoạt động.'; end if;
  if p_rating is null or p_rating not between 1 and 5 or length(coalesce(p_comment,''))>2000 then raise exception 'Đánh giá phải từ 1 đến 5, nội dung tối đa 2000 ký tự.'; end if;
  insert into public.event_feedback(event_id,user_id,rating,comment) values(p_event,auth.uid(),p_rating,coalesce(p_comment,'')) on conflict(event_id,user_id) do update set rating=excluded.rating,comment=excluded.comment,updated_at=now();
end;
$$;
revoke all on function private.can_manage_event(uuid),private.can_read_event(uuid),private.sync_event_counts(uuid),private.promote_event_waitlist(uuid) from public,anon,authenticated;
grant usage on schema private to anon;
grant execute on function private.can_read_event(uuid) to anon,authenticated;
grant execute on function private.can_manage_event(uuid) to authenticated;
revoke all on function public.save_event(uuid,jsonb),public.set_event_status(uuid,text,text),public.toggle_event_registration(uuid,boolean),public.register_event(uuid),public.cancel_event_registration(uuid),public.event_attendees(uuid),public.mark_event_attendance(uuid,boolean),public.save_event_feedback(uuid,integer,text) from public,anon;
grant execute on function public.save_event(uuid,jsonb),public.set_event_status(uuid,text,text),public.toggle_event_registration(uuid,boolean),public.register_event(uuid),public.cancel_event_registration(uuid),public.event_attendees(uuid),public.mark_event_attendance(uuid,boolean),public.save_event_feedback(uuid,integer,text) to authenticated;
commit;
