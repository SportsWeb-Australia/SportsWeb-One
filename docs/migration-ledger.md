# Migration Ledger

Single source of truth for which hand-applied SQL files have reached the
**production** Supabase project (`uzibfawcwoapfbigpzum`, `sportsweb-one`).

Because SQL is applied by hand in the Supabase SQL Editor (never `db push`), the
`.sql` files in `supabase/` carry a header line about their apply state. Those
headers drift out of date — a file can say "NOT YET APPLIED" long after it was
pasted in. This ledger is the authority; when in doubt, verify against prod, not
the header.

## How this was verified

State below was confirmed on **2026-08-04** by direct introspection of the prod
database (information_schema / pg_catalog / pg_policies) — i.e. checking that the
columns, functions, policies, grants and triggers each file creates actually
exist. Method, not memory.

## Status — 2026-08-04

| SQL file | Creates / changes | Prod state |
|---|---|---|
| `strip-seeding-and-demo-flag.sql` | `clubs.is_demo`; strips content seeding from `create_trial_club()`; flags 13 demo clubs | ✅ APPLIED |
| `grant-anon-club-modules.sql` | anon `SELECT` on `club_modules` (F2 entitlement reads) | ✅ APPLIED |
| `club-preview-token.sql` | `clubs.preview_token` + `rotate_club_preview_token()` | ✅ APPLIED |
| `publish-gate-club-tables.sql` | RLS publish gate (9 policies keyed on `website_status`) | ✅ APPLIED |
| `club-content-public-rpc.sql` | anon public read of `club_content` (`club_content_public_read` policy) | ✅ APPLIED |
| `club-content-preview-leak.sql` | tightens public `club_content` read to gate on `website_status` | ✅ APPLIED |
| `people-is-public.sql` | `people.is_public` (committee surfacing) | ✅ APPLIED |
| `sitepulse-notify.sql` | AFTER-INSERT trigger on `sitepulse_feedback` (operator email) | ✅ APPLIED |
| `f2-page-schema.sql` | `club_pages` / `club_page_versions` + `publish_club_page` / `revert_club_page` | ✅ APPLIED |
| `scratch-tenant.sql` | provisions the `scratch-tenant` demo club | ✅ APPLIED |
| `club-pages-column-grants.sql` | anon column grants on `club_pages` | ❌ NOT APPLIED — **likely unnecessary** |

### The one genuine gap

`club-pages-column-grants.sql` is not applied. It is **probably not needed**:
`club_pages` is served to the public through the `public_club_page` RPC
(SECURITY DEFINER), not via direct anon table reads, so a direct anon column
grant has no consumer today. Do **not** apply it without first confirming a code
path that reads `club_pages` directly as the `anon` role. Left unapplied on
purpose, recorded here so it is a decision and not a mystery.

## Later additions

| File | What it does | State |
| --- | --- | --- |
| `storage-platform-admin-write.sql` | adds the `is_platform_admin()` arm to the three `club-media` storage write policies (insert/update/delete) so platform admins can swap page images inline, matching `club-content-admin-write.sql` for text | ✅ APPLIED 2026-08-05 (verified via `pg_policies`) |
| `club-content-versions.sql` | content version history: `club_content_versions` table (RLS read), snapshot-before-publish in `publish_club_content`, plus `save_content_restore_point()` / `restore_content_version()` RPCs. Powers site undo + restore-from-backup | ✅ APPLIED 2026-08-05 (verified: table + 3 functions present, jsonb round-trip checked) |

## Applied 2026-08-17 (F2 sidebar/nav + the fence)

Applied in this order, which matters — see the note below.

| File | What it does | State |
| --- | --- | --- |
| `publish-bake-notify.sql` | `notify_bake()` (Vault + `net.http_post`); calls it from `set_website_status` (published branch) and `publish_club_page` | ✅ APPLIED 2026-08-16 |
| `club-page-cache.sql` | `club_page_cache` table (RLS, no grants) + `public_club_page_cache()` read RPC | ✅ APPLIED 2026-08-16 |
| `captured/section-variant-fence.sql` | `_section_presentation_fields` / `_section_variant_default` / `_section_variant_violation` + `save_club_page_draft()` | ✅ APPLIED 2026-08-17 — its header claimed "a no-op on prod"; introspection proved none of the four functions existed here, so it was **not** a no-op. The composer calls `save_club_page_draft` for every Save and Publish, so PR #126 would have shipped a composer that could not save. |
| `f2-sidebar-layout.sql` | `club_pages.draft_layout_mode` / `published_layout_mode`; re-creates `public_club_page` (adds a `layout_mode` return column), `publish_club_page`, `revert_club_page` | ✅ APPLIED 2026-08-17 |
| `f2-public-nav.sql` | `public_club_nav(club_id, preview_token)` — the chrome's DB-driven nav, with a draft branch | ✅ APPLIED 2026-08-17 |

🔴 **Order dependency, and the reason this section exists.** `publish-bake-notify.sql` and
`f2-sidebar-layout.sql` **both** re-create `public.publish_club_page` — one to add
`notify_bake()`, the other to copy `layout_mode`. Each was written from a copy of the body
that predated the other, so whichever is applied last wins outright and silently drops the
other's change: publishing stops firing the bake, or two-column pages go live single-column.
Caught in review of PR #126 before either reached prod. `f2-sidebar-layout.sql` now carries
**both** changes (with the `notify_bake` call existence-checked), which is why it must be
applied **after** `publish-bake-notify.sql` and why that earlier file must never be re-applied
on its own. Verified on prod after applying: `publish_club_page` contains both `notify_bake`
and `published_layout_mode`.

Also verified after applying: `public_club_page` now returns
`TABLE(layout, seo, title, layout_mode)` — the reason `f2-sidebar-layout.sql` needed an
explicit `DROP FUNCTION` first, since Postgres refuses a return-column change via
`CREATE OR REPLACE` (42P13) and would otherwise have failed mid-file, after the `ALTER TABLE`
had already committed.

## Notes

- The "already run in prod, committed for version control only" files (e.g.
  `club-onboarding.sql`, and the many "safe to re-run" files) are unchanged and
  remain applied.
- The `.sql` header lines on the applied files above were corrected on
  2026-08-04 to stop them reading "NOT YET APPLIED". If you add a new
  hand-applied migration, add a row here when you paste it into prod.
