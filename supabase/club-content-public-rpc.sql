-- ============================================================
-- Brief 01: lock club_content + unified public read RPC.
-- Repo path: supabase/club-content-public-rpc.sql
-- ------------------------------------------------------------
-- Supersedes the interim fix in supabase/club-content-preview-leak.sql (already
-- applied): that closed the authenticated cross-club leak by making the public
-- read published-only and added a token-only RPC. THIS migration completes the
-- design: no direct public read at all -- every public/preview read goes through
-- one SECURITY DEFINER RPC that decides access server-side. This is also the shape
-- the club_pages public read will take in F2, so it is not throwaway.
--
-- End state:
--   * club_content is readable DIRECTLY only by club_users of that club_id or a
--     platform admin (the member_write ALL policy already covers this).
--   * anon has no direct access at all.
--   * public_club_content(p_club_id, p_preview_token) returns content rows when the
--     caller is allowed (published OR valid token OR member OR platform admin),
--     and ZERO rows otherwise (never leaks existence).
--
-- NOT YET APPLIED. Author + show only. Apply in the Supabase SQL Editor once
-- authorized by name. Pure ASCII, re-runnable. Keys off club_id.
-- ============================================================

-- 1. Remove the direct public read entirely (was published-only after the interim
--    fix). Members/admins keep direct access via club_content_member_write (ALL,
--    is_platform_admin() OR club_id IN my_club_ids()); leave that policy untouched.
drop policy if exists club_content_public_read on public.club_content;

-- 2. Belt-and-suspenders: ensure anon cannot select the table directly.
--    (anon already has no grant on club_content; this makes the intent explicit.)
revoke select on public.club_content from anon;

-- 3. The one public read path. SECURITY DEFINER so it can read past RLS for an
--    allowed caller only. Returns just (content_key, value) -- no internal columns.
create or replace function public.public_club_content(p_club_id uuid, p_preview_token text default null)
returns table (content_key text, value text)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_allowed boolean := false;
  v_token   uuid;
begin
  if p_club_id is null then
    return; -- zero rows, no error
  end if;

  -- (a) published club -> public
  select exists (
    select 1 from public.clubs
    where id = p_club_id and website_status = 'published'
  ) into v_allowed;

  -- (b) valid, non-expired preview token for this club (suspended/draft included)
  if not v_allowed and p_preview_token is not null then
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
      ) into v_allowed;
    end if;
  end if;

  -- (c) authenticated member of this club, or a platform admin
  if not v_allowed then
    v_allowed := public.is_platform_admin()
      or exists (select 1 from public.club_users where user_id = auth.uid() and club_id = p_club_id);
  end if;

  if not v_allowed then
    return; -- zero rows; do not leak club existence
  end if;

  return query
    select cc.content_key, cc.value
    from public.club_content cc
    where cc.club_id = p_club_id;
end;
$$;

grant execute on function public.public_club_content(uuid, text) to anon, authenticated;

-- Note: get_club_content_by_preview_token (the interim token-only RPC) is left in
-- place so the front end's transitional fallback keeps working; it can be dropped
-- in a later cleanup once public_club_content is confirmed live.

-- ------------------------------------------------------------
-- After applying, verify with a RAW ANON KEY against REST (see the brief's
-- checklist). Quick server-side sanity:
--   select * from public_club_content('<published club>');            -> rows
--   select * from public_club_content('<draft club>');                -> 0 rows
--   select * from public_club_content('<draft club>', '<valid token>')-> rows
--   select * from public_club_content('<draft club>', 'not-a-uuid');  -> 0 rows
-- ============================================================
