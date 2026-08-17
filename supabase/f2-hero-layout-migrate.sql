-- ============================================================
-- F2 -- retire the invented hero layout names. Repo path: supabase/f2-hero-layout-migrate.sql
--
-- src/sections/schemas.ts once allowed hero layouts named media-full / media-split /
-- media-diagonal. Those names were replaced by real designs, but nothing migrated the stored
-- values -- and under the renderer's validate-or-skip contract an unrecognised layout fails
-- heroSchema, which SKIPS THE WHOLE HERO. A club whose page still said 'media-split' would
-- simply lose the banner off the top of its homepage, with a console warning nobody reads.
--
-- Maps every retired name to 'feature', the closest surviving design (a media-led hero).
-- Touches draft_layout AND published_layout: publish_club_page snapshots the draft, so a page
-- hand-fixed in draft can still be serving a stale published copy carrying the old value.
--
-- Idempotent and safe to re-run: rows without a retired value are rewritten to themselves.
-- Verified 2026-08-17: production holds ZERO hero sections (club_pages is empty there), so
-- this is a no-op on prod today -- it exists for `develop`, which had one such row, and for
-- any environment restored from an older backup.
-- ============================================================

with retired(name) as (values ('media-full'), ('media-split'), ('media-diagonal')),
updated as (
  select
    p.id,
    (
      select jsonb_agg(
               case
                 when s->>'type' = 'hero'
                  and s #>> '{props,layout}' in (select name from retired)
                 then jsonb_set(s, '{props,layout}', '"feature"'::jsonb)
                 else s
               end
               order by ord
             )
      from jsonb_array_elements(p.draft_layout) with ordinality as t(s, ord)
    ) as new_draft,
    (
      select jsonb_agg(
               case
                 when s->>'type' = 'hero'
                  and s #>> '{props,layout}' in (select name from retired)
                 then jsonb_set(s, '{props,layout}', '"feature"'::jsonb)
                 else s
               end
               order by ord
             )
      from jsonb_array_elements(p.published_layout) with ordinality as t(s, ord)
    ) as new_published
  from public.club_pages p
  where
    exists (
      select 1 from jsonb_array_elements(coalesce(p.draft_layout, '[]'::jsonb)) s
      where s->>'type' = 'hero' and s #>> '{props,layout}' in (select name from retired)
    )
    or exists (
      select 1 from jsonb_array_elements(coalesce(p.published_layout, '[]'::jsonb)) s
      where s->>'type' = 'hero' and s #>> '{props,layout}' in (select name from retired)
    )
)
update public.club_pages p
   set draft_layout     = coalesce(u.new_draft, p.draft_layout),
       published_layout = coalesce(u.new_published, p.published_layout)
  from updated u
 where u.id = p.id;

-- ------------------------------------------------------------
-- After applying, verify no retired names remain anywhere:
--
--   with secs as (
--     select s #>> '{props,layout}' as layout
--     from public.club_pages p, jsonb_array_elements(coalesce(p.draft_layout,'[]'::jsonb)) s
--     where s->>'type' = 'hero'
--     union all
--     select s #>> '{props,layout}'
--     from public.club_pages p, jsonb_array_elements(coalesce(p.published_layout,'[]'::jsonb)) s
--     where s->>'type' = 'hero'
--   )
--   select layout, count(*) from secs group by layout;
--
-- Expect only 'centred', 'feature', or null.
-- ============================================================
