-- set-club-colours.sql
-- Controlled write for a club's brand colours (primary/secondary/tertiary on the
-- clubs row, read by deriveColours).
--
-- Run manually in the Supabase SQL Editor. Re-runnable (CREATE OR REPLACE).
--
-- Why an RPC: there is NO club_admin UPDATE policy on clubs — the only write
-- path is clubs_super_admin_all (is_super_admin()). So a direct
-- `update clubs set primary_colour=...` fails RLS for club admins. This
-- SECURITY DEFINER RPC is the single controlled write, mirroring
-- set_website_status: gated to the club's own admin or a platform admin, with
-- hex validation. primary_colour / secondary_colour are NOT NULL on clubs;
-- tertiary_colour is nullable.

create or replace function public.set_club_colours(
  p_club      uuid,
  p_primary   text,
  p_secondary text,
  p_tertiary  text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not (public.is_platform_admin() or public.is_club_admin(p_club)) then
    raise exception 'not authorised';
  end if;

  -- primary_colour and secondary_colour are NOT NULL on clubs.
  if p_primary is null or p_secondary is null then
    raise exception 'primary and secondary colours are required';
  end if;

  -- Validate each provided value as a 6-digit hex colour (#rrggbb). tertiary
  -- may be null (cleared), but if present it must be valid too.
  if p_primary   !~ '^#[0-9a-fA-F]{6}$'
     or p_secondary !~ '^#[0-9a-fA-F]{6}$'
     or (p_tertiary is not null and p_tertiary !~ '^#[0-9a-fA-F]{6}$') then
    raise exception 'colours must be 6-digit hex (e.g. #ed2129)';
  end if;

  update public.clubs
     set primary_colour   = p_primary,
         secondary_colour = p_secondary,
         tertiary_colour  = p_tertiary
   where id = p_club;

  if not found then
    raise exception 'club not found';
  end if;
end
$function$;

grant execute on function public.set_club_colours(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Sanity check (optional — run after applying):
--   select proname, prosecdef,
--          array(select r.rolname from pg_roles r
--                where has_function_privilege(r.rolname, p.oid, 'execute')
--                  and r.rolname in ('anon','authenticated','service_role')) as exec_roles
--   from pg_proc p where proname = 'set_club_colours';
--   -- Expect security_definer = true, executable by authenticated (not anon).
-- ---------------------------------------------------------------------------
