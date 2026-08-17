-- ============================================================
-- SportsWeb One - Injury stage reminders: daily schedule
-- Pairs with the injury-stage-reminders Edge Function. Pure ASCII, safe to re-run.
--
-- NOT applied automatically. This file is deliberately left for Carson to run
-- by hand once the Edge Function is deployed and ready to go live — the whole
-- feature is opt-in per club (clubs.injury_reminders_enabled) and this cron
-- job is the second gate: nothing sends until BOTH the club has opted in AND
-- this schedule exists.
-- ============================================================

-- Extensions used to call the Edge Function on a schedule (already enabled by
-- trial-nurture.sql if that's been run; safe to re-run here regardless).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- EDIT the two placeholders below, then run this block:
--   <PROJECT_REF>  -> uzibfawcwoapfbigpzum
--   <ANON_OR_SERVICE_KEY> -> your project anon key (Project Settings > API)
-- Runs once a day at 7am UTC (5pm AEST / 6pm AEDT) so admins get it at the
-- end of the Australian day. Re-running unschedule first keeps it idempotent.
select cron.unschedule('injury-stage-reminders') where exists (
  select 1 from cron.job where jobname = 'injury-stage-reminders'
);
select cron.schedule(
  'injury-stage-reminders',
  '0 7 * * *',
  $cron$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/injury-stage-reminders',
    headers := jsonb_build_object(
                 'Content-Type','application/json',
                 'Authorization','Bearer <ANON_OR_SERVICE_KEY>'
               ),
    body    := '{}'::jsonb
  );
  $cron$
);

-- To stop the reminders later:  select cron.unschedule('injury-stage-reminders');
