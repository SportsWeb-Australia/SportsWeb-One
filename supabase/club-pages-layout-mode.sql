-- ============================================================
-- Brief 10 sec 3a -- the sidebar. Repo: supabase/club-pages-layout-mode.sql
-- ------------------------------------------------------------
-- Adds club_pages.layout_mode: how the renderer ARRANGES a page's sections.
--   'stack'     -- the flat, full-width flow every page has always had (the default; an
--                  existing page is untouched and renders exactly as before).
--   'main-side' -- Brief 10's two-column magazine region: sections opt into a column via
--                  the page-document field SectionInstance.column ('main' | 'side'); a section
--                  with no column stays full-width (e.g. the hero). This is the one structural
--                  shape the token thesis cannot express, so it is a page property, not a theme.
--
-- Arrangement is NOT versioned into draft/published here -- it is a single column, set by the
-- composer, applying to whatever layout is live. (If arrangement ever needs a draft/published
-- split, that is a later migration; today the two-drop-zone editor writes this directly.)
--
-- Grants: authenticated already has table-level SELECT (so the new column is readable by the
-- admin preview + the authenticated F2 nav read with no extra grant). WRITES are column-level
-- (see club-pages-column-grants.sql), so layout_mode must be added to the insert/update grants
-- or the slice-B two-drop-zone editor's .update({ layout_mode }) is silently permission-denied.
-- published_layout / published_at stay RPC-only; this does not touch them.
--
-- NOT YET APPLIED TO PRODUCTION. Author + show only; applied to the `develop` branch for
-- staging. Apply to prod via the Supabase SQL Editor once authorized by name. Pure ASCII.
-- Depends on: club_pages (f2-page-schema.sql), club-pages-column-grants.sql.
-- ============================================================

alter table public.club_pages
  add column if not exists layout_mode text not null default 'stack'
  check (layout_mode in ('stack', 'main-side'));

-- Let the admin (authenticated) set arrangement through the composer. Additive to the
-- existing column-level grants; published_layout / published_at remain ungranted (RPC-only).
grant insert (layout_mode) on public.club_pages to authenticated;
grant update (layout_mode) on public.club_pages to authenticated;

-- ------------------------------------------------------------
-- After applying, verify:
--   * select layout_mode from club_pages limit 1;                 -> 'stack' for every row.
--   * update club_pages set layout_mode = 'main-side' where ...;  -> succeeds (as club admin).
--   * update club_pages set layout_mode = 'bogus'   where ...;    -> check constraint violation.
-- ============================================================
