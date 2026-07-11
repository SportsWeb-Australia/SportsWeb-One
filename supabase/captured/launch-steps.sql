-- ============================================================
-- CAPTURED FROM PROD 2026-07-11 -- already exists; documentation/parity only.
-- Launch checklist: step catalog + per-launch progress + start_club_launch().
-- Idempotent (no-op on prod). Depends on: launch_phases, club_launches,
-- is_platform_admin(), is_launch_operator(), launch_step_is_admin_only().
-- ============================================================

-- 1. Catalog of launch steps (one row per step, shared across all launches).
create table if not exists public.launch_step_catalog (
  step_key       text    not null primary key,
  phase_no       integer not null references public.launch_phases(phase_no),
  title          text    not null,
  help_md        text,
  is_critical    boolean not null default false,
  access_level   text    not null default 'operator'
                   check (access_level = any (array['admin_only','operator'])),
  sort           integer not null default 0,
  active         boolean not null default true,
  audience       text    not null default 'operator'
                   check (audience = any (array['operator','club','both'])),
  expected_label text,
  cta_route      text
);

alter table public.launch_step_catalog enable row level security;

drop policy if exists lsc_admin on public.launch_step_catalog;
create policy lsc_admin on public.launch_step_catalog
  for all using (is_platform_admin()) with check (is_platform_admin());

drop policy if exists lsc_read on public.launch_step_catalog;
create policy lsc_read on public.launch_step_catalog
  for select using (is_platform_admin() or is_launch_operator());

-- 2. Per-launch progress (one row per (launch, step)).
create table if not exists public.launch_step_progress (
  id              uuid not null default gen_random_uuid() primary key,
  launch_id       uuid not null references public.club_launches(id) on delete cascade,
  step_key        text not null references public.launch_step_catalog(step_key),
  status          text not null default 'pending'
                    check (status = any (array['pending','done','skipped','blocked'])),
  checked_by      uuid references auth.users(id),
  checked_at      timestamptz,
  screenshot_path text,
  notes           text,
  updated_at      timestamptz not null default now(),
  unique (launch_id, step_key)
);

create index if not exists idx_lsp_launch on public.launch_step_progress using btree (launch_id);

alter table public.launch_step_progress enable row level security;

drop policy if exists lsp_insert on public.launch_step_progress;
create policy lsp_insert on public.launch_step_progress
  for insert with check (is_platform_admin());

drop policy if exists lsp_read on public.launch_step_progress;
create policy lsp_read on public.launch_step_progress
  for select using (
    is_platform_admin()
    or exists (select 1 from public.club_launches l
                where l.id = launch_step_progress.launch_id and is_launch_operator(l.region))
  );

drop policy if exists lsp_update on public.launch_step_progress;
create policy lsp_update on public.launch_step_progress
  for update using (
    is_platform_admin()
    or ((not launch_step_is_admin_only(step_key)) and exists (
          select 1 from public.club_launches l
           where l.id = launch_step_progress.launch_id and is_launch_operator(l.region)))
  ) with check (
    is_platform_admin()
    or ((not launch_step_is_admin_only(step_key)) and exists (
          select 1 from public.club_launches l
           where l.id = launch_step_progress.launch_id and is_launch_operator(l.region)))
  );

-- 3. start_club_launch: ensure a club_launches row + seed progress from the catalog.
CREATE OR REPLACE FUNCTION public.start_club_launch(p_club_id uuid, p_region text DEFAULT 'national'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
