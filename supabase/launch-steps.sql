-- SportsWeb One -- Launch-steps engine (RECOVERED from production for version control).
--
-- This records the live definitions of the "Get started" / launch-checklist engine
-- that ClubSetup.tsx and SetupCard.tsx already depend on. It documents what exists
-- in the database today; it does NOT change behaviour. Recovered read-only from
-- project uzibfawcwoapfbigpzum via the Supabase MCP. Comment em-dashes were
-- normalised to ASCII; logic is byte-faithful otherwise.
--
-- PREREQUISITES (defined elsewhere / still off-repo -- this file references but does
-- NOT create them):
--   tables:    public.launch_phases(phase_no), public.club_launches(id, club_id, region, updated_at)
--   helpers:   public.is_platform_admin(), public.is_launch_operator(text), public.is_launch_operator(),
--              public.launch_step_is_admin_only(text)
--   tables:    public.club_users, public.user_club_roles, public.club_content, public.teams, public.people
--
-- Safe to re-run (create table if not exists / create or replace function /
-- drop policy if exists). Do NOT run blindly against prod just to "sync" -- it is
-- already live; this file is for the repo's record.

-- ----------------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------------
create table if not exists public.launch_step_catalog (
  step_key       text not null,
  phase_no       integer not null,
  title          text not null,
  help_md        text,
  is_critical    boolean not null default false,
  access_level   text not null default 'operator',
  sort           integer not null default 0,
  active         boolean not null default true,
  audience       text not null default 'operator',
  expected_label text,
  cta_route      text,
  constraint launch_step_catalog_pkey primary key (step_key),
  constraint launch_step_catalog_phase_no_fkey foreign key (phase_no) references public.launch_phases(phase_no),
  constraint launch_step_catalog_access_level_check check (access_level = any (array['admin_only','operator'])),
  constraint launch_step_catalog_audience_check check (audience = any (array['operator','club','both']))
);

create table if not exists public.launch_step_progress (
  id              uuid not null default gen_random_uuid(),
  launch_id       uuid not null,
  step_key        text not null,
  status          text not null default 'pending',
  checked_by      uuid,
  checked_at      timestamptz,
  screenshot_path text,
  notes           text,
  updated_at      timestamptz not null default now(),
  constraint launch_step_progress_pkey primary key (id),
  constraint launch_step_progress_launch_id_step_key_key unique (launch_id, step_key),
  constraint launch_step_progress_launch_id_fkey foreign key (launch_id) references public.club_launches(id) on delete cascade,
  constraint launch_step_progress_step_key_fkey foreign key (step_key) references public.launch_step_catalog(step_key),
  constraint launch_step_progress_checked_by_fkey foreign key (checked_by) references auth.users(id),
  constraint launch_step_progress_status_check check (status = any (array['pending','done','skipped','blocked']))
);

create index if not exists idx_lsp_launch on public.launch_step_progress using btree (launch_id);

-- ----------------------------------------------------------------------------
-- 2. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.launch_step_catalog  enable row level security;
alter table public.launch_step_progress enable row level security;

drop policy if exists lsc_admin on public.launch_step_catalog;
create policy lsc_admin on public.launch_step_catalog
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists lsc_read on public.launch_step_catalog;
create policy lsc_read on public.launch_step_catalog
  for select to authenticated
  using (public.is_platform_admin() or public.is_launch_operator());

drop policy if exists lsp_insert on public.launch_step_progress;
create policy lsp_insert on public.launch_step_progress
  for insert to authenticated
  with check (public.is_platform_admin());

drop policy if exists lsp_read on public.launch_step_progress;
create policy lsp_read on public.launch_step_progress
  for select to authenticated
  using (
    public.is_platform_admin()
    or exists (
      select 1 from public.club_launches l
      where l.id = launch_step_progress.launch_id
        and public.is_launch_operator(l.region)
    )
  );

drop policy if exists lsp_update on public.launch_step_progress;
create policy lsp_update on public.launch_step_progress
  for update to authenticated
  using (
    public.is_platform_admin()
    or (
      (not public.launch_step_is_admin_only(step_key))
      and exists (
        select 1 from public.club_launches l
        where l.id = launch_step_progress.launch_id
          and public.is_launch_operator(l.region)
      )
    )
  )
  with check (
    public.is_platform_admin()
    or (
      (not public.launch_step_is_admin_only(step_key))
      and exists (
        select 1 from public.club_launches l
        where l.id = launch_step_progress.launch_id
          and public.is_launch_operator(l.region)
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 3. Functions
-- ----------------------------------------------------------------------------

-- start_club_launch: ensure a club_launches row exists and back-fill its progress
-- rows from the active catalog. Idempotent (on conflict do nothing / update).
create or replace function public.start_club_launch(p_club_id uuid, p_region text default 'national'::text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_launch_id uuid;
begin
  if not (public.is_platform_admin() or public.is_launch_operator(p_region)) then
    raise exception 'not authorised to start a launch';
  end if;

  insert into public.club_launches (club_id, region)
       values (p_club_id, coalesce(p_region,'national'))
  on conflict (club_id) do update set updated_at = now()
  returning id into v_launch_id;

  insert into public.launch_step_progress (launch_id, step_key)
  select v_launch_id, c.step_key
    from public.launch_step_catalog c
   where c.active = true
  on conflict (launch_id, step_key) do nothing;

  return v_launch_id;
end;
$function$;

-- club_setup_status: auto-detection for the club checklist. Returns a json map of
-- step_key -> boolean by inspecting real club data (content, teams, people).
create or replace function public.club_setup_status(p_club_id uuid)
returns json
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_import   boolean := false;
  v_branding boolean := false;
  v_style    boolean := false;
  v_homepage boolean := false;
  v_teams    boolean := false;
  v_invite   boolean := false;
begin
  -- Access guard: platform admins, or a member / role-holder of THIS club.
  if not (
    public.is_platform_admin()
    or exists (select 1 from public.club_users      where user_id = auth.uid() and club_id = p_club_id)
    or exists (select 1 from public.user_club_roles where user_id = auth.uid() and club_id = p_club_id)
  ) then
    raise exception 'Not authorised for this club';
  end if;

  -- club.import - site content is in (imported or entered).
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id
        and content_key in ('hero.title','about.body.0')
        and coalesce(value,'') <> ''
    ) into v_import;
  exception when others then v_import := false; end;

  -- club.branding - a logo has been set.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'branding.logo' and coalesce(value,'') <> ''
    ) into v_branding;
  exception when others then v_branding := false; end;

  -- club.style - a website style/variant has been chosen.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'site.variant' and coalesce(value,'') <> ''
    ) into v_style;
  exception when others then v_style := false; end;

  -- club.homepage - the hero headline is set.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'hero.title' and coalesce(value,'') <> ''
    ) into v_homepage;
  exception when others then v_homepage := false; end;

  -- club.teams - at least one team exists.
  begin
    select exists (select 1 from public.teams where club_id = p_club_id) into v_teams;
  exception when others then v_teams := false; end;

  -- club.invite - at least one person record exists for the club.
  begin
    select exists (select 1 from public.people where club_id = p_club_id) into v_invite;
  exception when others then v_invite := false; end;

  return json_build_object(
    'club.import',   v_import,
    'club.branding', v_branding,
    'club.style',    v_style,
    'club.homepage', v_homepage,
    'club.teams',    v_teams,
    'club.invite',   v_invite
  );
end
$function$;
