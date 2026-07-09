-- ============================================================================
-- Storage for club onboarding file uploads (automatic, per-club - no folders to make)
-- Repo path: supabase/club-onboarding-storage.sql
-- ----------------------------------------------------------------------------
-- The onboarding form uploads files straight to this bucket at path
-- <club_id>/<timestamp>_<name>. The per-club "folder" is just the club_id in the
-- path, created on the fly - nothing to set up per club.
--
-- Private bucket. Anonymous form users can INSERT (upload) only; platform/super
-- admins can SELECT (so the panel can generate signed download URLs). Pure ASCII.
-- Applied to prod (project uzibfawcwoapfbigpzum) as an authorized onboarding migration.
-- Safe to re-run (idempotent).
-- ============================================================================

-- 50 MB/file cap (bump if you need bigger; huge/bulk media still go to the Zoho drive).
insert into storage.buckets (id, name, public, file_size_limit)
values ('club-onboarding', 'club-onboarding', false, 52428800)
on conflict (id) do nothing;

-- UPLOAD: anyone (anon form user) can add files to this bucket only.
drop policy if exists club_onboarding_upload on storage.objects;
create policy club_onboarding_upload
  on storage.objects for insert
  to anon, authenticated
  with check ( bucket_id = 'club-onboarding' );

-- READ: platform / super admins can list + download (panel signed URLs).
drop policy if exists club_onboarding_read_files on storage.objects;
create policy club_onboarding_read_files
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'club-onboarding' and ( is_platform_admin() or is_super_admin() ) );

-- Note: anon INSERT means the bucket accepts uploads from the public form (by design).
-- Mitigations: bucket is private (not world-readable), 50 MB/file cap, low-value target.
-- If abuse ever appears, tighten by moving uploads behind a signed-upload token from
-- the onboarding-intake function.
