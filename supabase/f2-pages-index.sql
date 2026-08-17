-- ============================================================
-- F2 phase 2 -- the public page INDEX rpc. Repo path: supabase/f2-pages-index.sql
--
-- "Which URLs does this club have?" There was no way to ask. public_club_page returns one
-- page's layout by slug, and public_club_nav returns the menu -- neither is the address list.
-- Phase 2 needs it twice: the publish-time bake has to know what to render, and sitemap.xml
-- has to list what exists.
--
-- CRITICAL difference from public_club_nav: NO nav_visible filter. A page kept out of the menu
-- is still a real, public, indexable URL -- /welfare/concussion is the live example. Baking or
-- sitemapping only the nav would silently drop those pages from the cache (so they'd fall back
-- to the client-rendered path) and from search engines entirely. The nav is a menu; this is the
-- address list. They are not the same question.
--
-- Publish gate is otherwise identical to public_club_nav, deliberately, including the preview
-- branch and its looser filter for never-published pages: an unpublished club returns zero
-- rows rather than an error, so this cannot be used to enumerate a club that is not live.
--
-- Depends on: supabase/f2-page-schema.sql (club_pages, clubs.website_status),
--             supabase/f2-public-nav.sql (the gate this mirrors).
-- ============================================================

create or replace function public.public_club_pages_index(
  p_club_id uuid,
  p_preview_token text default null
)
returns table (
  slug text,
  title text,
  is_home boolean,
  published_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_token     uuid;
  v_preview   boolean := false;
  v_published boolean := false;
begin
  if p_club_id is null then
    return;
  end if;

  if p_preview_token is not null then
    begin v_token := p_preview_token::uuid; exception when others then v_token := null; end;
    if v_token is not null then
      select exists (
        select 1 from public.clubs c
        where c.id = p_club_id and c.preview_token = v_token
          and (c.preview_token_expires_at is null or now() < c.preview_token_expires_at)
      ) into v_preview;
    end if;
  end if;

  if v_preview then
    -- Draft index: every page, published or not, so a reviewer's preview covers the whole site.
    return query
      select p.slug, p.title, p.is_home, p.published_at, p.updated_at
      from public.club_pages p
      where p.club_id = p_club_id
      order by p.is_home desc, p.nav_order nulls last, p.slug;
    return;
  end if;

  select (c.website_status = 'published') into v_published from public.clubs c where c.id = p_club_id;
  if not coalesce(v_published, false) then
    return; -- unpublished/nonexistent club -> zero rows, never an error, no existence leak
  end if;

  -- Home first, then nav order, then alphabetical: the bake renders "/" before anything else,
  -- which is the page most likely to be hit if a later render fails and the bake aborts.
  return query
    select p.slug, p.title, p.is_home, p.published_at, p.updated_at
    from public.club_pages p
    where p.club_id = p_club_id
      and p.published_layout is not null -- only pages that have actually gone live
    order by p.is_home desc, p.nav_order nulls last, p.slug;
end;
$$;

revoke execute on function public.public_club_pages_index(uuid, text) from public;
grant execute on function public.public_club_pages_index(uuid, text) to anon, authenticated;

-- ------------------------------------------------------------
-- After applying, verify:
--   * index(published club) -> every page with a published_layout, home first.
--   * a nav_visible = false page IS included (the whole point -- contrast public_club_nav).
--   * a page that has never been published -> excluded.
--   * index(draft club) -> 0 rows. index(nonexistent club) -> 0 rows, no error.
--   * index(draft club, VALID token) -> all pages, published or not.
--   * index(any club, expired/garbage token) -> falls through to the published rule.
-- ============================================================
