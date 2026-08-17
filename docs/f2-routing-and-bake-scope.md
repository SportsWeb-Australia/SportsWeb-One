# F2 real routing + bake — scope

**Goal:** a club's website in SW1 is a set of `club_pages` — arbitrary pages, real URLs — served fast via the publish-time bake, so the Claude-built sites sitting outside SW1 (Dookie United first, then the rest) can be **imported as data** and managed through the platform from then on. This is the piece that turns "clubs edit a 15-route template" into "clubs edit the site we built them".

**Why now:** the pre-render pipeline (PR #125) is built and verified end to end, but it bakes only the legacy fixed-route tree. F2 pages exist (`club_pages`, `PageRenderer`, composer) but render only behind `?f2=<slug>` — a query-param opt-in with no real URLs, no nav integration on main, and no bake coverage. Until F2 pages have real URLs, no site with pages outside the fixed 15 routes can live in SW1 at all (Dookie's site has 23 pages; ~14 have nowhere to go).

---

## Ground truth (verified 2026-08-17)

- **Legacy routes are code:** `src/PublicSite.tsx` (extracted from `App.tsx` this week) hardcodes `/`, `/about`, `/teams`, `/football`, `/netball`, `/program/:slug`, `/fixtures`, `/news`, `/news/:slug`, `/events`, `/events/:slug`, `/sponsors`, `/documents`, `/contact`, `/register`, `*`.
- **F2 opt-in:** `App.tsx` — `?f2=<slug>` renders `<F2Page clubId slug/>`; `?compose` opens the composer. No pathname ever reaches F2.
- **`club_pages` schema already carries what routing needs:** `slug`, `is_home`, `nav_label`, `nav_order`, `nav_visible`, `nav_parent_id`, `title`, `seo jsonb`, `draft_layout`, `published_layout` (verified against live rows). Public read is the SECURITY DEFINER RPC `public_club_page(club_id, slug, preview_token)` — published layout for published clubs, draft for a valid token, zero rows otherwise.
- **Renderer is bake-compatible by construction:** `F2Page` is a thin fetch wrapper; `PageRenderer` is pure given `layout`/`ctx`/`theme` with a per-section error boundary (validate-or-skip). The same fetch-then-`renderToString` split the legacy bake uses applies cleanly.
- **The bake/served pipeline is ready for a second source:** `club_page_cache.source` defaults `'legacy'` and was reserved for exactly this; `api/render.js` is route-keyed and source-agnostic; `publish_club_page` **already fires `notify_bake`** (wired this week) — today that bake just doesn't render F2 pages.
- **On branch `f2-rdca-port-v2` (PR #126, unreviewed):** public nav from `club_pages` (`usePublicClubNav.ts`, `supabase/f2-public-nav.sql`), the chrome shell (`src/sections/chrome/`), sidebar layout mode split draft/published (`f2-sidebar-layout.sql`, applied to the *develop* project), 4 new section types, and the repo's only test suite. Main's F2 has 16 section types and none of that.
- **Import target reference:** `~/Developer/dookie-united-fancy` — 23 static pages incl. nested paths (`/welfare/concussion`, `/football/juniors`, `/legal/privacy`), currently live at dookieunited.com.au on Cloudflare Pages.
- **`docs/F2-design-doc.md` is LOCKED** — this scope extends it (real URLs were always the destination: legacy `club_content` "folds into `public_club_page` when F2 lands"); it must not contradict it. Re-read it before building.

## Design

### 1. Per-club renderer flag — explicit, never inferred

`clubs.render_mode text not null default 'legacy'` (`'legacy' | 'f2'`). A club is moved to F2 deliberately, one at a time. Inferring from "has club_pages rows" would flip a club the moment someone drafts a page — silent and wrong. Every existing club is untouched by default.

### 2. Routing (the core change)

In the public tree, when the resolved club has `render_mode='f2'`:
- `/` → the `is_home=true` page.
- Catch-all `/*` → `public_club_page(club_id, <full path minus leading slash>)`. **Slugs may contain slashes** (`welfare/concussion`) — one text column, no tree tables; `nav_parent_id` already models menu nesting separately from URL shape.
- **Hybrid system routes stay:** `/news/:slug`, `/events/:slug` (collection detail pages), plus `/admin`, `/start`, `/guide` and the SEO endpoints. Collections (news/events/sponsors/teams/matches) remain typed tables rendered by F2 *sections*; their detail pages are system-rendered. A **reserved-slug list** (those prefixes) is enforced at page-save so a club can't shadow a system route.
- Unknown path → branded 404 (S9/§D8).
- Legacy clubs: zero change. `?f2=` preview stays as the composer's preview mechanism.

### 3. Nav + chrome

Nav derives from `club_pages` (`nav_label/nav_order/nav_visible/nav_parent_id`) via one RPC — the branch's `f2-public-nav.sql`/`usePublicClubNav.ts` is this, done. Chrome (header/footer shell) likewise exists on the branch. This is the strongest argument for reviewing PR #126 **first** rather than rebuilding a subset of it.

### 4. Bake + serve

- New RPC `public_club_pages_index(club_id)` → published pages' `slug, title, is_home, nav_*, seo` (anon-callable, published-clubs-only; same gate shape as `public_club_page`). Used by the bake, the nav, and `sitemap.xml`.
- `api/bake.js`: for `render_mode='f2'` clubs, enumerate via the index RPC, fetch each layout via `public_club_page`, render `PageRenderer` + chrome under `StaticRouter` (new `renderF2RouteToHtml` beside the legacy one, same shell/assembly/hydration mechanics), write rows with `source='f2'`. Hybrid detail routes still bake from the legacy renderer path. All-or-nothing per club, as now.
- `api/render.js`, cache table, trigger, hydration in `main.tsx`: **no structural change** — routes are just keys. Hydration payload for F2 pages carries the layout doc + ctx instead of `ClubConfig`.
- `api/sitemap.xml.js` learns the index RPC.
- SSR guard sweep over the F2 section components (same pre-flight as the legacy tree got — effects don't run under `renderToString`; anything reading `window` at render time must be gated; SEO must come from data, not effects).

### 5. The import pipeline (the payoff, per club)

Claude-executed per club, SOP-style: harvest the static site → author `club_pages` rows (map each page to registry sections; `rich_text` is the fallback for prose that fits no section) → seed collections (news/events/sponsors/teams) → images to `club-media` → set nav fields → set `render_mode='f2'` → publish → `publish_club_page`/`set_website_status` fire the bake automatically. Old-URL → new-URL 301 map per the live-migration SOP for anything that moved. Domain cutover stays a separate, later step (needs `club_domains` — still not applied to prod — and the Vercel domain attach; explicitly out of this scope).

## Phasing

1. **Decide the base** (see decisions) → `render_mode` column + routing catch-all behind it. Prove on `scratch-tenant` (restore `club_pages_backup_20260817` — the deleted test pages — as fixtures).
2. Nav + chrome on real URLs.
3. `public_club_pages_index` + bake F2 + sitemap + hydration. Verify with the same publish→bake→serve→unpublish cycle used for PR #125.
4. Reserved slugs + branded 404 + composer save-guard.
5. **Pilot import: Dookie United** — all 23 pages, on the SW1 URL (no domain cutover yet). Side-by-side against the Cloudflare site.
6. Then the queue of outside clubs, one at a time.

## Decisions (Carson, 2026-08-17)

1. **Base branch: review + merge PR #126 first.** Routing builds on its nav/chrome/tests rather than rebuilding them.
2. **Hybrid detail routes.** F2 pages own the page tree; `/news/:slug` and `/events/:slug` stay system-rendered from the collection tables.
3. **Import authors the pages.** No auto-provided system pages: an F2 club's site is exactly its own `club_pages` set — the per-club import creates fixtures/news/contact pages as part of it.

## Risks

- **PR #126 is unreviewed** and its SQL was applied to the *develop* project, not prod — sequencing it means reviewing ~40 files of someone else's WIP first.
- **Slug/system-route collisions** — mitigated by the reserved list, but the list must also cover future system routes.
- **SSR guards in F2 sections** — unaudited for `renderToString`; budget a pre-flight pass (the legacy tree needed three fixes).
- **`docs/F2-design-doc.md` is locked** — any conflict between this scope and it must be resolved by Carson, not silently.
