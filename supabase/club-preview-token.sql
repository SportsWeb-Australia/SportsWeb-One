-- ============================================================
-- Shareable read-only draft preview: per-club preview token + read/rotate RPCs.
-- Repo path: supabase/club-preview-token.sql
-- ------------------------------------------------------------
-- Lets a non-admin reviewer open a DRAFT club site via an unguessable link
-- (?preview=<token>), no login, read-only, and leave SitePulse feedback. No RLS
-- widening: anon still cannot select a draft clubs row directly. The read RPC is
-- SECURITY DEFINER and returns ONLY the public-site columns loadClub uses -- never
-- account/plan/drive/token or any other private field -- and only for a matching,
-- unexpired token.
--
-- NOT YET APPLIED. Author + show only. Run in the Supabase SQL Editor once Carson
-- authorizes THIS file. Pure ASCII, re-runnable. Keys off club_id.
-- ============================================================

-- 1. Per-club token (MVP: columns on clubs; a club_preview_tokens table is the
--    scalable version later). Default gives every club a token immediately.
alter table public.clubs
  add column if not exists preview_token uuid not null default gen_random_uuid(),
  add column if not exists preview_token_expires_at timestamptz;

-- 2. Resolve a draft club by preview token -> the PUBLIC-SITE config columns only.
--    Returns jsonb (or null) to avoid coupling to column types (e.g. the
--    website_status enum). Never returns other clubs or private fields.
create or replace function public.get_club_by_preview_token(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(x) from (
    select c.id, c.slug, c.name, c.sport_type,
           c.primary_colour, c.secondary_colour, c.tertiary_colour,
           c.logo_url, c.address, c.phone, c.contact_email,
           c.facebook_url, c.instagram_url,
           c.selected_template_id,
           c.website_status
           -- is_trial / trial_ends_at deliberately excluded: reviewers must not
           -- see trial status. loadClub forces is_trial=false in preview mode.
    from public.clubs c
    where p_token is not null
      and c.preview_token = p_token
      and (c.preview_token_expires_at is null or now() < c.preview_token_expires_at)
  ) x;
$$;

grant execute on function public.get_club_by_preview_token(uuid) to anon, authenticated;

-- 3. Rotate a club's preview token (invalidates the old link), with optional expiry.
--    Gated to an admin of THAT club. Returns the new token.
create or replace function public.rotate_club_preview_token(p_club_id uuid, p_expires_at timestamptz default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_token uuid;
begin
  if not (is_platform_admin() or is_super_admin() or is_club_admin(p_club_id)) then
    raise exception 'not authorized';
  end if;
  update public.clubs
     set preview_token = gen_random_uuid(),
         preview_token_expires_at = p_expires_at
   where id = p_club_id
   returning preview_token into v_token;
  return v_token;
end;
$$;

grant execute on function public.rotate_club_preview_token(uuid, timestamptz) to authenticated;

-- ------------------------------------------------------------
-- After applying, verify:
--   select get_club_by_preview_token('<a real token>');            -> the club json
--   select get_club_by_preview_token(gen_random_uuid());           -> null (wrong token)
--   -- anon direct read of a draft row still denied (RLS unchanged).
-- ============================================================
