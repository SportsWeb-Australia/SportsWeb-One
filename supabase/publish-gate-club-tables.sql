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
-- Only the *_public_read policies are touched; every member/admin write policy is
-- left exactly as-is. people is intentionally untouched (member-only, holds PII).
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
-- After applying, verify with a RAW ANON key (per club-scoped table):
--   * published club -> rows returned;  draft/suspended club -> 0 rows.
--   * authenticated non-member of a DRAFT club -> 0 rows (cross-club read closed).
--   * admin/member editing own club -> unaffected (write policies untouched).
-- ============================================================
