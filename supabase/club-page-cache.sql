-- ============================================================================
-- club_page_cache — publish-time pre-rendered HTML for a club's public pages.
--
-- Part of the publish-time pre-render work (docs/publish-time-prerender-handover.md).
-- Written only by api/bake.js using the service_role key; read only through the
-- SECURITY DEFINER RPC at the bottom of this file. No direct grant to anon or
-- authenticated, matching how club_pages is handled.
--
-- Postgres rather than a blob/KV store: no new infrastructure or secret-storage
-- surface, and the serving path already has to read clubs.website_status from
-- this database on every request, so the cache read rides along with it.
--
-- Safe to re-run.
-- ============================================================================

create table if not exists public.club_page_cache (
  id                   uuid primary key default gen_random_uuid(),
  club_id              uuid not null references public.clubs(id) on delete cascade,
  route                text not null,
  html                 text not null,
  seo                  jsonb not null default '{}',
  club_config          jsonb not null,
  -- Which renderer produced this row. 'legacy' is the ClubConfig-driven route
  -- tree; F2 pages become a second source later without disturbing these rows.
  source               text not null default 'legacy',
  baked_at             timestamptz not null default now(),
  -- DEBUGGING ARTEFACT ONLY. Never gate serving on this: it records what the
  -- club's status was at bake time, which says nothing about its status now.
  -- Unpublishing has to take effect on the very next request, so the serving
  -- path re-reads clubs.website_status live. See the RPC below.
  club_status_at_bake  website_status not null,
  unique (club_id, route)
);

alter table public.club_page_cache enable row level security;

-- No policies, deliberately. RLS with zero policies denies everyone; the bake
-- writes with service_role (which bypasses RLS) and the public reads through the
-- RPC below (which is SECURITY DEFINER). Nothing needs a direct grant.
revoke all on public.club_page_cache from anon, authenticated;

comment on table public.club_page_cache is
  'Publish-time pre-rendered HTML per club/route. Written by api/bake.js via service_role; read via public_club_page_cache().';

-- ---------------------------------------------------------------------------
-- Public read path.
--
-- Mirrors public_club_page's shape: one SECURITY DEFINER function decides access
-- server-side so no caller can forget a gate.
--
-- Two rules it enforces that the serving code must not be trusted to remember:
--   1. A valid preview token returns NOTHING. Cached HTML is by definition the
--      published render, so serving it to a preview would show the wrong thing.
--      Preview always falls through to a live render.
--   2. Publish status is read LIVE from clubs, never from club_status_at_bake, so
--      unpublishing or suspending stops cached HTML on the next request even
--      while a stale row is still sitting in the table.
-- ---------------------------------------------------------------------------
create or replace function public.public_club_page_cache(
  p_club_id uuid,
  p_route text,
  p_preview_token text default null
)
returns table (html text, seo jsonb, baked_at timestamptz)
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
  if p_club_id is null or p_route is null then
    return;
  end if;

  -- 1. A valid preview token means "show me the draft" — the cache can never
  --    answer that. Return nothing so the caller renders live.
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
    return;
  end if;

  -- 2. Live status check. Anything but 'published' serves no cache at all.
  select (website_status = 'published') into v_published from public.clubs where id = p_club_id;
  if not coalesce(v_published, false) then
    return;
  end if;

  return query
    select c.html, c.seo, c.baked_at
    from public.club_page_cache c
    where c.club_id = p_club_id and c.route = p_route;
end;
$$;

-- EXECUTE is granted to PUBLIC by default; revoke it and grant deliberately.
revoke execute on function public.public_club_page_cache(uuid, text, text) from public;
grant execute on function public.public_club_page_cache(uuid, text, text) to anon, authenticated;
