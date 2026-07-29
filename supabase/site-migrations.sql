-- ============================================================================
-- site_migrations : tracked record of each club's website host migration
-- SportsWeb One  (project ref: uzibfawcwoapfbigpzum)
-- Prepared for manual run in the Supabase SQL Editor. ASCII. Re-runnable.
-- AI prepares, humans approve, the system records everything.
--
-- Scope: platform admins only (is_platform_admin() = super_admin + sportsweb_manager).
-- Keys off club_id. Reuses existing public.update_updated_at() (house touch fn).
-- ============================================================================

-- 1. TABLE ------------------------------------------------------------------
create table if not exists public.site_migrations (
  id                        uuid primary key default gen_random_uuid(),
  club_id                   uuid not null references public.clubs(id) on delete cascade,
  flow                      text not null default 'migration'
                              check (flow in ('migration','greenfield')),
  -- 'migration'  = moving an existing site off Vercel
  -- 'greenfield' = brand-new site born on Cloudflare (no Vercel step)
  domain                    text not null,
  repo                      text,
  pages_project             text,          -- Cloudflare Pages project name
  www_cname_target          text,          -- e.g. your-project.pages.dev
  source_host               text not null default 'vercel'
                              check (source_host in ('vercel','none','other')),
  target_host               text not null default 'cloudflare_pages',
  status                    text not null default 'not_started'
                              check (status in (
                                'not_started','deploying','testing',
                                'dns_www','dns_redirect','verifying',
                                'complete','rolled_back')),
  steps                     jsonb not null default jsonb_build_object(
                                'pages_deployed',        false,
                                'pages_dev_tested',      false,
                                'www_custom_domain_added',false,
                                'www_cname_set',         false,
                                'root_redirect_set',     false,
                                'live_verified',         false,
                                'canonical_www_confirmed',false,
                                'vercel_domain_removed', false
                              ),
  email_untouched_confirmed boolean not null default false,  -- safety gate: MX/SPF/DKIM left alone
  started_at                timestamptz,
  completed_at              timestamptz,
  performed_by              uuid default auth.uid() references auth.users(id),
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint site_migrations_club_unique unique (club_id)
);

comment on table public.site_migrations is
  'One record per club tracking the website host migration (Vercel -> Cloudflare Pages) or a green-field Cloudflare build. Platform-admin only.';

create index if not exists site_migrations_status_idx on public.site_migrations (status);
create index if not exists site_migrations_flow_idx   on public.site_migrations (flow);

-- 2. TIMESTAMP TRIGGERS -----------------------------------------------------
-- updated_at (reuse existing function)
drop trigger if exists set_site_migrations_updated_at on public.site_migrations;
create trigger set_site_migrations_updated_at
  before update on public.site_migrations
  for each row execute function public.update_updated_at();

-- started_at / completed_at auto-stamp on status change
create or replace function public.site_migrations_stamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    if new.status <> 'not_started' and new.started_at is null then
      new.started_at := now();
    end if;
  elsif (tg_op = 'UPDATE') then
    if new.status is distinct from old.status then
      if new.status <> 'not_started' and new.started_at is null then
        new.started_at := now();
      end if;
      if new.status = 'complete' and new.completed_at is null then
        new.completed_at := now();
      elsif new.status <> 'complete' then
        new.completed_at := null;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_site_migrations on public.site_migrations;
create trigger stamp_site_migrations
  before insert or update on public.site_migrations
  for each row execute function public.site_migrations_stamp();

-- 3. ROW LEVEL SECURITY -----------------------------------------------------
alter table public.site_migrations enable row level security;

drop policy if exists site_migrations_select on public.site_migrations;
create policy site_migrations_select on public.site_migrations
  for select using (is_platform_admin());

drop policy if exists site_migrations_insert on public.site_migrations;
create policy site_migrations_insert on public.site_migrations
  for insert with check (is_platform_admin());

drop policy if exists site_migrations_update on public.site_migrations;
create policy site_migrations_update on public.site_migrations
  for update using (is_platform_admin()) with check (is_platform_admin());

drop policy if exists site_migrations_delete on public.site_migrations;
create policy site_migrations_delete on public.site_migrations
  for delete using (is_platform_admin());

grant select, insert, update, delete on public.site_migrations to authenticated;

-- 4. REPORTING VIEWS (security_invoker so RLS applies) ----------------------
-- Per-club board for the admin table
create or replace view public.site_migration_board
  with (security_invoker = true) as
select
  m.id,
  m.club_id,
  c.name  as club_name,
  c.slug  as club_slug,
  m.flow,
  m.domain,
  m.status,
  m.steps,
  m.email_untouched_confirmed,
  m.www_cname_target,
  m.pages_project,
  m.repo,
  m.started_at,
  m.completed_at,
  m.updated_at
from public.site_migrations m
join public.clubs c on c.id = m.club_id;

grant select on public.site_migration_board to authenticated;

-- Roll-up for the Super Admin dashboard progress card
create or replace view public.site_migration_progress
  with (security_invoker = true) as
select
  count(*)                                                          as total,
  count(*) filter (where status = 'complete')                      as completed,
  count(*) filter (where status not in ('not_started','complete')) as in_progress,
  count(*) filter (where status = 'not_started')                   as not_started,
  count(*) filter (where flow = 'migration')                       as migrations,
  count(*) filter (where flow = 'greenfield')                      as greenfield,
  round(100.0 * count(*) filter (where status = 'complete')
        / nullif(count(*), 0), 1)                                  as pct_complete
from public.site_migrations;

grant select on public.site_migration_progress to authenticated;

-- 5. RPCs (platform-admin guarded) ------------------------------------------
-- Start (or re-open) a club's migration record.
create or replace function public.start_site_migration(
  p_club_id uuid,
  p_domain  text,
  p_flow    text default 'migration',
  p_repo    text default null
)
returns public.site_migrations
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.site_migrations;
begin
  if not is_platform_admin() then
    raise exception 'not authorised';
  end if;

  insert into public.site_migrations (club_id, domain, flow, repo, source_host, status)
  values (
    p_club_id,
    p_domain,
    p_flow,
    p_repo,
    case when p_flow = 'greenfield' then 'none' else 'vercel' end,
    'deploying'
  )
  on conflict (club_id) do update
    set domain = excluded.domain,
        flow   = excluded.flow,
        repo   = coalesce(excluded.repo, public.site_migrations.repo),
        source_host = excluded.source_host
  returning * into r;

  return r;
end;
$$;

grant execute on function public.start_site_migration(uuid, text, text, text) to authenticated;

-- Tick / untick a single step. Advancing steps does NOT auto-complete;
-- set status = 'complete' explicitly (or via the UI) once verified.
create or replace function public.set_site_migration_step(
  p_club_id uuid,
  p_step    text,
  p_done    boolean
)
returns public.site_migrations
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.site_migrations;
begin
  if not is_platform_admin() then
    raise exception 'not authorised';
  end if;

  if p_step not in (
    'pages_deployed','pages_dev_tested','www_custom_domain_added',
    'www_cname_set','root_redirect_set','live_verified',
    'canonical_www_confirmed','vercel_domain_removed'
  ) then
    raise exception 'unknown step: %', p_step;
  end if;

  update public.site_migrations
    set steps = jsonb_set(steps, array[p_step], to_jsonb(p_done), true)
    where club_id = p_club_id
  returning * into r;

  if not found then
    raise exception 'no migration record for club %', p_club_id;
  end if;

  return r;
end;
$$;

grant execute on function public.set_site_migration_step(uuid, text, boolean) to authenticated;

-- Set status directly (deploying / testing / dns_www / dns_redirect /
-- verifying / complete / rolled_back). Timestamps auto-stamp via trigger.
create or replace function public.set_site_migration_status(
  p_club_id uuid,
  p_status  text
)
returns public.site_migrations
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.site_migrations;
begin
  if not is_platform_admin() then
    raise exception 'not authorised';
  end if;

  update public.site_migrations
    set status = p_status
    where club_id = p_club_id
  returning * into r;

  if not found then
    raise exception 'no migration record for club %', p_club_id;
  end if;

  return r;
end;
$$;

grant execute on function public.set_site_migration_status(uuid, text) to authenticated;

-- Defense-in-depth: these are platform-admin RPCs, never anon. (They already
-- raise 'not authorised' via is_platform_admin(); this revokes the default
-- PUBLIC execute so anon can't even reach them over /rest/v1/rpc.)
revoke execute on function public.start_site_migration(uuid, text, text, text) from anon;
revoke execute on function public.set_site_migration_step(uuid, text, boolean) from anon;
revoke execute on function public.set_site_migration_status(uuid, text) from anon;

-- ============================================================================
-- END. Verify with:
--   select * from public.site_migration_progress;
--   select * from public.site_migration_board order by updated_at desc;
-- ============================================================================
