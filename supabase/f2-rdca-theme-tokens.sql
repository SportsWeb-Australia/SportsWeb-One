-- ============================================================
-- F2 -- the RDCA theme's real token values. Repo path: supabase/f2-rdca-theme-tokens.sql
-- Built against design-sources/rdca-deploy-flat_1.zip/_shared.css (the real, shipped site)
-- and docs/rdca-port-audit-v2.md sec 1c/1d/1e.
--
-- Every club_themes preset row ships tokens:'{}' today -- combined with the F2 token gap
-- fixed in src/styles/tokens.css this session (an html[data-render="f2"] fallback that
-- didn't exist at all), F2 pages have been rendering with NO real per-club colour identity,
-- just the generic neutral fallback. This is the first REAL theme: RDCA's actual navy/red,
-- Bebas Neue/DM Sans, and density -- lifted from Carson's shipped site, not invented.
--
-- New preset key 'feature' (not 'classic' or 'broadcast') -- matches the hero.layout enum
-- value F2 sections.css schemas.ts now uses for this design, and deliberately does not
-- collide with the legacy 'classic'/'broadcast' DesignVariant keys (different table,
-- different code path, but same name would read as the same theme to a human -- avoid that).
-- The --ink-accent pair is included per the token model even though RDCA's red doesn't
-- strictly need it (white-on-red is legible) -- AFLVM's gold WILL need it, and this is the
-- reference example for "the pair exists on every accent, always."
--
-- APPLIED to `develop` (project jgziqwowavhuqpbmzxhs) 2026-08-03, authorized by Carson.
-- NOT applied to production.
-- ============================================================

insert into public.club_themes (key, name, tokens, is_preset)
values (
  'feature',
  'Feature',
  jsonb_build_object(
    '--font-display', '"Bebas Neue", "Arial Narrow", sans-serif',
    '--font-body', '"DM Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    '--fs-eyebrow', '0.625rem',
    '--fs-body', '0.875rem',
    '--fs-lead', '1rem',
    '--fs-h3', '1.75rem',
    '--fs-h2', 'clamp(1.75rem, 1.3rem + 2vw, 2.5rem)',
    '--fs-h1', 'clamp(2.5rem, 1.5rem + 5vw, 4.25rem)',
    '--space-1', '0.5rem',
    '--space-2', '1rem',
    '--space-3', '1.5rem',
    '--space-4', '2.5rem',
    '--container', '1200px',
    '--radius', '14px',
    '--radius-lg', '20px',
    '--section-pad', 'clamp(2rem, 4vw, 3.5rem)',
    '--heading-transform', 'none',
    '--heading-tracking', '0.005em',
    '--heading-leading', '0.95',
    '--heading-weight', '400',
    '--hero-align', 'left',
    '--head-align', 'left',
    '--bg', '#f0f2f5',
    '--bg-alt', '#e4e7ec',
    '--bg-invert', '#0d1f3c',
    '--surface', '#ffffff',
    '--surface-2', '#e4e7ec',
    '--text', '#0d1923',
    '--text-soft', '#5a6880',
    '--text-invert', '#ffffff',
    '--border', 'rgba(0,0,0,.08)',
    '--hero-bg', '#0d1f3c',
    '--hero-text', '#ffffff',
    '--shadow', '0 1px 4px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05)',
    '--accent-on-bg', '#cc2222',
    '--ink-accent', '#ffffff'
  ),
  true
)
on conflict (key) do update set tokens = excluded.tokens, name = excluded.name;

-- Point the RDCA acceptance-test club at the real theme instead of the generic 'classic'.
update public.clubs set theme_key = 'feature' where id = '2d5e7d88-aa32-43a7-a594-4d2f813441de';

-- ------------------------------------------------------------
-- After applying, verify:
--   * select tokens from club_themes where key = 'feature' -> the full jsonb object above.
--   * select theme_key from clubs where id = '2d5e7d88-aa32-43a7-a594-4d2f813441de' -> 'feature'.
--   * public_club_page(that club, 'home') unaffected (theme_key isn't part of this RPC's
--     return -- F2Page reads it separately) -- layout/seo/title/layout_mode unchanged.
-- ============================================================
