-- ============================================================================
-- Fix: let SuperClubs operators (club super_admins) read club_onboarding
-- Repo path: supabase/club-onboarding-read.sql
-- ----------------------------------------------------------------------------
-- The onboarding panel lives in the SuperClubs operator screen, which is gated
-- by is_super_admin() (club_users role super_admin of any club). The original
-- read policy only allowed is_platform_admin() OR is_club_admin(club_id), so an
-- operator who is a club super_admin (but not a platform admin) could not see
-- submissions for clubs they don't directly admin. This extends the READ policy
-- to include is_super_admin(), matching the operator role that runs SuperClubs.
--
-- SAVE is unaffected: clubs.onboarding_drive_url writes already work via the
-- existing clubs is_super_admin() all-access policy, so no RPC is needed.
--
-- Pure ASCII. Keyed off club_id. Run in the Supabase SQL Editor (project uzibfawcwoapfbigpzum).
-- ============================================================================

drop policy if exists club_onboarding_read on public.club_onboarding;

create policy club_onboarding_read
  on public.club_onboarding
  for select
  using ( is_platform_admin() or is_super_admin() or is_club_admin(club_id) );
