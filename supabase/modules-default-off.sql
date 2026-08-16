-- ============================================================
-- Modules default to OFF for new clubs.
--
-- Both club-creation paths seeded ('volunteers', 'trial'), so every club ever
-- created started with Volunteer One switched on. Nothing reads
-- club_modules.trial_ends_at and nothing expires a trial, so that seed was in
-- practice a permanent free grant of a paid module.
--
-- These definitions are the live ones with the seed removed and nothing else
-- changed. Supersedes the club_modules seed in run-this.sql (admin_create_club)
-- and strip-seeding-and-demo-flag.sql (create_trial_club).
--
-- Existing clubs are deliberately untouched: this changes the DEFAULT for new
-- clubs, not entitlements already granted. Barnstoneworth United and Bor City FC
-- keep their 'volunteers'/'trial' rows and their sites are unaffected.
-- ============================================================

-- ------------------------------------------------------------
-- Super Admin → "+ New club"
-- ------------------------------------------------------------
create or replace function public.admin_create_club(
  p_name text, p_slug text, p_primary text default '#1F8CA7'::text,
  p_secondary text default '#111111'::text, p_tertiary text default null::text,
  p_contact text default null::text, p_sport text default 'other'::text,
  p_admin_email text default null::text)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_club  uuid;
  v_user  uuid;
  v_admin text := 'none';
  v_sport public.sport_type;
begin
  if not public.is_platform_admin() then raise exception 'not authorised'; end if;
  if p_slug is null or length(trim(p_slug)) = 0 then raise exception 'A slug is required'; end if;
  if exists (select 1 from public.clubs where slug = p_slug) then
    raise exception 'A club with the address "%" already exists', p_slug;
  end if;

  -- Safe enum cast: unknown/blank sports become 'other' rather than erroring.
  begin
    v_sport := nullif(trim(coalesce(p_sport, '')), '')::public.sport_type;
  exception when others then
    v_sport := 'other'::public.sport_type;
  end;
  if v_sport is null then v_sport := 'other'::public.sport_type; end if;

  insert into public.clubs (name, slug, sport_type, primary_colour, secondary_colour, tertiary_colour, contact_email)
  values (p_name, p_slug, v_sport, p_primary, p_secondary, p_tertiary, p_contact)
  returning id into v_club;

  -- No module seeding. Every module starts off; switch them on per club in
  -- Platform Admin → Clubs & modules.

  -- If the first senior admin already has an account, link them now.
  if p_admin_email is not null and length(trim(p_admin_email)) > 0 then
    select id into v_user from auth.users where lower(email) = lower(trim(p_admin_email)) limit 1;
    if v_user is not null then
      insert into public.user_club_roles (user_id, club_id, role)
      values (v_user, v_club, 'club_senior_admin')
      on conflict (user_id, club_id) do update set role = excluded.role;
      v_admin := 'linked';
    else
      v_admin := 'no_account';
    end if;
  end if;

  return json_build_object('club_id', v_club, 'slug', p_slug, 'admin', v_admin);
end $function$;

-- ------------------------------------------------------------
-- Public self-serve trial signup
-- ------------------------------------------------------------
create or replace function public.create_trial_club(
  p_name text, p_sport text default 'afl'::text, p_variant text default 'heritage'::text,
  p_email text default null::text, p_primary text default '#1F2A44'::text,
  p_secondary text default '#C8102E'::text)
returns json
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_club  uuid;
  v_base  text;
  v_slug  text;
  v_n     int := 1;
  v_sport sport_type;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'A club name is required';
  end if;
  if length(p_name) > 80 then
    raise exception 'That club name is too long';
  end if;
  if p_email is null or position('@' in p_email) = 0 or position('.' in p_email) = 0 then
    raise exception 'A valid email is required';
  end if;

  begin
    v_sport := p_sport::sport_type;
  exception when others then
    v_sport := 'other'::sport_type;
  end;

  v_base := regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g');
  v_base := trim(both '-' from v_base);
  if v_base = '' then v_base := 'club'; end if;
  v_slug := v_base;
  while exists (select 1 from public.clubs where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;

  insert into public.clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email,
                            is_trial, trial_started_at, trial_ends_at)
  values (trim(p_name), v_slug, v_sport, coalesce(p_primary,'#1F2A44'), coalesce(p_secondary,'#C8102E'),
          nullif(trim(coalesce(p_email,'')),''),
          true, now(), now() + interval '7 days')
  returning id into v_club;

  insert into public.club_content (club_id, content_key, value)
  values (v_club, 'site.variant', coalesce(nullif(trim(p_variant),''),'heritage'))
  on conflict (club_id, content_key) do update set value = excluded.value;

  -- No module seeding. The 7-day clock on clubs.trial_ends_at is the trial;
  -- module entitlements are granted deliberately, not handed out at signup.

  -- NO content seeding. The club starts empty and renders its honest empty states.

  return json_build_object('club_id', v_club, 'slug', v_slug, 'variant',
                           coalesce(nullif(trim(p_variant),''),'heritage'));
end
$function$;
