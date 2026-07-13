-- ============================================================
-- Publish only through the front door. Repo: supabase/club-pages-column-grants.sql
-- ------------------------------------------------------------
-- publish_club_page / revert_club_page are the ONLY path to a published state -- they copy
-- draft->published AND snapshot the version atomically, so Club Digital Legacy has no holes.
-- But the table-level grant let `authenticated` write EVERY column, including
-- published_layout / published_at: a plain .update({ published_layout }) publishes straight
-- past the RPC, with no snapshot, and nobody notices for a year. This closes that back door
-- with column-level grants -- the guarantee becomes structural, not a convention.
--
-- The SECURITY DEFINER RPCs run as the table owner, so they still reach every column; only
-- the `authenticated` role's DIRECT writes are constrained.
--
-- NOT YET APPLIED. Author + show only. Apply once authorized by name (new migration; the
-- earlier overrides do not generalise). Pure ASCII.
-- ============================================================

-- club_pages: authenticated may create/edit the editable columns, but NEVER
-- published_layout or published_at (RPC-only).
revoke insert, update on public.club_pages from authenticated;
grant insert (club_id, slug, title, nav_label, nav_order, nav_visible, nav_parent_id,
              is_home, seo, draft_layout, updated_by)
  on public.club_pages to authenticated;
grant update (draft_layout, seo, title, nav_label, nav_order, nav_visible, nav_parent_id,
              updated_by)
  on public.club_pages to authenticated;
-- published_layout, published_at: intentionally granted to NEITHER insert nor update.
-- Writable only by publish_club_page / revert_club_page. (select + delete unchanged.)

-- club_page_versions: the Digital Legacy record. Written ONLY by publish_club_page (as
-- owner). authenticated may READ its history but never insert/update/delete it directly --
-- an append-only ledger the admin cannot tamper with.
revoke insert, update, delete on public.club_page_versions from authenticated;
-- select unchanged (admins view their history; restore goes through restore_club_page_version).

-- club_pages DELETE: a raw delete CASCADES to club_page_versions (page_id on delete cascade)
-- -- an admin could drop the page and take the append-only ledger with it in one statement.
-- Page deletion is a P4 concern: it goes through an RPC that decides the history's fate
-- (soft-delete, or archive the versions first), never a cascade. Take delete out of reach now.
revoke delete on public.club_pages from authenticated;

-- ------------------------------------------------------------
-- After applying, verify (role-sim as a club-admin member):
--   * update club_pages set published_layout = '...'  -> permission denied for column.
--   * update club_pages set draft_layout   = '...'    -> succeeds.
--   * select publish_club_page(page_id)               -> succeeds (publishes + snapshots).
--   * insert/update/delete on club_page_versions      -> permission denied.
--   * select on club_page_versions                    -> succeeds.
--   * delete from club_pages where id = ...           -> permission denied.
-- ============================================================
