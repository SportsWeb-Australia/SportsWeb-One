# RDCA Port — Audit (Brief 10, Step 1)

**Read-only audit. Reported before any code, per Brief 10.**
Source of truth: `design-sources/rdca-deploy-flat_1.zip` (RDCA Ringwood — `_shared.css` 319 lines /
159 selectors, `_pages.css` 682 lines, `index.html` 994 lines; verified line counts match the brief).
Target contracts: `src/sections/` (16-type registry, zod schemas, renderer), `club_pages`,
`club_themes`. Architecture unchanged (`docs/F2-design-doc.md`); this replaces the skin.

---

## 1a. RDCA's homepage, section by section

Walking `index.html` top to bottom. **F2 type** = existing registry type it maps to; **NEW** = a type
that must be added. Chrome = the page shell (Brief 10 §Step 4), not a page-document section.

| # | RDCA section (line) | Maps to | Notes |
|---|---|---|---|
| — | TOPBAR (387) | **chrome** | contact + socials strip; part of the shell |
| — | NAV (440) + MOBILE MENU (403) | **chrome** | `.nav-wrap` sticky navy, `.mob-menu` |
| 1 | TICKER (491) | **NEW `ticker`** | live scores; module class, Match Centre entitlement, Rule-9 empty |
| 2 | HERO (499) | **`hero`** (extended) | `.hero-grid` 1fr/440px; `.hero-stats` 4-cell; **`.hmc` match card inside `.hero-right`** (§3b) |
| 3 | APP BUTTONS (560) | **NEW `app_grid`** | icon-grid app launcher; not `quick_links` (different form) — propose new |
| — | SPONSOR AD BANNER (563) | **`sponsors`** (variant) | dummy advert unit → a sponsors display variant, or drop |
| — | MOBILE REGISTER (580) | **chrome** | mobile-only CTA affordance |
| 4 | NEWS (598) | **`news`** | `.news-hero` feature + `.news-grid` → `news.layout: feature` |
| 5 | COMPETITION HUB (614) | **`match_data`** (extended) | tabs ladder / fixtures / results → needs a tabbed display on `match_data` |
| 6 | TOP PERFORMERS (634) | **NEW `top_performers`** | module class, Match Centre entitlement |
| 7 | REP CRICKET (646) | **NEW `feature_banner`** | photo banner + cards |
| 8 | LINEUP (666) | **NEW `lineup`** | announced XI; module class, Match Centre entitlement |
| 9 | UMPIRES (686) | **`feature_banner`** | same frame as Rep Cricket, different content (one type) |
| 10 | EVENTS (706) | **`events`** | `.events-grid` |
| 11 | CLUBS (715) | **NEW `clubs_directory`** | member-club grid, division-grouped (association level) |
| 12 | NEWSLETTER (724) | **NEW `newsletter`** | email signup band |
| 13 | IDENTITY (745, side) | **NEW `identity`** | club identity card; `column: side` |
| 14 | UPCOMING (762, side) | **`match_data`** (side) | upcoming fixtures widget; `column: side` |
| 15 | PLAYER SPOTLIGHT (771, side) | **NEW `player_spotlight`** | `column: side`; module class |
| 16 | ALERTS (795, side) | **NEW `alerts`** | match-day alert signup; `column: side` |
| — | SPONSOR ADS (808, side) | **`sponsors`** (variant) | sidebar ad slot |
| 17 | SW1 PROMO (813, side) | **chrome / fixed** | "Powered by SportsWeb One"; platform-owned, not club-editable |
| 18 | PHOTO STRIP (≈825) | **NEW `photo_strip`** | gallery row |
| 19 | CONTACT (≈880) | **`contact`** | full-width contact |
| 20 | SPONSOR CAROUSEL (896) | **`sponsors`** (variant) | `.sc-*` auto-scroll → `sponsors.display: carousel` |
| — | FOOTER (908) | **chrome** | `.footer` + `.footer-accent` |

**Proposed new section types (8, consolidated):** `ticker`, `app_grid`, `top_performers`,
`feature_banner` (Rep + Umpires), `lineup`, `clubs_directory`, `newsletter`, `photo_strip`, plus the
sidebar set `identity` / `player_spotlight` / `alerts`. **Consolidations applied** (Brief 10 §7 lesson):
`feature_banner` absorbs Rep + Umpires; `sponsors` absorbs carousel / tiles / ad-banner as
`display` variants; `match_data` absorbs the competition hub (tabbed) and the sidebar "upcoming"
(mode + column). That is ~8 real new types, not ~13.

**Classification (Brief 10 fence):** `ticker`, `top_performers`, `lineup` are **Module** class
(Match Centre entitlement, Rule-9 empty state). `identity`, `newsletter`, `alerts`, `app_grid`,
`photo_strip`, `feature_banner`, `clubs_directory`, `player_spotlight` are **Content/Collection**.
Each keeps a zod schema, cardinality, `aiAuthorable`, empty state.

---

## 1b. The two things F2 structurally cannot express

🔴 **The sidebar.** RDCA is COL MAIN + COL SIDE — a two-column magazine layout. F2's page document
is a flat array of full-width sections; there is no `column`, no sidebar. Confirmed: `PageRenderer`
maps the array to a single `.sw-page` stack. **Fix (Brief 10 §3a):** `club_pages.layout_mode`
(`stack` | `main-side`) + `column?: 'main' | 'side'` on the instance; the array stays flat, the
renderer buckets by column only when `main-side`. `sectionInstanceSchema` (`schemas.ts:193`) is a
plain `z.object` that **silently strips unknown keys** — a bare `column` vanishes on save with no
error. Must become **`.strict()`** with `column` added explicitly, platform-side.

🔴 **The hero holds the live-match card.** `.hmc` is glassmorphic (`backdrop-filter: blur(16px)`),
inside `.hero-grid`'s 440px right column — a full cricket scorecard: two teams (`4/187 · 42.2 ov`
vs `223`), a 4-cell grid (Partnership / Required / Best Bowler / Last Wicket), and a ball-by-ball
chip row. It is the single most striking thing on the page. The earlier "split hero into hero +
scoreboard" was **wrong** and is not re-derived. **Fix (Brief 10 §3b):** `hero.showMatchCard` +
the card rendered in the hero's right slot from the same source as scoreboard; not entitled →
single-column hero, no empty box (Rule 9). Sport-neutral via `clubs.sport_type` (cricket →
overs/wickets/RRR; AFL → quarters/goals).

---

## 1c. The component base (replaces `blocks.css` wholesale)

`_shared.css` (159 selectors) is a complete, shipped, twice-themed system. These become F2's base
component layer:

- **Primitives:** `.btn` + 6 variants (`btn-red/navy/ghost/outline-*`), `.badge` (+ colours),
  `.card`, `.eyebrow` (with the `::before` accent rule), `.s-hed`, `.divider`, `.live-dot`,
  `.view-all`, `.sec-hdr`.
- **Chrome:** `.topbar`, `.nav-wrap` / `.nav-inner` / `.nav-link`, `.mob-menu`, `.ticker-bar` +
  `.tk-*`, `.footer` / `.footer-accent`.
- **Hero + match card:** `.hero`, `.hero-photo(::after)`, `.hero-grid`, `.hero-left`, `.hero-stats` /
  `.hero-stat*`, `.hero-right`, `.hmc` + `.hmc-*`.

Ported adapted to the token model (§1d) — not "inspired by". `blocks.css` (2,908 lines) and the
F2-era `sections.css` both go.

---

## 1d. The token gap — `--ink-*` pairs

F2 already has the *shape* of the fix: `sections.css:68` pairs `--brand-fill` with `--brand-fill-on`
(the ink that sits on the fill). But F2 **derives** accent colours by `color-mix` from the club
brand, which cannot know a light brand needs dark ink. BHRDCA proves the failure mode:

```css
--gold: #f6c21c;  --ink-gold: #0a2242;   /* gold is too light for white text -> navy ink */
.btn-red { background: var(--gold); color: var(--ink-gold); }
```

**Proposed model.** Every accent token ships with an explicit paired-ink token, chosen (not derived)
per club:

```
--brand-primary      --brand-primary-ink     /* text/icon that sits ON primary  */
--brand-accent       --brand-accent-ink      /* RDCA red -> white; BHRDCA gold -> navy */
```

The ink is a **stored theme token**, not a `color-mix` output — so a club whose brand is yellow
stores `--brand-accent-ink: #0a2242` and never renders white-on-gold. Where a theme omits the ink,
fall back to a WCAG-contrast pick (black/white by luminance) — a safe default, never a silent
low-contrast mix. This is the one place `color-mix` derivation must be replaced by an authored value.

---

## 1e. Honest sizing — and what may be wrong in the brief

**Size.** This is the largest single front-end effort in the project. Realistic shape:

- ~8 new section types × (schema + component + CSS + cardinality + aiAuthorable + empty state).
- ~319 selectors of `_shared.css` + the relevant `_pages.css` groups ported into the base layer.
- 2 schema/renderer changes (sidebar `column`/`layout_mode` bucketing; hero match-card slot).
- Composer: two drop zones under `main-side`.
- Sport-neutral match model; seed RDCA's demo content as real rows.

That is **not one PR**. Estimate **8–12 PRs**, sequenced: (1) base layer + chrome + tokens; (2) hero
+ `.hmc`; (3) sidebar schema + renderer + composer; (4–7) the section ports in batches; (8) seed +
acceptance test. Net new/changed CSS+TSX in the low thousands of lines. Trying to land it in one PR
is how it goes wrong.

**Where it can go wrong:** porting `_pages.css` verbatim drags in RDCA-page-specific rules (article,
board, comms pages) that aren't the homepage — port the homepage's selector set only. And the
density (14px base, 10–11px labels) must be carried as tokens, or the port reads like F2 again.

**What may be wrong in the brief (flagging, not overriding):**

1. **`hero.layout` enum (§3b) invents 5 unbuilt designs.** `'feature' | 'centred' | 'broadcast' |
   'heritage' | 'card' | 'matchday'` — only `feature` (RDCA) is real in Phase A. `broadcast`,
   `heritage`, `matchday`, `card` are designs we haven't built. Naming structure variants from
   imagination is the exact mistake §2 warns against ("don't invent the abstraction from theory").
   **Recommendation:** Phase A adds only `hero.layout: 'feature'` (plus the existing `centred`);
   the rest land as their designs are actually built (Phase B+). The enum migration (§3b) then maps
   old values into `centred`/`feature` only.

2. **`clubs.design_key` may be premature in Phase A.** A *selector* among designs only earns its
   keep once there are ≥2 designs (Phase B). In Phase A the design lives in the ported components;
   every club renders RDCA. **Recommendation:** add `design_key` when Phase B introduces the second
   design (so the selector is validated against real alternatives), not now — consistent with the
   brief's own "build one, then two, then extract" rule. If we want it now, seed it with a single
   `'rdca'` value and no UI.

3. **`app_grid` vs `quick_links`** is a genuine judgement call — the app button grid could be a
   `quick_links` display variant rather than a new type. I lean new type (distinct icon-tile form),
   but flag it for Carson.

Everything else in the brief holds and is what the audit confirms: bin `blocks.css`, port the real
structure, the sidebar and in-hero card are the two real structural additions, the `--ink-*` pair is
the real token gap, and the acceptance test (RDCA rendered from `club_pages`, indistinguishable from
the static site) is the only bar that counts.

---

## Recommended PR sequence (Phase A)

1. **PR-A** base component layer (port `_shared.css`) + chrome shell + token model (`--ink-*` pairs); bin `blocks.css`/`sections.css`.
2. **PR-B** hero port incl. `.hmc` in the 440px slot; `hero.layout: 'feature'` + `showMatchCard`; sport-neutral model.
3. **PR-C** sidebar: `layout_mode` + `column` (`.strict()` schema), renderer bucketing, composer two-drop-zone.
4. **PR-D..G** section ports in batches (news/events/sponsors/contact → then ticker/app_grid/top_performers/feature_banner/lineup/clubs_directory/newsletter/photo_strip/identity/player_spotlight/alerts).
5. **PR-H** seed RDCA demo club (`is_demo`) real rows; the side-by-side acceptance test.

Migrations → `develop` branch, handed over, never production.

**Reporting this audit now; no code until it's reviewed.**
