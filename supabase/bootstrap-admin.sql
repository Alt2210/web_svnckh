-- Run manually in Supabase SQL Editor after this person has registered and confirmed email.
-- Replace the placeholder. There is no default admin account or password.
do $$
declare target uuid;
begin
  select id into target from auth.users
  where lower(email)=lower('admin@svnckh.com') and email_confirmed_at is not null;
  if target is null then raise exception 'Không tìm thấy tài khoản email đã xác minh. Hãy sửa email trong script.'; end if;
  insert into public.access_roles(user_id,role) values(target,'admin') on conflict do nothing;
  insert into public.audit_logs(actor_id,action,resource_id,detail)
    values(null,'role.bootstrap_admin',target,jsonb_build_object('source','SQL Editor'));
end;
$$;

-- Review and approval are separate delegated authorities per SRS.
-- Only grant them after business authorization. Replace UUID and uncomment as appropriate:
-- insert into public.access_roles(user_id,role) values ('UUID_CAN_BO','reviewer');
-- insert into public.access_roles(user_id,role) values ('UUID_NGUOI_PHE_DUYET','approver');
-- All these roles must enroll and verify TOTP MFA before accessing staff data.
