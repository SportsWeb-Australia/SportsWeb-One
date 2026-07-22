# SportsWeb One — Builder Roadmap

> **Status (branch `rdca-design-port`, unmerged — pending Carson's visual review):**
> Phase A **design layer is functionally complete**. RDCA is fully ported: chrome + hero (with the
> in-hero `.hmc` match card), the sidebar (`layout_mode` + `column`, versioned draft/published) with
> the composer two-column editor, and **all 27 section types render RDCA** (16 re-skinned + 11 new:
> app_grid, feature_banner, newsletter, photo_strip, clubs_directory, identity, player_spotlight,
> alerts, ticker, top_performers, lineup). `sections.css` retired; the full RDCA homepage renders
> from `club_pages` (20 sections, acceptance 27/27 resolve) on the develop demo tenant. A vitest
> fence suite (21 tests) guards the registry / `.strict()` column door / validate-or-skip /
> cardinality / sidebar bucketing. **Outstanding for prod:** apply
> `supabase/club-pages-layout-mode-versioned.sql`; Carson's side-by-side visual pass vs the static
> site; then merge. `blocks.css` (legacy path) not yet retired.

The website builder is a funnel. The F2 engine (registry + renderer + composer + themes +
fences) is built. The **design layer** (real, hand-ported designs) is what's being added now
(Brief 10). Two capabilities complete the funnel and are recorded here so their dependencies are
on the record and we don't build them out of order.

```
   SUPPLY (how designs get made)                ONBOARDING (how a club gets in)
   (2) Claude design-generator  ───►  F2 ENGINE  ◄───  (1) Site importer
        from screenshots+links         section registry       existing site -> content
        -> reviewed DESIGN PACK        renderer/composer       -> typed tables (draft)
                                        theme tokens
                                        the fences
                            club picks a DESIGN + edits CONTENT -> deploy
```

The invariant that governs both: **content != colour != design.**
- Content lives in the typed tables (`news`/`events`/`sponsors`/`teams`/... + `club_content`) and
  the page document props.
- Colour is the club's brand (`club_themes.tokens` / `clubs.theme_key`).
- Design is real structure + typography (a design pack; `clubs.design_key`, Phase C).

---

## (1) Import an existing site + content -> choose a design -> deploy

**What it is:** a content-ingestion adapter -- the inverse of the renderer. Source site ->
structured content in F2's typed tables. Then the club picks a design and publishes.

**Rides existing seams:**
- Typed content model is the import target (news/events/sponsors/teams/committee/documents +
  identity + socials). No new content model.
- The **AI "grounded" authoring mode already exists** (registry `aiAuthorable`): fill only from
  facts in the source. Claude classifying scraped content into the schemas is grounded extraction
  -- Rule-9-safe because it is the club's own real content, never fabricated.
- The **composer is the review step**: import writes a DRAFT the club confirms/edits, never a
  silent auto-publish.

**Must-hold constraints (or it breaks the build):**
- Everything through the fence: extracted content validates against the zod schemas at the door;
  raw HTML -> the closed `Block[]` union (never a raw-HTML sink); images **re-hosted** through the
  asset pipeline, never hotlinked.
- Honest partial import -- surface what came in vs what didn't; the club fills gaps in the composer.
- Match/fixture data is NOT scraped -- it comes from PlayHQ. Import brings identity/news/sponsors/
  committee/photos; live data is the integration.
- Per-source adapters over time (GameDay/PlayHQ, Wix/Squarespace exports, generic HTML) sharing one
  extract -> validate -> draft core.

**Depends on:** typed model (built) + **>=1 shippable design** (RDCA, in progress) + composer
(built). Does NOT need design packs.

**Sequencing:** can start **sooner** -- in parallel with Phase B. It is an adapter + grounded
extraction + a confirm UI, not a design.

---

## (2) Create a new design via Claude (screenshots + links) -> deployed, club-editable

**What it is:** productising the RDCA porting workflow, with the reference being screenshots +
links instead of a static repo.

**The one invariant:** the output is a **design pack (reviewed code)**, NOT AI-generated raw HTML
in props. A design = section components emitting scoped class hooks + CSS scoped under the design
root + token defaults. Claude emitting a raw-HTML "design" bypasses every fence -- exactly what
Brief 10 exists to prevent. So "generate a design" = Claude produces a design-pack *candidate*
that goes through the same pipeline RDCA did:

> audit -> port to tokens -> scope under the design root -> wire into the registry ->
> **verify side-by-side against the source** -> merge.

**Rides existing seams:**
- Output slots into the design-pack abstraction (`design_key`, Phase C) -- the slot RDCA/Chadstone
  occupy.
- "Club-editable later" = clubs edit CONTENT in the composer within the chosen design; they never
  touch the design's CSS. That boundary is already how F2 works.
- New section types a design needs are added to the registry (schema-first, fenced).

**Must-hold constraints:**
- Grounded in the references, never imagined (Brief 10's core warning -- the sections.css / hero-enum
  mistake was inventing structure from theory).
- Human-in-the-loop acceptance test (RDCA's bar: "can't tell which is which") before a design ships.

**Depends on:** the **design-pack abstraction existing** -- which per Brief 10 is *extracted from
two hand-ported designs* (RDCA + Phase B), not invented. Building the generator before the
abstraction repeats the mistake we are recovering from.

**Sequencing:** RDCA (now) -> Phase B (2nd design) -> Phase C (extract the abstraction) -> **then**
the design-generator.

---

## Consolidated order

1. **Finish PR-A** -- RDCA hero + chrome live from `club_pages`; add the `matchCentre.current`
   loader so the `.hmc` shows.
2. **Sidebar PR** -- `layout_mode` + `column`, the `.strict()` `sectionInstanceSchema` fix, the
   composer two-drop-zone (the two-column magazine layout F2 can't yet express).
3. **Port the remaining RDCA sections** (~8 new types + re-skin existing), then bin
   `blocks.css`/`sections.css`.
4. **Site importer (1)** -- can begin here, in parallel; needs only RDCA + typed tables + composer.
5. **Phase B** -- second design (Chadstone), to reveal the real design-pack seams.
6. **Phase C** -- extract the design-pack abstraction (`design_key`).
7. **Claude design-generator (2)** -- built on the Phase C abstraction.
8. **Match Centre / PlayHQ** -- the live data feed; launch blocker, runs in parallel.
9. Deferred: the other 15 section editors, per-page SEO, P4/P5.
