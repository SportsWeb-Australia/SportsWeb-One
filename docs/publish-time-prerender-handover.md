# Publish-time HTML pre-rendering — implementation handover

**Status:** Approved by Carson, ready to build. Design + research complete (done in a separate session, in an unrelated repo). This doc is the complete brief — you should not need any other context.

**Scope:** SW1 only. Pilot on Dookie United only. All on `main`.

---

## ⚠️ READ FIRST — repo state before you touch anything

At the time this handover was written, the local checkout at `~/Developer/SportsWeb-One` was:

- **82 commits behind `origin/main`**
- Carrying **~23 modified tracked files** and a large set of untracked files — in-progress F2 / AFLVM / sections work from a **parallel session** (`src/sections/*`, `src/admin/PageComposer.tsx`, `src/lib/loadClub.ts`, `src/main.tsx`, `supabase/f2-*.sql`, `public/aflvm-*`, etc.)

Three of those dirty files — `src/lib/loadClub.ts`, `src/main.tsx`, `src/sections/usePublicClubPage.ts` — are files **this plan also needs to modify**. Do not start editing until you have reconciled this.

**First actions, before any implementation:**
1. `git status` and `git log --oneline -5` to see the current real state (it will have moved on from the above).
2. `git stash -u` or commit the parallel session's work — confirm with Carson which, do not discard it.
3. `git pull` to get current with `origin/main` (the 82-commit gap means the line numbers cited throughout this doc may have drifted — treat them as landmarks, re-grep to confirm before relying on any specific line).
4. Re-verify the key file references in "Ground truth" below actually still match after pulling.

---

## Context — why this exists

Carson wants Dookie United's real domain eventually running through SportsWeb One itself, so club edits (news, events, images) publish live with no developer in the loop, and no risk of two copies of the truth drifting apart (a separate static site + SW1's database). Getting there safely means two separable pieces of engineering:

1. **Publish-time rendering/caching** — *this plan*. Make SW1 itself fast, the way Wix/Squarespace bake a cached page on Publish instead of every visitor triggering a live client-rendered database query. Buildable and provable entirely on SW1's own domain, zero risk to any real club or domain.
2. **Custom hostname routing** — `docs/saas-app-cloudflare-for-saas-scoping.md`, marked "scoping only, do not build". Routing a real domain like `dookieunited.com.au` through SW1. **Explicitly out of scope here**, gated on its own separate unresolved decisions. Do not conflate the two.

Carson explicitly chose the full solution over a lighter interim option (which would have been: collapse the ~11 live Supabase queries into one cached JSON snapshot, keeping the app client-rendered). He wants **real server-rendered HTML, baked at publish time** — actual Wix/Squarespace parity, not just fewer database round trips.

He also chose to build **directly on `main`** rather than a feature branch, on the basis that `docs/F2-design-doc.md` confirms "NO CLUB IS LIVE" today — only Carson's own demo/draft clubs exist, so there is no real traffic to protect against mid-build.

### Related context: the Dookie static site

There is currently a **separate, static, hand-built Dookie site** live at `dookieunited.com.au`, hosted on **Cloudflare Pages** (project `dookie-united-fancy`, repo `SportsWeb-Australia/dookie-united-fancy`, local `~/Developer/dookie-united-fancy`). It was cut over to the real domain recently, is indexed, has Google Search Console verified, and has a PWA install prompt.

That static site is **the "second copy of the truth"** this whole initiative exists to eventually eliminate. It is **not** part of this build and must not be touched by it. Pointing `dookieunited.com.au` at SW1 is a distinct future migration, downstream of both this piece *and* the Cloudflare-for-SaaS piece.

---

## Ground truth from investigation

Three parallel Explore agents surveyed the SW1 repo. Findings below are what they confirmed. (Line numbers predate an 82-commit gap — re-grep to confirm.)

**Which renderer the pilot targets:** the live public routes today (`/`, `/about`, `/teams`, `/fixtures`, etc., `src/App.tsx:265-284`) are the **legacy** `ClubConfig`-driven renderer, fed by `getClubConfig()` → `buildClubConfig()` in `src/lib/loadClub.ts`. The newer F2 `PageRenderer`/`public_club_page` path (JSONB `draft_layout`/`published_layout` on `club_pages`) is still opt-in via `?f2`, and Dookie has no `club_pages` rows yet. **The pilot targets the legacy route tree, not F2.** F2 pages plug into the same cache layer later as a second content source. (Note: the parallel session's dirty files are heavily in F2/sections territory — another reason to reconcile the working tree first.)

**The performance problem being solved:** SW1 is a pure Vite + React SPA — no SSR, not Next.js. Every visit paints an empty shell, then a `useEffect` (`App.tsx:150-168`) fires ~11 sequential/parallel Supabase queries via `buildClubConfig()` before real content appears. There is **zero caching of page content anywhere** — the only `Cache-Control` headers in the entire repo are on 3 SEO endpoints (`sitemap.xml`, `robots.txt`, `llms.txt`), not on actual pages.

**Publish hooks — the two places to wire a bake trigger:**
- `set_website_status(p_club, p_status)` — `supabase/club-publish-control.sql:64-93`. Whole-club draft/published/suspended toggle. Called from `src/admin/PublishControl.tsx:76-91`.
- `publish_club_page(p_page_id)` — `supabase/f2-page-schema.sql:217-250`. Copies `draft_layout → published_layout`. Called from `src/admin/PageComposer.tsx:260-277`.

Both are bare SECURITY DEFINER column writes today — **no trigger, webhook, or rebuild fires from either.**

**Existing webhook precedent to mirror:** `pg_net` is already enabled. `sitepulse_notify_new_feedback()` (fired by an `AFTER INSERT` trigger on `sitepulse_feedback`) reads a URL + secret from Supabase Vault and calls `net.http_post(...)`, wrapped in `exception when others then return` so a failure never blocks the write. **This is the exact pattern to replicate** for "fire an HTTP call on publish."

**Data model:** `clubs` (`id`, `slug`, `domain` — unique but unused by resolution, `website_status` enum, `is_demo`, `preview_token` + expiry). `club_pages` has **no anon grant at all** — public reads go only through SECURITY DEFINER RPC `public_club_page(p_club_id, p_slug, p_preview_token)`, which already handles "valid preview token → always draft, even for a published club" and "no leak of unpublished clubs' existence." Other public tables (`news`, `events`, `sponsors`, `teams`, `matches`, `ladder`, `club_content`) are anon-readable directly, RLS-gated on both the row's own `status='published'` **and** the parent `clubs.website_status='published'`.

**`club_domains`** (`host text primary key, slug text`) maps hostname → club slug. Read by both `src/lib/supabase.ts:resolveClubSlug()` (client, `window.location.hostname`) and `api/_club.js:resolveClub()` (server, `req.headers.host`) — deliberately mirrored implementations. **Caveat:** this table does not appear in the main schema dump (only in a separately-run `supabase/run-this.sql`). Both existing resolvers handle its absence gracefully. Verify it is actually live before depending on it.

**Vercel:** `vercel.json` has only the 3 SEO-endpoint rewrites + a catch-all SPA fallback to `index.html`. No `headers` block. `api/` holds only plain `.js` Node functions today (`_club.js`, `sitemap.xml.js`, `robots.txt.js`, `llms.txt.js`) — **no TSX/JSX imports from `api/` exist yet**, and no `@vercel/kv` / `@vercel/blob` / SSR framework in `package.json`.

**Known risk to design around:** `docs/fake-data-audit.md` found live bugs in the current fetch path (e.g. hardcoded "the Dooks" copy leaking onto other clubs' `/fixtures` pages). Baking freezes whatever bugs exist into the cache until the next publish — so the bake path **must call the exact same `buildClubConfig` the client uses**, never a second parallel implementation. `docs/F2-design-doc.md` (LOCKED) asserts "NO FAKE DATA. EVER." — the cache layer must never itself become a source of stale-presented-as-current content.

**Pilot club:** Dookie United — `club_id 7a841f7f-c6ac-4181-aec2-e91c53103512`, slug `dookie-united`, a **real non-demo club** (`is_demo = false`), currently `website_status='draft'`.

---

## Implementation plan

### 1. Render function — extract a server-safe render path

`App.tsx:150-168` fetches via `useEffect`, so data arrives *after* first render — SSR needs it *before*. Refactor:

- **`src/lib/loadClub.ts`**: `buildClubConfig(clubRow, opts)` is already pure (no browser globals) — export it directly, or add a thin `getClubConfigForClubId(clubId, opts?)` wrapper (mirroring the existing `getClubConfigById` shape) as the documented **bake entry point**. Server-side resolution (host → slug → club_id) stays separate, mirroring `api/_club.js:resolveClub`.
- **Verify before wiring the pilot:** confirm `dookie-united`'s slug does *not* equal `staticClub.identity.slug` in `src/content/club.config.ts`. `buildClubConfig` branches on that (`isDemoClub`) and falls back to the rich hardcoded Dookie fixture vs. `emptyClub` — baking the wrong base config for the pilot club would be a visible day-one regression.
- Extract `App.tsx`'s public-site JSX (~lines 247-291) into a new pure component **`src/PublicSite.tsx`** (`{ club, variant }` props, no `useEffect`/`window`). `App.tsx` renders `<PublicSite .../>` for the client path; a new **`src/lib/renderClubRoute.tsx`** exports `renderRouteToHtml(club, variant, path)` using `react-dom/server`'s `renderToString` + `react-router-dom/server`'s `StaticRouter` (already available via the existing `react-router-dom` dep) wrapping the same `<PublicSite/>`.
- **`src/lib/seo.ts`**'s `SeoManager` is DOM-mutation-only (`document.head.querySelector` etc.) — cannot run under `renderToString`. Extract a pure `computeSeoTags(club, route): SeoHead` used by both the existing client effect and the bake function.
- **Pre-flight, not an assumption:** audit per-page components (`Fixtures.tsx`, `Home.tsx`, etc.) for `window`/`document` calls outside `useEffect` before assuming `renderToString` won't throw.

### 2. Bake function — `api/bake.js`

New Vercel Node function. Reuses `api/_club.js`'s Supabase client pattern, but takes an explicit `club_id` (+ optional page list) from the trigger's POST body rather than resolving from request headers.

For each legacy route (`/`, `/about`, `/teams`, `/fixtures`, `/news` + detail slugs from the fetched data, `/events` + detail, `/sponsors`, `/contact`, `/register`): call `getClubConfigForClubId` **once**, then `renderRouteToHtml` per route reusing that one fetched config. Assemble final HTML from the built `dist/index.html` shell (hashed asset tags) + rendered markup into `#root` + `computeSeoTags` output in `<head>` + a `<script id="sw1-hydration-data" type="application/json">` payload (§6).

**Open build-tooling question — resolve this FIRST, before the rest is buildable:** how `api/bake.js` gets access to `dist/index.html`'s shell at request time (self-fetch over HTTP vs. a build-time-captured shell asset), and whether Vercel's zero-config Node function bundler transpiles a TSX/`src/` import from a plain `.js` `api/` file at all. **No precedent for either in this repo** — may need a small dedicated esbuild step that doesn't exist today. **Prototype in isolation** (curl `api/bake.js` manually for Dookie's `club_id`, inspect output) before building anything else.

Authenticated via the same Vault-secret shared-header pattern as `sitepulse-notify` (`x-webhook-secret` checked against a `BAKE_WEBHOOK_SECRET` Vercel env var) — not an open URL.

### 3. Cache storage — new Postgres table, not Vercel Blob/KV

Reuses existing infra (no new provisioning, no new secret-storage surface) and keeps read-after-write consistency simple against the same DB the serving path already queries for `website_status`.

New file `supabase/club-page-cache.sql`:

```sql
create table public.club_page_cache (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  route text not null,
  html text not null,
  seo jsonb not null default '{}',
  club_config jsonb not null,
  source text not null default 'legacy',
  baked_at timestamptz not null default now(),
  club_status_at_bake website_status not null,
  unique (club_id, route)
);
alter table public.club_page_cache enable row level security;
revoke all on public.club_page_cache from anon, authenticated;
-- Written only by the bake function via the service_role key (new secret,
-- Vercel-env-scoped — first server-side use of service_role in this repo).
-- Read only via a SECURITY DEFINER RPC (§5), never a direct grant.
```

### 4. Trigger wiring — extend the two publish RPCs directly

**Not** a blanket `AFTER UPDATE` trigger on `clubs` (too wide — fires on unrelated edits). Instead add the `net.http_post` call *inside* `set_website_status` (only in the `p_status='published'` branch) and *inside* `publish_club_page` (after its layout copy), each via a shared `notify_bake(p_club_id, p_reason)` helper mirroring `sitepulse_notify_new_feedback`'s Vault-secret + swallowed-exception shape.

New Vault secrets: `bake_notify_url` (→ deployed `api/bake` URL), `bake_webhook_secret`. New file: `supabase/publish-bake-notify.sql`.

⚠️ **This modifies two existing locked-down SECURITY DEFINER publish RPCs — it is not purely additive SQL.** Treat with care.

### 5. Serving path — `api/render.js` fronting public routes

No Edge Middleware exists today. Add a Node function and repoint `vercel.json`'s catch-all rewrite at it — **carefully** excluding `/admin/*`, `/start`, `/guide`, static assets, and the existing SEO endpoints. Vercel rewrites match in array order, first match wins; this needs real testing, not assumption.

Logic:
1. Resolve club via the existing `api/_club.js:resolveClub` (reused, not reimplemented).
2. **`?preview=<token>` always bypasses cache** — falls through to a live on-demand render (same `getClubConfigForClubId` + `renderRouteToHtml`, just not persisted), mirroring `public_club_page`'s existing "token always wins" behaviour.
3. Otherwise **re-check `clubs.website_status` fresh at serve time** (cheap indexed read). **Never trust `club_page_cache.club_status_at_bake`** — that column is a debugging artifact only. Not-published → serve today's plain SPA shell unchanged, regardless of any lingering cache row. *This is what makes unpublish/suspend take effect immediately.*
4. Published + cache row exists → serve `html` verbatim with a conservative `Cache-Control` (e.g. `public, max-age=60, stale-while-revalidate=300`). Published + no cache row yet (bake lag) → fall back to the SPA shell. **Never a 500 or a blank page.**
5. Route the actual read through a new SECURITY DEFINER RPC `public_club_page_cache(p_club_id, p_route, p_preview_token)`, mirroring `public_club_page`'s access-control shape, rather than a raw anon-key `select` — keeps this repo's existing convention.

**Pilot safety gate:** `api/render.js` only consults the cache/new path at all when `club_id` is in an env-var allowlist (`BAKE_PILOT_CLUB_IDS=7a841f7f-...`). Every other club falls through to today's unchanged SPA-shell behaviour unconditionally, so this **cannot affect any other club even by accident**.

### 6. Hydration

Bake payload embeds `ClubConfig` in a `<script id="sw1-hydration-data" type="application/json">` tag. `src/main.tsx` changes to: if that script tag exists, parse it and `ReactDOM.hydrateRoot(root, <App initialClub={parsed} />)` instead of a fresh `createRoot().render()`. `App.tsx`'s `useState(emptyClub)` seed (line ~70) takes a new `initialClub` prop so the first client render tree matches the server-sent DOM (required for clean hydration).

The existing data-fetch `useEffect` still runs afterward as a freshness safety net for SPA navigations, but causes no visible flash since state already starts correct. No hydration script present (draft/suspended clubs) → falls back to today's `createRoot()` path unchanged.

⚠️ **Real risk — test explicitly, don't assume:** `hydrateRoot` is strict about DOM mismatches. `loadClub.ts`'s `toLocaleDateString`/`toLocaleTimeString` calls (match dates/times) can format differently between Node's ICU build and the browser's. Verify no hydration-mismatch warnings on Fixtures/Home before calling this done.

### 7. Rollout sequence — all on `main`, Dookie only, in order

0. **Reconcile the working tree first** (see "READ FIRST" at top) — stash/commit the parallel session's work, pull, re-verify file references.
1. **Refactor pass only** (§1) — `PublicSite` extraction, `getClubConfigForClubId`, `computeSeoTags`. Deploy, confirm **zero behaviour change** to the live (still client-rendered) site.
2. **Prototype `api/bake.js` in isolation** (§2), manual curl against Dookie's `club_id`. Resolve the `dist/index.html` access question before proceeding.
3. **Add `club_page_cache` + `public_club_page_cache` RPC** (§3), nothing writing to it yet.
4. **Wire `api/bake.js` to persist**; manual curl, confirm a sane row lands.
5. **Build `api/render.js` + `vercel.json` rewrite**, gated by the `BAKE_PILOT_CLUB_IDS` allowlist (§5) so no other club is reachable through this path.
6. **End-to-end test against Dookie while still `draft`:** bake → confirm cached serve + clean hydration (no console warnings) for allowlisted requests; confirm `?preview=` is always live; confirm deleting the cache row degrades gracefully to the current SPA shell.
7. **Apply the SQL trigger** (§4), create the two Vault secrets, set `BAKE_WEBHOOK_SECRET` in Vercel.
8. **Flip Dookie to `website_status='published'`** via the existing `PublishControl.tsx` UI — confirm the trigger fires, the bake completes, and a real allowlisted request gets correct baked HTML + SEO tags + hydration.
9. **Flip Dookie back to draft/suspended** — confirm the live `website_status` re-check stops serving cached HTML on the very next request, even with a stale row still present.
10. **Only after verified stable:** widen or remove the allowlist, club by club. Separate later decision, not part of this plan.

---

## Open risks (flagged, not glossed over)

- **`api/` reading `dist/` build output**, and **whether Vercel's Node bundler transpiles TSX imports from a plain `.js` API file** — no precedent in this repo for either. Resolve both in step 2's isolated prototype before building further. May need a small dedicated esbuild step this repo doesn't have today. *This is the single biggest unknown in the plan.*
- **`club_domains` table's actual existence** on the live DB is unconfirmed (absent from the main schema dump). Verify directly, don't assume — though the pilot's allowlist-by-`club_id` gate mostly sidesteps it.
- **Hydration mismatch from locale-dependent date/time formatting** — test explicitly against the real Vercel Node runtime (§6).
- **Bake staleness window** — only `set_website_status`→published and `publish_club_page` trigger a re-bake. Content edited via other admin paths post-publish (news, events, `club_content` inline overrides) does **not** re-trigger a bake in this plan, so an admin editing news after publishing goes stale until the next explicit publish/unpublish/republish cycle. **Real product question worth deciding explicitly with Carson before or during implementation:** should every content write re-bake, or only explicit publish actions?
- **`vercel.json` rewrite ordering** — routing `/(.*)` through `api/render.js` while still correctly serving `/admin/*`, static assets, and the SEO endpoints is a genuine misconfiguration risk. A bad rewrite breaks the *whole app*, not just public pages. Test against a preview deployment before touching `main`'s production alias.
- **Working-tree collision with the parallel F2/AFLVM session** — `src/lib/loadClub.ts`, `src/main.tsx`, and `src/sections/usePublicClubPage.ts` are dirty *and* in this plan's edit path. Reconcile before starting.

---

## Explicitly out of scope

- **Custom-domain routing** (Cloudflare for SaaS / `docs/saas-app-cloudflare-for-saas-scoping.md`) — separate piece, separate gating decisions, not touched by this plan.
- **Any club other than Dookie United** — gated by the `BAKE_PILOT_CLUB_IDS` allowlist throughout.
- **The static Dookie site** (`~/Developer/dookie-united-fancy`, live on Cloudflare Pages at `dookieunited.com.au`) — not touched.
- **Actually pointing `dookieunited.com.au` at SW1** — downstream of both this piece and the Cloudflare piece; a distinct future migration decision.
