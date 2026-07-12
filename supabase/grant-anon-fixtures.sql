-- ============================================================
-- Fix the Module-class public read: let logged-out visitors see a PUBLISHED club's
-- fixtures / results / ladder. Repo path: supabase/grant-anon-fixtures.sql
-- ------------------------------------------------------------
-- Bug: anon has no table grant on matches/ladder, so on a published club's public
-- site loadClub's matches/ladder read fails and the Match Centre falls back to the
-- static SAMPLE data ("MANUAL / SAMPLE DATA", "the Dooks"). Confirmed on the live
-- published clubs Northside Lions, Eastside United, Riverside Cricket (each has real
-- matches+ladder rows that never reach a logged-out visitor). Same class as the
-- club_content anon-grant bug.
--
-- Safe ONLY because supabase/publish-gate-club-tables.sql is applied: matches_public_read
-- and ladder_public_read are now club-publish-gated, so anon reads a PUBLISHED club's
-- rows and 0 for draft/suspended. (club_modules is included so the public renderer can
-- read a published club's module entitlements to decide what to show; its public_read
-- is likewise now published-gated.)
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name. Ships SEPARATELY
-- from the publish-gate migration (a security gate + a functional change in one file
-- makes a failed verify ambiguous). Pure ASCII, re-runnable.
--
-- After applying, verify on a DRAFT or SCRATCH club promoted to published (NOT by
-- editing a live published club): logged-out /fixtures shows the club's real fixtures/
-- results/ladder, not the sample; a draft club still shows nothing to anon.
-- ============================================================

grant select on public.matches      to anon;
grant select on public.ladder       to anon;
grant select on public.club_modules to anon;
