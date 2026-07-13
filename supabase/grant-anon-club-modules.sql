-- ============================================================
-- Public Module entitlement: let the anon (logged-out) F2 render read club_modules.
-- Repo: supabase/grant-anon-club-modules.sql
-- ------------------------------------------------------------
-- FINDING (PR 5 module-states proof): on the public F2 render, a Module section's
-- entitlement is resolved from ClubConfig.enabledModules, built by loadClub from
-- club_modules. But anon has NO SELECT GRANT on club_modules, so logged out the module
-- flags are invisible and entitlement collapses to the interim data-presence rule
-- (has match data => entitled). Consequence: the "entitled, no data -> empty state"
-- Module state is unreachable for anon -- it looks identical to "not entitled -> nothing".
--
-- The RLS is already correct: club_modules_public_read gates SELECT to published clubs
-- (USING club_id IN (published)). Only the grant is missing. This adds it -- anon can then
-- read a PUBLISHED club's module flags (low-sensitivity: it only says which features a club
-- has), and public Module entitlement works via the flag, not just data presence.
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name (this is a NEW
-- migration; the earlier three-file override does not generalise). Pure ASCII.
-- ============================================================

grant select on public.club_modules to anon;

-- After applying, verify:
--   * anon select on a PUBLISHED club's club_modules -> its rows (via club_modules_public_read).
--   * anon select on a DRAFT club's club_modules      -> 0 rows (policy still gates it).
--   * F2 render of a club with a 'match_centre' module + no match data -> the entitled
--     empty state ("Fixtures... will appear once the season draw is published").
-- ============================================================
