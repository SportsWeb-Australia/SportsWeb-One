-- ============================================================
-- Brief 10 sec 3a -- the sidebar, slice B. Repo: supabase/club-pages-layout-mode-versioned.sql
-- ------------------------------------------------------------
-- Slice A shipped club_pages.layout_mode as a SINGLE column, read live. That was fine while
-- nothing edited it. Slice B gives the composer a UI to change it -- so it must obey the same
-- Save/Publish contract as the layout itself: Save = private draft, Publish = goes live. A
-- single live column would leak a mode change to the public site on Save. So layout_mode is
-- split into draft/published, exactly like draft_layout / published_layout:
--   draft_layout_mode     -- the composer's working copy (Save writes it; authenticated may set).
--   published_layout_mode -- what the public site renders (RPC-only, like published_layout).
--
-- publish_club_page copies draft_layout_mode -> published_layout_mode alongside the layout;
-- revert_club_page restores draft_layout_mode from published_layout_mode. The public read
-- (F2Page) uses published_layout_mode. (Note: the mode flag is inert without per-instance
-- `column` data, which already lives in the versioned layout document -- so this split is what
-- keeps a lone mode change from ever changing the live site before Publish.)
--
-- Supersedes supabase/club-pages-layout-mode.sql (the single-column slice A migration). If prod
-- has not had slice A applied yet, this file is self-contained: it adds the two columns from
-- scratch (the seed UPDATE simply no-ops when layout_mode is absent -- run it only if that
-- column exists; see the guarded block below).
--
-- NOT YET APPLIED TO PRODUCTION. Applied to the `develop` branch for staging. Apply to prod via
-- the Supabase SQL Editor once authorized by name. Pure ASCII.
-- Depends on: club_pages, publish_club_page / revert_club_page (f2-page-schema.sql).
-- ============================================================

-- 1. The two versioned columns.
alter table public.club_pages
  add column if not exists draft_layout_mode text not null default 'stack'
    check (draft_layout_mode in ('stack', 'main-side')),
  add column if not exists published_layout_mode text not null default 'stack'
    check (published_layout_mode in ('stack', 'main-side'));

-- 2. Seed both from slice A's single column IF it exists (draft == published at upgrade time).
--    Guarded so this migration also runs cleanly on a prod that never had the slice A column.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'club_pages' and column_name = 'layout_mode'
  ) then
    update public.club_pages
       set draft_layout_mode     = layout_mode,
           published_layout_mode = layout_mode;
    alter table public.club_pages drop column layout_mode;
  end if;
end $$;

-- 3. Grants: authenticated may set the DRAFT mode (the composer). published_layout_mode is
--    written ONLY by publish/revert (as owner) -- no grant, mirroring published_layout.
grant insert (draft_layout_mode), update (draft_layout_mode) on public.club_pages to authenticated;

-- 4. publish_club_page: carry the draft mode into the published mode, in the same atomic update.
create or replace function public.publish_club_page(p_page_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club_id    uuid;
  v_draft      jsonb;
  v_draft_mode text;
begin
  select club_id, draft_layout, draft_layout_mode
    into v_club_id, v_draft, v_draft_mode
    from public.club_pages where id = p_page_id;
  if v_club_id is null then
    raise exception 'Page not found';
  end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club';
  end if;

  -- Copy draft -> published (layout AND arrangement) + stamp, atomically.
  update public.club_pages
     set published_layout      = v_draft,
         published_layout_mode = v_draft_mode,
         published_at          = now(),
         updated_by            = auth.uid()
   where id = p_page_id;

  -- Record the NEWLY published layout. Every published state ends up in history.
  insert into public.club_page_versions (club_id, page_id, layout, label, created_by)
  values (v_club_id, p_page_id, v_draft, 'published', auth.uid());

  return json_build_object('page_id', p_page_id, 'published_at', now());
end;
$$;

-- 5. revert_club_page: restore the draft mode from the published mode, alongside the layout.
create or replace function public.revert_club_page(p_page_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club_id  uuid;
  v_pub      jsonb;
  v_pub_mode text;
begin
  select club_id, published_layout, published_layout_mode
    into v_club_id, v_pub, v_pub_mode
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
         draft_layout_mode = v_pub_mode,
         updated_by        = auth.uid()
   where id = p_page_id;

  return json_build_object('page_id', p_page_id, 'reverted', true);
end;
$$;

-- ------------------------------------------------------------
-- After applying, verify:
--   * select draft_layout_mode, published_layout_mode from club_pages limit 1;  -> both 'stack'.
--   * update club_pages set draft_layout_mode='main-side' where ...;            -> succeeds (admin).
--   * update club_pages set published_layout_mode='main-side' where ...;        -> permission denied.
--   * select publish_club_page(page_id);   -> published_layout_mode now matches draft.
--   * select revert_club_page(page_id);    -> draft_layout_mode restored to published.
-- ============================================================
