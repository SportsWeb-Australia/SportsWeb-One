# RDCA design port — audit v2 (reconciled to Brief 10)

**Status (updated 2026-08-03, end of build session):** the audit below is done; Step 4 (the actual port) is now substantially built and verified live against the real seeded RDCA demo club on `develop`. See "Build progress" immediately below for what shipped and what's left. The rest of this file is the original read-only audit, kept as-is for reference.

## Build progress (this session, after the audit)

**Schema/renderer foundations:**
- `sectionInstanceSchema.column`: `'main' | 'side' | 'full'` — 'full' added after discovering live that RDCA's real page isn't just two columns (hero/ticker/app-buttons sit full-width *before* the main/side split; photo-strip/contact/sponsor-carousel sit full-width *after* it). `PageRenderer` groups the flat array into interleaved full/cols runs, preserving document order.
- `hero.layout`/`showMatchCard`, real `.hero-grid`/`.hmc` markup for `layout: 'feature'` — extended the schema to match fields *already seeded* in the real DB (`titleRich`, `stats`, `badges`, `note`) rather than leaving them silently stripped.
- Real, complete token set (`club_themes.key='feature'`) — navy/red/Bebas Neue/DM Sans lifted from the real site. Fixed a platform-wide bug first: F2 had **zero fallback color tokens** at all (every `--bg`/`--text`/`--surface`/etc. was legacy-only).
- Chrome shell (topbar/nav/mobile-menu/footer) — didn't exist in F2 before this session. Real DB-driven dropdown nav via new RPC `public_club_nav`.
- `layout_mode`/`draft_layout_mode`/`published_layout_mode` — draft/publish split so the composer's "Save is never live" invariant holds for structure too, not just content.

**New section types:** `clubs_directory`, `ticker`, `team_lineup`, `photo_strip` — all 4 confirmed gaps from §1a-gap and the decisions below, now built (schema + aiAuthorable + cardinality + component + registry + CSS), each verified live with real or realistic data.

**Display variants (the 7 decided type-vs-variant calls, all built):** `quick_links.display: 'icon-grid'`, `match_data.mode: 'top_performers'` (honest empty state — no leaderboard data source exists yet, not fabricated), `rich_text.layout: 'spotlight'` + `photo`, `announcement_bar.display: 'list'` + `items`, `sponsors.display: 'carousel'`, `cta_band.size: 'feature'` + `media`.

**Bugs found and fixed live, not before:**
1. A pre-existing generic CSS rule (`.sw-sec > *`) forced every section's direct child to a centred max-width column — broke the moment any section grew a second child (first the hero's match-card slot, then the hero's photo+grid wrapper). Fixed both times with a scoped override.
2. `public_club_nav`'s `RETURNS TABLE(id uuid, ...)` made `id` an OUT-parameter name; the unqualified `where id = p_club_id` inside the function body was ambiguous against it — a real Postgres 42702 error, caught via raw `fetch()` against the RPC, not assumed from a green build.
3. The RDCA hero row rendering full-width but squeezed into the main column's ~1fr share until `column: 'full'` was added and applied to the real seeded row.
4. One real seeded row used the pre-change `hero.layout: 'media-split'` value, which the enum rename had silently made invalid — fixed via a real data migration on the affected row, not skipped as "no rows exist" (a stale assumption from `f2-page-schema.sql`'s original comments).

**All of it verified live** against the real `develop`-branch DB (project `jgziqwowavhuqpbmzxhs`) at desktop/tablet/mobile — not mocked, except where no real data existed yet (clubs_directory, ticker/team_lineup/photo_strip, the two newest variants), in which case a temporary in-repo harness (`src/__verify.tsx`, deleted after each check) rendered the real components against realistic data.

**Competition Hub tabs shipped too:** `match_data` in `mode: 'combined'` with 2+ data types now renders as real, interactive Ladder/Fixtures/Results tabs (RDCA's actual UI), not three stacked blocks — verified live by clicking through all three tabs. Single-mode sections (`mode: 'fixtures'` etc.) keep the plain block, since tabs over one thing aren't tabs.

**News/events/contact finished too:** `news.layout:'feature'` now renders a real full-bleed featured-story card (image + gradient overlay + category/title/meta) followed by a grid of the rest, matching RDCA's news-hero + news-grid pattern — not one flat list. `events` cards now have a real image + date-badge overlay, not a text row. `contact.layout:'full-width'` ships — a real full-bleed dark closing-contact banner (RDCA's actual pattern), distinct from the existing inline card. All verified live.

**Step 4 is now essentially complete for the sections RDCA's real homepage uses.** No AFLVM content exists yet — this was all built against RDCA's real seeded data as the proving ground per Brief 10's own plan (port one design fully, then start the second/pitch site).

---

**Status (original, pre-build):** read-only audit. No code written. Per `docs/codey-brief-10-the-design-layer.md` Step 1: "Report the audit before writing code."

**Supersedes:** `origin/f2-rdca-port-pr-a`'s `docs/rdca-port-audit.md` (unmerged). That audit's Ruling 3 claimed F2's flat section array already handles RDCA's sidebar and hero match-card via theme tokens alone. Brief 10 explicitly corrects this: a prior audit "approved in error" a split that put the live-match card in its own section, "designing out the single most striking thing on the page." **F2 genuinely cannot express the sidebar or the in-hero match card today** — both need real schema additions, not just CSS. This audit is written against that corrected model.

**Source:** `design-sources/rdca-deploy-flat_1.zip` → `index.html` (994 lines), `_shared.css` (319 lines, 154 unique selectors), `_pages.css` (682 lines). RDCA = Ringwood & District Cricket Association, a real site Carson built and shipped. Sister site BHRDCA (Box Hill) shares 159/159 selectors, differs only in `:root` colour values — proof colour tokens alone don't make a design; RDCA's structure is what's being ported.

---

## 1a. RDCA homepage, section by section → F2 mapping

Walking `index.html` top to bottom in source order:

| # | RDCA section | Markup anchor | Maps to | Notes |
|---|---|---|---|---|
| 1 | Topbar | `.topbar` | **chrome** (new) | Contact strip + social + register CTA. Not a page section — site-wide chrome, like nav/footer. |
| 2 | Mobile menu | `.mob-menu` | **chrome** (new) | Slide-out nav, generated from the same nav data as #4. |
| 3 | Nav | `.nav-wrap` | **chrome** (new) | Sticky, 2-level dropdowns (Competitions, Media, RDCA). This is what Brief 10 means by "F2 renders bare sections today — no masthead/nav/footer." |
| 4 | Ticker | `.ticker-bar` | **new type: `ticker`** | Auto-scrolling live-score strip, cricket-specific fields (overs, RRR). Needs a sport-neutral data shape. |
| 5 | Hero | `.hero` | **`hero`** (exists) but needs `layout` + `showMatchCard` extension | See §1b — the `.hmc` card in the hero's 440px right column is the escape hatch F2 can't do yet. |
| 6 | App buttons | `.app-section` | **new type: `app_grid`** | 12-icon quick-nav grid (Fixtures/Results/Ladders/Clubs/Grounds/News/etc). Distinct from `quick_links` (which is link-list styled, not icon-grid styled) — worth checking if `quick_links` can absorb this as a `display: 'grid'` variant before adding a type. |
| 7 | Sponsor ad banner | inline, no section wrapper | **`cta_band`** (exists) | Fits the existing type as a display variant — a bordered gradient card with a CTA. No new type needed. |
| 8 | Mobile register banner | `.mob-reg-card` | **CSS-only** (`@media` visibility swap) | Not a distinct section — same register CTA restyled for mobile. Design detail, not a data concern. |
| 9 | News | `.news-hero` + `.news-grid` | **`news`** (exists) | Featured story (`news-hero`, full-bleed photo + overlay) + 2-col grid of smaller cards. `news.layout: feature\|grid\|list` (per the existing F2 doc) should cover this if `feature` renders one hero card above a grid. |
| 10 | Competition hub | `.comp-tabs` / `.ladder-wrap` / `.fxr` / `.rrow` | **`match_data`** (exists, module) | Tabbed ladder/fixtures/results, div selector. This is squarely the Match Centre module — PlayHQ-backed once entitled, empty-state otherwise (Rule 9). |
| 11 | Top performers | `.perf-grid` | **new type, or `match_data` sub-view** | Leaderboard (runs/wickets leaders). Could be a `match_data` display variant rather than a new type — worth deciding once PlayHQ's actual payload shape is known (does the public API even expose leaderboards?). |
| 12 | Rep cricket | `.rep-section` | **`cta_band`** (exists) | Full-bleed photo banner + copy + CTA — structurally identical to #7, just bigger. Confirms `cta_band` needs a `size: 'compact'\|'feature'` variant, not a new type. |
| 13 | Lineup | `.tl2-panel` | **new type: `team_lineup`**, or fold into `match_data` | Named XI list for the next match. Sport-specific (batting order). Candidate to be a `match_data` sub-component rather than its own registry type — needs the "fewer, realer types" test from Ruling 7 of the old audit. |
| 14 | Umpires | `.ump-banner` | **`cta_band`** (exists) | Same full-bleed-banner pattern as #7/#12. Third occurrence — strong signal `cta_band` should support a big-banner display mode as first-class, not a one-off. |
| 15 | Events | `.events-grid` | **`events`** (exists) | Straightforward — date badge + photo + title + location cards. No gap. |
| 16 | Clubs | `.clubs-divisions` / `.clubs-grid` | **no F2 type exists** — this is AFLVM's `clubs_directory` need too | Division-grouped grid of club cards (photo, crest, name, division, profile link). **This is the section AFLVM's brief calls the centrepiece ("Find a Club", ~45 clubs) and F2's registry has no type for it.** Real gap, needs proposing — see §1a-gap below. |
| 17 | Newsletter | `.nl-inner` | **`cta_band`** (exists) | Email-capture banner. Fits existing type if it supports a form-field slot, or is just a CTA to an external subscribe page (simpler, avoids a form-handling escape hatch). |
| 18 | Identity (sidebar) | `#side-identity` | **sidebar-scoped `hero`-lite or `president_welcome`** | Club crest + tagline card. Small enough it may just be a compact `rich_text` or a dedicated sidebar widget — low priority to resolve now. |
| 19 | Upcoming (sidebar) | `.fx-toggle` / `.fx-group` | **`match_data`** (sidebar placement of the same fixtures data as #10) | Confirms fixtures data should be reusable across two placements/sizes, not two types. |
| 20 | Player spotlight (sidebar) | `#player-spotlight` | **new type: `player_spotlight`**, or a `committee`/`teams` display variant | Single-player feature card. Small; may not deserve its own type — could be `rich_text` with a photo prop, or folded into `teams`. |
| 21 | Alerts (sidebar) | inline `.card` | **new type: `alerts`**, or `announcement_bar` reused in a card shell | Community notices list. `announcement_bar` already exists for site-wide banners — check whether a sidebar list of dated notices is different enough to need its own type or is `announcement_bar` with `display: 'list'`. |
| 22 | SW1 promo (sidebar) | `.sw1-promo` | **platform chrome, not a club section** | This is SportsWeb's own upsell unit, not something a club places. Excluded from the port — it belongs in platform admin surfaces, not the section registry. |
| 23 | Photo strip | `.ats-band` | **new type: `photo_strip`** | Horizontal scrolling gallery, credited to a named photographer. Distinct from any existing type. |
| 24 | Contact (full width) | `.contact-section` | **`contact`** (exists) | Full-bleed banner variant of the existing type — likely a `contact.layout: 'inline'\|'full-width'` prop, not a new type. |
| 25 | Sponsor carousel | `.sc-wrap` | **`sponsors`** (exists, `display: strip\|wall\|tiered`) | Confirms the existing display-variant model already covers this — add `carousel` as a fourth `display` value rather than inventing a type. |
| 26 | Footer | `<footer class="footer">` | **chrome** (new) | Site-wide, like nav/topbar. |

### §1a-gap — the one real missing section type: `clubs_directory`

This is the type AFLVM's brief explicitly names as the centrepiece of their whole site (the 45-club A–Z directory) and RDCA independently proves the same need (28-club division-grouped directory, #16 above). Two unrelated real sites want the same thing F2 doesn't have. Proposed shape, sized against both:

```
clubs_directory: {
  groupBy?: 'division' | 'none',   // RDCA groups by division; AFLVM would group by men's/women's
  display: 'grid' | 'list',
  showCrest: boolean,
}
```
Data itself (club name, crest, division/category, profile link) is a **Collection**-class read from a real `clubs`-adjacent table — never authored content, per the registry's content/collection split. This needs its own scoping pass before Phase A build starts; flagging it here rather than assuming it.

---

## 1b. The two things F2 structurally cannot express today

🔴 **The sidebar.** RDCA's `.main-layout` is `grid-template-columns: 1fr 320px` (`_shared.css:138`) — a genuine two-column magazine layout, 8 sections in COL MAIN, 6 in COL SIDE (see rows 9–22 above). F2's `club_pages.draft_layout`/`published_layout` is a flat JSONB array; `PageRenderer.tsx` renders every resolved section full-width in document order. There is no column concept anywhere in the schema or renderer. **This blocks the port entirely until fixed** — Brief 10's proposed fix (§3a, `club_pages.layout_mode: 'stack'|'main-side'` + an optional `column: 'main'|'side'` on each section instance, array stays flat) is the right shape and doesn't require a tree/nested document.

🔴 **The hero's embedded live-match card.** `.hero-grid` is `1fr 440px` (`_shared.css:94`) — the right column holds `.hmc`, a glassmorphic scorecard, *inside* the hero, not a separate section below it. This is confirmed the single most distinctive visual element on the page. F2's `hero` section today has no such slot — Brief 10's fix (`hero.layout` enum including `'feature'`, plus `hero.showMatchCard?: boolean`, reading from the same data source as the standalone `scoreboard` module) is correct and specifically must **not** be re-split into a separate section, which is the mistake Brief 10 says was "approved in error" previously.

Both fixes are schema-level (Step 3 in Brief 10), not CSS-level — confirming Brief 10's own scoping, not the superseded audit's claim that tokens alone would cover it.

---

## 1c. The component base — what `_shared.css` gives the F2 port

154 unique selectors in `_shared.css`, cleanly separable into a **base layer** (reusable across any RDCA-style design) and **section-specific** rules (belong inside each ported component):

**Base layer** (candidate replacement for both `blocks.css` and `sections.css`):
- `.btn` + 6 variants (`btn-red`, `btn-navy`, `btn-ghost`, `btn-outline-red`, `btn-outline-navy`, `btn-outline-white`) + 2 sizes
- `.card` (the single elevated-surface primitive: bg, radius, border, shadow)
- `.badge` + 4 colour variants
- `.eyebrow` (with its signature red 18×2.5px rule — a distinctive, reusable brand mark, not decoration to drop)
- `.s-hed` / `.sec-hdr` (section heading + header-row-with-action pattern, used by 6+ sections)
- `.view-all` (the consistent "see more" link style)
- `.divider`
- `.live-dot` (pulsing indicator, used in ticker + hero badge + hmc)

**Chrome layer** (new — F2 renders bare sections, no masthead/nav/footer exists at all): `.topbar`, `.nav-wrap`/`.nav-*`, `.mob-menu`, `.footer`.

**Section-specific** (ports 1:1 into each new/rebuilt component, not shared): `.hero*`, `.hmc*`, `.ticker*`, `.comp-tabs`/`.ladder-wrap`/`.fxr`/`.rrow`, `.clubs-*`, `.ats-band` (photo strip), `.contact-section`, `.sc-wrap` (sponsor carousel), `.rep-section`/`.ump-banner` (both instances of one full-bleed-banner pattern — worth a shared `.feature-banner` base rather than duplicating).

This directly confirms Brief 10 Step 2: `sections.css`'s ~generic `sw-sec*` hooks get replaced by this real base layer, ported (not "inspired by").

---

## 1d. Token gap — `--ink-*` pairs

Confirmed absent in the current codebase (grepped the whole tree — no `--ink-` or `--brand-accent-ink` literal exists anywhere, despite `docs/prospects/aflvm/assets/README.md` already referencing it as if it were a codified rule). The closest existing convention is `--brand-fill` / `--brand-fill-on` in `src/styles/tokens.css:23-24`, currently hardcoded `#ffffff` — not club-brand-aware, exactly the gap this fixes.

RDCA's own tokens (`_shared.css:13`) don't need an ink pair — `--red:#cc2222` carries white text fine. The gap only shows up on a light accent. Two real, concrete cases already in hand:
- **BHRDCA** (sister site, in `design-sources/bhrdca-x/`): `--gold:#f6c21c; --ink-gold:#0a2242` — navy text on gold, because white-on-gold is unreadable.
- **AFLVM** (this session's asset pull, `docs/prospects/aflvm/assets/README.md`): gold `#e09900` almost certainly needs the same treatment — an authored dark ink, not a `color-mix` guess.

**Proposed token model** (extends the existing `--brand-fill`/`--brand-fill-on` pattern to be genuinely club-brand-aware instead of hardcoded):
```
club_themes.tokens: {
  "--accent": "<club's real accent hex>",
  "--ink-accent": "<authored ink — dark navy for light accents, white for dark accents>",
  "--accent-deep": "<hover/active state, derived via color-mix is fine here — it's a shade, not a contrast decision>"
}
```
The ink pairing itself must be **authored per club, not derived** — `color-mix` cannot know contrast requirements. This should become a real, codified rule in `docs/engineering-conventions.md` (it's currently only referenced from the AFLVM asset doc, not actually written anywhere canonical) — recommend adding it as part of Phase A, not deferred.

---

## 1e. Honest sizing

**Chrome (topbar + nav + mobile menu + footer):** new surface, doesn't exist in F2 at all today. Medium — mostly structural HTML/CSS port, nav-drop data can reuse whatever powers admin's page list. Estimate: 1 focused session.

**Schema additions (sidebar `column` + `layout_mode`, hero `layout`/`showMatchCard`):** small in line count, high in care — touches `sectionInstanceSchema` (`.strict()` change is a breaking validation change, needs the hero-enum data migration handled correctly per Ruling 6 of the old audit) and `PageRenderer`'s render loop (bucket-by-column when `main-side`). Estimate: half a session, but blocks everything else in the port — do this first.

**Base component layer (`.btn`/`.card`/`.badge`/`.eyebrow`/etc replacing `sections.css`):** mechanical, low-risk, the "port it, don't reinvent it" instruction is easy to follow literally here. Estimate: half a session.

**The 26 section mappings above:** the real bulk of the work. Roughly 9 are drop-in fits to existing types (news, events, contact, sponsors, cta_band ×3, match_data ×2), 1 is confirmed net-new and shared with AFLVM (`clubs_directory`), and 6–7 are judgment calls that need a real decision before building (ticker, app_grid, top_performers, team_lineup, player_spotlight, alerts, photo_strip) — each could become its own type or fold into an existing one via a display variant, and Ruling 7's "fewer, realer types" test should be applied to each individually rather than batch-decided here. Estimate: 2–3 sessions, with the type-vs-variant decisions being the actual bottleneck, not the CSS/markup port itself.

**Where this brief could be wrong:** the "port it faithfully" instruction works cleanly for structure/CSS, but six-plus of RDCA's sections are content-management questions in disguise (does an association want a scrolling ticker of dummy-cricket-format live scores when Match Centre isn't wired yet? does "Top Performers" even exist in PlayHQ's public payload?). Recommend treating §1a's "new type, or fold into X" rows as open questions for Carson's judgment before Phase A build starts, not decisions this audit should make unilaterally.

---

## Decisions (Carson, 2026-08-03)

Resolves the 7 open type-vs-variant calls from §1a. Also: **PlayHQ/Match Centre stays dummy/demo data for the AFLVM pitch — no live wiring until the gig is won.** This makes every decision below simpler: `match_data` and anything folded into it renders `is_demo` seeded content per Rule 9's honest-labelling carve-out, not real fixtures.

| Section | Decision | Shape |
|---|---|---|
| Ticker | **New type: `ticker`** | Chrome-like, always-visible strip under nav. Auto-scroll behaviour and placement are structurally unlike a normal page block. |
| App grid | **Variant of `quick_links`** | `quick_links.display: 'list' \| 'icon-grid'`. Same label+icon+url content model as the existing type. |
| Top performers | **Variant of `match_data`** | A leaderboard display mode alongside ladder/fixtures/results — same competition/season context, different table shape. |
| Team lineup | **New type: `team_lineup`** | Named XI/lineup data didn't fit cleanly inside `match_data`'s schema — gets its own type. |
| Player spotlight | **Variant of `rich_text`** | Authored photo+copy card, not pulled from real roster data — fits `rich_text`'s authored-content model with a photo prop. |
| Alerts | **Variant of `announcement_bar`** | Same short-urgent-message content type as the existing site-wide banner, rendered as a stacked list in a sidebar card instead of a banner. |
| Photo strip | **New type: `photo_strip`** | Genuinely distinct from every existing collection type — none of `documents`/`social_feed`/`news` is "a horizontal strip of standalone photos." |

Net new registry types from this port: **`ticker`, `team_lineup`, `photo_strip`**, plus the previously-confirmed **`clubs_directory`** gap (§1a-gap) — four new types total, not the seven the raw section count suggested. The rest absorb into existing types as display variants, consistent with Ruling 7's "fewer, realer types."

## Bottom line

RDCA is portable and the architecture underneath (registry, zod schemas, cardinality, aiAuthorable, the total renderer) survives completely — Brief 10's own claim holds. Three real blockers before Phase A can start rendering anything:
1. The sidebar/hero-card schema additions (§1b) — small, but everything else depends on them.
2. A decision on the ~7 ambiguous section types (§1a) — type-vs-variant calls only Carson can make well.
3. The `clubs_directory` type (§1a-gap) — needed by both RDCA and AFLVM independently, currently missing entirely, and is exactly the section AFLVM's brief calls its centrepiece.

None of this touches Phase B/C (a second design, the design-pack abstraction) — per the earlier plumbing conflict, that stays deliberately deferred until RDCA is real and a second design exists to compare it against.
