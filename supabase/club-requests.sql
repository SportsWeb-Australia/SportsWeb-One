-- SportsWeb One -- Change requests raised by clubs from the on-page editor.
-- APPLIED TO PROD 2026-08-16 (sportsweb-one / uzibfawcwoapfbigpzum) - verified via
-- pg_policies + role-impersonation RLS tests; see docs/migration-ledger.md.
-- Idempotent, but do NOT re-run without reason.
--
-- The inline editor deliberately only lets a club change what it can safely change
-- on its own: text, photos, video links, brand colours, and its News/Events items.
-- Anything beyond that (a new section, a layout change, a new page) is raised here
-- instead, with the reason and how urgent it is, so SportsWeb can action it.
--
-- Prerequisites already in the database: public.is_platform_admin(), clubs(id),
-- club_users(user_id, club_id), and public.my_club_ids() (declared in
-- club-content.sql / club-modules.sql / club-needs.sql).

create or replace function public.my_club_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select club_id from public.club_users where user_id = auth.uid()
$$;

create table if not exists public.club_requests (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references public.clubs(id) on delete cascade,
  requested_by  uuid references auth.users(id) on delete set null,
  -- Where the club was standing when they asked. Saves SportsWeb guessing which
  -- page "the photo bit looks wrong" refers to.
  page_path     text,
  what          text not null,
  why           text not null,
  urgency       text not null default 'soon'
                  check (urgency in ('whenever', 'soon', 'urgent')),
  status        text not null default 'new'
                  check (status in ('new', 'in_progress', 'done', 'declined')),
  -- SportsWeb's reply back to the club, shown against the request.
  response      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists club_requests_club_idx on public.club_requests (club_id, created_at desc);
-- Partial index: the platform queue almost always filters to what's outstanding.
create index if not exists club_requests_open_idx on public.club_requests (created_at desc)
  where status in ('new', 'in_progress');

-- updated_at: the repo has no generic updated_at trigger -- tables maintain it in
-- the writing code (see club-needs.sql). This table follows that same convention.

alter table public.club_requests enable row level security;

grant select, insert on public.club_requests to authenticated;
grant update, delete on public.club_requests to authenticated;

-- A club may raise a request for ITS OWN club, and read its own history.
-- requested_by is pinned to the caller so a member can't file as someone else.
drop policy if exists club_requests_insert on public.club_requests;
create policy club_requests_insert on public.club_requests
  for insert
  with check (
    (public.is_platform_admin() or club_id in (select public.my_club_ids()))
    and (requested_by is null or requested_by = auth.uid())
  );

drop policy if exists club_requests_read on public.club_requests;
create policy club_requests_read on public.club_requests
  for select
  using (public.is_platform_admin() or club_id in (select public.my_club_ids()));

-- Triage is SportsWeb's job: only platform admins may change status/response, so a
-- club can't quietly mark its own request done.
drop policy if exists club_requests_admin_update on public.club_requests;
create policy club_requests_admin_update on public.club_requests
  for update
  using      (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists club_requests_admin_delete on public.club_requests;
create policy club_requests_admin_delete on public.club_requests
  for delete
  using (public.is_platform_admin());
