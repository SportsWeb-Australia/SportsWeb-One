-- SportsWeb One -- club-media Storage policies: add the platform-admin arm.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Why: the club-media bucket write policies (insert/update/delete) were member-only
-- (first path segment must be a club in my_club_ids()), with no is_platform_admin()
-- arm -- so a platform admin uploading a logo/image for a club they are not a member
-- of failed with "new row violates row-level security policy" at the Storage layer.
-- This mirrors the club_content fix (club-content-admin-write.sql) and the pattern
-- already used by the launch-evidence bucket: platform admins OR club members may
-- write into a club's folder. Public read is unchanged.
--
-- Path convention: {club_id}/{folder}/{file}; (storage.foldername(name))[1] is the
-- first segment. Prerequisite helpers already in the database: public.is_platform_admin(),
-- public.my_club_ids(). Supersedes the member-only write policies in supabase/storage.sql.

drop policy if exists "club-media member insert" on storage.objects;
create policy "club-media member insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'club-media'
    and (
      public.is_platform_admin()
      or exists (
        select 1 from public.my_club_ids() cid
        where cid::text = (storage.foldername(name))[1]
      )
    )
  );

drop policy if exists "club-media member update" on storage.objects;
create policy "club-media member update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'club-media'
    and (
      public.is_platform_admin()
      or exists (
        select 1 from public.my_club_ids() cid
        where cid::text = (storage.foldername(name))[1]
      )
    )
  );

drop policy if exists "club-media member delete" on storage.objects;
create policy "club-media member delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'club-media'
    and (
      public.is_platform_admin()
      or exists (
        select 1 from public.my_club_ids() cid
        where cid::text = (storage.foldername(name))[1]
      )
    )
  );
