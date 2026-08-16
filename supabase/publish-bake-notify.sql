-- ============================================================================
-- Fire a publish-time bake when a club publishes.
--
-- Part of the publish-time pre-render work (docs/publish-time-prerender-handover.md).
--
-- ⚠️ This file RE-CREATES two existing, locked-down SECURITY DEFINER functions
--    (set_website_status, publish_club_page). Their bodies below are copied from
--    the live definitions (pg_get_functiondef) with exactly one line added to each.
--    Before re-running this after any change to those functions, diff it against
--    live first — a stale copy here would silently revert an auth gate.
--
-- Deliberately NOT a blanket AFTER UPDATE trigger on clubs: that fires on every
-- unrelated column edit. The notify sits inside the two calls that actually mean
-- "publish".
--
-- Safe to re-run.
-- ============================================================================

create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- The notifier. Mirrors sitepulse_notify_new_feedback: read URL + secret from
-- Vault, POST, and swallow everything.
--
-- The swallow is the important part. A publish is the user's action and has
-- already succeeded by the time this runs; a bake endpoint being unreachable,
-- slow, or misconfigured must never roll that back or surface as "publish
-- failed". A missed bake degrades to serving the previous cache, or to the SPA
-- shell — both of which are correct, just not fresh.
--
-- Not configured (either secret absent) is a no-op, so applying this file before
-- the secrets exist changes nothing.
-- ---------------------------------------------------------------------------
create or replace function public.notify_bake(p_club_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url    text;
  v_secret text;
begin
  if p_club_id is null then
    return;
  end if;

  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'bake_notify_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'bake_webhook_secret';

  if v_url is null or v_secret is null then
    return;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',     'application/json',
                 'x-webhook-secret', v_secret
               ),
    body    := jsonb_build_object(
                 'club_id', p_club_id,
                 'reason',  p_reason
               )
  );
exception
  when others then
    -- Never let a bake failure roll back the publish that triggered it.
    return;
end;
$$;

-- Called only from the SECURITY DEFINER functions below, which run as the owner,
-- so no caller needs EXECUTE of their own.
revoke execute on function public.notify_bake(uuid, text) from public;

-- ---------------------------------------------------------------------------
-- set_website_status — unchanged except for the notify on the published branch.
--
-- Only 'published' bakes. Going to draft or suspended needs no re-bake: serving
-- re-checks live publish status on every request, so the cache stops being served
-- without being touched, and leaving it in place makes re-publishing instant.
-- ---------------------------------------------------------------------------
create or replace function public.set_website_status(p_club uuid, p_status website_status)
returns website_status
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_current website_status;
begin
  if not (public.is_platform_admin() or public.is_club_admin(p_club)) then
    raise exception 'not authorised';
  end if;

  select website_status into v_current from public.clubs where id = p_club;
  if not found then
    raise exception 'club not found';
  end if;

  -- Club admins are limited to draft/published and cannot touch a suspended club.
  if not public.is_platform_admin()
     and (p_status = 'suspended' or v_current = 'suspended') then
    raise exception 'not authorised';
  end if;

  update public.clubs set website_status = p_status where id = p_club;

  if p_status = 'published' then
    perform public.notify_bake(p_club, 'set_website_status');
  end if;

  return p_status;
end
$function$;

grant execute on function public.set_website_status(uuid, website_status) to authenticated;

-- ---------------------------------------------------------------------------
-- publish_club_page — unchanged except for the notify after the layout copy.
--
-- Note: the bake currently renders the LEGACY route tree, not F2 pages, so this
-- re-bakes routes that publishing an F2 page did not change. Harmless (the bake
-- is idempotent) and correct in advance of F2 becoming a second content source.
-- ---------------------------------------------------------------------------
create or replace function public.publish_club_page(p_page_id uuid)
returns json
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare v_club_id uuid; v_draft jsonb;
begin
  select club_id, draft_layout into v_club_id, v_draft from public.club_pages where id = p_page_id;
  if v_club_id is null then raise exception 'Page not found'; end if;
  if not (is_platform_admin() or vm_is_club_member(v_club_id)) then
    raise exception 'Not authorized for this club'; end if;
  update public.club_pages
     set published_layout = v_draft, published_at = now(), updated_by = auth.uid()
   where id = p_page_id;
  insert into public.club_page_versions (club_id, page_id, layout, label, created_by)
  values (v_club_id, p_page_id, v_draft, 'published', auth.uid());

  perform public.notify_bake(v_club_id, 'publish_club_page');

  return json_build_object('page_id', p_page_id, 'published_at', now());
end;
$function$;

revoke execute on function public.publish_club_page(uuid) from public;
grant execute on function public.publish_club_page(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Secrets this needs (create once, outside this file so no value is committed):
--
--   select vault.create_secret('<bake url>',    'bake_notify_url');
--   select vault.create_secret('<shared secret>','bake_webhook_secret');
--
-- bake_webhook_secret must equal BAKE_WEBHOOK_SECRET in the Vercel project, and
-- bake_notify_url must point at the deployment that actually has api/bake.
-- ---------------------------------------------------------------------------
