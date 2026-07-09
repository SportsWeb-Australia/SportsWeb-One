-- ============================================================================
-- club_onboarding read policy - widen to platform + super admins
-- Repo path: supabase/club-onboarding-read.sql
-- ----------------------------------------------------------------------------
-- The superadmin "Onboard this club" panel reads club_onboarding for any club.
-- The operator role in this app is a club_users super_admin (is_super_admin()),
-- which already gates SuperClubs and the clubs table - but the original read
-- policy only allowed is_platform_admin() OR is_club_admin(club_id), so a
-- super_admin could not read submissions for clubs they do not personally admin.
-- This adds is_super_admin() so any SuperClubs operator can read every club's
-- submission. Save (clubs.onboarding_drive_url) already works via the existing
-- clubs_super_admin_all (is_super_admin()) all-access policy - no RPC needed.
--
-- Keyed off club_id only. Applied to prod (project uzibfawcwoapfbigpzum) as an
-- authorized onboarding migration. Safe to re-run (idempotent).
-- ============================================================================

drop policy if exists club_onboarding_read on public.club_onboarding;
create policy club_onboarding_read
  on public.club_onboarding
  for select
  using ( is_platform_admin() or is_super_admin() or is_club_admin(club_id) );
