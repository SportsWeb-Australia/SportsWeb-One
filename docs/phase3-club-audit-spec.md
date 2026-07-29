# Phase 3 — Free club website audit (PARKED — separate project)

**Status:** Parked / not started. Spec only. Build as its own project when prioritised.
**Origin:** Site Migrations handover, Phase 3 ("free club audit"). Phase 1 (tracker
+ SOP viewer) and Phase 2 (live-verify edge function) are shipped.

## The idea (plain terms)
A recurring, per-club "report card" for each club's website that runs on a schedule,
stores results over time, and surfaces suggested improvements. Framed to clubs as a
free value-add ("here's what we noticed about your site this month"), and to us as
an upsell/retention signal. Sits alongside the SEO/analytics roadmap and the per-club
SEO work on the F2 builder.

## Checks to cover
- **SEO structured data / schema** — presence + validity of JSON-LD (Organisation,
  SportsTeam, Event), title/meta/canonical.
- **Page speed** — Lighthouse-style score (LCP/CLS/TTFB), mobile + desktop.
- **Image alt tags** — count of images missing `alt`.
- **Meta / title tags** — missing/duplicate/over-length titles + descriptions.
- **Broken links** — internal + outbound 4xx/5xx.
- (Later) accessibility basics, mixed-content, sitemap/robots presence.

## Suggested shape (to decide at build time)
- **Table** `club_audits` (own table, one row per club per run): `club_id`, `run_at`,
  `scores jsonb`, `issues jsonb`, `suggestions jsonb`, `overall_score`. Reportable
  like the migration views (`club_audit_latest`, `club_audit_progress`).
- **Runner** — scheduled edge function or external worker (Lighthouse needs a
  headless browser, which Supabase Edge/Deno can't run — likely an external runner
  such as PageSpeed Insights API, or a small Cloudflare Worker / GitHub Action).
  The lighter checks (schema, alt, meta, broken links) can run in an edge function.
- **Surface** — a per-club "Website health" card in admin (reuse the SopViewer /
  sw1- card patterns), and optionally a club-facing read-only view later
  (`platform_docs.visibility='club'` precedent).

## Open questions
- Lighthouse execution environment (PSI API vs self-hosted headless) + cost.
- Cadence (weekly? monthly?) and how results are shown to clubs (email digest?).
- Overlap with existing SEO roadmap / F2 per-club SEO — align, don't duplicate.

## Not blocking anything
Independent of the migration tracker and the SaaS-app move. Pick up when prioritised.
