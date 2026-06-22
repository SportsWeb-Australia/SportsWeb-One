-- =====================================================================
-- Teams & Seasons admin
-- Admin-only, club-scoped RPCs for managing the seasons and teams that
-- member roles + registrations + the public website all read from.
-- Safe / additive. Run in the Supabase SQL Editor.
-- Relies on existing helpers: public.is_platform_admin(), public.club_role(uuid),
-- public.my_club_ids().
-- =====================================================================

-- ---------------------------------------------------------------------
-- SEASONS
-- ---------------------------------------------------------------------

-- Rich list for the admin manager (includes dates, unlike list_club_seasons).
create or replace function public.admin_list_seasons(p_club uuid)
returns table (id uuid, name text, sport text, start_date date, end_date date, is_current boolean)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.name, s.sport, s.start_date, s.end_date, s.is_current
    from public.seasons s
   where s.club_id = p_club
     and (public.is_platform_admin() or p_club in (select public.my_club_ids()))
   order by s.is_current desc, s.start_date desc nulls last, s.name;
$$;
grant execute on function public.admin_list_seasons(uuid) to authenticated;

create or replace function public.upsert_season(
  p_club uuid,
  p_id uuid,
  p_name text,
  p_sport text,
  p_start date,
  p_end date,
  p_is_current boolean
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_sport text := nullif(trim(p_sport), '');
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Season name is required';
  end if;

  if p_id is null then
    insert into public.seasons (club_id, name, sport, start_date, end_date, is_current)
    values (p_club, trim(p_name), v_sport, p_start, p_end, coalesce(p_is_current, false))
    returning id into v_id;
  else
    update public.seasons
       set name = trim(p_name),
           sport = v_sport,
           start_date = p_start,
           end_date = p_end,
           is_current = coalesce(p_is_current, false)
     where id = p_id and club_id = p_club
    returning id into v_id;
    if v_id is null then
      raise exception 'Season not found';
    end if;
  end if;

  -- Only one current season per club + sport.
  if coalesce(p_is_current, false) then
    update public.seasons
       set is_current = false
     where club_id = p_club
       and id <> v_id
       and coalesce(sport, '') = coalesce(v_sport, '');
  end if;

  return v_id;
end;
$$;
grant execute on function public.upsert_season(uuid, uuid, text, text, date, date, boolean) to authenticated;

create or replace function public.delete_season(p_club uuid, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;

  select count(*) into v_used from public.person_roles where season_id = p_id;
  if v_used > 0 then
    raise exception 'Cannot delete: % member role(s) use this season. End or reassign them first.', v_used;
  end if;

  select count(*) into v_used from public.registrations where season_id = p_id;
  if v_used > 0 then
    raise exception 'Cannot delete: % registration(s) use this season.', v_used;
  end if;

  delete from public.seasons where id = p_id and club_id = p_club;
end;
$$;
grant execute on function public.delete_season(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------
-- TEAMS
-- ---------------------------------------------------------------------

-- Rich list for the admin manager (grade, coach, status, order).
create or replace function public.admin_list_teams(p_club uuid)
returns table (
  id uuid, name text, sport text, age_group text, gender text,
  grade text, coach_name text, status text, display_order int
)
language sql
stable
security definer
set search_path = public
as $$
  select t.id, t.name, t.sport, t.age_group, t.gender,
         t.grade, t.coach_name, t.status, t.display_order
    from public.teams t
   where t.club_id = p_club
     and (public.is_platform_admin() or p_club in (select public.my_club_ids()))
   order by t.display_order nulls last, t.name;
$$;
grant execute on function public.admin_list_teams(uuid) to authenticated;

create or replace function public.upsert_team(
  p_club uuid,
  p_id uuid,
  p_name text,
  p_sport text,
  p_age_group text,
  p_gender text,
  p_grade text,
  p_coach text,
  p_status text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_slug text;
  v_ord int;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Team name is required';
  end if;

  if p_id is null then
    v_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
    if coalesce(v_slug, '') = '' then
      v_slug := 'team';
    end if;
    if exists (select 1 from public.teams where club_id = p_club and slug = v_slug) then
      v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
    end if;
    select coalesce(max(display_order), 0) + 1 into v_ord from public.teams where club_id = p_club;

    insert into public.teams (
      club_id, name, slug, sport, age_group, gender, grade, coach_name, status, display_order
    ) values (
      p_club, trim(p_name), v_slug,
      nullif(trim(p_sport), ''), nullif(trim(p_age_group), ''), nullif(trim(p_gender), ''),
      nullif(trim(p_grade), ''), nullif(trim(p_coach), ''),
      coalesce(nullif(trim(p_status), ''), 'draft'), v_ord
    )
    returning id into v_id;
  else
    update public.teams
       set name = trim(p_name),
           sport = nullif(trim(p_sport), ''),
           age_group = nullif(trim(p_age_group), ''),
           gender = nullif(trim(p_gender), ''),
           grade = nullif(trim(p_grade), ''),
           coach_name = nullif(trim(p_coach), ''),
           status = coalesce(nullif(trim(p_status), ''), status)
     where id = p_id and club_id = p_club
    returning id into v_id;
    if v_id is null then
      raise exception 'Team not found';
    end if;
  end if;

  return v_id;
end;
$$;
grant execute on function public.upsert_team(uuid, uuid, text, text, text, text, text, text, text) to authenticated;

create or replace function public.delete_team(p_club uuid, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int;
begin
  if not (public.is_platform_admin() or public.club_role(p_club) in ('club_senior_admin','club_admin')) then
    raise exception 'Not authorised';
  end if;

  select count(*) into v_used from public.person_roles where team_id = p_id;
  if v_used > 0 then
    raise exception 'Cannot delete: % member role(s) are linked to this team. Reassign them first.', v_used;
  end if;

  delete from public.teams where id = p_id and club_id = p_club;
end;
$$;
grant execute on function public.delete_team(uuid, uuid) to authenticated;
