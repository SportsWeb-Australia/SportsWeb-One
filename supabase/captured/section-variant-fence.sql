-- ============================================================
-- CAPTURED FROM `develop` branch DB 2026-08-03 -- already exists; documentation/parity only.
-- Found live on the `develop` Supabase branch while applying f2-sidebar-layout.sql. NOT
-- referenced anywhere in this repo (git grep across all branches + this worktree found only
-- a prose mention in docs/codey-brief-10-the-design-layer.md:183 -- "The variant fence + drift
-- guard already cover the new enum" -- written as if the reader already knows this exists.
-- Whoever built this applied it directly to the DB and never captured the SQL to a file.
-- Idempotent. NOTE: the "no-op on prod" claim below was WRONG -- introspection on
-- 2026-08-17 found none of these four functions existed on production, so this file was
-- APPLIED to PRODUCTION that day (authorized by Carson). PageComposer calls
-- save_club_page_draft for every Save and Publish, so without it the composer could not
-- save at all. Record reality first per
-- docs/engineering-conventions.md sec 5 ("two sources of truth drift"; this was a THIRD case
-- -- a source of truth that existed in NO file at all, not even a stale one).
--
-- What this is: a fence between the Builder (Carson/Codey, sets structure/design) and the
-- Club Editor (a club member, edits content only) -- see engineering-conventions.md sec 3 --
-- enforced at the DATABASE layer, not just by UI convention. `_section_presentation_fields`
-- names which props of a section TYPE are "design", not "content" (currently: hero.layout,
-- news.layout, sponsors.display). `save_club_page_draft` is the RPC a club's own save
-- should call (NOT a direct `update club_pages set draft_layout = ...`, which is what
-- src/admin/PageComposer.tsx currently does, bypassing this fence entirely -- see the
-- open question this raises, noted in this session's chat, not resolved here).
--
-- A non-platform-admin caller who tries to change a fenced field's value (vs. what it was,
-- or vs. its default on a brand-new section) gets a hard error, not a silent revert. A
-- platform admin (Codey acting as Carson) is exempt -- the Builder can set structure freely.
-- ============================================================

CREATE OR REPLACE FUNCTION public._section_presentation_fields(sectype text)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case sectype
    when 'hero' then array['layout']::text[]
    when 'news' then array['layout']::text[]
    when 'sponsors' then array['display']::text[]
    else array[]::text[]
  end;
$function$;

CREATE OR REPLACE FUNCTION public._section_variant_default(sectype text, field text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case sectype || '.' || field
    when 'hero.layout' then 'centred'
    when 'news.layout' then 'grid'
    when 'sponsors.display' then 'strip'
    else null
  end;
$function$;

CREATE OR REPLACE FUNCTION public._section_variant_violation(new_sec jsonb, old_sec jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare
  f text;
  newv text;
begin
  foreach f in array coalesce(public._section_presentation_fields(new_sec->>'type'), array[]::text[])
  loop
    newv := new_sec #>> array['props', f];
    if old_sec is not null then
      if newv is distinct from (old_sec #>> array['props', f]) then
        return f;
      end if;
    else
      if newv is not null and newv is distinct from public._section_variant_default(new_sec->>'type', f) then
        return f;
      end if;
    end if;
  end loop;
  return null;
end;
$function$;

CREATE OR REPLACE FUNCTION public.save_club_page_draft(p_page_id uuid, p_layout jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_club uuid;
  v_old jsonb;
  v_out jsonb := coalesce(p_layout, '[]'::jsonb);
  new_sec jsonb;
  old_sec jsonb;
  bad text;
begin
  select club_id, draft_layout into v_club, v_old from public.club_pages where id = p_page_id;
  if v_club is null then
    raise exception 'page not found' using errcode = 'P0002';
  end if;
  if not (public.vm_is_club_member(v_club) or public.is_platform_admin()) then
    raise exception 'not authorised to edit this page' using errcode = '42501';
  end if;

  if not public.is_platform_admin() then
    for new_sec in select * from jsonb_array_elements(v_out)
    loop
      select e into old_sec
        from jsonb_array_elements(coalesce(v_old, '[]'::jsonb)) e
       where e->>'id' = new_sec->>'id'
       limit 1;
      bad := public._section_variant_violation(new_sec, old_sec);
      if bad is not null then
        raise exception 'Section variants are set by the platform (section %, field %)',
          new_sec->>'type', bad using errcode = '42501';
      end if;
    end loop;
  end if;

  update public.club_pages set draft_layout = v_out where id = p_page_id;
  return v_out;
end;
$function$;

-- Observation, not fixed here: save_club_page_draft is anon-executable (no explicit REVOKE),
-- unlike public_club_page/publish_club_page/revert_club_page which all explicitly
-- `revoke ... from public` before granting deliberately. Functionally safe today (an anon
-- caller has no club membership, so vm_is_club_member/is_platform_admin both fail) but
-- inconsistent with this repo's own pattern elsewhere. Worth tightening when this file is
-- properly adopted, not silently changed here.
