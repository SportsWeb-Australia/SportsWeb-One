-- ============================================================
-- F2 P3 -- CLUBS GRANT RESHAPE (design doc 7a/7b)
-- Finding: `authenticated` held TABLE-LEVEL update + delete on public.clubs, so a club admin could
-- write plan / account_status / is_demo / is_trial / subscription_status / stripe_* / slug /
-- sport_type / theme_overrides, and DELETE their own club row -- subject only to RLS. That is a
-- curtain over billing and tenancy, not design. This closes it: revoke the broad grants, re-grant
-- UPDATE on ONLY the columns a club legitimately edits.
--
-- Audit gate (done): the only authenticated write to clubs in the app is ClubOnboardingPanel
-- setting onboarding_drive_url -- a SuperAdmin (platform) tool. onboarding_drive_url is now
-- platform-only, so that write moves to the RPC below; the panel calls it instead of a direct
-- update. No other app code updates/inserts/deletes clubs as the user.
--
-- BRANCH WORK. Apply + verify on develop; promote to prod ONLY via an authorised merge, and the
-- panel code (RPC call) must ship together with this migration -- never before it.
-- ============================================================

-- The one surviving write, as a platform-gated RPC (onboarding_drive_url is operational, not the
-- club's to set).
create or replace function public.set_club_onboarding_drive_url(p_club_id uuid, p_url text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'platform admins only' using errcode = '42501';
  end if;
  update public.clubs set onboarding_drive_url = p_url where id = p_club_id;
end;
$$;
revoke all on function public.set_club_onboarding_drive_url(uuid, text) from public;
grant execute on function public.set_club_onboarding_drive_url(uuid, text) to authenticated;

-- Reshape the grant. Column-level revokes do NOT bite while a table-level grant exists, so we must
-- revoke the table grant and re-grant the keepers (same pattern as club_pages).
revoke update on public.clubs from authenticated;
revoke delete on public.clubs from authenticated;   -- nobody deletes a club via the table API
-- INSERT is the same door, one verb over: raw INSERT lets any authenticated user create a club row
-- with any plan / account_status / is_demo. Both creation paths -- create_trial_club and
-- admin_create_club -- are SECURITY DEFINER (owned by postgres), so they insert regardless of this
-- grant. Verified they exist + are SECDEF; re-verify both still create a club on the branch.
revoke insert on public.clubs from authenticated;

-- Re-grant UPDATE on ONLY the club-editable columns: public identity, contact, and brand colours.
-- Brand colours stay club-editable and are SAFE by design -- the theme consumes them as inputs
-- (color-mix derives every semantic colour), so a club cannot produce grey-on-grey. Everything
-- else (theme_key, selected_template_id, theme_overrides, sport_type, slug, domain,
-- onboarding_drive_url, and all billing/lifecycle/system columns) is platform/system-owned.
grant update (
  name,
  logo_url,
  contact_email,
  address,
  phone,
  primary_colour,
  secondary_colour,
  tertiary_colour,
  facebook_url,
  instagram_url,
  twitter_url,
  youtube_url
) on public.clubs to authenticated;
