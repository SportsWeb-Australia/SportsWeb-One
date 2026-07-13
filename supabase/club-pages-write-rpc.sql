-- ============================================================
-- F2 P3 -- SAVE RPC + SAVE-PATH VARIANT FENCE (design doc 7b)
-- Every write to club_pages is now an RPC -- save_club_page_draft, publish_club_page,
-- revert_club_page, restore_club_page_version. The table is not an API. This adds the draft-save
-- path and revokes direct UPDATE(draft_layout), so the ONLY way to write a draft is the RPC, which
-- forces platform-controlled PRESENTATION variants (hero.layout, news.layout, sponsors.display) to
-- their stored-or-default value for a non-platform-admin. A club admin PATCHing draft_layout
-- directly cannot set a variant the composer never offered them.
--
-- DEPENDS ON supabase/generated/variant-fence.gen.sql (the variant map, generated from
-- src/sections/presentation-fields.json). Apply that file FIRST.
--
-- BRANCH WORK. Apply + verify on develop (UI, both a club_admin and a platform_admin seed user);
-- promote to prod ONLY via an authorised merge, and the composer's RPC call ships WITH it.
-- ============================================================

-- For ONE section, return the first presentation field a non-admin is illegally changing, or NULL.
-- REJECT, never rewrite: a club admin cannot reach a variant field through the composer, so the
-- only way to trigger this is a deliberate direct PATCH -- that earns an error, not a silent
-- correction that tells the user a save happened when it did not.
--   existing section -> the value must round-trip exactly (no change, no removal)
--   new section       -> the field may be absent (renderer uses the default) or equal the default;
--                        anything else is a club setting a variant the platform never offered.
create or replace function public._section_variant_violation(new_sec jsonb, old_sec jsonb)
returns text language plpgsql immutable as $$
declare
  f text;
  newv text;
begin
  foreach f in array coalesce(public._section_presentation_fields(new_sec->>'type'), array[]::text[])
  loop
    newv := new_sec #>> array['props', f];   -- null if absent
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
$$;

-- The only draft write path. Non-admins are VALIDATED (raise on any variant change); the layout is
-- then written verbatim. Returns the stored layout so the composer reflects exactly what was saved.
create or replace function public.save_club_page_draft(p_page_id uuid, p_layout jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
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

  -- Platform admins have design authority; everyone else may not touch section variants.
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
$$;

revoke all on function public.save_club_page_draft(uuid, jsonb) from public;
grant execute on function public.save_club_page_draft(uuid, jsonb) to authenticated;

-- Close the direct path: the RPC is now the only way to write a draft.
revoke update (draft_layout) on public.club_pages from authenticated;
