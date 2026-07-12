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
-- rows and 0 for draft/suspended.
--
-- club_modules is deliberately NOT granted: the public render (components/ + pages/)
-- never reads enabledModules, so a logged-out visitor does not need club_modules to
-- decide what to show (loadClub's club_modules read is admin-only and already
-- fails-safe for anon). Per Brief 06 item 1 step 4: grant only if the renderer needs
-- it -- it does not.
--
-- APPLIED 2026-07-12 (authorized, Brief 06 item 1). Ships SEPARATELY from the
-- publish-gate migration. Pure ASCII, re-runnable.
-- ============================================================

grant select on public.matches to anon;
grant select on public.ladder  to anon;
