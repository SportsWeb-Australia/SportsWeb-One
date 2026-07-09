-- ============================================================
-- is_site_admin(p_club_id) -- gate the public-site SitePulse widget to admins.
-- Repo path: supabase/sitepulse-site-admin.sql
-- ------------------------------------------------------------
-- The public club site calls this from the browser (with the signed-in user's
-- token) to decide whether to inject the SitePulse feedback widget. Returns true
-- only for an authenticated admin: a platform admin, any club super_admin, or an
-- admin of THIS club. Anonymous callers (no auth.uid()) get false.
--
-- SECURITY DEFINER so it can read the role tables; it still evaluates against the
-- caller's auth.uid() (the underlying helpers do). Pure ASCII. Safe to re-run.
-- Applied to prod (project uzibfawcwoapfbigpzum).
-- ============================================================

create or replace function public.is_site_admin(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_platform_admin() or is_super_admin() or is_club_admin(p_club_id);
$$;

grant execute on function public.is_site_admin(uuid) to anon, authenticated;
