-- Temporary admin policy requested for the demo.
-- Apply once after 003. Does not remove enrolled factors or change passwords.
begin;
create or replace function private.has_role(p_role text) returns boolean
language sql stable security definer set search_path='' as $$
  select private.active_user()
    and (p_role='admin' or coalesce(auth.jwt()->>'aal','aal1')='aal2')
    and exists(select 1 from public.access_roles where user_id=(select auth.uid()) and role=p_role);
$$;
-- To require MFA for admin again, use a new migration restoring the original
-- condition: private.active_user() AND JWT aal='aal2' AND assigned role exists.
commit;
