# SW1 app → Cloudflare for SaaS — scoping (wanted sooner; DECIDE before building)

**Status:** Scoping only. Carson wants this sooner than later. Do NOT start building
until the one gating decision below is made — this is a different job from the
club-site migration SOP.

## Why this is NOT the club-site SOP
The club-site SOP moves *small standalone sites* (one repo → one Cloudflare Pages
project) off Vercel. This is the opposite shape: **one multi-tenant app** (the SW1
SaaS) that **many club domains** all point at. You don't get one Pages project per
club — you need every club's own domain to resolve to the single app, with a valid
TLS cert per domain. That is exactly what **Cloudflare for SaaS (Custom Hostnames)**
is for.

## The one gating decision: how custom hostnames + SSL get provisioned
Cloudflare for SaaS lets you attach each club's domain to our zone as a **Custom
Hostname**, and Cloudflare auto-issues/renews the TLS cert for it. The club keeps
DNS at VentraIP and just points a record at our **fallback origin**. Options to pin
down before building:

1. **Where the app runs** (fallback origin):
   - **Cloudflare Workers/Pages Functions** in front of the app — cleanest fit with
     CF for SaaS; Custom Hostnames route straight to a Worker.
   - **Keep the app origin on Vercel**, put Cloudflare in front (CF for SaaS →
     proxied origin). Less migration now, but two vendors in the path.
   - Recommendation to evaluate first: **Workers/Pages** so the whole path is CF.

2. **Cert validation method** per custom hostname:
   - HTTP validation (simplest, needs the hostname already routing to us), TXT, or
     **DCV delegation** (best for many domains where we don't control their DNS —
     the club delegates `_acme-challenge` once via a CNAME).

3. **Apex vs www** (same email-safety principle as the club SOP):
   - Clubs keep MX/SPF/DKIM at VentraIP untouched.
   - `www` → CNAME to our fallback origin (e.g. `apps.sportsweb.com.au`).
   - Apex `theclub.com.au` → CNAME flattening isn't available at VentraIP, so either
     301 the apex → www (reuse the club-SOP pattern) or use an A record to CF anycast.

4. **Cost / limits:** CF for SaaS includes a free allotment of custom hostnames then
   bills per active hostname — model this against the club count before committing.

## Rough phased path (once decided)
1. Decide origin (Workers/Pages vs proxied Vercel) + validation method (spike one
   real club end-to-end).
2. Stand up the fallback origin; wire the app's tenant resolution to read the
   incoming `Host` header (map hostname → club).
3. Build a **Custom Hostnames provisioning flow** (CF for SaaS API) — likely a new
   admin action + edge function, mirroring the Site Migrations tracker so each club's
   hostname state is recorded and reportable.
4. Migrate clubs in waves; keep email records untouched throughout.

## Relationship to what's already built
The Site Migrations tracker + `platform_docs` SOP pattern is a good template for the
per-club **hostname provisioning** record here (status, steps, reportable views).
When we build this, model it the same way.

## Next step
Book a short design session to make decision #1–#3 (origin, validation, apex handling)
and cost-check #4. Then spec the provisioning flow as its own build.
