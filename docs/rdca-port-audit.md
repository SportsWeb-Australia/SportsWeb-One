# RDCA Design Port — Audit & Decisions

**Status:** approved to start (PR-A).
**Author:** platform.
**Source of truth:** `SportsWeb-Australia/bhrdca` @ `3b98b79` (2026-07-08) — the newest of the
RDCA builds and the only one with a render/component layer (`bhrdca-render.js`,
`bhrdca-components.js`). Its `_shared.css` is self-described as *"RDCA SportsWeb One shared
design system, extracted verbatim from the approved homepage (index.html, RDCA v9) — single
source of truth for the visual system."*

This document is the alignment artifact. It is committed **first**, before any port code, so the
rulings below are on the record and PR-A can be checked against them.

---

## 0. What we are porting, and into what

**Source.** A static HTML/CSS/JS site. No build, no `package.json`, no schema layer. The design
system lives in two files:

- `_shared.css` (~340 lines) — the chrome and the core design system: topbar, sticky navy nav,
  live-scores ticker, hero (with the Home Match Centre card), the `1fr / 320px` main-layout grid
  with a thin sidebar, competition hub, top performers, rep/umpire banners, sponsor carousel,
  footer. Tokens live in one `:root` block.
- `_pages.css` (~74 KB) — per-page and association-level (`bh-*`) styling.

Three parallel repos (`bhrdca`, `rdca-sportsweb`, `RDCA-V2`) all descend from the same
"RDCA v9" `_shared.css`. They differ only in accent palette and a few section additions. We treat
**bhrdca** as canonical and fold the deltas from the others in later if needed.

**"RDCA" here = two levels of the same design:**
- **Association / sporting-body level** (BHRDCA: Box Hill Reporter District Cricket Association,
  est. 1890, 28 member clubs, 3,500+ cricketers). Hero shows a crest badge, plus a member-clubs
  directory. In our model an association is itself a `club` row — no `organisation_id`.
- **Club level** (the "approved RDCA v9 homepage"). Hero shows the **Home Match Centre** scorecard
  card; the body is the `main / sidebar` two-column layout. This is the **RDCA acceptance-test
  club** and the primary target of the port.

**Target.** `SportsWeb-Australia/sportsweb-one` (this repo). Vite + React + TS + Supabase.
Home pages are composed today from a **fixed-shape `ClubConfig`** (`src/content/types.ts`) with a
`BlockToggles` boolean set, rendered by `src/components/home/HomeLayouts.tsx`. Skin is driven by
`src/styles/tokens.css` — **28 `data-variant` designs** with runtime `--club-*` colour injection.
There is **no zod and no section-instance model in the repo today**; the port introduces one. All
CSS is hand-written with `sw-` / `sw1-` prefixes; no Tailwind.

---

## 1. Rulings (on the record)

Each is recorded verbatim in intent, with how it lands in this codebase.

### Ruling 1 — Mock data is already covered by `clubs.is_demo`
No new rule, no blessing needed. A demo tenant may hold fabricated content **because the tenant is
honestly labelled** — that is what the flag is for. The RDCA acceptance-test club is a demo tenant
(`is_demo = true`). **Seed its content as real rows on the branch.** Rule 9 stands untouched: the
live / AI / real-club path keeps its empty states.

### Ruling 2 — Live sports data does not block the port, but 🔴 blocks launch
RDCA's fixture / ladder / performer data is **dummy, for presentation only**. Real data comes from a
**PlayHQ integration** — a *named project*, not a seam.

De-risking finding: PlayHQ's **public API covers fixtures, results and ladders with no partner
approval** — `x-api-key` + `x-phq-tenant` headers against `https://api.playhq.com`. Partner/Bearer
access is only for registrations and participant data (a different product we do not need here).
Call path: **Organisation ID → Seasons → Grades → Fixture for grade → Game ID → Summary for game.**
Docs: `docs.playhq.com/tech`. BHRDCA org id (from the source hero link):
`box-hill-reporter-district-cricket-association/f8c1124c`. Credentials are being requested via the
association in parallel.

> 🔴 **LAUNCH BLOCKER.** Match Centre is not wired for launch. It does not block the *port* — it
> blocks *going live with real data*. Flagged loudly here on purpose.

### Ruling 3 — 🔴 The design must survive with all live-data sections absent (affects PR-A)
The first real clubs launch **before** Match Centre is wired. Rule 9 means the live-data sections
render nothing — they are simply **absent**, not empty-stated. So the page must still read as a
finished page with **all** of these gone at once:

- the live-scores **ticker**
- the **competition hub** (ladder / fixtures / results)
- **top performers**
- **lineup**
- **sidebar fixtures**
- the **hero match card** (`showMatchCard: false`)

> A page that collapses without live data is too dependent on content we can't guarantee — and it is
> the difference between a club launching next month and a club waiting on an integration.

**Good news from the source:** the RDCA design already degrades gracefully at its own breakpoints —
`_shared.css` hides `.hmc` and collapses `.hero-grid` to a single column at ≤1060px, and collapses
`.main-layout` (`1fr / 320px`) to one column too. PR-A makes that degradation **content-driven, not
just viewport-driven**: the hero drops the card when `showMatchCard` is false, and the shell holds
as a clean single or two-column page when the sidebar/live sections are empty.

**PR-A must prove both, and show them:**
1. the **hero with `showMatchCard: false`** (headline + CTAs + stats, no scorecard, no dead gap);
2. the **two-column layout with a thin sidebar**, holding when the live-data sections are absent.

### Ruling 4 — `sectionInstanceSchema`: fix the class, not the instance
The port introduces a section-instance model. The first draft typed an instance as a **plain
`z.object`**, which **silently strips unknown keys** — so a saved `column` would vanish, the sidebar
placement would not work, and nothing would say why. That is the zero-rows failure class again: the
save succeeds, the field disappears, the feature is dead, no error.

**Decision:** make the schema **`.strict()`** — an unknown key *raises* instead of being dropped.
Reject, don't sanitize, applied to the schema itself. Then add **`column?: 'main' | 'side'`**
explicitly, **platform-side of the fence** (locked/global, like the design variants — not a
free-form club field).

### Ruling 5 — `.hmc` is a cricket scorecard; keep the match model sport-neutral
`.hmc` (Home Match Centre) is a **cricket** scorecard — overs, wickets, run-rate, ball-by-ball
four/six chips. **Port the frame, not the sport.** The match model is keyed off **`clubs.sport_type`**
inside the section:

- a **cricket** club sees overs / wickets / RRR;
- an **AFL** club sees quarters / goals / behinds; etc.

We are **not** shipping a cricket-only platform. The card chrome is shared; the stat rows are
per-sport.

### Ruling 6 — Hero enum change is a data migration
The hero section's kind/layout enum changes as part of the port. Existing hero page rows must have
their **old values mapped across** in a migration — not left to fall through to a default and
silently change. (Migration SQL is handed over for manual application via the Supabase SQL Editor;
never `db push` to production.)

### Ruling 7 — Consolidate to ~8–10 real section types
Approved. The `sections.css` lesson applied correctly: **fewer, realer types.** Two named
consolidations:

- **`sponsors`** absorbs *carousel / tiles / cards* as a **display variant**, not separate types.
- **`feature_banner`** covers both **Rep Cricket** and **Umpires** (same photo-banner-with-cards
  frame, different content).

Proposed consolidated set (the audit's inventory of the RDCA source, ratified by Ruling 7):

| # | Section type    | Absorbs (RDCA source)                                   | Live-data? |
|---|-----------------|--------------------------------------------------------|------------|
| 1 | `hero`          | hero + Home Match Centre card (`showMatchCard`)         | card only  |
| 2 | `ticker`        | live-scores ticker                                      | **yes**    |
| 3 | `news`          | news hero + 3-up news grid                              | no         |
| 4 | `match_centre`  | competition hub (ladder / fixtures / results tabs)      | **yes**    |
| 5 | `performers`    | top performers grid                                     | **yes**    |
| 6 | `feature_banner`| Rep Cricket + Umpires photo banners                     | no         |
| 7 | `sponsors`      | sponsor carousel / tiles / cards (display variant)      | no         |
| 8 | `events`        | events grid                                             | no         |
| 9 | `clubs_directory`| member-clubs grid (association level)                  | no         |
| 10| `rich_text`     | about snapshot, communications callout                  | no         |

Sidebar widgets (player spotlight, fixtures, SW1 promo, identity) attach via `column: 'side'` rather
than as their own top-level types. `app_links`, `newsletter`, `contact` and `footer` are chrome, not
body sections.

---

## 2. PR sequence

- **PR-A (this one):** base `_shared.css` port + token model (with **`--ink-*` pairs**) + chrome
  (topbar / nav / ticker shell / footer) + hero. Proves Ruling 3 (both degradation states). **No
  section engine, no data model yet.**
- **PR-B:** section-instance model — the `.strict()` schema, `column?: 'main' | 'side'`, the ~8–10
  types, `HomeLayouts` composition from instances.
- **PR-C:** `match_centre` + sport-neutral match model (`clubs.sport_type`), empty-state behaviour
  per Rule 9.
- **PR-D:** migrations — hero enum map (Ruling 6), section rows; seed the RDCA demo club's content
  as real rows on `is_demo = true` (Ruling 1). SQL handed over, applied manually.
- **PR-E:** PlayHQ adapter (Ruling 2) — the launch gate for real data.

---

## 3. Token model note — the `--ink-*` pairs

The RDCA source already teaches the lesson PR-A formalises. BHRDCA is **navy + gold**; gold is too
light to carry white text, so the source pairs the gold accent with a **navy ink**:

```
--gold:      #f2b90c;
--ink-gold:  #0a2242;   /* text that sits ON gold */
```

and every gold surface (`.btn-red`, `.badge-red`, `.ticker-pill`, active nav) uses `--ink-gold` for
its text. PR-A lifts this into the token model as an explicit convention: **every accent ships with a
paired `--ink-<accent>`** so text-on-accent contrast is a token decision, not a per-rule patch — the
same way the 28 variants already pair `--hero-bg` with `--hero-text`. This keeps a club's real brand
colours legible on any surface without hand-fixing each component.

---

## 4. Open items (tracked, not blocking PR-A)

- PlayHQ credentials (in flight via the association) — gates PR-E / launch.
- Confirm deltas in `rdca-sportsweb` / `RDCA-V2` `_shared.css` worth folding into canonical.
- Per-sport stat-row definitions for the sport-neutral match model (Ruling 5) — enumerated in PR-C.
