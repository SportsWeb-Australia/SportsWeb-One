-- ============================================================
-- Publish-gate every public read on club-scoped tables (close the draft leaks).
-- Repo path: supabase/publish-gate-club-tables.sql
-- ------------------------------------------------------------
-- Applies the pattern already proven on club_content to every club-scoped table:
--   public read is allowed ONLY when the owning club is published, i.e.
--     club_id IN (SELECT id FROM public.clubs WHERE website_status = 'published')
-- (Draft AND suspended are excluded -- only 'published' passes.)
--
-- Per table:
--   * news/events/sponsors/teams: KEEP the existing row-level status='published'
--     gate AND add the club-publish gate (both must hold).
--   * club_modules/ladder/matches: replace USING(true) with the club-publish gate.
--   * club_pages/club_sections: replace USING(true) with the club-publish gate --
--     locks them BEFORE F2 writes any draft page/section content.
--   * club_content: re-asserted (already gated) so this file is the single source
--     of truth for the end state. No-op on the current DB.
-- Only the *_public_read policies are touched; every member/admin policy is left
-- exactly as-is. people is intentionally untouched (member-only, holds PII).
--
-- Admin editing on DRAFT clubs is NOT affected: unlike club_content (which relied
-- on member_write ALL), news/events/sponsors/teams already carry a full member/admin
-- read set that is independent of *_public_read and unchanged here --
--   <t>_member_read  SELECT  club_id IN my_club_ids()
--   <t>_admin_all    ALL     is_club_admin(club_id) OR is_super_admin()
--   <t>_member_write ALL     club_id IN my_club_ids()
-- RLS policies are OR'd, so a draft club's admin keeps read+write via these even
-- with public_read gated to published. Verified by role-sim (draft admin read+write
-- ALLOWED on all four) before this file was written -- no new policy is required.
--
-- Does NOT change any table grant. Note (separate decision): club_modules, ladder
-- and matches have NO anon grant, so anonymous visitors cannot read them even when
-- the club is published -- public sites do not show live fixtures/ladder/modules to
-- logged-out visitors. If that is wanted, grant anon SELECT on ladder+matches (as
-- was done for club_content); that is deliberately NOT bundled here.
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name. Pure ASCII,
-- re-runnable (idempotent: drop-if-exists then create). Keys off club_id.
-- ============================================================

-- Content tables: keep row status gate, add club-publish gate --------------------
drop policy if exists news_public_read on public.news;
create policy news_public_read on public.news
  for select using (
    status = 'published'::content_status
    and club_id in (select id from public.clubs where website_status = 'published')
  );

drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select using (
    status = 'published'::content_status
    and club_id in (select id from public.clubs where website_status = 'published')
  );

drop policy if exists sponsors_public_read on public.sponsors;
create policy sponsors_public_read on public.sponsors
  for select using (
    status = 'published'::content_status
    and club_id in (select id from public.clubs where website_status = 'published')
  );

drop policy if exists teams_public_read on public.teams;
create policy teams_public_read on public.teams
  for select using (
    status = 'published'::content_status
    and club_id in (select id from public.clubs where website_status = 'published')
  );

-- Was USING(true): replace with the club-publish gate ----------------------------
drop policy if exists club_modules_public_read on public.club_modules;
create policy club_modules_public_read on public.club_modules
  for select using (
    club_id in (select id from public.clubs where website_status = 'published')
  );

drop policy if exists ladder_public_read on public.ladder;
create policy ladder_public_read on public.ladder
  for select using (
    club_id in (select id from public.clubs where website_status = 'published')
  );

drop policy if exists matches_public_read on public.matches;
create policy matches_public_read on public.matches
  for select using (
    club_id in (select id from public.clubs where website_status = 'published')
  );

-- Lock the F2 tables BEFORE they hold any rows -----------------------------------
drop policy if exists club_pages_public_read on public.club_pages;
create policy club_pages_public_read on public.club_pages
  for select using (
    club_id in (select id from public.clubs where website_status = 'published')
  );

drop policy if exists club_sections_public_read on public.club_sections;
create policy club_sections_public_read on public.club_sections
  for select using (
    club_id in (select id from public.clubs where website_status = 'published')
  );

-- Re-assert the already-gated club_content policy (no-op on current DB) -----------
drop policy if exists club_content_public_read on public.club_content;
create policy club_content_public_read on public.club_content
  for select using (
    club_id in (select id from public.clubs where website_status = 'published')
  );

-- ------------------------------------------------------------
-- After applying, verify:
--   RAW ANON key (per club-scoped table):
--     * published club -> rows returned;  draft/suspended club -> 0 rows.
--     * authenticated non-member of a DRAFT club -> 0 rows (cross-club read closed).
--   AUTHENTICATED club admin of a DRAFT club (the one that must NOT break):
--     * can still READ its own news / events / sponsors / teams in the admin.
--     * can still EDIT (insert/update/delete) its own news / events / sponsors /
--       teams. (Pre-verified by role-sim: read + write ALLOWED on all four.)
-- ============================================================
