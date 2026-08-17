-- ============================================================
-- SportsWeb One - Compliance alerts: weekly schedule
-- Pairs with the compliance-alerts Edge Function. Pure ASCII, safe to re-run.
-- ============================================================

-- Extensions used to call the Edge Function on a schedule (already enabled by
-- trial-nurture.sql if that's been run in this project; safe to repeat).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Weekly digest, Monday 8am Sydney time (22:00 UTC Sunday during AEST /
-- 21:00 UTC during AEDT - pick whichever is closer and adjust after a daylight
-- savings change if it drifts; this is a first cut, not precision-critical).
-- EDIT the placeholder below, then run this block:
--   <SERVICE_ROLE_KEY> -> Project Settings > API > service_role key
-- Re-running unschedule first keeps it idempotent.
select cron.unschedule('compliance-alerts') where exists (
  select 1 from cron.job where jobname = 'compliance-alerts'
);
select cron.schedule(
  'compliance-alerts',
  '0 22 * * 0',
  $cron$
  select net.http_post(
    url     := 'https://uzibfawcwoapfbigpzum.supabase.co/functions/v1/compliance-alerts',
    headers := jsonb_build_object(
                 'Content-Type','application/json',
                 'Authorization','Bearer <SERVICE_ROLE_KEY>'
               ),
    body    := '{}'::jsonb
  );
  $cron$
);

-- To stop the digest later:  select cron.unschedule('compliance-alerts');
