-- ============================================================
-- AFLVM demo club -- the pitch site. Repo path: supabase/aflvm-demo-club.sql
-- Built against docs/prospects/aflvm/assets/README.md (real pulled assets) and the AFLVM
-- build brief. Real facts only (Rule 9's is_demo carve-out: a demo tenant may hold real-but-
-- illustrative content because it is honestly labelled -- not fabricated numbers).
--
-- Reuses the "Feature" structural design (real hero/.hmc/chrome/sidebar port proven against
-- RDCA this session) with AFLVM's OWN real brand colours -- a new theme preset 'aflvm', not
-- a copy of RDCA's. Gold #e09900 is the accent here specifically because it is the flagship
-- case that motivated the --ink-accent pairing rule (docs/rdca-port-audit-v2.md sec 1d):
-- white-on-gold is unreadable, so gold ships with an authored navy ink, same pattern as
-- BHRDCA's --ink-gold.
--
-- No PlayHQ wiring (standing decision: dummy data until the AFLVM gig is won) --
-- hero.showMatchCard stays false, matchCentre is never populated for this club.
-- All club crest/sponsor/logo URLs are the REAL images at their REAL hosted location
-- (aflvm.com.au) -- pulled, not re-uploaded (no storage bucket provisioned on this branch).
--
-- APPLIED to `develop` (project jgziqwowavhuqpbmzxhs) 2026-08-03, authorized by Carson.
-- NOT applied to production.
-- ============================================================

do $$
declare
  v_club_id uuid;
begin

-- club_themes must exist BEFORE clubs (clubs.theme_key has a FK to club_themes.key) --
-- learned live: the first apply attempt hit "violates foreign key constraint
-- clubs_theme_key_fkey" with clubs inserted first. Reordered here to match what was applied.
insert into public.club_themes (key, name, tokens, is_preset)
values (
  'aflvm',
  'AFLVM',
  jsonb_build_object(
    '--font-display', '"Bebas Neue", "Arial Narrow", sans-serif',
    '--font-body', '"DM Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    '--fs-eyebrow', '0.625rem',
    '--fs-body', '0.9375rem',
    '--fs-lead', '1.0625rem',
    '--fs-h3', '1.75rem',
    '--fs-h2', 'clamp(1.75rem, 1.3rem + 2vw, 2.5rem)',
    '--fs-h1', 'clamp(2.5rem, 1.5rem + 5vw, 4.25rem)',
    '--space-1', '0.5rem', '--space-2', '1rem', '--space-3', '1.5rem', '--space-4', '2.5rem',
    '--container', '1200px', '--radius', '10px', '--radius-lg', '16px',
    '--section-pad', 'clamp(2rem, 4vw, 3.5rem)',
    '--heading-transform', 'none', '--heading-tracking', '0.005em', '--heading-leading', '0.95', '--heading-weight', '400',
    '--hero-align', 'left', '--head-align', 'left',
    '--bg', '#f4f5f8', '--bg-alt', '#e9ebf1', '--bg-invert', '#01003c',
    '--surface', '#ffffff', '--surface-2', '#e9ebf1',
    '--text', '#111527', '--text-soft', '#5c6178', '--text-invert', '#ffffff',
    '--border', 'rgba(1,0,60,.1)',
    '--hero-bg', '#01003c', '--hero-text', '#ffffff',
    '--shadow', '0 1px 4px rgba(1,0,60,.08), 0 4px 16px rgba(1,0,60,.06)',
    -- The flagship ink-pair case: gold accent needs a dark ink, unlike RDCA's red.
    '--accent-on-bg', '#e09900',
    '--ink-accent', '#01003c'
  ),
  false -- club-specific, not a reusable style preset
)
on conflict (key) do update set tokens = excluded.tokens;

insert into public.clubs (
  name, slug, sport_type, logo_url,
  primary_colour, secondary_colour, tertiary_colour,
  contact_email, website_status, is_demo, theme_key
) values (
  'AFL Masters Vic Metro', 'aflvm-demo', 'afl',
  'https://aflvm.com.au/wp-content/uploads/2024/06/AFL-Master-aflvm-logo-1.png',
  '#d23127', '#01003c', '#e09900',
  'admin@aflvm.com.au', 'published', true, 'aflvm'
) returning id into v_club_id;

insert into public.sponsors (club_id, name, logo_url, sponsor_level, display_order, status, in_carousel) values
  (v_club_id, 'S-Trend', 'https://aflvm.com.au/wp-content/uploads/2023/12/S-Trend-logo.png', 'gold', 1, 'published', true),
  (v_club_id, 'Top Notch', 'https://aflvm.com.au/wp-content/uploads/2023/12/top-notch-logo.png', 'gold', 2, 'published', true),
  (v_club_id, 'Sundaylicious', 'https://aflvm.com.au/wp-content/uploads/2024/09/Sundaylicious-Logo-HORIZ-REV-1.webp', 'silver', 3, 'published', true),
  (v_club_id, 'ISLA Vodka', null, 'silver', 4, 'published', true),
  (v_club_id, 'The Reed Group', null, 'silver', 5, 'published', true),
  (v_club_id, 'Le Pine Funerals', null, 'silver', 6, 'published', true),
  (v_club_id, 'Centaur Institute', null, 'bronze', 7, 'published', true),
  (v_club_id, 'Pat Cronin Foundation', null, 'supporter', 8, 'published', true);

insert into public.club_pages (
  club_id, slug, title, nav_label, nav_order, nav_visible, is_home,
  draft_layout, published_layout, published_at, draft_layout_mode, published_layout_mode
) values (
  v_club_id, 'home', 'AFL Masters Vic Metro', 'Home', 0, true, true,
  jsonb_build_array(
    jsonb_build_object(
      'id', 'hero', 'type', 'hero', 'visible', true, 'column', 'full',
      'props', jsonb_build_object(
        'title', 'Melbourne''s Home of Masters Football',
        'titleRich', jsonb_build_array(
          jsonb_build_object('text', 'Melbourne''s'),
          jsonb_build_object('text', 'Home of', 'break', true),
          jsonb_build_object('text', 'Masters Football', 'break', true, 'style', 'accent')
        ),
        'subtitle', 'AFL Masters Vic Metro (AFLVM) -- the Victorian Metropolitan competition for over-35s men''s and women''s football, with 45 member clubs across Melbourne.',
        'media', jsonb_build_object('kind', 'image', 'url', 'https://aflvm.com.au/wp-content/uploads/2026/03/2026-Newcastle-Masters-NC-gbg-scaled.jpg'),
        'primaryCta', jsonb_build_object('label', 'Find a Club', 'href', '?f2=clubs'),
        'secondaryCta', jsonb_build_object('label', 'National Carnival', 'href', '?f2=carnival'),
        'stats', jsonb_build_array(
          jsonb_build_object('label', 'Member Clubs', 'value', '45'),
          jsonb_build_object('label', 'National Carnival', 'value', '2026'),
          jsonb_build_object('label', 'Age Groups', 'value', '35+')
        ),
        'layout', 'feature',
        'showMatchCard', false
      )
    ),
    jsonb_build_object(
      'id', 'clubs', 'type', 'clubs_directory', 'visible', true, 'column', 'main',
      'props', jsonb_build_object(
        'heading', 'Find a Club',
        'groupBy', 'none',
        'display', 'grid',
        'clubs', jsonb_build_array(
          jsonb_build_object('name','Ascot Vale','crest','https://aflvm.com.au/wp-content/uploads/2024/06/ASCOT-VALE.jpg'),
          jsonb_build_object('name','Bayside Saints','crest','https://aflvm.com.au/wp-content/uploads/2024/06/BAYSIDE-SAINTS.png'),
          jsonb_build_object('name','Beaconsfield Superules','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Beaconsfield-Superules.jpg'),
          jsonb_build_object('name','Box Hill North','crest','https://aflvm.com.au/wp-content/uploads/2024/06/BOX-HILL-NORTH.jpg'),
          jsonb_build_object('name','Brunswick','crest','https://aflvm.com.au/wp-content/uploads/2024/06/BRUNSWICK.jpg'),
          jsonb_build_object('name','Carrum Cowboys','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Carrum-Cowboys.jpg'),
          jsonb_build_object('name','Craigieburn','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Craigieburn.png'),
          jsonb_build_object('name','Cranbourne Districts','crest','https://aflvm.com.au/wp-content/uploads/2024/06/CRANBOURNE.jpg'),
          jsonb_build_object('name','Darebin Falcons','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Falcons-Logo-full-colour-500w-1.jpg'),
          jsonb_build_object('name','De La Salle','crest','https://aflvm.com.au/wp-content/uploads/2025/01/dls.jpg'),
          jsonb_build_object('name','Diamond Valley','crest','https://aflvm.com.au/wp-content/uploads/2025/02/Diamond-Valley.png'),
          jsonb_build_object('name','Dingley Supers','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Dingley-Supers.png'),
          jsonb_build_object('name','Eastern Warriors','crest','https://aflvm.com.au/wp-content/uploads/2024/06/warrior-logo-square.jpg'),
          jsonb_build_object('name','Essendon Masters','crest','https://aflvm.com.au/wp-content/uploads/2024/06/ESSENDON-MASTERS.png'),
          jsonb_build_object('name','Frankston District Tigersharks','crest','https://aflvm.com.au/wp-content/uploads/2024/06/FRANKSTON-DISTRICT-TIGERSHARKS.png'),
          jsonb_build_object('name','Geelong','crest','https://aflvm.com.au/wp-content/uploads/2024/06/GEELONG.jpg'),
          jsonb_build_object('name','Greenvale','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Greenvale-Football-Club.jpg'),
          jsonb_build_object('name','Hillside Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/HILLSIDE-FOOTBALL-CLUB.jpg'),
          jsonb_build_object('name','Laurimar FC Supers','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Laurimar-FC-Supers.jpg'),
          jsonb_build_object('name','Lilydale Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/LILYDALE-FOOTBALL-CLUB.jpg'),
          jsonb_build_object('name','Marcellin Bald Eagles','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Marcellin-Bald-Eagles.jpg'),
          jsonb_build_object('name','Mordialloc Superules','crest','https://aflvm.com.au/wp-content/uploads/2024/06/mordysupers.webp'),
          jsonb_build_object('name','Narre Warren','crest','https://aflvm.com.au/wp-content/uploads/2024/06/NARRE-WARREN-FOOTBALL-NETBALL-CLUB.jpg'),
          jsonb_build_object('name','Newport Football Club','crest','https://aflvm.com.au/wp-content/uploads/2026/01/Newport-Football-Club.png'),
          jsonb_build_object('name','Northern Districts','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Northern-Districts-Super-Rules-FC.jpg'),
          jsonb_build_object('name','Northside Lions','crest','https://aflvm.com.au/wp-content/uploads/2024/06/northside-lions-logo-765-x-536.jpg'),
          jsonb_build_object('name','Old Paradians Football Club','crest','https://aflvm.com.au/wp-content/uploads/2026/01/old-parade.jpg'),
          jsonb_build_object('name','Parkdale Superules','crest','https://aflvm.com.au/wp-content/uploads/2024/06/PARKDALE-SUPERULES.jpg'),
          jsonb_build_object('name','Western Spurs','crest','https://aflvm.com.au/wp-content/uploads/2021/03/Spurs_LOGO_-PNG-2-POS-01-3.png'),
          jsonb_build_object('name','Plenty Valley','crest','https://aflvm.com.au/wp-content/uploads/2024/06/PLENTY-VALLEY.jpg'),
          jsonb_build_object('name','Port Melbourne Colts','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Colts-Logo.webp'),
          jsonb_build_object('name','Peninsula Raiders','crest','https://aflvm.com.au/wp-content/uploads/2024/06/PENINSULA-RAIDERS.png'),
          jsonb_build_object('name','Rupertswood Football Club','crest','https://aflvm.com.au/wp-content/uploads/2026/01/Rupertswood-Football-Club.png'),
          jsonb_build_object('name','South Yarra','crest','https://aflvm.com.au/wp-content/uploads/2024/06/SOUTH-YARRA.webp'),
          jsonb_build_object('name','Sunbury Lions Masters Women''s','crest','https://aflvm.com.au/wp-content/uploads/2026/01/Sunbury-Lions-Master-Women.png'),
          jsonb_build_object('name','Werribee Masters Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/werribeemastersfc.jpg'),
          jsonb_build_object('name','Western Saints Superules Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Western-Saints-Superules-Football-Club.jpg'),
          jsonb_build_object('name','Whittlesea Superules Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Whittlesea-Superules.jpg'),
          jsonb_build_object('name','Williamstown','crest','https://aflvm.com.au/wp-content/uploads/2024/06/WILLIAMSTOWN.png'),
          jsonb_build_object('name','Parkside Spurs','crest','https://aflvm.com.au/wp-content/uploads/2024/06/spurs.png')
        )
      )
    ),
    jsonb_build_object(
      'id', 'ql', 'type', 'quick_links', 'visible', true, 'column', 'side',
      'props', jsonb_build_object(
        'heading', 'Quick Links',
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Fixtures & Ladders (PlayHQ)', 'href', 'https://www.playhq.com/afl/org/afl-masters-victoria-metropolitan-superules-football-league/f6373f0f'),
          jsonb_build_object('label', 'National Carnival', 'href', '?f2=carnival'),
          jsonb_build_object('label', 'Register to Play', 'href', '?f2=register'),
          jsonb_build_object('label', 'Umpires', 'href', '?f2=umpires')
        )
      )
    ),
    jsonb_build_object(
      'id', 'sp', 'type', 'sponsors', 'visible', true, 'column', 'full',
      'props', jsonb_build_object('heading', 'Our Partners', 'display', 'carousel')
    ),
    jsonb_build_object(
      'id', 'ct', 'type', 'contact', 'visible', true, 'column', 'full',
      'props', jsonb_build_object('heading', 'Contact AFLVM', 'showEmail', true, 'layout', 'full-width')
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'id', 'hero', 'type', 'hero', 'visible', true, 'column', 'full',
      'props', jsonb_build_object(
        'title', 'Melbourne''s Home of Masters Football',
        'titleRich', jsonb_build_array(
          jsonb_build_object('text', 'Melbourne''s'),
          jsonb_build_object('text', 'Home of', 'break', true),
          jsonb_build_object('text', 'Masters Football', 'break', true, 'style', 'accent')
        ),
        'subtitle', 'AFL Masters Vic Metro (AFLVM) -- the Victorian Metropolitan competition for over-35s men''s and women''s football, with 45 member clubs across Melbourne.',
        'media', jsonb_build_object('kind', 'image', 'url', 'https://aflvm.com.au/wp-content/uploads/2026/03/2026-Newcastle-Masters-NC-gbg-scaled.jpg'),
        'primaryCta', jsonb_build_object('label', 'Find a Club', 'href', '?f2=clubs'),
        'secondaryCta', jsonb_build_object('label', 'National Carnival', 'href', '?f2=carnival'),
        'stats', jsonb_build_array(
          jsonb_build_object('label', 'Member Clubs', 'value', '45'),
          jsonb_build_object('label', 'National Carnival', 'value', '2026'),
          jsonb_build_object('label', 'Age Groups', 'value', '35+')
        ),
        'layout', 'feature',
        'showMatchCard', false
      )
    ),
    jsonb_build_object(
      'id', 'clubs', 'type', 'clubs_directory', 'visible', true, 'column', 'main',
      'props', jsonb_build_object(
        'heading', 'Find a Club',
        'groupBy', 'none',
        'display', 'grid',
        'clubs', jsonb_build_array(
          jsonb_build_object('name','Ascot Vale','crest','https://aflvm.com.au/wp-content/uploads/2024/06/ASCOT-VALE.jpg'),
          jsonb_build_object('name','Bayside Saints','crest','https://aflvm.com.au/wp-content/uploads/2024/06/BAYSIDE-SAINTS.png'),
          jsonb_build_object('name','Beaconsfield Superules','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Beaconsfield-Superules.jpg'),
          jsonb_build_object('name','Box Hill North','crest','https://aflvm.com.au/wp-content/uploads/2024/06/BOX-HILL-NORTH.jpg'),
          jsonb_build_object('name','Brunswick','crest','https://aflvm.com.au/wp-content/uploads/2024/06/BRUNSWICK.jpg'),
          jsonb_build_object('name','Carrum Cowboys','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Carrum-Cowboys.jpg'),
          jsonb_build_object('name','Craigieburn','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Craigieburn.png'),
          jsonb_build_object('name','Cranbourne Districts','crest','https://aflvm.com.au/wp-content/uploads/2024/06/CRANBOURNE.jpg'),
          jsonb_build_object('name','Darebin Falcons','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Falcons-Logo-full-colour-500w-1.jpg'),
          jsonb_build_object('name','De La Salle','crest','https://aflvm.com.au/wp-content/uploads/2025/01/dls.jpg'),
          jsonb_build_object('name','Diamond Valley','crest','https://aflvm.com.au/wp-content/uploads/2025/02/Diamond-Valley.png'),
          jsonb_build_object('name','Dingley Supers','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Dingley-Supers.png'),
          jsonb_build_object('name','Eastern Warriors','crest','https://aflvm.com.au/wp-content/uploads/2024/06/warrior-logo-square.jpg'),
          jsonb_build_object('name','Essendon Masters','crest','https://aflvm.com.au/wp-content/uploads/2024/06/ESSENDON-MASTERS.png'),
          jsonb_build_object('name','Frankston District Tigersharks','crest','https://aflvm.com.au/wp-content/uploads/2024/06/FRANKSTON-DISTRICT-TIGERSHARKS.png'),
          jsonb_build_object('name','Geelong','crest','https://aflvm.com.au/wp-content/uploads/2024/06/GEELONG.jpg'),
          jsonb_build_object('name','Greenvale','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Greenvale-Football-Club.jpg'),
          jsonb_build_object('name','Hillside Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/HILLSIDE-FOOTBALL-CLUB.jpg'),
          jsonb_build_object('name','Laurimar FC Supers','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Laurimar-FC-Supers.jpg'),
          jsonb_build_object('name','Lilydale Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/LILYDALE-FOOTBALL-CLUB.jpg'),
          jsonb_build_object('name','Marcellin Bald Eagles','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Marcellin-Bald-Eagles.jpg'),
          jsonb_build_object('name','Mordialloc Superules','crest','https://aflvm.com.au/wp-content/uploads/2024/06/mordysupers.webp'),
          jsonb_build_object('name','Narre Warren','crest','https://aflvm.com.au/wp-content/uploads/2024/06/NARRE-WARREN-FOOTBALL-NETBALL-CLUB.jpg'),
          jsonb_build_object('name','Newport Football Club','crest','https://aflvm.com.au/wp-content/uploads/2026/01/Newport-Football-Club.png'),
          jsonb_build_object('name','Northern Districts','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Northern-Districts-Super-Rules-FC.jpg'),
          jsonb_build_object('name','Northside Lions','crest','https://aflvm.com.au/wp-content/uploads/2024/06/northside-lions-logo-765-x-536.jpg'),
          jsonb_build_object('name','Old Paradians Football Club','crest','https://aflvm.com.au/wp-content/uploads/2026/01/old-parade.jpg'),
          jsonb_build_object('name','Parkdale Superules','crest','https://aflvm.com.au/wp-content/uploads/2024/06/PARKDALE-SUPERULES.jpg'),
          jsonb_build_object('name','Western Spurs','crest','https://aflvm.com.au/wp-content/uploads/2021/03/Spurs_LOGO_-PNG-2-POS-01-3.png'),
          jsonb_build_object('name','Plenty Valley','crest','https://aflvm.com.au/wp-content/uploads/2024/06/PLENTY-VALLEY.jpg'),
          jsonb_build_object('name','Port Melbourne Colts','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Colts-Logo.webp'),
          jsonb_build_object('name','Peninsula Raiders','crest','https://aflvm.com.au/wp-content/uploads/2024/06/PENINSULA-RAIDERS.png'),
          jsonb_build_object('name','Rupertswood Football Club','crest','https://aflvm.com.au/wp-content/uploads/2026/01/Rupertswood-Football-Club.png'),
          jsonb_build_object('name','South Yarra','crest','https://aflvm.com.au/wp-content/uploads/2024/06/SOUTH-YARRA.webp'),
          jsonb_build_object('name','Sunbury Lions Masters Women''s','crest','https://aflvm.com.au/wp-content/uploads/2026/01/Sunbury-Lions-Master-Women.png'),
          jsonb_build_object('name','Werribee Masters Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/werribeemastersfc.jpg'),
          jsonb_build_object('name','Western Saints Superules Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Western-Saints-Superules-Football-Club.jpg'),
          jsonb_build_object('name','Whittlesea Superules Football Club','crest','https://aflvm.com.au/wp-content/uploads/2024/06/Whittlesea-Superules.jpg'),
          jsonb_build_object('name','Williamstown','crest','https://aflvm.com.au/wp-content/uploads/2024/06/WILLIAMSTOWN.png'),
          jsonb_build_object('name','Parkside Spurs','crest','https://aflvm.com.au/wp-content/uploads/2024/06/spurs.png')
        )
      )
    ),
    jsonb_build_object(
      'id', 'ql', 'type', 'quick_links', 'visible', true, 'column', 'side',
      'props', jsonb_build_object(
        'heading', 'Quick Links',
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Fixtures & Ladders (PlayHQ)', 'href', 'https://www.playhq.com/afl/org/afl-masters-victoria-metropolitan-superules-football-league/f6373f0f'),
          jsonb_build_object('label', 'National Carnival', 'href', '?f2=carnival'),
          jsonb_build_object('label', 'Register to Play', 'href', '?f2=register'),
          jsonb_build_object('label', 'Umpires', 'href', '?f2=umpires')
        )
      )
    ),
    jsonb_build_object(
      'id', 'sp', 'type', 'sponsors', 'visible', true, 'column', 'full',
      'props', jsonb_build_object('heading', 'Our Partners', 'display', 'carousel')
    ),
    jsonb_build_object(
      'id', 'ct', 'type', 'contact', 'visible', true, 'column', 'full',
      'props', jsonb_build_object('heading', 'Contact AFLVM', 'showEmail', true, 'layout', 'full-width')
    )
  ),
  now(), 'main-side', 'main-side'
);

raise notice 'AFLVM demo club created: %', v_club_id;

end $$;

-- ------------------------------------------------------------
-- After applying, verify:
--   * select id, slug, theme_key from clubs where slug = 'aflvm-demo' -> one row.
--   * select tokens from club_themes where key = 'aflvm' -> the full jsonb object above.
--   * select count(*) from sponsors where club_id = (select id from clubs where slug='aflvm-demo') -> 8.
--   * select title, layout_mode... from club_pages where club_id = (...) and slug='home' -> 5 sections.
--   * view: http://localhost:5173/?club=aflvm-demo&f2 (dev), or the deployed preview + ?f2.
-- ============================================================
