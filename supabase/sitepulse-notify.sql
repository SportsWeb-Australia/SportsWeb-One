-- ============================================================
-- SitePulse new-feedback notification: AFTER INSERT trigger -> pg_net -> edge fn.
-- Repo path: supabase/sitepulse-notify.sql
-- ------------------------------------------------------------
-- One trigger on public.sitepulse_feedback catches BOTH insert paths (public/
-- preview widget via sitepulse-ingest, and the in-admin AdminFeedback client
-- insert). It fires an async HTTP POST (pg_net) to the sitepulse-notify edge
-- function, which emails the operator. Config (URL + shared secret) comes from
-- Vault -- never hardcoded. The function is exception-safe: a notify failure
-- must NEVER roll back the feedback insert (the row is the source of truth).
--
-- NOT YET APPLIED. Author + show only. Run in the Supabase SQL Editor once
-- Carson authorizes THIS file. Pure ASCII, re-runnable. Keys off club_id.
--
-- Prereqs (already true on this project): pg_net + supabase_vault are enabled.
--
-- BEFORE this trigger will send, create the two Vault secrets (values are
-- Carson's; do NOT paste real secrets into this file):
--   select vault.create_secret(
--     'https://uzibfawcwoapfbigpzum.supabase.co/functions/v1/sitepulse-notify',
--     'sitepulse_notify_url');
--   select vault.create_secret('<the shared webhook secret>', 'sitepulse_webhook_secret');
-- The same webhook secret must be set as the SITEPULSE_WEBHOOK_SECRET function
-- secret. Until both Vault rows exist, the trigger is a no-op (never blocks inserts).
-- ============================================================

-- 1. Enable pg_net (no-op if already enabled).
create extension if not exists pg_net;

-- 2. Trigger function: POST the new row to the notifier. SECURITY DEFINER so it
--    can read Vault and call net.http_post regardless of the inserting role.
create or replace function public.sitepulse_notify_new_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url    text;
  v_secret text;
begin
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'sitepulse_notify_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'sitepulse_webhook_secret';

  -- Not configured yet -> do nothing, but let the insert succeed.
  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type',    'application/json',
                 'x-webhook-secret', v_secret
               ),
    body    := jsonb_build_object(
                 'id',          new.id,
                 'club_id',     new.club_id,
                 'category',    new.category,
                 'urgency',     new.urgency_flag,
                 'description', left(coalesce(new.description, ''), 500),
                 'page_url',    new.page_url,
                 'user_type',   new.user_type,
                 'created_at',  new.created_at
               )
  );

  return new;
exception
  when others then
    -- Notify must never roll back the insert. Swallow everything.
    return new;
end;
$$;

-- 3. Fire once per inserted feedback row.
drop trigger if exists trg_sitepulse_notify on public.sitepulse_feedback;
create trigger trg_sitepulse_notify
  after insert on public.sitepulse_feedback
  for each row
  execute function public.sitepulse_notify_new_feedback();

-- ------------------------------------------------------------
-- After applying + setting the Vault secrets + function secrets, verify:
--   -- widget path:
--   insert into public.sitepulse_feedback(club_id, source, category, description, user_type)
--   values ('<a real club id>', 'report', 'bug', 'notify test - widget', 'public');
--   -- admin path is the same table, so the one trigger covers both.
--   -- Check the sitepulse-notify function logs for a 200 + the test inbox for the email.
--   -- Then delete the test rows.
-- ============================================================
