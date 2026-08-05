-- ============================================================
-- Close a cross-club leak in the ticket sales summary view.
-- Repo path: supabase/tk-sales-summary-security-invoker.sql
-- ------------------------------------------------------------
-- Problem: public.tk_event_sales_summary is owned by postgres and was created
-- WITHOUT security_invoker, so reads ran with the owner's rights. The base tables
-- (tk_events / tk_orders / tk_tickets) have RLS enabled but NOT forced, and the
-- owner (postgres) is exempt from RLS -- so any `authenticated` user (the view had
-- a direct SELECT grant) could read EVERY club's ticket revenue: paid orders,
-- gross/fees/collected cents, tickets issued/redeemed and door takings, for all
-- events across all clubs. Flagged by the Supabase Security Advisor ("Security
-- Definer View", ERROR level).
--
-- Fix: turn on security_invoker so the view evaluates base-table access as the
-- QUERYING user, honouring the club-scoped RLS (tk_is_club_member(club_id)). Also
-- drop the meaningless INSERT/UPDATE/DELETE grants on this read-only aggregate view
-- (it is not updatable). SELECT for `authenticated` is kept and is now safe.
--
-- Callers UNAFFECTED: the view is only read inside club-scoped SECURITY DEFINER
-- RPCs (they filter `where club_id = p_club_id` and check tk_can_view_club()),
-- which run as postgres and are unchanged by this. No direct client query exists.
--
-- APPLIED TO PROD 2026-08-05 - applied via MCP (execute_sql) at Carson's explicit
-- authorization, then verified: reloptions = security_invoker=on, authenticated
-- grants = SELECT only, Security Advisor ERROR count = 0. Recorded here for the
-- ledger; do NOT re-run needlessly (it is idempotent if you do). Pure ASCII.
-- ============================================================

alter view public.tk_event_sales_summary set (security_invoker = on);

revoke insert, update, delete on public.tk_event_sales_summary from authenticated;
