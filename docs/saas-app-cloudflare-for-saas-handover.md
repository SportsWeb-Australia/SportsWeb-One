# Handover — SW1 app → Cloudflare for SaaS (design session)

**For:** a fresh Claude Code thread tasked with designing (not yet building) the move
of the SW1 multi-tenant app onto Cloudflare using Cloudflare for SaaS (Custom
Hostnames). Carson wants this sooner than later.

**Read first:** `docs/saas-app-cloudflare-for-saas-scoping.md` (the scoping + gating
decisions) and `docs/phase3-club-audit-spec.md` (adjacent parked work). The Site
Migrations feature (Phases 1–2) is already shipped — use it as the *pattern* for the
per-club provisioning record here.

## Context
- SW1 is a **multi-tenant** app (Vite + React + TS + Supabase, project ref
  `uzibfawcwoapfbigpzum`), currently deployed on **Vercel** from GitHub
  `SportsWeb-Australia/SportsWeb-One` `main`. ~20 clubs today.
- Each club has its **own domain** pointing at the one app. This is **not** the
  club-site migration SOP (that moves standalone sites to one Pages project each).
  This is **Cloudflare for SaaS / Custom Hostnames**: many club domains → one app,
  with an auto-provisioned TLS cert per domain.
- DNS stays at **VentraIP**; club **email (MX/SPF/DKIM) is never touched** — same
  golden rule as the club-site SOP.

## Recommended direction (starting point — validate, don't assume)
1. **Origin:** deploy the SPA to **Cloudflare Pages**; put a **Worker** in front to
   route by `Host` header → club (tenant resolution). Keeps the whole path on CF.
2. **Cert validation:** **DCV delegation** — clubs add one `_acme-challenge` CNAME
   once; Cloudflare then auto-issues + auto-renews all custom-hostname certs. Best fit
   when we don't control the clubs' DNS.
3. **Apex vs www:** reuse the club-SOP pattern — `www` canonical (CNAME to our SaaS
   fallback origin), bare domain 301 → `www`. Email records untouched.
4. **Cost (~20 clubs):** ~$0–5/mo. 20 of 100 custom hostnames free; Pages free;
   Workers free tier likely fine. Advanced Certificate Manager (~$10/mo) probably not
   needed. CONFIRM current Cloudflare pricing during the session.

## What the design session should PRODUCE (no building yet)
1. A decision record locking #1–#3 above (or a reasoned alternative), after a
   **single real-club end-to-end spike plan** (pick one club, prove the full path:
   custom hostname added → cert issued → app serves that club by Host header).
2. A **cost model** against the real club count + growth.
3. A spec for a **hostname-provisioning flow** modelled on the Site Migrations tracker:
   a `saas_hostnames` (or similar) table (status + steps + reportable views), an admin
   action, and an edge function that calls the **Cloudflare for SaaS API** to create /
   check custom hostnames. Mirror `site_migrations` naming/patterns.
4. The **tenant-resolution change** in the app (map incoming `Host` → club) and how it
   coexists with the current slug/preview routing.
5. A **phased migration plan** (spike → origin standup → provisioning flow → migrate
   clubs in waves), email untouched throughout.

## Guardrails / house rules (SportsWeb-One)
- Hand-written CSS (`sw-` / `sw1-` prefixes), no Tailwind. SQL is pure ASCII.
- Migrations: Claude may apply via Supabase MCP/SQL editor for this account (Carson's
  standing call), but keep the `.sql` file in `supabase/` as the source of truth. The
  house `updated_at` trigger fn is `public.update_updated_at()` (NOT
  `update_updated_at_column()` — that only exists in the `storage` schema).
- Admin chrome is always SportsWeb blue (`#2563eb`), never club-tinted.
- Show diffs before commit/push; Carson verifies on Vercel/preview.
- This is a DESIGN session: produce decisions + specs, do not start building the
  provisioning flow until Carson approves the design.
