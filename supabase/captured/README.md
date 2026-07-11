# supabase/captured — reverse-engineered DDL for objects that predate the repo

These objects were created directly in the SportsWeb One Supabase database
(project `uzibfawcwoapfbigpzum`) with **no `.sql` file in this repo**. The files
here were captured from the live schema on **2026-07-11** (via `pg_get_functiondef`
and the system catalogs) purely so the repo has a faithful record of them.

**Nothing here has been applied and nothing needs to be — these objects already
exist in prod.** Each file is written idempotently (`IF NOT EXISTS` /
`CREATE OR REPLACE` / `DROP POLICY IF EXISTS`), so it is a no-op on prod and would
only recreate the objects on a fresh environment.

Captured objects:
- `launch-steps.sql` — `launch_step_catalog`, `launch_step_progress` (+ RLS/policies)
  and the `start_club_launch(uuid, text)` function.
- `club-setup-status.sql` — the `club_setup_status(uuid)` function.
- `sales.sql` — `sales_products`, `sales_targets` (+ RLS/policies).
- `clubs-account-plan-columns.sql` — `clubs.account_status`, `clubs.plan`.

Dependencies these reference but that are **defined elsewhere** (not captured here):
`launch_phases`, `club_launches`, and the helper functions `is_platform_admin()`,
`is_super_admin()`, `is_launch_operator()`, `launch_step_is_admin_only()`.
