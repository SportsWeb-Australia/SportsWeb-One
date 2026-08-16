-- ============================================================
-- Club change-request notification: AFTER INSERT trigger -> pg_net -> edge fn.
-- Repo path: supabase/club-requests-notify.sql
-- ------------------------------------------------------------
-- When a club raises a change request from the on-page editor, POST it to the
-- club-request-notify edge function, which emails SportsWeb. Mirrors the proven
-- sitepulse-notify wiring (supabase/sitepulse-notify.sql) exactly, including the
-- exception-safe body: a notify failure must NEVER roll back the request insert,
-- because the row is the source of truth and the queue is the real deliverable.
--
-- NOT YET APPLIED TO PROD. Author + show only -- run in the Supabase SQL Editor
-- once Carson authorizes THIS file. Pure ASCII, re-runnable.
--
-- Prereqs: supabase/club-requests.sql applied; pg_net + supabase_vault enabled
-- (both already true on this project).
--
-- BEFORE this trigger will send, create the two Vault secrets (values are
-- Carson's; do NOT paste real secrets into this file):
--   select vault.create_secret(
--     'https://uzibfawcwoapfbigpzum.supabase.co/functions/v1/club-request-notify',
--     'club_request_notify_url');
--   select vault.create_secret('<the shared webhook secret>', 'club_request_webhook_secret');
-- The same webhook secret must be set as the CLUB_REQUEST_WEBHOOK_SECRET function
-- secret. Until both Vault rows exist, the trigger is a no-op (never blocks inserts).
-- ============================================================

-- 1. Enable pg_net (no-op if already enabled).
create extension if not exists pg_net;

-- 2. Trigger function: POST the new row to the notifier. SECURITY DEFINER so it
--    can read Vault and call net.http_post regardless of the inserting role.
create or replace function public.club_request_notify_new()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url    text;
  v_secret text;
begin
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'club_request_notify_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'club_request_webhook_secret';

  -- Not configured yet -> do nothing, but let the insert succeed.
  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',     'application/json',
                 'x-webhook-secret', v_secret
               ),
    body    := jsonb_build_object(
                 'id',         new.id,
                 'club_id',    new.club_id,
                 'what',       left(coalesce(new.what, ''), 500),
                 'why',        left(coalesce(new.why, ''), 500),
                 'urgency',    new.urgency,
                 'page_path',  new.page_path,
                 'created_at', new.created_at
               )
  );

  return new;
exception
  when others then
    -- Notify must never roll back the insert. Swallow everything.
    return new;
end;
$$;

-- 3. Fire once per inserted request row.
drop trigger if exists trg_club_request_notify on public.club_requests;
create trigger trg_club_request_notify
  after insert on public.club_requests
  for each row
  execute function public.club_request_notify_new();

-- ------------------------------------------------------------
-- After applying + setting the Vault secrets + function secrets, verify:
--   insert into public.club_requests(club_id, what, why, urgency)
--   values ('<a real club id>', 'notify test', 'checking the email path', 'whenever');
--   -- Check the club-request-notify function logs for a 200 + the test inbox.
--   -- Then delete the test row.
-- ============================================================
