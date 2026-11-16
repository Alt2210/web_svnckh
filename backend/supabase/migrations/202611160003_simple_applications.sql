-- Simplified application product: one intake and admin reviews in one step.
-- Apply once after migrations 001 and 002; preserve old applications and RPCs.
begin;
insert into public.application_rounds(id,title,opens_at,closes_at,instructions,is_open)
values('ca000000-2026-4000-8000-000000000001','Tiếp nhận hồ sơ CLB',now()-interval '1 day','2099-12-31T23:59:59Z','Thông tin CLB và ít nhất một minh chứng PDF.',true);

create function public.submit_club_basic(p_club uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare a public.applications; c public.clubs; r uuid;
begin
  select * into c from public.clubs where id=p_club for update;
  if not private.active_user() or c.owner_id is distinct from auth.uid() or c.status<>'active' then raise exception 'Bạn không có quyền nộp hồ sơ này.'; end if;
  select * into a from public.applications where club_id=p_club order by submitted_at desc limit 1 for update;
  if a.id is not null then
    if a.status<>'need_revision' then raise exception 'Hồ sơ đã được gửi hoặc đã có kết quả. Vui lòng xem trạng thái hiện tại.'; end if;
    r:=a.round_id;
  else r:='ca000000-2026-4000-8000-000000000001'; end if;
  return public.submit_club(p_club,r);
end;
$$;

create function public.admin_review_club_application(p_application uuid,p_status text,p_note text,p_deadline timestamptz default null,p_document_no text default '',p_effective_at date default null)
returns void language plpgsql security definer set search_path='' as $$
declare a public.applications; c public.clubs;
begin
  if not private.has_role('admin') then raise exception 'Cần quyền admin và xác thực hai bước.'; end if;
  select * into a from public.applications where id=p_application for update;
  if a.id is null then raise exception 'Không tìm thấy hồ sơ.'; end if;
  select * into c from public.clubs where id=a.club_id for update;
  if c.status<>'active' or c.owner_id=auth.uid() then raise exception 'Không được tự duyệt hồ sơ của mình hoặc CLB đã lưu trữ.'; end if;
  if a.status not in ('submitted','resubmitted','under_review','recommended') then raise exception 'Hồ sơ đã có kết quả hoặc đang chờ người nộp bổ sung.'; end if;
  if p_status is null or p_status not in ('approved','rejected','need_revision') then raise exception 'Kết quả không hợp lệ.'; end if;
  if length(trim(coalesce(p_note,''))) not between 5 and 3000 or length(coalesce(p_document_no,''))>120 then raise exception 'Nhận xét cần từ 5 đến 3000 ký tự.'; end if;
  if p_status='need_revision' and (p_deadline is null or p_deadline<=now() or p_deadline>=(select closes_at from public.application_rounds where id=a.round_id)) then raise exception 'Hạn bổ sung phải trong tương lai và trong thời gian tiếp nhận.'; end if;
  if p_status='approved' and (length(trim(coalesce(p_document_no,'')))<3 or p_effective_at is null or p_effective_at>current_date) then raise exception 'Cần số quyết định và ngày hiệu lực không sau hôm nay.'; end if;
  update public.applications set status=p_status,updated_at=now() where id=a.id;
  if p_status='approved' then
    update public.clubs set membership='recognized',updated_at=now() where id=c.id;
    insert into public.decisions(application_id,approver_id,document_no,effective_at,reason) values(a.id,auth.uid(),trim(p_document_no),p_effective_at,p_note);
  end if;
  insert into public.application_events(application_id,actor_id,status,note,deadline) values(a.id,auth.uid(),p_status,p_note,case when p_status='need_revision' then p_deadline else null end);
  perform private.log_action('application.admin_reviewed',a.id,jsonb_build_object('before',a.status,'after',p_status,'note',p_note));
end;
$$;
revoke all on function public.submit_club_basic(uuid),public.admin_review_club_application(uuid,text,text,timestamptz,text,date) from public,anon;
grant execute on function public.submit_club_basic(uuid),public.admin_review_club_application(uuid,text,text,timestamptz,text,date) to authenticated;
commit;
