-- club-publish-control.sql
-- Go-live loop for club sites: (1) true draft preview for admins, (2) a single
-- controlled write to flip website_status (Publish / Unpublish).
--
-- Run manually in the Supabase SQL Editor. Re-runnable (CREATE OR REPLACE).
-- Does NOT touch the clubs_public_read policy — anonymous visitors still see
-- published clubs only. Drafts stay private.
--
-- Context:
--   * enum website_status = draft | published | suspended
--   * clubs_public_read (SELECT): website_status = 'published'   (anon: published only)
--   * clubs_admin_read  (SELECT): is_club_admin(id) OR is_super_admin()
--   * is_platform_admin(): platform_user_roles role in (superadmin, sportsweb_manager)
--   * is_club_admin(uuid): club_users role in (club_admin, super_admin) for auth.uid()

-- ---------------------------------------------------------------------------
-- 1. Draft preview — broaden the two admin read RPCs so a club's OWN admin can
--    read their own club's full row regardless of status, not just platform
--    admins. Anonymous callers still fail both branches (auth.uid() is null →
--    is_club_admin / is_platform_admin both false → 'not authorised'), so drafts
--    remain private. The clubs SELECT policies are untouched.
-- ---------------------------------------------------------------------------

create or replace function public.admin_get_club_by_slug(p_slug text)
returns setof clubs
language plpgsql
stable security definer
set search_path to 'public'
as $function$
begin
  if not (
    public.is_platform_admin()
    or public.is_club_admin((select id from public.clubs where slug = p_slug))
  ) then
    raise exception 'not authorised';
  end if;
  return query select * from public.clubs c where c.slug = p_slug;
end
$function$;

create or replace function public.admin_get_club(p_club uuid)
returns setof clubs
language plpgsql
stable security definer
set search_path to 'public'
as $function$
begin
  if not (public.is_platform_admin() or public.is_club_admin(p_club)) then
    raise exception 'not authorised';
  end if;
  return query select * from public.clubs c where c.id = p_club;
end
$function$;

-- ---------------------------------------------------------------------------
-- 2. Publish control — the single controlled write to website_status.
--    * Only the club's own admin or a platform admin may call it.
--    * Club admins may toggle draft <-> published only.
--    * 'suspended' is a platform moderation state: setting it, or moving a club
--      out of it, requires a platform admin.
--    No other code path writes website_status (no auto-publish).
-- ---------------------------------------------------------------------------

create or replace function public.set_website_status(p_club uuid, p_status website_status)
returns website_status
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_current website_status;
begin
  if not (public.is_platform_admin() or public.is_club_admin(p_club)) then
    raise exception 'not authorised';
  end if;

  select website_status into v_current from public.clubs where id = p_club;
  if not found then
    raise exception 'club not found';
  end if;

  -- Club admins are limited to draft/published and cannot touch a suspended club.
  if not public.is_platform_admin()
     and (p_status = 'suspended' or v_current = 'suspended') then
    raise exception 'not authorised';
  end if;

  update public.clubs set website_status = p_status where id = p_club;
  return p_status;
end
$function$;

grant execute on function public.set_website_status(uuid, website_status) to authenticated;

-- ---------------------------------------------------------------------------
-- Sanity checks (optional — run to verify after applying):
--   select proname, prosecdef,
--          array(select r.rolname from pg_roles r
--                where has_function_privilege(r.rolname, p.oid, 'execute')
--                  and r.rolname in ('anon','authenticated','service_role')) as exec_roles
--   from pg_proc p
--   where proname in ('admin_get_club','admin_get_club_by_slug','set_website_status');
--   -- Expect set_website_status executable by authenticated (not anon).
-- ---------------------------------------------------------------------------
