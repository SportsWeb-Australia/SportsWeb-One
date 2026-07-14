# RDCA Design Port — Audit & Decisions (F2)

**Status:** PR-A in progress, on `f2-rdca-port-pr-a` off `main`.
**Reconciled to F2** after an initial draft was written against a stale (pre-F2) tree.

> Correction on the record: the first draft of this doc read `ClubConfig` + `BlockToggles` +
> `HomeLayouts.tsx` as the architecture. That is the **legacy** path. The real `main` carries the
> **F2** architecture (`docs/F2-design-doc.md`, `src/admin/PageComposer.tsx`, the 16-type zod
> section registry in `src/sections/`, `club_pages`, `club_themes`). Rulings 4/6/7 only reconcile
> against F2 — they are about the section registry and its schemas, which exist.

---

## 0. Source of truth

- **RDCA = Ringwood & District Cricket Association.** Canonical source in-tree:
  `design-sources/rdca-deploy-flat_1.zip` (repo `RDCA-V2`; `index.html` self-contained, other pages
  use `_shared.css` + `_pages.css`). Tokens: navy `#0d1f3c` / navy3 `#1e3d6b` / **red `#cc2222`** /
  bg `#f0f2f5` / `--r:14px`. Fonts: **Bebas Neue** (display), **DM Sans** (body), JetBrains Mono.
- **BHRDCA (Box Hill Reporter DCA)** is a **separate sister site** (`design-sources/bhrdca-x/`),
  navy **+ gold**. Same `_shared.css` lineage, different accent. Its `--ink-gold` (navy text on
  gold) is the clearest illustration of the `--ink-*` pairing rule and is cited below for that
  reason, but the **RDCA acceptance-test club themes to Ringwood navy+red**.
- Other sources now in-tree (not this PR): Bor City FC ×4, Chadstone Redbacks ×3.
- **Stop cloning repos.** Everything is under `design-sources/`.

---

## 1. How the port lands on F2

F2's thesis (doc sec 6/7): **design variance lives in theme tokens; structure is one fixed set of
section components.** The renderer applies `club_themes.tokens` as CSS custom properties at
`.sw-page`; `sections.css` styles every `sw-sec*` hook via `var(--token)` and carries no colours.
So porting RDCA is mostly:

1. **A theme** — RDCA's `_shared.css` design values mapped onto the F2 token names. This is the
   "token model with `--ink-*` pairs" deliverable (see sec 3).
2. **Chrome** — F2 renders bare sections today (`F2Page` → `PageRenderer`, no masthead/nav/footer).
   PR-A adds the F2 public chrome shell. This is the one genuinely net-new surface.
3. **Hero** — the `hero` section already exists (`sw-sec--hero`, `data-layout` variants, token-
   styled). RDCA's hero look comes from the theme; any RDCA-specific hero affordance is a section
   variant, never a new escape hatch (doc sec 7: "the fence is the product").

What PR-A does **not** do: touch the section registry, add section types, or wire data. Those are
the rulings below, landing in later PRs.

---

## 2. Rulings (reconciled to F2 files)

### Ruling 1 — Mock data is covered by the demo flag
A demo tenant may hold fabricated content because it is honestly labelled. Seed the RDCA
acceptance-test club's content as **real rows** on the branch. **Rule 9 stands** for the
live/AI/real-club path (honest empty states, never fabricated data — enforced by the Collection/
Module section components, which render real data or an empty state).

### Ruling 2 — 🔴 Live sports data blocks launch, not the port
RDCA fixture/ladder/performer data is dummy for presentation. Real data = **PlayHQ** integration
behind the `match_data` / `scoreboard` **module** sections (entitlement-gated, `src/sections/
entitlement.ts`). PlayHQ **public** API covers fixtures/results/ladders with no partner approval:
`x-api-key` + `x-phq-tenant` against `https://api.playhq.com`; path Organisation → Seasons → Grades
→ Fixture → Game → Summary; docs `docs.playhq.com/tech`. Credentials in flight via the association.
**LAUNCH BLOCKER — flagged loudly. Does not block the port.**

### Ruling 3 — 🔴 The page must hold with every live-data section absent
This is already **structural in F2**, and Carson solved it by hand in the source:

- **Renderer side:** `resolveSection` skips any section that is hidden, unknown, entitlement-gated-
  off, or invalid — the page never white-screens on a missing section (`PageRenderer.tsx`). A
  scoreboard/match_data section that isn't entitled at launch simply isn't rendered. **"showMatchCard:
  false" = the scoreboard module section absent → skipped.** No hero prop is involved.
- **Source side:** RDCA's own CSS degrades — `.hmc{display:none}`, `.hero-grid → 1fr`,
  `.main-layout → 1fr` at ≤1060px. **Keep this behaviour in the port** (the two-state proof below).

The PR-A hero/chrome must therefore read as a finished page with the ticker, competition hub,
performers, lineup, sidebar fixtures and hero match card all absent — because at launch they are.

### Ruling 4 — `sectionInstanceSchema`: fix the class, not the instance
Confirmed in `src/sections/schemas.ts:193` — `sectionInstanceSchema` is a plain `z.object`
(`id, type, props, visible`). A plain object **strips unknown keys**, so a saved `column` would
vanish silently. **Decision:** make it **`.strict()`** (unknown key raises) and add
**`column?: 'main' | 'side'`** explicitly, platform-side, added to both the schema and the
`SectionInstance` interface. (Lands with the two-column composition PR, not PR-A.)

### Ruling 5 — `.hmc` is a cricket scorecard; keep the model sport-neutral
`.hmc` (Home Match Centre) = cricket scorecard (overs/wickets/RRR/ball chips). The F2 `scoreboard`
section is already sport-neutral config (`showLast/showNext/showLadderPos`). Port the **frame**; the
stat rows key off **`clubs.sport_type`** (cricket → overs/wickets/RRR; AFL → quarters/goals). Not a
cricket-only platform.

### Ruling 6 — Hero enum change is a data migration
The hero `layout` enum (`centred | media-full | media-split | media-diagonal`, `schemas.ts:48`) is
the section-variant menu. If the port changes it, existing hero rows in `club_pages` are migrated by
value-map — never left to fall through. Migration SQL handed over for manual apply to `develop`;
never `db push` to production.

### Ruling 7 — Consolidate to real types (already the F2 shape)
F2's 16-type registry already embodies this: `sponsors` carries `display: strip|wall|tiered` (one
type, display variants — exactly "sponsors absorbing carousel/tiles/cards"); `news` carries
`layout: feature|grid|list`. Any RDCA-specific need (e.g. a Rep Cricket / Umpires **feature_banner**)
is weighed against `rich_text` + a `cta_band` before a new type is proposed — fewer, realer types.
The registry is the fence (doc sec: "same fence for the volunteer and the AI").

---

## 3. The token model — `--ink-*` pairs (F2 already anticipates it)

The F2 section CSS already pairs an accent fill with its ink: `--brand-fill` (the fill) +
`--brand-fill-on` (text that sits on it), used by `.sw-sec-cta--primary` (`sections.css:68`). This is
exactly the `--ink-*` rule the RDCA source teaches:

```
RDCA (Ringwood):   --brand-fill: #cc2222;  --brand-fill-on: #ffffff;   /* red carries white */
BHRDCA (Box Hill): --brand-fill: #f2b90c;  --brand-fill-on: #0a2242;   /* gold needs NAVY ink */
```

PR-A's job is to (a) fill the RDCA theme's token values from `_shared.css`, and (b) make the paired-
ink convention **complete and explicit** across every accent surface (`--accent-on-bg`, active nav,
badges, ticker pill), so text-on-accent is a token decision, not a per-rule patch — and a club's real
brand colour stays legible on any surface. The BHRDCA gold case is why the pair must exist even
though RDCA's red does not strictly need it.

---

## 4. PR-A scope (this branch)

Per Brief 10 (not yet in-tree; proceeding on the inline scope + the seven rulings) and F2:

- **RDCA theme** — token values mapped from `_shared.css`, with the `--brand-fill`/`--brand-fill-on`
  pair populated. Seeded to `club_themes` via SQL handed over for `develop` (never prod).
- **Chrome** — F2 public masthead/nav + footer shell around `PageRenderer`, token-driven.
- **Hero** — RDCA hero look via the theme (+ any hero affordance as a `data-layout` variant).
- **Proof** — the page holds with all live-data sections absent (ruling 3), keeping RDCA's own
  degradation. `--ink-*` pairs verified legible.

Later PRs: `.strict()` + `column` (ruling 4); sport-neutral scoreboard (ruling 5); hero-enum
migration (ruling 6); seed RDCA demo rows (ruling 1); PlayHQ adapter (ruling 2, launch gate).

---

## 5. Open items

- **Brief 10** is not in the tree — PR-A proceeds on the inline scope + rulings; will reconcile if it
  carries binding specifics (exact token names, chrome structure).
- `club_themes` preset tokens are seeded `'{}'` in `f2-page-schema.sql` — confirm whether Classic's
  real tokens landed anywhere, so the RDCA theme mirrors the same token set.
- PlayHQ credentials (in flight) — gates the launch, not the port.
