-- ============================================================
-- Close the draft-content leak: gate club_content public read to PUBLISHED clubs,
-- and serve draft-preview content through a token-gated SECURITY DEFINER RPC.
-- Repo path: supabase/club-content-preview-leak.sql
-- ------------------------------------------------------------
-- Problem: club_content SELECT was `public_read USING (true)`, so a DRAFT club's
-- content was REST-readable by anyone who knew the club_id -- only the clubs row
-- was publish-gated. This tightens the public read to published clubs only, and
-- adds get_club_content_by_preview_token so the no-login draft-preview link
-- (?preview=<token>, PR #9) keeps rendering content. Mirrors get_club_by_preview_token.
--
-- Admin content editing is UNAFFECTED: club_content_member_write is an ALL policy
-- (is_platform_admin() OR club_id IN my_club_ids()), which already covers SELECT
-- for admins of the club. Only the anonymous/public read path changes.
--
-- NOT YET APPLIED. Author + show only. Run in the Supabase SQL Editor once Carson
-- authorizes THIS file. Pure ASCII, re-runnable. Keys off club_id.
-- ============================================================

-- 1. Tighten the public read: published clubs only (was USING (true)).
--    The subquery is itself subject to clubs RLS (clubs_public_read = published),
--    and the explicit filter makes intent clear regardless of caller role.
drop policy if exists club_content_public_read on public.club_content;
create policy club_content_public_read on public.club_content
  for select
  using (
    club_id in (select id from public.clubs where website_status = 'published')
  );

-- (club_content_member_write is left exactly as-is: ALL, USING/WITH CHECK
--  is_platform_admin() OR club_id IN (SELECT my_club_ids()). Do not touch.)

-- 2. Token-gated content read for the draft preview (anon, no login).
--    SECURITY DEFINER so it bypasses the tightened RLS for a matching, unexpired
--    token only. Returns just this club's content rows -- nothing else.
create or replace function public.get_club_content_by_preview_token(p_token uuid)
returns table (content_key text, value text)
language sql
stable
security definer
set search_path = public
as $$
  select cc.content_key, cc.value
  from public.club_content cc
  join public.clubs c on c.id = cc.club_id
  where p_token is not null
    and c.preview_token = p_token
    and (c.preview_token_expires_at is null or now() < c.preview_token_expires_at);
$$;

grant execute on function public.get_club_content_by_preview_token(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- After applying, verify (matches the frontend's preview path):
--   -- valid token -> that club's content rows:
--   select * from get_club_content_by_preview_token('<a real preview_token>');
--   -- wrong token -> 0 rows:
--   select * from get_club_content_by_preview_token(gen_random_uuid());
--   -- anon direct read of a DRAFT club's content is now blocked (0 rows) while a
--   -- PUBLISHED club's content still reads. Admin editing unaffected (member_write).
-- ============================================================
