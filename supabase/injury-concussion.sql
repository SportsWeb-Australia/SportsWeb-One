-- ============================================================================
-- SportsWeb One — Injury & concussion management
-- Repo path: supabase/injury-concussion.sql
-- ----------------------------------------------------------------------------
-- Core feature (not a club_modules switch). Replaces the abandoned prototype
-- `public.injuries` table (single rtp_stage counter, club-wide read, no
-- per-stage dates/sign-off, no documents) with a dated graduated
-- return-to-play protocol model.
--
-- Access model: senior admins (club_senior_admin / platform admin) see and
-- edit every record in their club. Coaches / assistant coaches / team
-- managers / trainers see and edit records only for players on a team they
-- actively hold that role on (see can_access_injury() below).
--
-- Protocol content is data-driven (injury_stage_templates /
-- injury_stage_template_items), NOT hardcoded in application code, because
-- the actual stage counts/day minimums must be confirmed against a real
-- governing-body protocol before anyone relies on them. The seeded template
-- below is an explicitly-labelled placeholder — see the seed data section.
--
-- Apply via the Supabase MCP apply_migration (lands in migration history),
-- then record in docs/migration-ledger.md. Safe to re-run (idempotent).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0) Retire the old prototype table (per Carson's decision 2026-08-18: no
--    application code depends on it, its one row is unattributed test data
--    created_by IS NULL on Dookie United).
-- ---------------------------------------------------------------------------
drop table if exists public.injuries cascade;

-- ---------------------------------------------------------------------------
-- 1) Stage templates — the graduated protocol content, editable without a
--    code change. injury_type = null means "usable for any injury type";
--    set to 'concussion' etc. to restrict a template to that type.
-- ---------------------------------------------------------------------------
create table if not exists public.injury_stage_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  injury_type text,
  is_default boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.injury_stage_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.injury_stage_templates(id) on delete cascade,
  stage_no smallint not null,
  label text not null,
  min_days_from_previous smallint not null default 1,
  requires_signoff boolean not null default true,
  created_at timestamptz not null default now(),
  unique (template_id, stage_no)
);

-- ---------------------------------------------------------------------------
-- 2) Records + dated stages + documents + an append-only access log.
-- ---------------------------------------------------------------------------
create table if not exists public.injury_records (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  injury_type text not null default 'general'
    check (injury_type = any (array['general','soft_tissue','fracture','concussion','other'])),
  occurred_on date not null default current_date,
  context text,
  description text,
  severity text check (severity is null or severity = any (array['minor','moderate','severe'])),
  status text not null default 'open' check (status = any (array['open','recovering','cleared'])),
  template_id uuid references public.injury_stage_templates(id) on delete set null,
  cleared_on date,
  cleared_by uuid,
  notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_injury_records_club on public.injury_records(club_id);
create index if not exists idx_injury_records_person on public.injury_records(person_id);
create index if not exists idx_injury_records_status on public.injury_records(club_id, status);

create table if not exists public.injury_stages (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.injury_records(id) on delete cascade,
  stage_no smallint not null,
  label text not null,
  due_on date,
  completed_at timestamptz,
  signed_off_by uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (record_id, stage_no)
);
create index if not exists idx_injury_stages_record on public.injury_stages(record_id);
create index if not exists idx_injury_stages_due on public.injury_stages(due_on) where completed_at is null;

-- Metadata only — the file itself lives in the private injury-documents bucket.
create table if not exists public.injury_documents (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.injury_records(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  uploaded_by uuid default auth.uid(),
  uploaded_at timestamptz not null default now()
);
create index if not exists idx_injury_documents_record on public.injury_documents(record_id);

-- Append-only. Rows are written only by the RPCs below (SECURITY DEFINER),
-- never inserted directly by the client, so it can't be spoofed.
create table if not exists public.injury_access_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid default auth.uid(),
  club_id uuid not null,
  record_id uuid,
  action text not null check (action = any (array['viewed','created','updated','stage_completed','document_uploaded'])),
  reason text
);
create index if not exists idx_injury_access_log_record on public.injury_access_log(record_id);

drop trigger if exists trg_injury_records_touch on public.injury_records;
create trigger trg_injury_records_touch before update on public.injury_records
  for each row execute function public.sw1_touch_updated_at();

drop trigger if exists trg_injury_stages_touch on public.injury_stages;
create trigger trg_injury_stages_touch before update on public.injury_stages
  for each row execute function public.sw1_touch_updated_at();

drop trigger if exists trg_injury_stage_templates_touch on public.injury_stage_templates;
create trigger trg_injury_stage_templates_touch before update on public.injury_stage_templates
  for each row execute function public.sw1_touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3) Access helpers
-- ---------------------------------------------------------------------------

-- Team ids the signed-in user actively coaches/manages/trains within p_club.
create or replace function public.injury_coach_team_ids(p_club uuid)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select pr.team_id
  from public.person_roles pr
  join public.people p on p.id = pr.person_id
  where p.user_id = auth.uid()
    and pr.club_id = p_club
    and pr.status = 'active'
    and pr.team_id is not null
    and pr.role = any (array['coach','assistant_coach','team_manager','trainer'])
$$;
grant execute on function public.injury_coach_team_ids(uuid) to authenticated;

-- Senior admins / platform admins: full club access. Coaches: only players
-- who currently hold an active role on a team the coach also holds one on.
create or replace function public.can_access_injury(p_club uuid, p_person_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_club_senior(p_club)
    or exists (
      select 1 from public.person_roles pr
      where pr.person_id = p_person_id
        and pr.club_id = p_club
        and pr.status = 'active'
        and pr.team_id in (select public.injury_coach_team_ids(p_club))
    )
$$;
grant execute on function public.can_access_injury(uuid, uuid) to authenticated;

-- Storage path convention: {club_id}/{person_id}/{record_id}/{file_name}.
create or replace function public.can_access_injury_path(p_name text)
returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  seg text[] := storage.foldername(p_name);
begin
  if array_length(seg, 1) < 2 then return false; end if;
  return public.can_access_injury(seg[1]::uuid, seg[2]::uuid);
exception when others then
  return false;
end;
$$;
grant execute on function public.can_access_injury_path(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4) RLS
-- ---------------------------------------------------------------------------
alter table public.injury_stage_templates enable row level security;
alter table public.injury_stage_template_items enable row level security;
alter table public.injury_records enable row level security;
alter table public.injury_stages enable row level security;
alter table public.injury_documents enable row level security;
alter table public.injury_access_log enable row level security;

-- Templates: any authenticated club user can read (needed to show labels);
-- only platform admins edit content for now (a template editor UI is a
-- fast-follow — for now, template content changes go through the ledger like
-- any other hand-applied SQL).
drop policy if exists injury_templates_read on public.injury_stage_templates;
create policy injury_templates_read on public.injury_stage_templates
  for select to authenticated using (true);
drop policy if exists injury_templates_write on public.injury_stage_templates;
create policy injury_templates_write on public.injury_stage_templates
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists injury_template_items_read on public.injury_stage_template_items;
create policy injury_template_items_read on public.injury_stage_template_items
  for select to authenticated using (true);
drop policy if exists injury_template_items_write on public.injury_stage_template_items;
create policy injury_template_items_write on public.injury_stage_template_items
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists injury_records_rw on public.injury_records;
create policy injury_records_rw on public.injury_records
  for all to authenticated
  using (public.can_access_injury(club_id, person_id))
  with check (public.can_access_injury(club_id, person_id));

drop policy if exists injury_stages_rw on public.injury_stages;
create policy injury_stages_rw on public.injury_stages
  for all to authenticated
  using (exists (
    select 1 from public.injury_records r
    where r.id = injury_stages.record_id and public.can_access_injury(r.club_id, r.person_id)
  ))
  with check (exists (
    select 1 from public.injury_records r
    where r.id = injury_stages.record_id and public.can_access_injury(r.club_id, r.person_id)
  ));

drop policy if exists injury_documents_rw on public.injury_documents;
create policy injury_documents_rw on public.injury_documents
  for all to authenticated
  using (exists (
    select 1 from public.injury_records r
    where r.id = injury_documents.record_id and public.can_access_injury(r.club_id, r.person_id)
  ))
  with check (exists (
    select 1 from public.injury_records r
    where r.id = injury_documents.record_id and public.can_access_injury(r.club_id, r.person_id)
  ));

-- Audit log: senior admins can read their club's log; no client insert/update/
-- delete policy at all — rows only ever come from the SECURITY DEFINER RPCs.
drop policy if exists injury_access_log_read on public.injury_access_log;
create policy injury_access_log_read on public.injury_access_log
  for select to authenticated using (public.is_club_senior(club_id));

grant select, insert, update, delete on public.injury_records, public.injury_stages, public.injury_documents to authenticated;
grant select on public.injury_stage_templates, public.injury_stage_template_items, public.injury_access_log to authenticated;
grant select, insert, update, delete on public.injury_stage_templates, public.injury_stage_template_items to service_role;
grant select, insert on public.injury_access_log to service_role;

-- ---------------------------------------------------------------------------
-- 5) RPCs — list/get log a 'viewed' entry; mutations log their own action.
-- ---------------------------------------------------------------------------

create or replace function public.list_injury_records(p_club uuid)
returns table (
  id uuid, person_id uuid, full_name text, team_id uuid, team_name text,
  injury_type text, occurred_on date, status text, severity text,
  next_stage_no smallint, next_stage_label text, next_stage_due date,
  stages_total bigint, stages_completed bigint
)
language sql stable security definer set search_path = public as $$
  select r.id, r.person_id, p.full_name, r.team_id, t.name,
         r.injury_type, r.occurred_on, r.status, r.severity,
         ns.stage_no, ns.label, ns.due_on,
         coalesce(sc.total, 0), coalesce(sc.done, 0)
  from public.injury_records r
  join public.people p on p.id = r.person_id
  left join public.teams t on t.id = r.team_id
  left join lateral (
    select s.stage_no, s.label, s.due_on
    from public.injury_stages s
    where s.record_id = r.id and s.completed_at is null
    order by s.stage_no asc limit 1
  ) ns on true
  left join lateral (
    select count(*) as total, count(*) filter (where s.completed_at is not null) as done
    from public.injury_stages s where s.record_id = r.id
  ) sc on true
  where r.club_id = p_club and public.can_access_injury(r.club_id, r.person_id)
  order by (r.status = 'open') desc, (r.status = 'recovering') desc, r.occurred_on desc
$$;
grant execute on function public.list_injury_records(uuid) to authenticated;

create or replace function public.get_injury_record(p_record uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  rec record;
  result jsonb;
begin
  select r.* into rec from public.injury_records r where r.id = p_record;
  if not found or not public.can_access_injury(rec.club_id, rec.person_id) then
    return null;
  end if;

  select jsonb_build_object(
    'record', to_jsonb(rec),
    'stages', (select coalesce(jsonb_agg(s.* order by s.stage_no), '[]'::jsonb) from public.injury_stages s where s.record_id = p_record),
    'documents', (select coalesce(jsonb_agg(d.* order by d.uploaded_at), '[]'::jsonb) from public.injury_documents d where d.record_id = p_record)
  ) into result;

  insert into public.injury_access_log (actor_id, club_id, record_id, action)
  values (auth.uid(), rec.club_id, p_record, 'viewed');

  return result;
end;
$$;
grant execute on function public.get_injury_record(uuid) to authenticated;

create or replace function public.create_injury_record(
  p_club uuid, p_person uuid, p_injury_type text, p_occurred_on date,
  p_description text default null, p_severity text default null,
  p_team_id uuid default null, p_template_key text default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_template_id uuid;
  v_item record;
  v_due date;
begin
  if not public.can_access_injury(p_club, p_person) then
    raise exception 'Not permitted';
  end if;

  if p_template_key is not null then
    select id into v_template_id from public.injury_stage_templates where key = p_template_key;
  else
    select id into v_template_id from public.injury_stage_templates
    where is_default and (injury_type is null or injury_type = p_injury_type)
    order by (injury_type = p_injury_type) desc limit 1;
  end if;

  insert into public.injury_records (club_id, person_id, team_id, injury_type, occurred_on, description, severity, template_id, created_by)
  values (p_club, p_person, p_team_id, p_injury_type, coalesce(p_occurred_on, current_date), p_description, p_severity, v_template_id, auth.uid())
  returning id into v_id;

  if v_template_id is not null then
    v_due := coalesce(p_occurred_on, current_date);
    for v_item in select * from public.injury_stage_template_items where template_id = v_template_id order by stage_no loop
      v_due := v_due + v_item.min_days_from_previous;
      insert into public.injury_stages (record_id, stage_no, label, due_on)
      values (v_id, v_item.stage_no, v_item.label, v_due);
    end loop;
  end if;

  insert into public.injury_access_log (actor_id, club_id, record_id, action)
  values (auth.uid(), p_club, v_id, 'created');

  return v_id;
end;
$$;
grant execute on function public.create_injury_record(uuid, uuid, text, date, text, text, uuid, text) to authenticated;

create or replace function public.update_injury_record(p_record uuid, p_patch jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  rec record;
begin
  select * into rec from public.injury_records where id = p_record;
  if not found or not public.can_access_injury(rec.club_id, rec.person_id) then
    raise exception 'Not permitted';
  end if;

  update public.injury_records set
    status = coalesce(p_patch->>'status', status),
    severity = coalesce(p_patch->>'severity', severity),
    description = coalesce(p_patch->>'description', description),
    notes = coalesce(p_patch->>'notes', notes)
  where id = p_record;

  insert into public.injury_access_log (actor_id, club_id, record_id, action)
  values (auth.uid(), rec.club_id, p_record, 'updated');
end;
$$;
grant execute on function public.update_injury_record(uuid, jsonb) to authenticated;

create or replace function public.complete_injury_stage(p_stage uuid, p_notes text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_record uuid;
  rec record;
  v_remaining int;
begin
  select record_id into v_record from public.injury_stages where id = p_stage;
  select * into rec from public.injury_records where id = v_record;
  if not found or not public.can_access_injury(rec.club_id, rec.person_id) then
    raise exception 'Not permitted';
  end if;

  update public.injury_stages
  set completed_at = now(), signed_off_by = auth.uid(), notes = coalesce(p_notes, notes)
  where id = p_stage;

  select count(*) into v_remaining from public.injury_stages where record_id = v_record and completed_at is null;
  if v_remaining = 0 then
    update public.injury_records set status = 'cleared', cleared_on = current_date, cleared_by = auth.uid() where id = v_record;
  elsif rec.status = 'open' then
    update public.injury_records set status = 'recovering' where id = v_record;
  end if;

  insert into public.injury_access_log (actor_id, club_id, record_id, action)
  values (auth.uid(), rec.club_id, v_record, 'stage_completed');
end;
$$;
grant execute on function public.complete_injury_stage(uuid, text) to authenticated;

create or replace function public.register_injury_document(p_record uuid, p_path text, p_file_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  rec record;
  v_id uuid;
begin
  select * into rec from public.injury_records where id = p_record;
  if not found or not public.can_access_injury(rec.club_id, rec.person_id) then
    raise exception 'Not permitted';
  end if;

  insert into public.injury_documents (record_id, club_id, storage_path, file_name, uploaded_by)
  values (p_record, rec.club_id, p_path, p_file_name, auth.uid())
  returning id into v_id;

  insert into public.injury_access_log (actor_id, club_id, record_id, action)
  values (auth.uid(), rec.club_id, p_record, 'document_uploaded');

  return v_id;
end;
$$;
grant execute on function public.register_injury_document(uuid, text, text) to authenticated;

-- Overdue stages across a club — powers the dashboard "risks" tile.
create or replace function public.injury_dashboard_summary(p_club uuid)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'active', (select count(*) from public.injury_records where club_id = p_club and status <> 'cleared'),
    'overdue_stages', (
      select count(*) from public.injury_stages s
      join public.injury_records r on r.id = s.record_id
      where r.club_id = p_club and s.completed_at is null and s.due_on < current_date
    ),
    'not_cleared', (select count(*) from public.injury_records where club_id = p_club and status <> 'cleared')
  )
  where public.is_club_senior(p_club) or exists (select 1 from public.injury_coach_team_ids(p_club))
$$;
grant execute on function public.injury_dashboard_summary(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Private storage bucket for medical documents (club-media is public and
--    unsafe for these — see the handover doc's explicit warning).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('injury-documents', 'injury-documents', false, 20971520) -- 20 MB/file
on conflict (id) do update set public = false;

drop policy if exists "injury-documents select" on storage.objects;
create policy "injury-documents select" on storage.objects
  for select to authenticated
  using (bucket_id = 'injury-documents' and public.can_access_injury_path(name));

drop policy if exists "injury-documents insert" on storage.objects;
create policy "injury-documents insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'injury-documents' and public.can_access_injury_path(name));

drop policy if exists "injury-documents delete" on storage.objects;
create policy "injury-documents delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'injury-documents' and public.can_access_injury_path(name));

-- ---------------------------------------------------------------------------
-- 7) Seed a placeholder template. DO NOT treat these day counts as medical
--    advice — this is a generic community-sport skeleton so the stage engine
--    has something to run against. Confirm real protocol content (stage
--    count, minimum days, who signs off) against your sport's governing body
--    before relying on it, then update these rows (no code change needed).
-- ---------------------------------------------------------------------------
insert into public.injury_stage_templates (key, name, injury_type, is_default, notes)
values (
  'generic_grtp_placeholder',
  'Graduated Return to Play (placeholder — confirm with governing body)',
  'concussion',
  true,
  'Seeded placeholder, not verified medical guidance. Replace stage counts/day minimums with your sport''s official protocol before relying on this in a real incident.'
)
on conflict (key) do nothing;

insert into public.injury_stage_template_items (template_id, stage_no, label, min_days_from_previous, requires_signoff)
select t.id, x.stage_no, x.label, x.min_days, true
from public.injury_stage_templates t
cross join (values
  (1, 'Rest — no activity until symptom-free', 1),
  (2, 'Light aerobic activity', 1),
  (3, 'Sport-specific exercise', 1),
  (4, 'Non-contact training drills', 1),
  (5, 'Full-contact practice (medical clearance required)', 1),
  (6, 'Return to play', 1)
) as x(stage_no, label, min_days)
where t.key = 'generic_grtp_placeholder'
on conflict (template_id, stage_no) do nothing;

-- ---------------------------------------------------------------------------
-- 8) Close the default PUBLIC execute/table grants (Postgres grants these to
--    PUBLIC on CREATE unless revoked — the security advisor flagged every
--    function above as anon-executable via PostgREST before this ran). The
--    internal auth.uid() checks already stop anon getting real data back,
--    but the doc requires "no anon access whatsoever" — revoke explicitly.
-- ---------------------------------------------------------------------------
revoke all on function public.injury_coach_team_ids(uuid) from public;
revoke all on function public.can_access_injury(uuid, uuid) from public;
revoke all on function public.can_access_injury_path(text) from public;
revoke all on function public.list_injury_records(uuid) from public;
revoke all on function public.get_injury_record(uuid) from public;
revoke all on function public.create_injury_record(uuid, uuid, text, date, text, text, uuid, text) from public;
revoke all on function public.update_injury_record(uuid, jsonb) from public;
revoke all on function public.complete_injury_stage(uuid, text) from public;
revoke all on function public.register_injury_document(uuid, text, text) from public;
revoke all on function public.injury_dashboard_summary(uuid) from public;

grant execute on function public.injury_coach_team_ids(uuid) to authenticated;
grant execute on function public.can_access_injury(uuid, uuid) to authenticated;
grant execute on function public.can_access_injury_path(text) to authenticated;
grant execute on function public.list_injury_records(uuid) to authenticated;
grant execute on function public.get_injury_record(uuid) to authenticated;
grant execute on function public.create_injury_record(uuid, uuid, text, date, text, text, uuid, text) to authenticated;
grant execute on function public.update_injury_record(uuid, jsonb) to authenticated;
grant execute on function public.complete_injury_stage(uuid, text) to authenticated;
grant execute on function public.register_injury_document(uuid, text, text) to authenticated;
grant execute on function public.injury_dashboard_summary(uuid) to authenticated;

revoke all on public.injury_records, public.injury_stages, public.injury_documents, public.injury_access_log, public.injury_stage_templates, public.injury_stage_template_items from public;
grant select, insert, update, delete on public.injury_records, public.injury_stages, public.injury_documents to authenticated;
grant select on public.injury_stage_templates, public.injury_stage_template_items, public.injury_access_log to authenticated;
