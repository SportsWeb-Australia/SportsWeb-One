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
--
-- REV (Carson review): preview-token check restructured to run FIRST regardless of
-- publish status (a published club must be able to preview its own draft_layout);
-- revoke execute from public before grants; partial unique index one-home-per-club;
-- updated_at maintained by trigger; clubs.theme_key now FKs club_themes(key).
-- REV 2 (Carson review): seed club_themes with the 8 Classic-backed preset keys (so the
-- theme_key FK and StartTrial's sport->theme map always resolve); add atomic
-- publish_club_page / revert_club_page RPCs. NOTE: create_trial_club writes the variant to
-- club_content['site.variant'] -- NOT theme_key, NOT website_variant -- so this migration
-- does not touch trial signup. The seed exists for when theme_key is populated (P4/P5).
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

-- At most ONE home page per club. Enforced, not merely unlikely (partial unique index).
create unique index club_pages_one_home on public.club_pages (club_id) where is_home;

-- updated_at must reflect the last write, not the insert. Trigger it so the column
-- cannot lie. (Versions are insert-only snapshots and need no such trigger.)
create or replace function public.f2_touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger club_pages_touch_updated_at
  before update on public.club_pages
  for each row execute function public.f2_touch_updated_at();

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
-- Seed the eight Classic-backed preset theme keys so clubs.theme_key (and StartTrial's
-- sport->theme map: heritage/coastal/broadcast/classic/arena/stadium) always reference a
-- real row. Tokens are '{}' here; PR 4 fills in the real design tokens. Idempotent.
insert into public.club_themes (key, name, tokens, is_preset) values
  ('heritage',  'Heritage',  '{}'::jsonb, true),
  ('broadcast', 'Broadcast', '{}'::jsonb, true),
  ('arena',     'Arena',     '{}'::jsonb, true),
  ('classic',   'Classic',   '{}'::jsonb, true),
  ('stadium',   'Stadium',   '{}'::jsonb, true),
  ('editorial', 'Editorial', '{}'::jsonb, true),
  ('momentum',  'Momentum',  '{}'::jsonb, true),
  ('coastal',   'Coastal',   '{}'::jsonb, true)
on conflict (key) do nothing;

-- theme_key REFERENCES club_themes(key): a club cannot point at a theme that does not
-- exist, and deleting a theme sets its clubs back to null (the renderer then falls back
-- to the default theme). Nullable = clubs still on the legacy website_variant renderer.
alter table public.clubs
  add column if not exists theme_key text references public.club_themes(key) on delete set null,
  add column if not exists theme_overrides jsonb not null default '{}'::jsonb;
-- The legacy variant sources (club_content['site.variant'] + clubs.selected_template_id ->
-- templates; there is NO clubs.website_variant column) are retired at P6, replaced by
-- theme_key -> club_themes. Not touched in this PR. (Comment-only; no DDL here.)

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

-- 5. The single public page read. A valid preview token ALWAYS wins -- a published club
--    must be able to preview its own draft_layout (the whole point of the draft/published
--    split). So: valid token -> draft_layout; else published -> published_layout; else
--    ZERO rows (never an error, no existence leak). An invalid/expired token on a
--    published club falls through to the live published page. Also returns page-level
--    seo + title for the renderer/head.
create or replace function public.public_club_page(p_club_id uuid, p_slug text, p_preview_token text default null)
returns table (layout jsonb, seo jsonb, title text)
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

  -- 1. Preview token FIRST, regardless of publish status.
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
    -- valid token wins even for a published club: serve the draft.
    return query
      select p.draft_layout, p.seo, p.title
      from public.club_pages p
      where p.club_id = p_club_id and p.slug = p_slug;
    return;
  end if;

  -- 2. No valid token -> published clubs serve published_layout, everyone else 0 rows.
  select (website_status = 'published') into v_published from public.clubs where id = p_club_id;
  if coalesce(v_published, false) then
    return query
      select p.published_layout, p.seo, p.title
      from public.club_pages p
      where p.club_id = p_club_id and p.slug = p_slug and p.published_layout is not null;
  end if;
  -- otherwise: zero rows
end;
$$;

-- EXECUTE is granted to PUBLIC by default; revoke it and grant deliberately.
revoke execute on function public.public_club_page(uuid, text, text) from public;
grant execute on function public.public_club_page(uuid, text, text) to anon, authenticated;

-- 6. Atomic publish + revert. Publishing is ONE call so no code path can copy
--    draft->published while forgetting to snapshot -- that is how Club Digital Legacy
--    grows silent holes. SECURITY DEFINER with an explicit membership check inside
--    (the write bypasses RLS, so the gate must be in the body).
--
--    Snapshot the INCOMING layout -- the one being published (Carson REV 2 correction).
--    Outgoing-only would never record the first published version nor the current live
--    one, and "what did the site look like in March?" would need versions + the live row.
--    With incoming-snapshots, club_page_versions is a COMPLETE record of every state that
--    was ever live: first publish = version 1; "revert to previous published" = the
--    second-newest version.
create or replace function public.publish_club_page(p_page_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club_id uuid;
  v_draft   jsonb;
begin
  select club_id, draft_layout into v_club_id, v_draft
    from public.club_pages where id = p_page_id;
  if v_club_id is null then
    raise exception 'Page not found';
  end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club';
  end if;

  -- Copy draft -> published + stamp, atomically. updated_at advances via trigger.
  update public.club_pages
     set published_layout = v_draft,
         published_at     = now(),
         updated_by       = auth.uid()
   where id = p_page_id;

  -- Record the NEWLY published layout. Every published state ends up in history,
  -- including the current one.
  insert into public.club_page_versions (club_id, page_id, layout, label, created_by)
  values (v_club_id, p_page_id, v_draft, 'published', auth.uid());

  return json_build_object('page_id', p_page_id, 'published_at', now());
end;
$$;

-- Revert = discard unpublished draft edits by restoring draft_layout to what is live.
create or replace function public.revert_club_page(p_page_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club_id uuid;
  v_pub     jsonb;
begin
  select club_id, published_layout into v_club_id, v_pub
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
     set draft_layout = v_pub,
         updated_by   = auth.uid()
   where id = p_page_id;

  return json_build_object('page_id', p_page_id, 'reverted', true);
end;
$$;

-- Restore any historical version into the draft (the payoff of incoming-snapshots: version
-- history is usable, not merely archival). Copies an old snapshot into draft_layout; the
-- club reviews, then publishes as normal. "Revert to previous published" = restore the
-- second-newest version, then publish.
create or replace function public.restore_club_page_version(p_version_id uuid)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club_id uuid;
  v_page_id uuid;
  v_layout  jsonb;
begin
  select club_id, page_id, layout into v_club_id, v_page_id, v_layout
    from public.club_page_versions where id = p_version_id;
  if v_club_id is null then
    raise exception 'Version not found';
  end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club';
  end if;

  update public.club_pages
     set draft_layout = v_layout,
         updated_by   = auth.uid()
   where id = v_page_id;

  return json_build_object('page_id', v_page_id, 'restored_from', p_version_id);
end;
$$;

revoke execute on function public.publish_club_page(uuid)           from public;
revoke execute on function public.revert_club_page(uuid)            from public;
revoke execute on function public.restore_club_page_version(uuid)   from public;
grant execute on function public.publish_club_page(uuid)         to authenticated;
grant execute on function public.revert_club_page(uuid)          to authenticated;
grant execute on function public.restore_club_page_version(uuid) to authenticated;

-- ------------------------------------------------------------
-- After applying, verify (raw anon key + role-sim):
--   * anon direct select on club_pages / club_page_versions -> denied (no grant).
--   * public_club_page(published club,'home')                 -> published_layout row.
--   * public_club_page(published club,'home', valid token)    -> draft_layout row (preview wins).
--   * public_club_page(published club,'home', bad token)      -> published_layout row (falls through).
--   * public_club_page(draft club,'home')                     -> 0 rows.
--   * public_club_page(draft club,'home', valid token)        -> draft_layout row.
--   * two rows with is_home = true for one club                -> rejected by club_pages_one_home.
--   * update any club_pages row -> updated_at advances.
--   * member/platform admin -> read+write own club_pages; another club -> denied.
--   * club_themes has 8 preset rows; clubs.theme_key = 'heritage' accepted, = 'nope' rejected.
--   * publish_club_page(page): draft copied to published, published_at set; and EACH publish
--     (including the first) writes a club_page_versions row of the NEWLY published layout.
--   * revert_club_page(page): draft_layout restored to published_layout.
--   * restore_club_page_version(version): that version's layout copied into draft_layout.
--   * publish/revert/restore as a non-member -> 'Not authorized for this club'.
-- ============================================================
