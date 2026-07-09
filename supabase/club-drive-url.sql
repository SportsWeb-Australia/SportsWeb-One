-- ============================================================================
-- Add per-club upload-drive link (Zoho WorkDrive "Collect Files" URL)
-- Repo path: supabase/club-drive-url.sql
-- ----------------------------------------------------------------------------
-- Lets the superadmin store each club's own Collect Files link so the onboarding
-- panel can bake it into the onboarding URL (?drive=). Keyed off the club row.
--
-- RUN THIS MANUALLY in the Supabase SQL Editor (project uzibfawcwoapfbigpzum).
-- Do not let tooling apply it. Safe to re-run (idempotent).
-- ============================================================================

alter table public.clubs
  add column if not exists onboarding_drive_url text;

-- No new RLS needed - it rides on the existing clubs table policies:
--   clubs_super_admin_all  (ALL,    is_super_admin())          -> superadmin read/write
--   clubs_admin_read       (SELECT, is_club_admin(id) OR is_super_admin())
-- The superadmin onboarding panel reads/writes clubs.onboarding_drive_url for
-- the club in view.
