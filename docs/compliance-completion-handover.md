# Compliance (WWCC / officials governance) — completion handover

**Status:** Half-built and live. The data model and a risk report exist; alerting, document handling, accreditation and the dashboard tie-in do not. This handover is "finish it", not "build it".

**Scope:** SW1 only (`~/Developer/SportsWeb-One`, Supabase project `uzibfawcwoapfbigpzum`).

---

## ⚠️ READ FIRST — before touching anything

1. `git status` + `git fetch origin` — parallel sessions commit daily. Branch off current `origin/main`.
2. **Commit early, push, open a PR** (S21 in `~/Developer/sportsweb-standards/SPORTSWEB-WEB-STANDARDS.md`).
3. `docs/migration-ledger.md` before trusting any `supabase/*.sql` file as current; copy live function bodies via `pg_get_functiondef` before modifying them.
4. The repo's typecheck baseline is ~37 pre-existing errors — do not try to fix them all, but **three are in this feature and are yours** (below).

## What exists (verified 2026-08-17)

- **Table `public.compliance_records`** (`supabase/migrations/20260713060000_remote_schema.sql:6991`): `club_id, person_id, check_type, reference_no, document_id, issued_on, expires_on, verified_by, verified_at, status('pending' default), notes, created_by, …`. Generic by design — `check_type='wwcc'` today, room for coaching accreditation, first aid, etc.
- **Risk report `src/admin/ComplianceReport.tsx`:** computes a per-person WWCC state (`valid | expiring | expired | missing`) with a 60-day expiring window, over adults in child-facing roles (`CHILD_FACING = coach, assistant_coach, team_manager, trainer, committee, volunteer, official, administrator`). Renders a club-wide risk list with drill-in to the person.
- **Capture:** WWCC number/expiry capture went in via the merged `wwcc-capture` work; person drawer in `src/admin/AdminPeople.tsx`; client API `src/lib/people.ts`.
- **An admin RPC already returns a `compliance` arm** gated on `v_admin` (`remote_schema.sql:1947`) — read it before adding new read paths; extend rather than duplicate.
- **Club guide** step 3 is "WWCC/compliance" (`src/admin/ClubGuide.tsx`), and the launch checklist engine (`launch_step_catalog`) is where any new "compliance complete" step would register.
- **Comms stack** for alerts: `dispatch-message` (SMS/email/push), `trial-nurture` as the scheduled-function precedent.

## The known defects (fix first — they're load-bearing evidence the feature stopped mid-flight)

1. **`ComplianceReport.tsx` has 3 TypeScript errors on main:** `Property 'id' does not exist on type 'ClubMember'` at lines ~66 and ~112 (twice). The report keys people by an `id` the `ClubMember` type doesn't declare. Fix the type in `src/lib/people.ts` (or the usage) properly — don't cast around it. These are 3 of the repo's 37 baseline errors.
2. Verify `compliance_records.document_id` — what does it reference? If there's no documents table/bucket behind it, it's a dangling column and the document-upload piece below defines it.

## Completion scope (proposed order)

1. **Fix the type errors**; confirm the report renders real data for a club with `compliance_records` rows.
2. **Expiry alerting:** a scheduled function (copy `trial-nurture`'s shape) that finds `expiring`/`expired` WWCC holders in child-facing roles and notifies the club's senior admins via `dispatch-message`. Frequency and copy: Carson's call. Nothing goes to the person themselves without his say-so.
3. **Document handling:** 🔴 the `club-media` bucket is **public** — WWCC evidence must not go there. If documents are wanted, add a private bucket + signed URLs and wire `document_id`. If not, drop the column ambition and record numbers only.
4. **Coach accreditation:** either as additional `check_type` rows (cheap, consistent) with the report generalised beyond WWCC, and/or the Club Learn (Zoho) module deep-link for the actual course-taking. Recommend both: records here, learning there.
5. **Dashboard tie-in:** the club dashboard currently lacks a metrics/risks view (known platform gap). Ship a compliance tile: N missing / N expiring / N expired among child-facing roles. This is the first real "risk" metric on the platform — build it as a pattern others (injuries, finance) can follow.
6. **Launch checklist:** add/confirm a club-audience step so new clubs are steered through WWCC capture during onboarding (`launch_step_catalog`, `club_setup_status` auto-detection in `supabase/captured/club-setup-status.sql`).
7. **Export:** CSV of the compliance register (committees get asked for this by leagues). `ResourceManager`-style export or a simple RPC.

## Permissions note

The report shows names + check status — governance data, not public content. It currently rides whatever gates the admin screens. Confirm with Carson who sees it: `club_senior_admin` only, or `club_admin` too (`src/lib/permissions.ts:30-41` — `club_admin` today has only content/comms/website).

## Out of scope

- Injury/concussion (separate handover: `docs/injury-concussion-handover.md`) — related but distinct; don't merge the models without Carson deciding.
- Website/F2/pre-render work — do not touch `api/`, `vercel.json`, or publish RPCs.
