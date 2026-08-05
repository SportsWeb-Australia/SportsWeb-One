-- ============================================================
-- SportsWeb One -- content version history (undo + restore-from-backup).
-- Repo path: supabase/club-content-versions.sql
-- ------------------------------------------------------------
-- Problem: publish_club_content overwrites the live `value` with draft_value and
-- keeps NO history, so a bad or wrong-club publish is unrecoverable. This adds a
-- per-club version log:
--   * every Publish first snapshots the current LIVE values (kind 'pre_publish');
--   * a "Save a restore point" action snapshots on demand (kind 'manual');
--   * restore_content_version() rolls the live values back to any snapshot, and
--     snapshots the current state first (kind 'pre_restore') so a restore is
--     itself undoable.
--
-- One mechanism serves both "undo last publish" (restore the newest pre_publish
-- snapshot) and "reinstall from backup" (restore any chosen snapshot).
--
-- Non-destructive by design: a restore writes back the keys held in the snapshot
-- and clears any pending drafts; keys added AFTER that snapshot are left in place
-- rather than deleted. Safe + re-runnable. Pure ASCII. Keys off club_id.
--
-- Prerequisite helpers already in prod: public.is_platform_admin(),
-- public.my_club_ids(). Depends on club_content (value/draft_value) from
-- supabase/club-content-draft.sql.
-- ============================================================

-- 1. Version log -------------------------------------------------------------
create table if not exists public.club_content_versions (
  id         uuid primary key default gen_random_uuid(),
  club_id    uuid not null references public.clubs(id) on delete cascade,
  snapshot   jsonb not null default '{}'::jsonb,  -- content_key -> live value at capture
  kind       text  not null default 'manual',     -- 'pre_publish' | 'manual' | 'pre_restore'
  note       text,
  actor      text,                                 -- email of whoever triggered it
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists club_content_versions_club_idx
  on public.club_content_versions (club_id, created_at desc);

-- 2. RLS: read only from the client (writes happen only inside the SECURITY
--    DEFINER RPCs below, which bypass RLS). Platform admins OR club members may
--    read their club's history.
alter table public.club_content_versions enable row level security;
drop policy if exists club_content_versions_read on public.club_content_versions;
create policy club_content_versions_read on public.club_content_versions
  for select
  using (public.is_platform_admin() or club_id in (select public.my_club_ids()));

grant select on public.club_content_versions to authenticated;

-- 3. Publish (replaces the version in club-content-draft.sql): snapshot the live
--    values before promoting drafts, so every publish leaves a restore point.
create or replace function public.publish_club_content(p_club_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_n      integer;
  v_drafts integer;
  v_email  text;
begin
  if p_club_id is null then
    raise exception 'A club id is required';
  end if;
  if not (public.is_platform_admin() or p_club_id in (select my_club_ids())) then
    raise exception 'Not authorized for this club';
  end if;

  select count(*) into v_drafts
  from public.club_content
  where club_id = p_club_id and draft_value is not null;

  if v_drafts = 0 then
    return 0;  -- nothing staged; no snapshot, no change
  end if;

  select email into v_email from auth.users where id = auth.uid();

  -- restore point: the live site exactly as it stands before this publish
  insert into public.club_content_versions (club_id, snapshot, kind, actor, created_by)
  select p_club_id,
         coalesce(jsonb_object_agg(content_key, value) filter (where value is not null), '{}'::jsonb),
         'pre_publish', v_email, auth.uid()
  from public.club_content
  where club_id = p_club_id;

  update public.club_content
     set value = coalesce(draft_value, value),
         draft_value = null,
         updated_at = now()
   where club_id = p_club_id
     and draft_value is not null;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

grant execute on function public.publish_club_content(uuid) to authenticated;

-- 4. Manual restore point: snapshot the current live values on demand.
create or replace function public.save_content_restore_point(p_club_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id    uuid;
  v_email text;
begin
  if p_club_id is null then
    raise exception 'A club id is required';
  end if;
  if not (public.is_platform_admin() or p_club_id in (select my_club_ids())) then
    raise exception 'Not authorized for this club';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  insert into public.club_content_versions (club_id, snapshot, kind, note, actor, created_by)
  select p_club_id,
         coalesce(jsonb_object_agg(content_key, value) filter (where value is not null), '{}'::jsonb),
         'manual', nullif(btrim(coalesce(p_note, '')), ''), v_email, auth.uid()
  from public.club_content
  where club_id = p_club_id
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.save_content_restore_point(uuid, text) to authenticated;

-- 5. Restore: roll the live values back to a chosen snapshot. Snapshots the
--    current state first (kind 'pre_restore') so the restore is itself undoable.
create or replace function public.restore_content_version(p_version_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_club  uuid;
  v_snap  jsonb;
  v_email text;
  v_n     integer;
begin
  if p_version_id is null then
    raise exception 'A version id is required';
  end if;

  select club_id, snapshot into v_club, v_snap
  from public.club_content_versions
  where id = p_version_id;

  if v_club is null then
    raise exception 'Restore point not found';
  end if;
  if not (public.is_platform_admin() or v_club in (select my_club_ids())) then
    raise exception 'Not authorized for this club';
  end if;

  select email into v_email from auth.users where id = auth.uid();

  -- snapshot where we are now, so this restore can itself be undone
  insert into public.club_content_versions (club_id, snapshot, kind, actor, created_by)
  select v_club,
         coalesce(jsonb_object_agg(content_key, value) filter (where value is not null), '{}'::jsonb),
         'pre_restore', v_email, auth.uid()
  from public.club_content
  where club_id = v_club;

  -- apply the snapshot to the keys it holds; clear any pending drafts on them
  update public.club_content cc
     set value = v_snap ->> cc.content_key,
         draft_value = null,
         updated_at = now()
   where cc.club_id = v_club
     and v_snap ? cc.content_key;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

grant execute on function public.restore_content_version(uuid) to authenticated;

-- ------------------------------------------------------------
-- After applying, verify:
--   * \d public.club_content_versions -> table present, RLS enabled.
--   * as a club admin: edit a page, Publish -> a 'pre_publish' row appears.
--   * select save_content_restore_point('<club>', 'baseline'); -> returns a uuid.
--   * select restore_content_version('<that uuid>'); -> N keys restored; a
--     'pre_restore' row is also written.
-- ============================================================
