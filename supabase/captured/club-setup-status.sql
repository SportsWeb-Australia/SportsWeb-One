-- ============================================================
-- CAPTURED FROM PROD 2026-07-11 -- already exists; documentation/parity only.
-- club_setup_status(uuid): returns a per-club JSON checklist of setup signals,
-- gated to platform admins or a member/role-holder of the club. Idempotent.
-- Depends on: is_platform_admin(), club_users, user_club_roles, club_content,
-- teams, people.
-- ============================================================

CREATE OR REPLACE FUNCTION public.club_setup_status(p_club_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_import   boolean := false;
  v_branding boolean := false;
  v_style    boolean := false;
  v_homepage boolean := false;
  v_teams    boolean := false;
  v_invite   boolean := false;
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

  return json_build_object(
    'club.import',   v_import,
    'club.branding', v_branding,
    'club.style',    v_style,
    'club.homepage', v_homepage,
    'club.teams',    v_teams,
    'club.invite',   v_invite
  );
end
$function$;
