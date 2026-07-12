-- ============================================================
-- F2 P2 -- PR 1: page-document schema. Repo path: supabase/f2-page-schema.sql
-- Built against docs/F2-design-doc.md sec 3 (LOCKED).
-- ------------------------------------------------------------
-- Composition lives in a JSONB page document on club_pages (draft_layout /
-- published_layout). club_sections (the row model) is DROPPED per sec 2 -- it is
-- empty, unwired drift and has no draft/published layer. Public page reads go
-- through ONE SECURITY DEFINER RPC (public_club_page); club_pages / club_page_versions
-- get NO anon grant. club_content's public read is UNCHANGED here -- it folds into
-- this RPC at PR 5.
--
-- Both existing tables are empty (0 rows). Captured first in
-- supabase/captured/club-pages-sections.sql, so this drops/rebuilds deliberately.
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name. Pure ASCII.
-- Depends on: clubs, vm_is_club_member(), is_platform_admin(), preview_token cols.
-- ============================================================

-- 0. Remove the competing empty composition models + the off-repo function that
--    seeds one of them. Three empty page tables (pages, club_pages, club_sections)
--    is two too many; F2 keeps ONE restructured club_pages (below).
drop function if exists public.ensure_club_home_sections(uuid);   -- writes to club_sections
drop table if exists public.club_sections;                        -- empty; row model rejected (sec 2)
drop table if exists public.pages;                                -- empty THIRD composition model (drift)
drop type if exists public.page_type;                             -- orphaned once pages is gone

-- 1. Restructure club_pages to the page-document shape (empty -> rebuild).
drop table if exists public.club_pages cascade;
create table public.club_pages (
  id               uuid primary key default gen_random_uuid(),
  club_id          uuid not null references public.clubs(id) on delete cascade,
  slug             text not null,                       -- 'home', 'juniors', 'contact'
  title            text not null,
  nav_label        text,
  nav_order        int,
  nav_visible      boolean not null default true,
  nav_parent_id    uuid references public.club_pages(id) on delete set null,  -- one dropdown level
  is_home          boolean not null default false,
  seo              jsonb not null default '{}'::jsonb,  -- page-level SEO; club-level is fallback
  draft_layout     jsonb not null default '[]'::jsonb,  -- ordered array of section instances
  published_layout jsonb,                               -- null = never published
  published_at     timestamptz,
  updated_at       timestamptz not null default now(),
  updated_by       uuid,
  unique (club_id, slug)
);
create index club_pages_club_idx on public.club_pages (club_id);

-- 2. Version history: snapshot on every publish (Club Digital Legacy, for free).
create table public.club_page_versions (
  id         uuid primary key default gen_random_uuid(),
  club_id    uuid not null references public.clubs(id) on delete cascade,
  page_id    uuid not null references public.club_pages(id) on delete cascade,
  layout     jsonb not null,
  label      text,
  created_at timestamptz not null default now(),
  created_by uuid
);
create index club_page_versions_page_idx on public.club_page_versions (page_id, created_at desc);

-- 3. Themes (platform-owned presets) + per-club selection/overrides.
create table public.club_themes (
  id        uuid primary key default gen_random_uuid(),
  key       text not null unique,
  name      text not null,
  tokens    jsonb not null default '{}'::jsonb,
  is_preset boolean not null default true
);
alter table public.clubs
  add column if not exists theme_key text,
  add column if not exists theme_overrides jsonb not null default '{}'::jsonb;
-- clubs.website_variant is retired at the END of the migration; during it, it is the
-- fallback for clubs still on the legacy renderer. Not dropped in this PR.

-- 4. RLS -- lock both new tables BEFORE any row is written. NO anon grant.
--    Public reads happen only through public_club_page. Member + platform admin r/w.
alter table public.club_pages         enable row level security;
alter table public.club_page_versions enable row level security;
alter table public.club_themes        enable row level security;

revoke all on public.club_pages         from anon;
revoke all on public.club_page_versions from anon;
grant select, insert, update, delete on public.club_pages         to authenticated;
grant select, insert, update, delete on public.club_page_versions to authenticated;
grant select on public.club_themes to anon, authenticated;   -- presets are not secret

create policy club_pages_rw on public.club_pages
  for all using (is_platform_admin() or vm_is_club_member(club_id))
          with check (is_platform_admin() or vm_is_club_member(club_id));

create policy club_page_versions_rw on public.club_page_versions
  for all using (is_platform_admin() or vm_is_club_member(club_id))
          with check (is_platform_admin() or vm_is_club_member(club_id));

create policy club_themes_read on public.club_themes for select using (true);
create policy club_themes_admin on public.club_themes
  for all using (is_platform_admin()) with check (is_platform_admin());

-- 5. The single public page read. Returns published_layout for a published club,
--    draft_layout for a valid preview token, else ZERO rows (never an error, no
--    existence leak). Also returns page-level seo + title for the renderer/head.
create or replace function public.public_club_page(p_club_id uuid, p_slug text, p_preview_token text default null)
returns table (layout jsonb, seo jsonb, title text)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_published boolean := false;
  v_token     uuid;
  v_preview   boolean := false;
begin
  if p_club_id is null or p_slug is null then
    return;
  end if;

  select (website_status = 'published') into v_published from public.clubs where id = p_club_id;

  if not coalesce(v_published, false) and p_preview_token is not null then
    begin v_token := p_preview_token::uuid; exception when others then v_token := null; end;
    if v_token is not null then
      select exists (
        select 1 from public.clubs
        where id = p_club_id and preview_token = v_token
          and (preview_token_expires_at is null or now() < preview_token_expires_at)
      ) into v_preview;
    end if;
  end if;

  if coalesce(v_published, false) then
    return query
      select p.published_layout, p.seo, p.title
      from public.club_pages p
      where p.club_id = p_club_id and p.slug = p_slug and p.published_layout is not null;
  elsif v_preview then
    return query
      select p.draft_layout, p.seo, p.title
      from public.club_pages p
      where p.club_id = p_club_id and p.slug = p_slug;
  end if;
  -- otherwise: zero rows
end;
$$;

grant execute on function public.public_club_page(uuid, text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- After applying, verify (raw anon key + role-sim):
--   * anon direct select on club_pages / club_page_versions -> denied (no grant).
--   * public_club_page(published club,'home')        -> published_layout row.
--   * public_club_page(draft club,'home')            -> 0 rows.
--   * public_club_page(draft club,'home',valid token)-> draft_layout row.
--   * member/platform admin -> read+write own club_pages; another club -> denied.
-- ============================================================
