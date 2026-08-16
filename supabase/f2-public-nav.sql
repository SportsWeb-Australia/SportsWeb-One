-- ============================================================
-- F2 -- the public nav RPC. Repo path: supabase/f2-public-nav.sql
-- club_pages already carries nav_label/nav_order/nav_visible/nav_parent_id/is_home
-- (supabase/f2-page-schema.sql), but there was no way for the public chrome to read them --
-- club_pages has NO anon grant at all, and public_club_page returns exactly one page's
-- layout, not the page list. This is the missing read: real nav structure, driven by real
-- page rows, one dropdown level (nav_parent_id), for the chrome shell (topbar/nav/footer)
-- built this session. AFLVM's brief specifically calls this out as a stress test (a deep,
-- multi-section nav) -- this is the plumbing that makes it real instead of hardcoded links.
--
-- Same shape as public_club_page: published clubs only, nav_visible rows only, never leaks
-- which pages exist for an unpublished/draft club (0 rows, not an error).
--
-- APPLIED to `develop` (project jgziqwowavhuqpbmzxhs) 2026-08-03, authorized by Carson.
-- Original apply hit "column reference id is ambiguous" (42702) -- RETURNS TABLE(id uuid,...)
-- makes `id` an OUT-parameter name, and the unqualified `where id = p_club_id` below collided
-- with it. Fixed by qualifying (`c.id`), which is what's shown here -- caught live during
-- verification, not before. NOT applied to production.
-- Depends on: supabase/f2-page-schema.sql (club_pages, clubs.website_status).
-- ============================================================

create or replace function public.public_club_nav(p_club_id uuid)
returns table (
  id uuid,
  slug text,
  title text,
  nav_label text,
  nav_order int,
  nav_parent_id uuid,
  is_home boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_published boolean := false;
begin
  if p_club_id is null then
    return;
  end if;

  select (c.website_status = 'published') into v_published from public.clubs c where c.id = p_club_id;
  if not coalesce(v_published, false) then
    return; -- unpublished/nonexistent club -> zero rows, never an error, no existence leak
  end if;

  return query
    select p.id, p.slug, p.title, p.nav_label, p.nav_order, p.nav_parent_id, p.is_home
    from public.club_pages p
    where p.club_id = p_club_id
      and p.nav_visible = true
      and p.published_layout is not null -- only pages that have actually gone live
    order by p.nav_order nulls last, p.title;
end;
$$;

revoke execute on function public.public_club_nav(uuid) from public;
grant execute on function public.public_club_nav(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- After applying, verify:
--   * public_club_nav(published club) -> nav_visible, published pages only, ordered.
--   * public_club_nav(draft/unpublished club) -> 0 rows.
--   * public_club_nav(nonexistent club) -> 0 rows, no error.
--   * a page with nav_visible = false, or one that has never been published -> excluded.
-- ============================================================
