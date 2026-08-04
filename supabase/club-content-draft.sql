-- ============================================================
-- Sprint 4: draft -> preview -> publish for club_content.
-- Repo path: supabase/club-content-draft.sql
-- ------------------------------------------------------------
-- Today club_content edits go live instantly (AdminSiteEditor upserts `value`).
-- This adds a per-key draft layer that mirrors the already-shipped F2 club_pages
-- model (draft_layout/published_layout), so it is a known-good shape:
--   * club_content.draft_value  -- staged edit; NULL = no pending change.
--   * the editor writes draft_value (app change ships with this); the public keeps
--     reading the live `value`.
--   * preview / members / platform admins read coalesce(draft_value, value).
--   * publish_club_content(club) promotes draft_value -> value for a club.
--   * revert_club_content(club) discards staged drafts.
--
-- Safe + reversible: draft_value starts NULL, so coalesce falls back to the live
-- value and NOTHING changes until the editor is flipped to write draft_value.
-- Apply this migration first; the app change (writing draft_value) ships after.
--
-- APPLIED TO PROD 2026-08-04 - verified via DB introspection; do NOT re-run
-- (see docs/migration-ledger.md). Pure ASCII, re-runnable. Keys off club_id.
-- ============================================================

-- 1. Draft column (nullable; existing rows unaffected).
alter table public.club_content add column if not exists draft_value text;

-- 2. Read RPC: serve the DRAFT to preview/members/admins, the LIVE value to the
--    public. Replaces the single-branch return with a v_published / v_preview
--    split (same idea as F2's public_club_page).
create or replace function public.public_club_content(p_club_id uuid, p_preview_token text default null)
returns table (content_key text, value text)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_published boolean := false;
  v_preview   boolean := false;
  v_token     uuid;
begin
  if p_club_id is null then
    return; -- zero rows, no error
  end if;

  -- published club -> visible to the public (live value)
  select exists (
    select 1 from public.clubs
    where id = p_club_id and website_status = 'published'
  ) into v_published;

  -- valid, non-expired preview token for this club -> draft view
  if p_preview_token is not null then
    begin
      v_token := p_preview_token::uuid;
    exception when others then
      v_token := null; -- malformed token -> treat as absent
    end;
    if v_token is not null then
      select exists (
        select 1 from public.clubs
        where id = p_club_id
          and preview_token = v_token
          and (preview_token_expires_at is null or now() < preview_token_expires_at)
      ) into v_preview;
    end if;
  end if;

  -- authenticated member of this club, or a platform admin -> draft view
  if not v_preview then
    v_preview := public.is_platform_admin()
      or exists (select 1 from public.club_users where user_id = auth.uid() and club_id = p_club_id);
  end if;

  if not (v_published or v_preview) then
    return; -- zero rows; never leak club existence
  end if;

  return query
    select cc.content_key,
           case when v_preview then coalesce(cc.draft_value, cc.value) else cc.value end
    from public.club_content cc
    where cc.club_id = p_club_id;
end;
$$;

grant execute on function public.public_club_content(uuid, text) to anon, authenticated;

-- 3. Publish staged content: promote draft_value -> value for a club, clear drafts.
--    Membership-checked (same gate as the club_content member_write policy).
create or replace function public.publish_club_content(p_club_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_n integer;
begin
  if p_club_id is null then
    raise exception 'A club id is required';
  end if;
  if not (public.is_platform_admin() or p_club_id in (select my_club_ids())) then
    raise exception 'Not authorized for this club';
  end if;

  update public.club_content
     set value = coalesce(draft_value, value),
         draft_value = null,
         updated_at = now()
   where club_id = p_club_id
     and draft_value is not null;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

grant execute on function public.publish_club_content(uuid) to authenticated;

-- 4. Discard staged content changes for a club (revert to live).
create or replace function public.revert_club_content(p_club_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_n integer;
begin
  if p_club_id is null then
    raise exception 'A club id is required';
  end if;
  if not (public.is_platform_admin() or p_club_id in (select my_club_ids())) then
    raise exception 'Not authorized for this club';
  end if;

  update public.club_content
     set draft_value = null,
         updated_at = now()
   where club_id = p_club_id
     and draft_value is not null;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

grant execute on function public.revert_club_content(uuid) to authenticated;

-- ------------------------------------------------------------
-- After applying, verify:
--   * \d public.club_content  -> draft_value column present.
--   * as anon:   select * from public_club_content('<published club>');  -> live values
--   * as member: select * from public_club_content('<your club>');       -> coalesce(draft,value)
--   * update one club_content row's draft_value, then:
--       select publish_club_content('<club>');  -> N; value now = draft; draft_value null
-- ============================================================
