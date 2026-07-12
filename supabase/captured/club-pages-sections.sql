-- ============================================================
-- CAPTURED FROM PROD 2026-07-12 -- already exists; documentation/parity only.
-- The pre-F2 club_pages + club_sections scaffolding (empty, unwired off-repo drift).
-- Captured BEFORE F2 restructures club_pages and DROPS club_sections (design doc
-- docs/F2-design-doc.md, section 2). "Never delete a table that was never documented"
-- -- so record reality here first, then change it deliberately in P2.
-- Idempotent, a no-op on prod, nothing applied. Public reads shown here are the
-- CURRENT (published-gated) state after supabase/publish-gate-club-tables.sql.
-- ============================================================

create table if not exists public.club_pages (
  id         uuid    not null default gen_random_uuid() primary key,
  club_id    uuid    not null references public.clubs(id) on delete cascade,
  key        text    not null,
  title      text    not null default '',
  nav_label  text    not null default '',
  path       text    not null default '/',
  sort       integer not null default 100,
  visible    boolean not null default true,
  is_system  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, key)
);

alter table public.club_pages enable row level security;

drop policy if exists club_pages_public_read on public.club_pages;
create policy club_pages_public_read on public.club_pages
  for select using (club_id in (select id from public.clubs where website_status = 'published'));

drop policy if exists club_pages_write on public.club_pages;
create policy club_pages_write on public.club_pages
  for all using (club_id in (select my_club_ids())) with check (club_id in (select my_club_ids()));

create table if not exists public.club_sections (
  id         uuid    not null default gen_random_uuid() primary key,
  club_id    uuid    not null references public.clubs(id) on delete cascade,
  page_id    uuid    not null references public.club_pages(id) on delete cascade,
  type       text    not null,
  sort       integer not null default 100,
  visible    boolean not null default true,
  props      jsonb   not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists club_sections_page_idx on public.club_sections using btree (page_id, sort);

alter table public.club_sections enable row level security;

drop policy if exists club_sections_public_read on public.club_sections;
create policy club_sections_public_read on public.club_sections
  for select using (club_id in (select id from public.clubs where website_status = 'published'));

drop policy if exists club_sections_write on public.club_sections;
create policy club_sections_write on public.club_sections
  for all using (club_id in (select my_club_ids())) with check (club_id in (select my_club_ids()));

-- NOTE: club_sections is scheduled to be DROPPED in F2 P2 (Brief 05 PR 1) in favour
-- of the JSONB page document on club_pages.draft_layout / published_layout.
