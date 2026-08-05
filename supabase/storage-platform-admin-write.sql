-- SportsWeb One -- club-media storage write: add the platform-admin arm.
-- Run once in the Supabase SQL editor. Safe to re-run. Pure ASCII.
--
-- Why: the club-media bucket's insert/update/delete policies only allowed club
-- members (my_club_ids()), with no is_platform_admin() arm. So a platform admin
-- (superadmin / sportsweb_manager) acting on a club they are not a member of
-- could edit page TEXT (club_content already has the platform-admin arm -- see
-- supabase/club-content-admin-write.sql) but could NOT swap a page IMAGE
-- ("new row violates row-level security policy" from storage.objects). This
-- brings club-media into line: platform admins OR club members may write inside
-- a club's folder. Public read is unchanged.
--
-- Prerequisite helpers already in the database: public.is_platform_admin(),
-- public.my_club_ids(). Path convention unchanged: {club_id}/{folder}/{file};
-- the first path segment must be the club being written to.

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
