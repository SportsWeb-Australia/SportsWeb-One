-- ============================================================================
-- Compliance (WWCC) completion — document handling, risk RPC, launch step.
-- Repo path: supabase/compliance-completion.sql
-- Pairs with docs/compliance-completion-handover.md. Hand-applied via the
-- Supabase SQL editor / MCP (project uzibfawcwoapfbigpzum) — not `db push`.
-- Safe to re-run (idempotent).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) compliance_documents — metadata for uploaded evidence (WWCC card scans,
--    accreditation certificates, etc). Mirrors the volunteer_documents shape
--    already used elsewhere in this schema. compliance_records.document_id
--    was a dangling column (no FK, no table) — this gives it a home.
-- ----------------------------------------------------------------------------

create table if not exists public.compliance_documents (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  kind text,
  title text,
  storage_path text not null,
  status text not null default 'pending'
    check (status = any (array['pending','verified','rejected','archived'])),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists compliance_documents_person_idx on public.compliance_documents (person_id);
create index if not exists compliance_documents_club_idx on public.compliance_documents (club_id);

drop trigger if exists compliance_documents_touch on public.compliance_documents;
create trigger compliance_documents_touch
  before update on public.compliance_documents
  for each row execute function public.update_updated_at();

alter table public.compliance_documents enable row level security;

-- Same gate as compliance_records itself: platform admins, club_senior_admin,
-- club_admin. Governance evidence, not general club content.
drop policy if exists compliance_documents_admin_rw on public.compliance_documents;
create policy compliance_documents_admin_rw on public.compliance_documents
  using (
    public.is_platform_admin()
    or public.club_role(club_id) = any (array['club_senior_admin', 'club_admin'])
  )
  with check (
    public.is_platform_admin()
    or public.club_role(club_id) = any (array['club_senior_admin', 'club_admin'])
  );

grant select, insert, update, delete on table public.compliance_documents to authenticated;
grant select, insert, update, delete on table public.compliance_documents to service_role;

-- Give the dangling column an FK now that it has somewhere to point.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'compliance_records_document_id_fkey'
  ) then
    alter table public.compliance_records
      add constraint compliance_records_document_id_fkey
      foreign key (document_id) references public.compliance_documents(id) on delete set null;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2) Private storage bucket for compliance evidence. club-media is PUBLIC and
--    must never hold WWCC documents — this is a separate, private bucket.
--    Path convention: {club_id}/{person_id}/{timestamp}_{filename}.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('compliance-documents', 'compliance-documents', false, 20971520) -- 20 MB/file
on conflict (id) do update set public = false;

drop policy if exists "compliance-documents admin rw" on storage.objects;
create policy "compliance-documents admin rw" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'compliance-documents'
    and (
      public.is_platform_admin()
      or public.club_role(nullif((storage.foldername(name))[1], '')::uuid) = any (array['club_senior_admin', 'club_admin'])
    )
  )
  with check (
    bucket_id = 'compliance-documents'
    and (
      public.is_platform_admin()
      or public.club_role(nullif((storage.foldername(name))[1], '')::uuid) = any (array['club_senior_admin', 'club_admin'])
    )
  );

-- ----------------------------------------------------------------------------
-- 3) get_member_detail — surface document_id on each compliance record so the
--    UI knows there's a document to fetch a signed URL for.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_member_detail(p_club uuid, p_person uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_admin  boolean;
  v_result json;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) is not null) then
    raise exception 'not authorised to view this member';
  end if;

  v_admin := public.is_platform_admin()
             or public.club_role(p_club) in ('club_senior_admin', 'club_admin');

  select json_build_object(
    'profile', (
      select to_json(x) from (
        select p.id, p.full_name, p.first_name, p.last_name, p.email, p.mobile,
               p.date_of_birth, p.status, p.avatar_url, p.address, p.suburb,
               p.state, p.postcode, p.member_since, p.emergency_name,
               p.emergency_phone, p.notes, p.created_at,
               (p.date_of_birth is not null
                 and age(p.date_of_birth) < interval '18 years') as is_minor
          from public.people p
         where p.id = p_person and p.club_id = p_club
      ) x
    ),
    'roles', coalesce((
      select json_agg(r) from (
        select pr.id, pr.role, pr.sport, pr.committee_title, pr.status,
               pr.start_date, pr.end_date, pr.team_id, pr.season_id,
               t.name as team_name, s.name as season_name
          from public.person_roles pr
          left join public.teams   t on t.id = pr.team_id
          left join public.seasons s on s.id = pr.season_id
         where pr.person_id = p_person and pr.club_id = p_club
         order by pr.status, pr.role
      ) r
    ), '[]'::json),
    'relationships', coalesce((
      select json_agg(rel) from (
        select prl.id, prl.relationship,
               rp.id as related_id, rp.full_name as related_name,
               (rp.date_of_birth is not null
                 and age(rp.date_of_birth) < interval '18 years') as related_is_minor
          from public.person_relationships prl
          join public.people rp on rp.id = prl.related_person_id
         where prl.person_id = p_person and prl.club_id = p_club
         order by prl.relationship
      ) rel
    ), '[]'::json),
    'compliance', case when v_admin then coalesce((
      select json_agg(c) from (
        select cr.id, cr.check_type, cr.reference_no, cr.issued_on,
               cr.expires_on, cr.status, cr.document_id
          from public.compliance_records cr
         where cr.person_id = p_person and cr.club_id = p_club
         order by cr.expires_on nulls last
      ) c
    ), '[]'::json) else null end,
    'registrations', case when v_admin then coalesce((
      select json_agg(reg) from (
        select rg.id, rg.membership_label, rg.status, rg.payment_status,
               rg.amount_cents, rg.amount_paid_cents, rg.registered_at,
               se.name as season_name
          from public.registrations rg
          left join public.seasons se on se.id = rg.season_id
         where rg.person_id = p_person and rg.club_id = p_club
         order by rg.registered_at desc nulls last
      ) reg
    ), '[]'::json) else null end,
    'can_edit',            v_admin,
    'can_view_sensitive',  v_admin
  ) into v_result;

  return v_result;
end;
$function$;

-- Note: signed URLs for compliance-documents are generated client-side via
-- supabase.storage.from('compliance-documents').createSignedUrl(path, ttl) —
-- the "compliance-documents admin rw" storage policy above (FOR ALL, so it
-- covers SELECT) is what gates that call, same as compliance_documents RLS
-- gates the row lookup for the path. No separate signing RPC needed.

-- ----------------------------------------------------------------------------
-- 4) compliance_risk_count — the same missing/expired/expiring WWCC logic the
--    ComplianceReport UI computes client-side, as a single server-side count.
--    Powers the dashboard "Compliance risks" tile (roleKpis.ts) so it stops
--    reading volunteer_compliance_records, an unrelated table.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.compliance_risk_count(p_club uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin', 'club_admin')) then
    raise exception 'not authorised to view compliance risk for this club';
  end if;

  return (
  with child_facing as (
    select distinct p.id as person_id
      from public.people p
      join public.person_roles pr
        on pr.person_id = p.id and pr.club_id = p.club_id and pr.status = 'active'
     where p.club_id = p_club
       and pr.role in ('coach','assistant_coach','team_manager','trainer','committee','volunteer','official','administrator')
       and (p.date_of_birth is null or age(p.date_of_birth) >= interval '18 years')
  ),
  recs as (
    select cr.person_id,
      case
        when cr.status = 'expired' then 2
        when cr.expires_on is null then (case when cr.status = 'valid' then 0 else 1 end)
        when cr.expires_on < current_date then 2
        when cr.expires_on < current_date + 60 then 1
        else 0
      end as pri
    from public.compliance_records cr
    where cr.club_id = p_club and cr.check_type = 'wwcc' and cr.status <> 'rejected'
  ),
  best as (
    select cf.person_id, coalesce(min(recs.pri), 3) as pri
      from child_facing cf
      left join recs on recs.person_id = cf.person_id
     group by cf.person_id
  )
  select count(*)::int from best where pri > 0
  );
end;
$function$;

revoke all on function public.compliance_risk_count(uuid) from public;
grant execute on function public.compliance_risk_count(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 5) club_setup_status — add club.compliance auto-detection (at least one
--    compliance_records row on file for the club).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.club_setup_status(p_club_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_import     boolean := false;
  v_branding   boolean := false;
  v_style      boolean := false;
  v_homepage   boolean := false;
  v_teams      boolean := false;
  v_invite     boolean := false;
  v_compliance boolean := false;
begin
  -- Access guard: platform admins, or a member / role-holder of THIS club.
  if not (
    public.is_platform_admin()
    or exists (select 1 from public.club_users      where user_id = auth.uid() and club_id = p_club_id)
    or exists (select 1 from public.user_club_roles where user_id = auth.uid() and club_id = p_club_id)
  ) then
    raise exception 'Not authorised for this club';
  end if;

  -- club.import — site content is in (imported or entered).
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id
        and content_key in ('hero.title','about.body.0')
        and coalesce(value,'') <> ''
    ) into v_import;
  exception when others then v_import := false; end;

  -- club.branding — a logo has been set.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'branding.logo' and coalesce(value,'') <> ''
    ) into v_branding;
  exception when others then v_branding := false; end;

  -- club.style — a website style/variant has been chosen.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'site.variant' and coalesce(value,'') <> ''
    ) into v_style;
  exception when others then v_style := false; end;

  -- club.homepage — the hero headline is set.
  begin
    select exists (
      select 1 from public.club_content
      where club_id = p_club_id and content_key = 'hero.title' and coalesce(value,'') <> ''
    ) into v_homepage;
  exception when others then v_homepage := false; end;

  -- club.teams — at least one team exists.
  begin
    select exists (select 1 from public.teams where club_id = p_club_id) into v_teams;
  exception when others then v_teams := false; end;

  -- club.invite — at least one person record exists for the club.
  begin
    select exists (select 1 from public.people where club_id = p_club_id) into v_invite;
  exception when others then v_invite := false; end;

  -- club.compliance — at least one WWCC/compliance record is on file.
  begin
    select exists (select 1 from public.compliance_records where club_id = p_club_id) into v_compliance;
  exception when others then v_compliance := false; end;

  return json_build_object(
    'club.import',     v_import,
    'club.branding',   v_branding,
    'club.style',      v_style,
    'club.homepage',   v_homepage,
    'club.teams',      v_teams,
    'club.invite',     v_invite,
    'club.compliance', v_compliance
  );
end
$function$;

-- ----------------------------------------------------------------------------
-- 6) Launch checklist — club-audience step so new clubs are steered through
--    WWCC capture. Sits after club.invite (committee is in place, so there
--    are people to record checks against).
-- ----------------------------------------------------------------------------

insert into public.launch_step_catalog
  (step_key, phase_no, title, help_md, is_critical, access_level, sort, active, audience, expected_label, cta_route)
values
  ('club.compliance', 6, 'Record WWCC & compliance',
   'On each committee/coach profile, the Compliance tab records Working with Children Checks and accreditations with their expiry.',
   false, 'operator', 8, true, 'club', '≈ 10 min', 'compliance')
on conflict (step_key) do update set
  phase_no       = excluded.phase_no,
  title          = excluded.title,
  help_md        = excluded.help_md,
  sort           = excluded.sort,
  audience       = excluded.audience,
  expected_label = excluded.expected_label,
  cta_route      = excluded.cta_route;
