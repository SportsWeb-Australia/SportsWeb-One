-- ============================================================
-- CAPTURED FROM PROD 2026-07-12 -- already exists; documentation/parity only.
-- The 'pages' table: a THIRD empty page-composition model (0 rows, zero code refs),
-- off-repo drift alongside club_pages + club_sections. Captured before F2 P2 DROPS it
-- (in supabase/f2-page-schema.sql, same migration as club_sections). "Never delete a
-- table that was never documented" -- record reality here first.
-- Idempotent, a no-op on prod, nothing applied.
-- ============================================================

-- page_type enum is used only by this table (dropped with it in P2).
do $$ begin
  create type public.page_type as enum ('home', 'about', 'custom');
exception when duplicate_object then null; end $$;

create table if not exists public.pages (
  id              uuid not null default uuid_generate_v4() primary key,
  club_id         uuid not null references public.clubs(id) on delete cascade,
  title           text not null,
  slug            text not null,
  page_type       public.page_type not null default 'custom',
  content         jsonb,
  seo_title       text,
  seo_description text,
  hero_image_url  text,
  status          public.content_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (club_id, slug)
);

alter table public.pages enable row level security;

drop policy if exists pages_admin_all on public.pages;
create policy pages_admin_all on public.pages
  for all using (is_club_admin(club_id) or is_super_admin());

drop policy if exists pages_public_read on public.pages;
create policy pages_public_read on public.pages
  for select using (status = 'published'::content_status);

-- NOTE: dropped in F2 P2 (supabase/f2-page-schema.sql). F2 keeps ONE restructured
-- club_pages; pages + club_sections both die.
