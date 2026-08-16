-- ============================================================
-- F2 -- sidebar layout. Repo path: supabase/f2-sidebar-layout.sql
-- Built against docs/codey-brief-10-the-design-layer.md sec 3a and
-- docs/rdca-port-audit-v2.md sec 1b: F2's page document is a flat array with no column
-- concept, which cannot express RDCA's (and any magazine-style design's) two-column
-- main+sidebar layout. This adds the ONE structural field that fixes it. The layout
-- document itself stays a flat array -- no nesting, no tree. See
-- src/sections/schemas.ts (sectionInstanceSchema.column) and src/sections/PageRenderer.tsx
-- (buckets by column at render time) for the application-side half of this change.
--
-- REV: a single `layout_mode` column (first draft of this file) broke the composer's
-- central invariant -- Save is never live, only Publish is. One shared column means
-- toggling it in the composer would go live on Save, same as accidentally editing
-- production. Split it draft/published, exactly like layout itself, and thread it through
-- publish_club_page / revert_club_page the same way draft_layout/published_layout already
-- are. This is the correct shape; there is no live data yet to have gotten wrong.
--
-- APPLIED to `develop` (project jgziqwowavhuqpbmzxhs) 2026-08-03, authorized by Carson.
-- NOT applied to production. Kept here as the record of what was applied.
-- Depends on: supabase/f2-page-schema.sql (club_pages, public_club_page, publish_club_page,
-- revert_club_page).
-- ============================================================

-- 1. draft/published layout_mode, mirroring draft_layout/published_layout exactly.
--    'stack' = today's single-column behaviour (default, no visible change for any existing
--    page). 'main-side' = the renderer buckets sections into two columns by their `column`
--    field (main/side, absent = main). Checked -- there are exactly two valid modes.
--    published_layout_mode is nullable like published_layout (null = never published).
alter table public.club_pages
  add column if not exists draft_layout_mode text not null default 'stack'
    check (draft_layout_mode in ('stack', 'main-side')),
  add column if not exists published_layout_mode text
    check (published_layout_mode is null or published_layout_mode in ('stack', 'main-side'));

-- 2. public_club_page must return the layout_mode for whichever layout it returns -- draft
--    branch returns draft_layout_mode, published branch returns published_layout_mode. Same
--    function, same security/grant model -- only the return shape and select lists change.
create or replace function public.public_club_page(p_club_id uuid, p_slug text, p_preview_token text default null)
returns table (layout jsonb, seo jsonb, title text, layout_mode text)
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
  if p_club_id is null or p_slug is null then
    return;
  end if;

  if p_preview_token is not null then
    begin v_token := p_preview_token::uuid; exception when others then v_token := null; end;
    if v_token is not null then
      select exists (
        select 1 from public.clubs
        where id = p_club_id and preview_token = v_token
          and (preview_token_expires_at is null or now() < preview_token_expires_at)
      ) into v_preview;
    end if;
  end if;

  if v_preview then
    return query
      select p.draft_layout, p.seo, p.title, p.draft_layout_mode
      from public.club_pages p
      where p.club_id = p_club_id and p.slug = p_slug;
    return;
  end if;

  select (website_status = 'published') into v_published from public.clubs where id = p_club_id;
  if coalesce(v_published, false) then
    return query
      select p.published_layout, p.seo, p.title, p.published_layout_mode
      from public.club_pages p
      where p.club_id = p_club_id and p.slug = p_slug and p.published_layout is not null;
  end if;
end;
$$;

revoke execute on function public.public_club_page(uuid, text, text) from public;
grant execute on function public.public_club_page(uuid, text, text) to anon, authenticated;

-- 3. publish_club_page: copy draft_layout_mode -> published_layout_mode atomically alongside
--    draft_layout -> published_layout. Same function, same auth check, one more column copied.
create or replace function public.publish_club_page(p_page_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club_id uuid;
  v_draft   jsonb;
  v_mode    text;
begin
  select club_id, draft_layout, draft_layout_mode into v_club_id, v_draft, v_mode
    from public.club_pages where id = p_page_id;
  if v_club_id is null then
    raise exception 'Page not found';
  end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club';
  end if;

  update public.club_pages
     set published_layout      = v_draft,
         published_layout_mode = v_mode,
         published_at          = now(),
         updated_by             = auth.uid()
   where id = p_page_id;

  insert into public.club_page_versions (club_id, page_id, layout, label, created_by)
  values (v_club_id, p_page_id, v_draft, 'published', auth.uid());

  return json_build_object('page_id', p_page_id, 'published_at', now());
end;
$$;

-- 4. revert_club_page: restore draft_layout_mode from published_layout_mode alongside
--    draft_layout <- published_layout. A published page always has a non-null
--    published_layout_mode by construction (step 3 always sets it), so this is safe.
create or replace function public.revert_club_page(p_page_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club_id uuid;
  v_pub     jsonb;
  v_mode    text;
begin
  select club_id, published_layout, published_layout_mode into v_club_id, v_pub, v_mode
    from public.club_pages where id = p_page_id;
  if v_club_id is null then
    raise exception 'Page not found';
  end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club';
  end if;
  if v_pub is null then
    raise exception 'Nothing published to revert to';
  end if;

  update public.club_pages
     set draft_layout      = v_pub,
         draft_layout_mode = coalesce(v_mode, 'stack'),
         updated_by        = auth.uid()
   where id = p_page_id;

  return json_build_object('page_id', p_page_id, 'reverted', true);
end;
$$;

-- ------------------------------------------------------------
-- After applying, verify:
--   * existing behaviour unchanged: public_club_page(any club,'home') still returns a row
--     shaped the same as before, plus layout_mode = 'stack' for every existing page (there
--     are 0 rows in club_pages today, so this is a no-op in practice, not a real migration).
--   * composer: update club_pages set draft_layout_mode = 'main-side' where id = <page> ->
--     accepted; public_club_page(<club>,<slug>,<valid preview token>) immediately reflects
--     it (draft branch); public_club_page(<club>,<slug>) with no token does NOT (published
--     branch, unchanged) -- Save is still never live.
--   * update club_pages set draft_layout_mode = 'nonsense' -> rejected by the check
--     constraint.
--   * publish_club_page(<page>): published_layout_mode now equals draft_layout_mode at the
--     moment of publish; public_club_page(<club>,<slug>) (no token) now returns 'main-side'.
--   * revert_club_page(<page>): draft_layout_mode restored to published_layout_mode.
--   * a page that has never been published: published_layout_mode stays null, revert is
--     blocked by the existing "Nothing published to revert to" check (v_pub is null).
-- ============================================================
