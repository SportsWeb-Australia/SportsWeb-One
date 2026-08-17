-- ============================================================
-- AFLVM brand correction -- navy/white/silver per Carson's brief (2026-08-04), replacing
-- the gold/blue palette pulled from aflvm.com.au's live CSS in aflvm-demo-club.sql. Carson's
-- own brief states the club's brand as navy #05003b / white / silver #C0C5CE explicitly --
-- takes precedence over the scraped site colours per SPORTSWEB-BUILD-FROM-SCRATCH-SOP.md
-- Part A0 ("state every colour explicitly; do not infer").
--
-- Silver is the light accent here (same problem BHRDCA's gold solved) -- authored ink is
-- navy #05003b, not derived, per docs/engineering-conventions.md's --ink-* rule (sec 1d of
-- docs/rdca-port-audit-v2.md).
--
-- APPLIED to `develop` (project jgziqwowavhuqpbmzxhs) 2026-08-04, authorized by Carson.
-- NOT applied to production.
-- ============================================================

update public.club_themes
set tokens = tokens
  || jsonb_build_object(
    '--bg-invert', '#05003b',
    '--hero-bg', '#05003b',
    '--nav-bg', '#05003b',
    '--border', 'rgba(5,0,59,.1)',
    '--shadow', '0 1px 4px rgba(5,0,59,.08), 0 4px 16px rgba(5,0,59,.06)',
    '--accent-on-bg', '#C0C5CE',
    '--ink-accent', '#05003b'
  )
where key = 'aflvm';

update public.clubs
set primary_colour = '#05003b',
    secondary_colour = '#ffffff',
    tertiary_colour = '#C0C5CE'
where slug = 'aflvm-demo';

-- Verify after applying:
--   select tokens->'--bg-invert', tokens->'--accent-on-bg', tokens->'--ink-accent'
--   from club_themes where key = 'aflvm';  -> #05003b / #C0C5CE / #05003b
-- ============================================================
