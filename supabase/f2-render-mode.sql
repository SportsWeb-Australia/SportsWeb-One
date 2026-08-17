-- ============================================================
-- F2 -- real routing, part 1: which renderer a club uses, and reserved slugs.
-- Repo path: supabase/f2-render-mode.sql
-- Built per docs/f2-routing-and-bake-scope.md (decisions recorded there, Carson 2026-08-17).
--
-- Until now F2 pages had no URLs: they rendered only behind ?f2=<slug>, a query-param opt-in.
-- That is why a club site with pages outside the legacy renderer's 15 hardcoded routes could
-- not live in SW1 at all -- Dookie United's real site has 23 pages, ~14 of which had nowhere
-- to go. This is the switch that lets a club's pages BE its URLs.
--
-- Safe to re-run.
-- ============================================================

-- 1. render_mode: which renderer serves this club's public site.
--
--    EXPLICIT, never inferred. The obvious shortcut -- "has club_pages rows, therefore F2" --
--    would flip a club's entire public site the moment somebody drafted a single page, which
--    is both surprising and unrecoverable-looking to whoever did it. A club moves to F2
--    because someone decided it should, one club at a time. Every existing club keeps the
--    legacy renderer with no change whatsoever.
alter table public.clubs
  add column if not exists render_mode text not null default 'legacy'
    check (render_mode in ('legacy', 'f2'));

comment on column public.clubs.render_mode is
  'Which renderer serves the public site: legacy (ClubConfig + fixed routes) or f2 (club_pages as real URLs). Set deliberately per club; never inferred from data.';

-- 2. Reserved slugs.
--
--    With F2 routing, club_pages.slug BECOMES the URL path. Some paths belong to the platform
--    and always will: the admin, the collection detail routes the F2 renderer deliberately
--    keeps system-rendered (news/events articles), the self-serve trial and guide, and the
--    SEO endpoints served by api/. If a club page could claim one of those, it would either
--    be unreachable (the system route wins) or would shadow platform functionality -- and
--    which of those happens depends on rewrite order, which is exactly the kind of thing
--    nobody should have to reason about when naming a page.
--
--    Enforced here rather than in the composer because the composer is not the only writer
--    (SQL seeding, imports, and a future pages admin all insert rows). A check constraint
--    can't call a function, so this is a trigger.
create or replace function public.club_pages_reserve_slugs()
returns trigger
language plpgsql
as $$
declare
  -- First path segment of the incoming slug. Nested slugs are allowed and expected
  -- ('welfare/concussion'), so only the first segment can collide with a system route.
  v_head text := split_part(coalesce(new.slug, ''), '/', 1);
begin
  if v_head = any (array[
    'admin', 'start', 'guide',          -- app routes (see APP_PREFIXES in api/render.js)
    'news', 'events',                    -- system-rendered collection detail routes
    'api', 'assets',                     -- functions + built asset output
    'robots.txt', 'sitemap.xml', 'llms.txt'
  ]) then
    raise exception
      'The address "%" is reserved by the platform. Please choose a different page address.',
      v_head
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_club_pages_reserve_slugs on public.club_pages;
create trigger trg_club_pages_reserve_slugs
  before insert or update of slug on public.club_pages
  for each row
  execute function public.club_pages_reserve_slugs();

-- ------------------------------------------------------------
-- After applying, verify:
--   * clubs.render_mode exists, defaults to 'legacy' for every existing row, rejects 'x'.
--   * insert a club_pages row with slug 'admin'      -> raises (reserved).
--   * insert a club_pages row with slug 'news'       -> raises (reserved).
--   * insert a club_pages row with slug 'welfare'    -> allowed.
--   * insert a club_pages row with slug 'welfare/concussion' -> allowed (nested is the point).
--   * insert a club_pages row with slug 'newsletter' -> allowed (prefix match must be on the
--     whole first SEGMENT, not a string prefix -- 'newsletter' is not 'news').
-- ============================================================
