-- ============================================================
-- Grant anon SELECT on club_content so LOGGED-OUT visitors see a published club's
-- content_content overrides (hero copy, etc.). Repo path: supabase/club-content-anon-select-grant.sql
-- ------------------------------------------------------------
-- Safe because club_content_public_read is already PUBLISHED-ONLY (set by
-- supabase/club-content-preview-leak.sql). RLS still gates every anon read to
-- published clubs; draft/suspended return 0 rows. Writes remain members/admin only
-- (club_content_member_write). This does NOT re-open the draft leak.
--
-- Note: if the Brief 01 migration (supabase/club-content-public-rpc.sql, RPC-only)
-- is later applied, it REVOKES this grant and drops the public_read policy -- the
-- two are alternatives. The front end prefers public_club_content when present and
-- falls back to a direct select, so it works under either model.
--
-- APPLIED 2026-07-11 (authorized). Pure ASCII, re-runnable.
-- ============================================================

grant select on public.club_content to anon;
