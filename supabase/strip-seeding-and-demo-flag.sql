-- ============================================================
-- Rule 9 at the source: stop manufacturing data. Repo: supabase/strip-seeding-and-demo-flag.sql
-- Built against docs/F2-design-doc.md sec 5 (rule 9 extended) + Codey Brief 09.
-- ------------------------------------------------------------
-- The seeding audit (Brief 08) found the platform manufactures fiction at club creation:
-- create_trial_club() seeds 16 fabricated content rows into every new trial club, and
-- supabase/demo-seed.sql seeds the 13-club demo estate. This migration draws the line
-- Brief 09 decided: provenance at the TENANT, not the row.
--
--   clubs.is_demo = true  -> Carson's showcase. Fabricated content is fine; it is honestly
--                            labelled as a demo. Always noindex (folds into per-club SEO).
--   clubs.is_demo = false -> a real tenant (trial or paying). Starts EMPTY. Only ever holds
--                            what a human put there. Renders the honest empty states.
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name. Pure ASCII.
-- Depends on: clubs, sport_type enum. Run BEFORE re-running demo-seed.sql (its guard needs
-- is_demo to exist).
-- ============================================================

-- 1. Provenance at the tenant. A club is a real tenant or a demo -- there is no third kind.
alter table public.clubs add column if not exists is_demo boolean not null default false;

-- 2. Mark the demo estate. These 13 are supabase/demo-seed.sql's clubs -- fabricated content
--    is now honestly labelled. Do NOT empty or delete them; the flag is what makes their
--    content honest. (Barnestoneworth + Bor City are already empty; leave them false.)
--    Dookie is deliberately NOT included -- Carson confirmed it is a REAL club (in draft),
--    is_demo = false. Its rows are hand-entered (audited), not seed fingerprint.
update public.clubs set is_demo = true
where slug in (
  'northside-lions','eastside-united','riverside-cricket','parkville-netball',
  'metro-city-basketball','bayside-lacrosse','brighton-rugby','riverstone-rugby-league',
  'sunset-oztag','coastal-touch','westvale-juniors','vintage-masters','lakes-united-fnc'
);

-- 3. Strip ALL content seeding from the live trial path. A new trial club is created with
--    its clubs row, its site.variant config, and its module entitlement -- and NOTHING else.
--    It renders the honest empty states (built in Brief 06/07 B2/B3). This is the whole
--    change: the three news / two events / two sponsors / four teams / four matches / five
--    ladder inserts are gone. Everything else (validation, slug, clubs insert, variant,
--    volunteer module, return shape) is unchanged from the audited version.
create or replace function public.create_trial_club(
  p_name text,
  p_sport text default 'afl',
  p_variant text default 'heritage',
  p_email text default null,
  p_primary text default '#1F2A44',
  p_secondary text default '#C8102E'
)
returns json
language plpgsql
security definer
set search_path to 'public', pg_temp
as $function$
declare
  v_club  uuid;
  v_base  text;
  v_slug  text;
  v_n     int := 1;
  v_sport sport_type;
begin
  -- Minimal validation (public endpoint).
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'A club name is required';
  end if;
  if length(p_name) > 80 then
    raise exception 'That club name is too long';
  end if;
  if p_email is null or position('@' in p_email) = 0 or position('.' in p_email) = 0 then
    raise exception 'A valid email is required';
  end if;

  -- Sport must be a real enum value; fall back to other if unknown.
  begin
    v_sport := p_sport::sport_type;
  exception when others then
    v_sport := 'other'::sport_type;
  end;

  -- Unique slug from the club name.
  v_base := regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g');
  v_base := trim(both '-' from v_base);
  if v_base = '' then v_base := 'club'; end if;
  v_slug := v_base;
  while exists (select 1 from public.clubs where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;

  -- Create the club, flagged as a 7-day trial. is_demo defaults false: a trial is a REAL
  -- prospect's club and starts empty.
  insert into public.clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email,
                            is_trial, trial_started_at, trial_ends_at)
  values (trim(p_name), v_slug, v_sport, coalesce(p_primary,'#1F2A44'), coalesce(p_secondary,'#C8102E'),
          nullif(trim(coalesce(p_email,'')),''),
          true, now(), now() + interval '7 days')
  returning id into v_club;

  -- Assigned template variant (read by loadClub via club_content). Config, not content.
  insert into public.club_content (club_id, content_key, value)
  values (v_club, 'site.variant', coalesce(nullif(trim(p_variant),''),'heritage'))
  on conflict (club_id, content_key) do update set value = excluded.value;

  -- Volunteer Manager on trial, consistent with admin_create_club. Entitlement, not content.
  insert into public.club_modules (club_id, module_key, status)
  values (v_club, 'volunteers', 'trial')
  on conflict (club_id, module_key) do update set status = excluded.status;

  -- NO content seeding. The club starts empty and renders its honest empty states.
  -- Getting REAL data in fast is onboarding's job (AI Import, P7) -- not a seed's.

  return json_build_object('club_id', v_club, 'slug', v_slug, 'variant',
                           coalesce(nullif(trim(p_variant),''),'heritage'));
end
$function$;

-- ------------------------------------------------------------
-- FOLLOW-UPS (not in this migration):
--   * noindex: DONE in-app in this same PR -- App.tsx emits robots noindex when
--     ClubConfig.isDemo (plumbed from clubs.is_demo). The per-HOST edge <head> injection
--     for non-JS scrapers still rides with the per-club SEO work (P0, next after P2).
--   * Dookie United (dookie-united): confirmed a REAL club (is_demo=false). One stray
--     published "Test" news row is a human test artifact (not platform fiction); the club
--     may want to remove it. Not touched here.
--   * The fabricated rows already sitting in the 13 demo clubs stay -- they are now honestly
--     labelled by is_demo. Nothing to clean.
--
-- After applying, verify:
--   * clubs.is_demo exists; the 13 demo clubs are true; Barnestoneworth/Bor City false.
--   * create_trial_club(...) creates a club with 0 news/events/sponsors/teams/matches/ladder.
--   * a fresh trial site renders the empty states, no fabricated fixtures.
-- ============================================================
