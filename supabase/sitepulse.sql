-- ============================================================
-- SitePulse module for SportsWeb One
-- Migration: sitepulse_module (run once in the SportsWeb One
-- Supabase SQL Editor -- project ref uzibfawcwoapfbigpzum).
--
-- Conventions honoured:
--   * Everything keys off club_id (references public.clubs). No organisation_id.
--   * RLS uses is_platform_admin() + my_club_ids() (the standard primitives).
--   * Pure ASCII, re-runnable (if not exists / on conflict do nothing).
--   * Run in the SQL Editor -- never db push.
--
-- Verified against prod (uzibfawcwoapfbigpzum): my_club_ids() returns SETOF uuid,
-- so "club_id in (select my_club_ids())" is correct as written (no = any() needed).
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Core feedback table
--   source = 'report'     -> ongoing bug / issue / improvement reports
--   source = 'onboarding' -> initial website-check items logged pre-launch
-- ------------------------------------------------------------
create table if not exists sitepulse_feedback (
  id                  uuid primary key default gen_random_uuid(),
  club_id             uuid not null references clubs(id) on delete cascade,
  source              text not null default 'report'
                      check (source in ('report','onboarding')),
  page_url            text,
  title               text,
  description         text not null,
  category            text not null default 'other'
                      check (category in (
                        'spelling','broken_link','incorrect_info','missing_info',
                        'image_logo','mobile_display','desktop_display','sports_data',
                        'sponsor','event_ticketing','store','accessibility',
                        'improvement','bug','other')),
  attachment_url      text,
  submitted_by_name   text,
  submitted_by_email  text,
  submitted_by_role   text,
  user_type           text not null default 'public'
                      check (user_type in ('public','club_admin','committee','sportsweb')),
  device_type         text check (device_type in ('mobile','tablet','desktop')),
  browser             text,
  os                  text,
  viewport            text,
  status              text not null default 'new'
                      check (status in (
                        'new','needs_review','accepted','in_progress',
                        'waiting_on_club','waiting_on_sportsweb',
                        'resolved','rejected','archived')),
  priority            text not null default 'medium'
                      check (priority in ('low','medium','high','urgent')),
  urgency_flag        boolean not null default false,
  contact_requested   boolean not null default false,
  assigned_to         uuid,                 -- platform/club user id; wire to your user table
  ai_summary          text,
  ai_recommended_action text,
  ai_responsibility   text check (ai_responsibility in ('club','sportsweb','template')),
  ai_confidence       numeric check (ai_confidence between 0 and 1),
  status_token        text not null default encode(gen_random_bytes(16),'hex'),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  resolved_at         timestamptz
);

create index if not exists idx_sitepulse_fb_club     on sitepulse_feedback(club_id);
create index if not exists idx_sitepulse_fb_status   on sitepulse_feedback(status);
create index if not exists idx_sitepulse_fb_source   on sitepulse_feedback(source);
create index if not exists idx_sitepulse_fb_priority on sitepulse_feedback(priority);
create unique index if not exists idx_sitepulse_fb_token on sitepulse_feedback(status_token);

-- ------------------------------------------------------------
-- Comments / activity (club_id denormalised for simple RLS)
-- ------------------------------------------------------------
create table if not exists sitepulse_comments (
  id           uuid primary key default gen_random_uuid(),
  feedback_id  uuid not null references sitepulse_feedback(id) on delete cascade,
  club_id      uuid not null references clubs(id) on delete cascade,
  author_type  text not null check (author_type in ('team','club','system')),
  author_id    uuid,
  visibility   text not null default 'internal'
               check (visibility in ('internal','client_visible')),
  body         text not null,
  attachment_url text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_sitepulse_cm_fb on sitepulse_comments(feedback_id);

-- ------------------------------------------------------------
-- Row Level Security
-- Public capture happens through the sitepulse-ingest Edge Function
-- (service role -> bypasses RLS), so there is NO anon insert policy.
-- These policies govern the authenticated dashboard.
--
-- Verified: my_club_ids() returns SETOF uuid, so the (select my_club_ids())
-- form below is correct.
-- ------------------------------------------------------------
alter table sitepulse_feedback enable row level security;
alter table sitepulse_comments enable row level security;

drop policy if exists sitepulse_fb_select on sitepulse_feedback;
create policy sitepulse_fb_select on sitepulse_feedback
  for select using ( is_platform_admin() or club_id in (select my_club_ids()) );

drop policy if exists sitepulse_fb_insert on sitepulse_feedback;
create policy sitepulse_fb_insert on sitepulse_feedback
  for insert with check ( is_platform_admin() or club_id in (select my_club_ids()) );

drop policy if exists sitepulse_fb_update on sitepulse_feedback;
create policy sitepulse_fb_update on sitepulse_feedback
  for update using ( is_platform_admin() or club_id in (select my_club_ids()) );

-- Club users see only client-visible comments on their clubs; platform admin sees all.
drop policy if exists sitepulse_cm_select on sitepulse_comments;
create policy sitepulse_cm_select on sitepulse_comments
  for select using (
    is_platform_admin()
    or (club_id in (select my_club_ids()) and visibility = 'client_visible')
  );

drop policy if exists sitepulse_cm_insert on sitepulse_comments;
create policy sitepulse_cm_insert on sitepulse_comments
  for insert with check (
    is_platform_admin()
    or (club_id in (select my_club_ids()) and visibility = 'client_visible')
  );

-- ------------------------------------------------------------
-- OPTIONAL: register as a module and entitle all clubs.
-- Adjust column names to match your actual modules / club_modules tables.
-- If you prefer SitePulse to be a core always-on feature, skip this block.
-- ------------------------------------------------------------
-- insert into modules (key, name, description)
-- values ('sitepulse', 'SitePulse', 'Website checks and issue reporting')
-- on conflict (key) do nothing;
--
-- insert into club_modules (club_id, module_key, enabled)
-- select id, 'sitepulse', true from clubs
-- on conflict do nothing;

-- ------------------------------------------------------------
-- Status -> club-facing label mapping (for the dashboard UI):
--   new / needs_review     -> Submitted
--   accepted               -> Under Review
--   in_progress            -> In Progress
--   waiting_on_club        -> Action needed from you
--   waiting_on_sportsweb   -> In Progress
--   resolved               -> Completed
--   rejected               -> Not proceeding
--   archived               -> (hidden)
-- ============================================================
