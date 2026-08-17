-- ============================================================================
-- Compliance — extend beyond WWCC-only. Follow-up to compliance-completion.sql.
-- Repo path: supabase/compliance-check-types.sql
-- Mirrors the role -> required-check-type matrix in
-- src/lib/complianceTypes.ts (REQUIRED_ROLES) — keep the two in sync.
-- Hand-applied via the Supabase SQL editor / MCP (project uzibfawcwoapfbigpzum).
-- Safe to re-run (idempotent).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- compliance_risk_count — was WWCC-only; now "at risk" = any role-required
-- check (WWCC, coach/trainer accreditation, first aid, official accreditation,
-- safeguarding) that's missing, expired, or expiring for that person. Counted
-- per person (worst check wins), matching the report's own "N people need
-- attention" framing.
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
  with requirements(role, check_type) as (
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
-- compliance_alert_targets — same requirement matrix; at_risk now lists every
-- missing/expired/expiring required check per person (not just WWCC), e.g.
-- {"name":"Mark Davies","check_type":"coach_accreditation","state":"expired","expires_on":"..."}
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
  with requirements(role, check_type) as (
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
      join requirements req on req.role = pr.role
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

-- ----------------------------------------------------------------------------
-- Launch checklist copy — was WWCC-specific, now the register covers more.
-- ----------------------------------------------------------------------------

update public.launch_step_catalog
set title = 'Record compliance checks',
    help_md = 'On each committee/coach profile, the Compliance tab records Working with Children Checks, accreditations and other checks with their expiry.'
where step_key = 'club.compliance';
