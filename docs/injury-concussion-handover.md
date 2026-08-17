# Injury & concussion management — build handover

**Status:** Nothing exists yet. Verified 2026-08-17: no table, no module, no admin screen, no route anywhere in the repo or the live database mentions injury or concussion. This is a green-field feature on a mature platform — the work is fitting it into existing patterns, not inventing new ones.

**Scope:** SW1 only (`~/Developer/SportsWeb-One`, Supabase project `uzibfawcwoapfbigpzum`).

---

## ⚠️ READ FIRST — before touching anything

1. `git status` + `git fetch origin` — multiple parallel sessions commit to this repo daily. Branch off **current `origin/main`**, never off a feature branch.
2. **Commit early, push, open a PR** (even draft). House law S21 in `~/Developer/sportsweb-standards/SPORTSWEB-WEB-STANDARDS.md`: never end a session with a dirty tree; every branch gets a PR.
3. `docs/migration-ledger.md` records which `supabase/*.sql` files are actually applied to prod — **the .sql files in the repo are not reliably current**. When modifying any existing DB function, copy its body from live (`pg_get_functiondef`) first, not from the repo file. This bit us on this exact database.
4. Apply DDL via the Supabase MCP `apply_migration` (so it lands in migration history), and record it in the ledger.

## Context

The platform objective includes injury and concussion management as a first-class club capability. Dookie United's static site has a real content reference: `~/Developer/dookie-united-fancy/welfare/index.html` and `welfare/concussion/index.html` — read them; they reflect what a club actually publishes about its protocol and are a useful domain primer.

Concussion management in community sport is a **graduated return-to-play protocol**: an incident is recorded, the person is stood down, and they progress through dated stages with sign-offs before clearance. Do not hardcode protocol timings from memory — **confirm the current protocol content (stages, minimum days, who signs off) with Carson** before encoding it; sporting bodies revise these.

## Ground truth — the patterns to build on (all verified)

- **The person model:** `public.people` — per-club rows, `roles text[]`, `tags text[]`, `is_public` (PII is opt-IN to the public site; health data must never be public at all). Client API: `src/lib/people.ts` (`listClubMembers`, `ClubMember`). Admin UI: `src/admin/AdminPeople.tsx`.
- **The closest existing shape — copy it:** `public.compliance_records` (in `supabase/migrations/20260713060000_remote_schema.sql:6991`): `id, club_id, person_id, check_type, reference_no, document_id, issued_on, expires_on, verified_by, verified_at, status, notes, created_by, created_at, updated_at`. An `injury_records` table wants the same skeleton plus incident date/context, injury type, and a stage/clearance model for concussion.
- **RLS conventions:** membership helper `my_club_ids()` = `club_users ∪ user_club_roles` (`supabase/run-this.sql:382`). Older single-table copies of that function exist in several .sql files — re-running them would narrow access; don't.
- **Permissions:** `src/lib/permissions.ts:30-41`. `club_admin` has only `club.content`/`club.comms`/`club.website`. Health data should NOT ride on `club.content`. Options: gate on `club.users` (senior admins only) or add a dedicated permission. Decide with Carson.
- **Notifications:** the comms stack is live — `dispatch-message` edge function (SMS/email/push), `notify`. For scheduled reminders ("stage 3 due today", "not yet cleared"), `trial-nurture` is the existing scheduled-function precedent to copy.
- **Module pattern (if it's an optional module):** catalogue entry in `src/lib/modules.ts`, entitlement row in `club_modules` (`enabled|trial|locked`), switch UI already generic in `src/admin/AdminModules.tsx`. NOTE: `club_modules.trial_ends_at` is written by nothing and read by nothing — a `trial` status never expires. Grant `enabled` for real clubs.
- **Documents:** 🔴 the `club-media` storage bucket is **public**. Medical documents must NOT go there. A new **private** bucket with signed-URL access is required if doctor clearances etc. are uploaded. `compliance_records.document_id` implies a documents pattern — verify where it points before reusing it.
- **Audit:** `access_audit` table exists (used by platform staff role changes, `src/admin/StaffAccess.tsx:75`). Health-record access is a reasonable candidate for the same treatment.
- **Admin surface:** screens are registered in `src/admin/AdminApp.tsx` (a big switch + sidebar) and mirrored in `src/admin/AdminConsole.tsx` tiles. `ComplianceReport.tsx` is the closest sibling screen to copy structurally.
- **British spellings** in columns (`colour` precedent) and plain-English tone in club-facing UI.

## Suggested shape (validate, don't assume)

1. **Tables:** `injury_records` (incident: person, club, date, context/match link optional, injury type, severity, status open/recovering/cleared, notes, created_by) and `injury_stages` (record_id, stage_no, label, due_on, completed_at, signed_off_by, notes) for the graduated protocol. Concussion is an injury type whose record auto-instantiates the protocol stages from a template.
2. **RLS:** no anon access whatsoever; member read/write gated tighter than content (see permissions decision). SECURITY DEFINER RPCs for anything cross-cutting, per house style.
3. **Admin UI:** an "Injuries" screen (list + person drill-in + record form + stage checklist), plus a red flag on the dashboard: players currently stood down, stages overdue.
4. **Comms:** opt-in reminders through `dispatch-message` when a stage falls due; nothing automatic to parents/members without Carson's explicit say-so.
5. **Dashboard:** this feature should feed the club "metrics + risks" dashboard (currently a known gap): active injuries, overdue stages, players not cleared.

## Open decisions for Carson

- Core feature or switchable module (`club_modules` key)?
- Who can see/write health records — senior admins only, or also coaches/team managers for their own team?
- Protocol template(s): one generic, or per-sport templates? Source of the official protocol content?
- Are documents (medical clearances) uploaded, or is it record-keeping only? (Uploads force the private-bucket work.)
- Any governing-body reporting/export obligations?

## Out of scope

- Public website content about welfare/concussion (that's website content, covered by the F2/website work).
- Anything touching the publish-time pre-render pipeline (PR #125) or F2 routing scope — separate streams, do not modify `api/`, `vercel.json`, or the publish RPCs from this session.
