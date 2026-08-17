-- ============================================================================
-- Per-club compliance requirement overrides.
-- Repo path: supabase/compliance-club-requirements.sql
-- Lets a club turn a role/check-type requirement on or off for themselves,
-- overriding the platform default matrix in src/lib/complianceTypes.ts
-- (PLATFORM_REQUIRED_ROLES). A club with no override rows behaves exactly
-- like before this file. Merge rule (mirrored in TS as computeEffectiveRequirements
-- and here in SQL as `requirements`/`req` CTEs):
--   effective = platform defaults
--               MINUS any (role, check_type) explicitly overridden required=false
--               PLUS  any (role, check_type) explicitly overridden required=true
-- Hand-applied via the Supabase SQL editor / MCP (project uzibfawcwoapfbigpzum).
-- Safe to re-run (idempotent).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) club_compliance_requirements table
-- ----------------------------------------------------------------------------

create table if not exists public.club_compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  role text not null,
  check_type text not null,
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id, role, check_type)
);

create index if not exists club_compliance_requirements_club_idx on public.club_compliance_requirements (club_id);

drop trigger if exists club_compliance_requirements_touch on public.club_compliance_requirements;
create trigger club_compliance_requirements_touch
  before update on public.club_compliance_requirements
  for each row execute function public.update_updated_at();

alter table public.club_compliance_requirements enable row level security;

-- Same gate as compliance_records itself.
drop policy if exists club_compliance_requirements_admin_rw on public.club_compliance_requirements;
create policy club_compliance_requirements_admin_rw on public.club_compliance_requirements
  using (
    public.is_platform_admin()
    or public.club_role(club_id) = any (array['club_senior_admin', 'club_admin'])
  )
  with check (
    public.is_platform_admin()
    or public.club_role(club_id) = any (array['club_senior_admin', 'club_admin'])
  );

grant select, insert, update, delete on table public.club_compliance_requirements to authenticated;
grant select, insert, update, delete on table public.club_compliance_requirements to service_role;

-- ----------------------------------------------------------------------------
-- 2) compliance_risk_count — now merges platform defaults with this club's
--    overrides before counting who's at risk.
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
  with platform_defaults(role, check_type) as (
    values
      ('coach','wwcc'), ('assistant_coach','wwcc'), ('team_manager','wwcc'), ('trainer','wwcc'),
      ('committee','wwcc'), ('volunteer','wwcc'), ('official','wwcc'), ('administrator','wwcc'),
      ('coach','coach_accreditation'), ('assistant_coach','coach_accreditation'),
      ('trainer','trainer_accreditation'),
      ('trainer','first_aid'),
      ('official','official_accreditation'),
      ('committee','safeguarding'), ('administrator','safeguarding')
  ),
  overrides as (
    select role, check_type, required from public.club_compliance_requirements where club_id = p_club
  ),
  requirements as (
    select pd.role, pd.check_type
      from platform_defaults pd
     where not exists (
       select 1 from overrides o where o.role = pd.role and o.check_type = pd.check_type and o.required = false
     )
    union
    select o.role, o.check_type from overrides o where o.required = true
  ),
  required_pairs as (
    select distinct p.id as person_id, req.check_type
      from public.people p
      join public.person_roles pr on pr.person_id = p.id and pr.club_id = p.club_id and pr.status = 'active'
      join requirements req on req.role = pr.role
     where p.club_id = p_club
       and (p.date_of_birth is null or age(p.date_of_birth) >= interval '18 years')
  ),
  recs as (
    select cr.person_id, cr.check_type,
      case
        when cr.status = 'expired' then 2
        when cr.expires_on is null then (case when cr.status = 'valid' then 0 else 1 end)
        when cr.expires_on < current_date then 2
        when cr.expires_on < current_date + 60 then 1
        else 0
      end as pri
    from public.compliance_records cr
    where cr.club_id = p_club and cr.status <> 'rejected'
  ),
  pair_best as (
    select rp.person_id, rp.check_type, coalesce(min(recs.pri), 3) as pri
      from required_pairs rp
      left join recs on recs.person_id = rp.person_id and recs.check_type = rp.check_type
     group by rp.person_id, rp.check_type
  ),
  person_worst as (
    select person_id, max(pri) as pri from pair_best group by person_id
  )
  select count(*)::int from person_worst where pri > 0
  );
end;
$function$;

revoke all on function public.compliance_risk_count(uuid) from public;
grant execute on function public.compliance_risk_count(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 3) compliance_alert_targets — same merge, per club (lateral, since this
--    function scans every club in one pass rather than taking p_club).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.compliance_alert_targets()
 RETURNS TABLE (
   club_id uuid,
   club_name text,
   club_slug text,
   recipient_email text,
   at_risk json
 )
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with platform_defaults(role, check_type) as (
    values
      ('coach','wwcc'), ('assistant_coach','wwcc'), ('team_manager','wwcc'), ('trainer','wwcc'),
      ('committee','wwcc'), ('volunteer','wwcc'), ('official','wwcc'), ('administrator','wwcc'),
      ('coach','coach_accreditation'), ('assistant_coach','coach_accreditation'),
      ('trainer','trainer_accreditation'),
      ('trainer','first_aid'),
      ('official','official_accreditation'),
      ('committee','safeguarding'), ('administrator','safeguarding')
  ),
  required_pairs as (
    select distinct p.id as person_id, p.club_id, p.full_name, req.check_type
      from public.people p
      join public.person_roles pr on pr.person_id = p.id and pr.club_id = p.club_id and pr.status = 'active'
      cross join lateral (
        select pd.check_type
          from platform_defaults pd
         where pd.role = pr.role
           and not exists (
             select 1 from public.club_compliance_requirements o
              where o.club_id = p.club_id and o.role = pr.role and o.check_type = pd.check_type and o.required = false
           )
        union
        select o.check_type
          from public.club_compliance_requirements o
         where o.club_id = p.club_id and o.role = pr.role and o.required = true
      ) req
     where (p.date_of_birth is null or age(p.date_of_birth) >= interval '18 years')
  ),
  recs as (
    select cr.person_id, cr.check_type,
      case
        when cr.status = 'expired' then 'expired'
        when cr.expires_on is null then (case when cr.status = 'valid' then 'valid' else 'expiring' end)
        when cr.expires_on < current_date then 'expired'
        when cr.expires_on < current_date + 60 then 'expiring'
        else 'valid'
      end as state,
      cr.expires_on
    from public.compliance_records cr
    where cr.status <> 'rejected'
  ),
  pair_best as (
    select rp.club_id, rp.person_id, rp.full_name, rp.check_type,
      coalesce(
        (array_agg(recs.state order by
          case recs.state when 'valid' then 0 when 'expiring' then 1 when 'expired' then 2 end
        ) filter (where recs.state is not null))[1],
        'missing'
      ) as state,
      min(recs.expires_on) filter (where recs.state in ('expiring','expired')) as expires_on
    from required_pairs rp
    left join recs on recs.person_id = rp.person_id and recs.check_type = rp.check_type
    group by rp.club_id, rp.person_id, rp.full_name, rp.check_type
  ),
  at_risk_pairs as (
    select club_id, person_id, full_name, check_type, state, expires_on
      from pair_best
     where state in ('missing','expired','expiring')
  ),
  club_risk as (
    select club_id,
           json_agg(
             json_build_object('name', full_name, 'check_type', check_type, 'state', state, 'expires_on', expires_on)
             order by case state when 'expired' then 0 when 'missing' then 1 when 'expiring' then 2 end, full_name, check_type
           ) as at_risk
      from at_risk_pairs
     group by club_id
  ),
  recipients as (
    select ucr.club_id, ucr.user_id from public.user_club_roles ucr where ucr.role = 'club_senior_admin'
    union
    select cu.club_id, cu.user_id from public.club_users cu where cu.role = 'super_admin'
  )
  select c.id, c.name, c.slug, u.email::text, cr.at_risk
    from club_risk cr
    join public.clubs c on c.id = cr.club_id
    join recipients r on r.club_id = cr.club_id
    join auth.users u on u.id = r.user_id and u.email is not null
   where coalesce(c.is_demo, false) is not true;
$function$;

revoke all on function public.compliance_alert_targets() from public;
grant execute on function public.compliance_alert_targets() to service_role;
