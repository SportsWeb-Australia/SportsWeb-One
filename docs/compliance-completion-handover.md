# Compliance (WWCC / officials governance) — completion handover

**Status:** Done (2026-08-18, branch `compliance-completion`). Type errors fixed, document handling (private bucket + `compliance_documents` table), expiry alerting (`compliance-alerts` function, deployed but not yet scheduled — see below), the report generalised to coach/trainer accreditation, the dashboard risk tile rewired off the wrong table, the launch-checklist step, and CSV export are all in. Detail per item below; nothing here was left half-done, but two things need Carson: the alert cadence/copy, and running `supabase/compliance-alerts.sql` (has a placeholder for the service-role key, same pattern as `trial-nurture.sql`) to actually turn the schedule on.

**Original brief (for reference):** Half-built and live. The data model and a risk report exist; alerting, document handling, accreditation and the dashboard tie-in do not. This handover is "finish it", not "build it".

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

## Completion notes (2026-08-18)

1. **Type errors** — fixed in `src/admin/ComplianceReport.tsx`: the report was keying people by `member.id`, but `ClubMember` (`src/lib/people.ts`) only has `personId`. Swapped both call sites. `compliance_records.document_id` was confirmed dangling (no FK existed) — see #3.
2. **Expiry alerting** — new `compliance-alerts` Edge Function (deployed, `--no-verify-jwt`), reads `public.compliance_alert_targets()` (a `service_role`-only SQL function — no `auth.uid()` gate needed since it's never granted to `anon`/`authenticated`) and sends one digest email per club senior admin via `dispatch-message`. Schedule template at `supabase/compliance-alerts.sql` mirrors `trial-nurture.sql` — weekly (Sunday 22:00 UTC ≈ Monday morning Sydney), **not yet turned on**: it has a `<SERVICE_ROLE_KEY>` placeholder for Carson to fill in and run. Frequency and copy are a first cut, easy to tune in the function/schedule file.
3. **Document handling** — new private `compliance-documents` storage bucket (20 MB/file cap) + `compliance_documents` metadata table (mirrors the existing `volunteer_documents` shape), gated the same as `compliance_records` itself (`club_senior_admin`/`club_admin`/platform admin). `compliance_records.document_id` now has a real FK. Upload UI is in the Compliance tab on a member's profile (`src/admin/MemberDetail.tsx`); viewing generates a short-lived signed URL client-side (`getComplianceDocumentUrl` in `src/lib/people.ts`) — never a public link.
4. **Coach accreditation** — capture already supported `check_type = coach_accreditation` / `trainer_accreditation`; the report (`ComplianceReport.tsx`) now also flags it for `coach`/`assistant_coach`/`trainer` roles alongside WWCC, as a second badge on at-risk rows plus its own "Accreditation gaps" stat. Didn't build the Club Learn (Zoho) deep-link half of the "records here, learning there" recommendation — no existing integration point found to hang it off; flag if you want that scoped separately.
5. **Dashboard tie-in** — `src/lib/roleKpis.ts`'s "Compliance risks" KPI (already wired into the president/secretary/coach dashboard cards) was silently reading `volunteer_compliance_records`, an unrelated table belonging to the separate VolunteerOne module — so it was always ~0 for ordinary clubs regardless of real WWCC risk. Rewired to a new `compliance_risk_count(p_club)` RPC that mirrors the report's own missing/expired/expiring logic server-side.
6. **Launch checklist** — added a `club.compliance` row to `launch_step_catalog` (phase 6 "Users", after `club.invite`) and `club.compliance` auto-detection to `club_setup_status()`. Routes through the existing `__compliance` screen, same as the `club.teams` step already does — which means it's only reachable by `club_senior_admin` today (the `club.users` permission gate), same known limitation as the teams step; not new.
7. **Export** — CSV button on the report (client-side, no new endpoint) covering every child-facing person, not just at-risk ones.
8. **Permissions** — left as found: the report (and now the CSV export) render behind `can("club.users")`, which only `club_senior_admin` (+ platform roles) has — `club_admin` doesn't see this screen at all today. RLS on `compliance_records`/`compliance_documents` actually permits both `club_senior_admin` and `club_admin`, so if Carson wants `club_admin` in too, it's a one-line permission change, not a schema change.

All SQL is in `supabase/compliance-completion.sql` (applied) and `supabase/compliance-alerts.sql` (template, not yet run) — see `docs/migration-ledger.md` for state.

## Addendum: beyond WWCC (2026-08-18, same day)

Carson asked to extend past WWCC-only into a full compliance register: what's
done, coming up, expired, and at risk, across trainer certifications, RSA,
coach accreditation, first aid, "and anything else you can think of."

- **New shared catalog:** `src/lib/complianceTypes.ts` is now the single
  source of truth for check types and which roles require which — imported by
  both `MemberDetail.tsx` (capture form) and `ComplianceReport.tsx` (register),
  so they can't drift apart the way the dashboard tile and report did before.
  Added types beyond the original set: CPR, umpire/official accreditation,
  member protection/safeguarding training, anti-doping/integrity training, food
  safety handling — on top of the existing WWCC, police check, first aid,
  coach/trainer accreditation, RSA, other.
- **Required vs tracked:** WWCC applies to every child-facing role (unchanged).
  Coach accreditation → coach/assistant coach. Trainer accreditation + first
  aid → trainer. Official accreditation → official. Safeguarding → committee/
  administrator. Everything else (RSA, food safety, anti-doping, police check,
  CPR, other) is tracked and expiry-flagged when someone has one on file, but
  nobody is marked "at risk" for lacking a cert their role was never assigned
  — there's no role in this schema for "runs the bar" or "handles food" to
  hang a requirement off. **This matrix is a reasonable default, not a
  per-sport/state rulebook — there's no per-club override yet.** If a club's
  real requirements differ, edit `REQUIRED_ROLES` in `complianceTypes.ts` and
  its SQL mirror below; a genuine per-club configuration UI would be a bigger
  follow-up.
- **Report rebuilt** (`ComplianceReport.tsx`) as a flat, filterable register:
  four clickable stat buckets (Done / Coming up / Expired / At risk — mapped
  1:1 from the existing valid/expiring/expired/missing state model, just
  relabelled for this framing) plus a check-type filter row that only shows
  types actually in use at the club. CSV export now covers the full register
  (every check, every state, every person), not just problems, since leagues
  typically ask for the whole thing.
- **Backend caught up too** (`supabase/compliance-check-types.sql`) — the
  dashboard KPI (`compliance_risk_count`) and the alert digest
  (`compliance_alert_targets`) now use the same requirement matrix as the
  report, person-worst-check aggregation for the KPI, per-issue detail for the
  digest email. Verified against live `person_roles` data (a committee person
  correctly required both WWCC and safeguarding).
- **Copy pass:** renamed "WWCC & compliance" to "Compliance register" in the
  admin nav (`AdminConsole.tsx`) and updated the Club Guide step body to stop
  reading as WWCC-only.
- Didn't build (at the time): a genuine per-club requirement matrix — see next
  addendum, Carson asked for this immediately after and it's now built.

## Addendum 2: per-club requirement matrix (2026-08-18, later same day)

The "one shared matrix for every club, edited in code" limitation above got
closed the same day.

- **New table `club_compliance_requirements`** (`club_id, role, check_type,
  required`, unique per triple) — a club's overrides to the platform default.
  No rows = pure platform default, unchanged behaviour. RLS matches
  `compliance_records` (`club_senior_admin`/`club_admin`/platform admin).
- **Merge rule** (same on both sides, deliberately simple — override wins,
  no partial/inherited state): effective = platform default MINUS anything
  explicitly turned off for this club PLUS anything explicitly turned on.
  Implemented as `computeEffectiveRequirements()` in `complianceTypes.ts` and
  mirrored in SQL in `supabase/compliance-club-requirements.sql`
  (`compliance_risk_count` takes `p_club` directly; `compliance_alert_targets`
  scans every club in one pass so its version uses a `LATERAL` join per
  person/role instead of a single club filter — same merge logic, different
  shape because of what each function iterates over).
- **New screen `ComplianceSettings.tsx`** (`__compliance_settings`, reached
  via a "Settings" button on the register, same `club.users` gate) — a
  role × check-type grid, one checkbox per cell, autosaves on toggle (same
  optimistic-update pattern as `AdminModules.tsx`'s module toggles). Cells
  with a club-specific override are marked "custom" so it's clear what's a
  platform default vs. a deliberate local choice. A "Reset to defaults"
  button clears all of a club's overrides in one go.
- **Scope, deliberately**: this only lets a club change WHICH check types a
  role needs — the roles themselves (`COMPLIANCE_ROLES` in
  `complianceTypes.ts`: coach, assistant coach, team manager, trainer,
  committee, volunteer, official, administrator) are fixed. A club can't add
  a new role to the register (e.g. "bar volunteer") through this — that would
  mean touching the roles model itself, out of scope here.
- Verified live: inserted a test override turning off `safeguarding` for
  `committee` and turning on `rsa` for `volunteer` on the demo club, confirmed
  the `requirements` CTE picked both up correctly, then deleted the test rows.
