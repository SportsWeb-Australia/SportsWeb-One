-- ============================================================
-- F2 P3 -- THEME-SELECTION FENCE (design doc 7a/7b)
-- Decision: a CURATED SHORTLIST, not platform-only. A club picks among designed themes (each
-- adapts to their brand colours -- they cannot make an ugly site); the PLATFORM controls which
-- themes are on the menu. Same shape as publish_club_page: an RPC is the only write path, and the
-- direct column write is revoked (see clubs-column-grants.sql, applied together).
--
-- BRANCH WORK. Apply + verify on the develop branch (through the authenticated UI, both a
-- club_admin and a platform_admin seed user). Promote to production ONLY via an authorised merge.
-- ============================================================

-- 1. The platform controls the menu.
alter table public.club_themes
  add column if not exists is_selectable boolean not null default false;

-- 2. The ONLY path to change a club's theme.
create or replace function public.set_club_theme(p_club_id uuid, p_theme_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Caller must belong to the club (or be a platform admin).
  if not (public.vm_is_club_member(p_club_id) or public.is_platform_admin()) then
    raise exception 'not authorised to change this club''s theme' using errcode = '42501';
  end if;
  -- The theme must exist AND be on the curated menu. Even a platform admin is bound to selectable
  -- themes HERE -- WIP / client-specific / experimental themes are assigned by other admin tooling,
  -- never by this club-facing picker. That is what keeps client_themes safe to hold experiments.
  if not exists (
    select 1 from public.club_themes where key = p_theme_key and is_selectable = true
  ) then
    raise exception 'theme % is not available for selection', p_theme_key using errcode = '22023';
  end if;
  update public.clubs set theme_key = p_theme_key where id = p_club_id;
end;
$$;

revoke all on function public.set_club_theme(uuid, text) from public;
grant execute on function public.set_club_theme(uuid, text) to authenticated;

-- 3. Seed the curated menu: the 8 Classic-backed token sets that exist today.
--    (NOTE: 'heritage' currently has empty tokens {} -- confirm it is intended-live before launch.)
update public.club_themes
   set is_selectable = true
 where key in ('arena','broadcast','classic','coastal','editorial','heritage','momentum','stadium');
