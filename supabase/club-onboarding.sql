-- ============================================================================
-- club_onboarding - post-sale website intake capture
-- Repo path: supabase/club-onboarding.sql
-- ----------------------------------------------------------------------------
-- Stores a submission from the public Club Website Onboarding form.
-- Keyed off club_id (NEVER organisation_id). Feeds the Club Build Progression
-- seed layer (Phase 3): the intake answers auto-populate empty destinations.
--
-- WRITE STRATEGY: rows are inserted server-side by the onboarding-intake
-- Edge Function using the service role, so there is NO public insert policy -
-- anonymous submitters never touch this table directly.
--
-- ALREADY RUN in prod (project uzibfawcwoapfbigpzum) - committed for version
-- control only. Do not let tooling apply it. Safe to re-run (idempotent).
-- ============================================================================

create table if not exists public.club_onboarding (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid references public.clubs(id) on delete cascade,  -- null allowed for pre-link intake
  club_name     text,
  contact_name  text,
  contact_email text,
  status        text not null default 'submitted',   -- submitted | in_review | actioned | archived
  answers       jsonb not null default '{}'::jsonb,   -- full structured form capture
  page_url      text,
  submitted_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists club_onboarding_club_id_idx on public.club_onboarding (club_id);
create index if not exists club_onboarding_status_idx   on public.club_onboarding (status);

alter table public.club_onboarding enable row level security;

-- READ: platform admins (superadmin + sportsweb_manager) see everything;
-- a club's own admin sees only their club's submissions.
-- Verified against the live helpers: is_platform_admin() reads platform_user_roles;
-- is_club_admin(club_id) reads club_users. Both exist in the project.
drop policy if exists club_onboarding_read on public.club_onboarding;
create policy club_onboarding_read
  on public.club_onboarding
  for select
  using ( is_platform_admin() or is_club_admin(club_id) );

-- (Deliberately no INSERT/UPDATE/DELETE policy for anon/auth roles.)
-- Inserts go through the Edge Function (service role). Platform admins can
-- manage rows via the service role / dashboard, or add an admin UPDATE policy
-- later if the review workflow needs it.
