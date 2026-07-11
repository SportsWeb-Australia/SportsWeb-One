# Section taxonomy audit

**Status:** read-only audit (Brief 02). No code/schema/migration changes. All claims cite `src/components/home/HomeLayouts.tsx` (abbreviated `HL`) unless noted.

## Headline numbers (read these first)

- **~15 canonical section types**, split **7 Content / 5 Collection / 3 Module**. This is the **~12–16-type world, not the 40+ world.** The section registry is maintainable.
- **28 variants collapse to ~6 structural templates + theme presets.** The 8 legacy variants are literally *one* function (`Classic`). The 20 bespoke variants reduce to ~5 genuinely distinct structures; the rest are theme/CSS differences.
- **Blast radius is tiny and lopsided: 4 published clubs, and ALL 4 render through `Classic`.** The 20 bespoke structural variants have **zero** published clubs (two have a single *draft* club). 17 clubs total: 13 draft, 4 published, 0 suspended.
- **The F2 data model already exists in the DB, empty and unwired:** `club_pages` (page-level) and `club_sections` (`id, club_id, page_id, type, sort, visible, props jsonb, …`) — this is exactly the "sections as first-class data" shape. Both have `public_read USING(true)` (same leak class as Brief 01) and 0 rows.
- **Hidden second project:** `documents` and `social_links` tables **do not exist**; the `teams`/grades sections in most variants render **hardcoded static arrays, not the (existing) `teams` table**. These are the Collection gaps to cost now.

---

## 2a. Raw section inventory (all 28 variants)

**Critical mechanism note:** *no variant reads `club_content` `content_key`s directly.* Every variant binds from `useData()` (HL:19-32), which reads the resolved `ClubConfig` (`club.identity.*`, `club.news`, `club.events`, `club.sponsors`, `club.matchCentre.{fixtures,results,ladder}`). `club_content` overrides are applied earlier in `loadClub.buildClubConfig` onto `cfg.hero/president/about/...`, then variants read those. So content-key → section is **indirect, through `cfg`**. Legend: **D**=Dynamic (DB list), **S**=Static copy, **C**=Conditional (render guard), **Dup**=appears twice.

### The 20 structural variants (each has its own layout function)

**broadsheet** (HL:35-94): hero/masthead (43-49, S+identity) · news_feature (53-65, D, C:`lead&&`, Dup) · news_grid (66-75, D, Dup) · fixtures_strip (78→`RailFixtures`365, D, C:`!length→null`) · ladder (79→`RailLadder`381, D, C) · quick_links railcard (80-87, S) · sponsor_strip (91, D).

**matchday** (HL:97-137): hero+next-match+countdown+last-result (103-129, D, C:`next?…:name`) · match_centre (130, D) · news_feature/social (131-133, D, `NewsSlot`) · sponsor_strip (134, D). *Fixtures/results used in hero AND match_centre.*

**appshell** (HL:140-196): quick_links greeting (152-163, S+shortName) · match_card (166-173, D, C:`next&&`) · news_grid (174-183, D) · events (184-190, D, C:`ev&&`) · sponsor_strip (193, D). *pos 2-4 share one `<section>`.*

**bento** (HL:199-263): grid of cells in one `<section>` (208-259): news_feature `news[0]` (210, D, C, Dup) · match_cell (219, D, C) · events_cell (227, D, C) · ladder_cell (234, D, C:`length>0`) · news_cell `news[1]` (247, D, C, Dup) · join_cta+sponsor-logo (253, mixed) · sponsor_strip (260, D).

**sponsorforward** (HL:266-299): hero (271, D) · sponsor_wall featured platinum/gold (272-291, D, Dup) · news_feature/social (292-294, D) · match_centre (295, D) · sponsor_strip **full/tiered** `withBlurb` (296, D, Dup). *Only variant with a non-carousel sponsor strip.*

**portal** (HL:302-362): one `<section>` nav-rail grid: quick_links rail (317-324, S+shortName) · match_card (326-333, D, C:`next&&`) · news_grid (334-344, D) · events (345-357, D, C:`length>0`). **No sponsor strip, no footer call** (unique).

**poster** (HL:399-450): hero (405-411, S+identity) · fixtures_strip single next (412-423, D, C:`next?…:"coming soon"`) · news_feature `news[0]` (424-435, D, C) · join_cta (436-446, S) · sponsor_strip (447, D).

**fieldcourt** (HL:454-532): hero (461-471, S+identity) · **code_split** football/netball promo (472-499, mixed; footy embeds `fixtures[0]`, netball fully static) · news_grid lead+minis (500-528, D) · sponsor_strip (529, D).

**masters** (HL:536-606): hero (544-554) · events (555-573, D, C:`length?…:empty`) · news_feature+embedded next-fixture+side-list (574-602, D) · sponsor_strip (603, D).

**pitch** (HL:610-672): hero (616-626) · fixtures_strip `slice(0,6)` (627-648, D, C:`length?…:empty`) · news_grid `slice(0,6)` (649-668, D) · sponsor_strip (669, D).

**scorecard** (HL:676-767): **scoreboard/stat_strip** last-result+next (683-708, D, C:`last?…`) · hero (709-715, S) · fixtures_strip (720-731, D, Dup) · ladder (732-743, D) · news_grid (746-763, D) · sponsor_strip (764, D). *fixtures used in scoreboard AND strip. pos 3-4 share one `<section>`.*

**hardcourt** (HL:771-848): hero (781-791, S) · **stat_strip** next/last/ladder-pos (792-814, D, C) · news_feature (824-833, D, C) · news_grid `slice(1,4)` (834-841, D) · sponsor_strip (845, D). *hero+stat share one `<section>`.*

**fastbreak** (HL:852-931): hero (860-867, S) · next_match card (870-882, D, C:`next&&`) · news_feature `news[0]` (883-895, D, C, Dup) · news_feature `news[1]` (896-908, D, C, Dup) · fixtures_strip `slice(0,4)` (911-928, D, C) · sponsor_strip (929, D).

**leaguefooty** (HL:936-1017): hero (948-959, S) · **teams (grades — STATIC array 939-944)** (960-973, S) · next_match card (976-985, D) · ladder `slice(0,5)` (986-995, D) · news_grid `slice(0,3)` (998-1014, D) · sponsor_strip (1015, D).

**courtside** (HL:1022-1093): hero (1035-1045, S) · **teams (grades — STATIC 1026-1032)** (1046-1058, S) · fixtures_strip `slice(0,5)` (1059-1073, D) · news_grid `slice(0,4)` (1074-1090, D) · sponsor_strip (1091, D).

**juniors** (HL:1098-1180): hero (1116-1123, S) · **teams (grades — STATIC 1102-1107)** (1124-1136, S) · **about/parent-info (STATIC 1108-1113)** (1137-1149, S) · news_feature (1152-1164, D, C:`lead?…:fallback`) · events `slice(0,2)` (1165-1174, D, C) · sponsor_strip (1177, D).

**rugbyunion** (HL:1184-1247): hero (1197-1208, S) · stat_strip honours (STATIC) (1209-1211, S) · **teams (grades — STATIC)** (1212-1224, S) · fixtures_strip next-card (1225-1231, D, C) · news_grid `slice(0,3)` (1232-1241, D) · sponsor_strip (1244, D).

**rugbyleague** (HL:1251-1323): hero/clash-banner+next (1259-1275, D, C:`next?vs:h1`) · results_strip recent form (1276-1288, D, C:`length>0`) · ladder `slice(0,6)` (1289-1298, D) · **teams (grades — STATIC)** (1299-1304, S) · news_grid (1307-1319, D) · sponsor_strip (1320, D).

**oztag** (HL:1327-1396): hero (1344-1351, S) · **teams (divisions — STATIC)** (1352-1364, S) · **comp_nights schedule (STATIC 1365-1378)** (S) · news_grid `slice(0,3)` (1379-1392, D) · sponsor_strip (1393, D).

**touch** (HL:1400-1467): hero (1411-1421, S) · **how_it_works steps (STATIC 1422-1435)** (S) · fixtures_strip this-week `slice(0,5)` (1436-1450, D, C) · news_grid (1451-1463, D) · sponsor_strip (1464, D).

### The 8 legacy variants → `Classic` (HL:1470-1484) — structurally identical

`heritage, broadcast, arena, classic, stadium, editorial, momentum, coastal` are **not** in the `LAYOUTS` map (HL:1486-1507), so `HomeLayout()` falls through to `<Classic>` (HL:1512-1513) for all 8. **They are the same function; any difference is data/colour, not structure.**

`Classic` sections (block-toggle gated, `const b = club.blocks`, HL:1471): hero (1474, ungated) · quick_links (1475, `b.quickLinks`) · news_feature (1476-1478, `b.featuredNews`) · match_centre (1479, `b.matchCentre`) · join_cta (1480, `b.joinCta`) · sponsor_strip (1481, `b.sponsors`). **Classic reads only 5 of the 13 `BlockToggles`** (`types.ts:216-228`); the other 8 (announcementBar, presidentWelcome, upcomingEvents, teams, clubInfo, committee, documents, socialFeed) are defined but unused by any homepage layout.

---

## 2b. Proposed canonical taxonomy — **~15 types**

Collapsing news_feature+news_grid→`news` (layout prop), sponsor_wall+sponsor_strip→`sponsors` (display prop), fixtures/results/ladder/scoreboard→a small `match_*` family.

| Canonical type | One-liner | Class | In variants (approx instances) | Structural vs stylistic diffs |
|---|---|---|---|---|
| `hero` | Masthead/intro banner | Content | all 28 (28+) | mostly **stylistic**; matchday/rugbyleague embed a fixture → **structural** (split it out) |
| `announcement_bar` | Dismissible notice | Content | chrome (via `club.announcement`), not in variant bodies | stylistic |
| `rich_text` | Prose / feature-list / static info | Content | juniors about, touch how_it_works, oztag comp_nights, rugbyunion honours (6+) | stylistic (but see outliers — these ship **fake static content**) |
| `quick_links` | Action tiles / nav rail | Content | broadsheet, appshell, portal (3) | stylistic |
| `cta_band` (`join_cta`) | Join/register call-to-action | Content | broadsheet, bento, poster, Classic (4) | stylistic |
| `president_welcome` | President message | Content | none on homepage (keys exist, unrendered) | stylistic |
| `contact` | Contact block | Content | contact page only | stylistic |
| `news` | Articles (feature / grid / list) | Collection (`news` ✓) | ~all (30+) | **stylistic** — same data, layout prop (feature/grid/count) |
| `events` | Upcoming events list | Collection (`events` ✓) | appshell, bento, portal, masters, juniors (5) | stylistic |
| `teams` | Teams / grades / divisions | Collection (`teams` ✓ but **rendered STATIC**) | leaguefooty, courtside, juniors, oztag, rugby×2 (6) | **structural risk** — currently hardcoded, not wired to the table |
| `sponsors` | Logo strip / wall / tiered | Collection (`sponsors` ✓) | ~all (28+) | **stylistic** — display prop (strip/wall/tiered/blurb) |
| `committee` | Committee/officials list | Collection (`people` ✓, filtered) | about page (BlockToggle only) | stylistic |
| `match_data` | Fixtures / results / ladder (mode prop) | Module (`matches`,`ladder` ✓) | ~all sport variants (25+) | **stylistic** — one type, `mode: fixtures\|results\|ladder\|combined` |
| `scoreboard` | Last-result + next-up summary bar | Module (`matches`,`results`,`ladder` ✓) | matchday, scorecard, hardcourt (3) | structural sub-family of match_data |
| `social_feed` | Embedded social posts | Module/external (**no table**) | matchday/sponsorforward via `NewsSlot` | stylistic |

> If you keep `news_feature`/`news_grid` and `sponsor_strip`/`sponsor_wall` and `fixtures`/`results`/`ladder` as *separate* types instead of prop-variants, the count rises to ~20 — still the maintainable world.

---

## 2c. Theme / structure split — the money question

| Classification | Count | Which |
|---|---|---|
| **Theme-only** (same sequence/structure as another) | **~19 of 28** | The 8 legacy (all = Classic → 1 structure) + the sport variants that are all `hero → [teams/fixtures] → news → sponsor_strip` with different CSS/static filler: pitch, poster, fieldcourt, masters, hardcourt, fastbreak, leaguefooty, courtside, juniors, rugbyunion, oztag, touch |
| **Structurally distinct** | **~6 templates** | `Classic` (toggle list) · `broadsheet` (newspaper lead+grid+rails) · `matchday`/`rugbyleague` (match-led hero) · `bento` (data-cell grid) · `appshell`/`portal` (app feed / nav-rail, no or minimal sponsor) · `scorecard` (scoreboard + split panels) · `sponsorforward` (sponsor-led) |
| **Outlier** | see 2d | bento, fieldcourt code_split, the static-content strips |

**~19 of 28 are theme-only. ~6 distinct structural templates remain** (Classic + ~5 bespoke shapes).

**Minimum theme-token set** to reproduce the visual differences without bespoke layouts: brand colours (already in DB) · type scale + font family (variants swap Google fonts — this is a big visual driver) · border-radius scale · hero treatment (`motif | image | video | split | clash`) · card style (bordered/elevated/flat) · section padding rhythm · default image aspect ratio · sponsor display mode. That payload turns ~19 variants into presets over ~6 templates.

---

## 2d. Outliers (adversarial — named, not hidden)

1. **`bento`** (HL:208-259) — layout logic is *data-shape-dependent*: which grid cells render depends on which of news[0]/news[1]/fixtures/events/ladder exist. Not a clean linear `{type,props}` list. → **(a) escape hatch**: a `bento_grid` composite section whose props are an ordered cell list, OR (d) don't migrate first.
2. **`fieldcourt` code_split** (HL:472-499) — bespoke two-code (football/netball) promo; one column embeds a fixture, the other is fully static. → **(b) generalise** to a 2-column `feature_split` (each column = a mini-section), or (a) escape hatch.
3. **Static-content strips** — juniors parent-info, touch how_it_works, oztag comp_nights, rugbyunion honours, and **all the `teams`/grades arrays**. These aren't outliers structurally, but they **ship hardcoded fake content** (placeholder grades/steps). Migrating them naively encodes fake data as defaults. → **(b) generalise** to `rich_text`/`feature_list` Content sections **and** wire `teams` to the real table; do **not** port the static arrays as-is.
4. **Hero-with-embedded-fixture** (matchday HL:103-129, rugbyleague HL:1259-1275, scorecard scoreboard) — hero DOM changes based on whether a fixture/result exists. → **split** into `hero` + `scoreboard`/`match_data` so each stays closed.
5. **`portal`** (HL:302-362) — no sponsor strip, nav-rail-primary; structurally distinct but expressible as a template. Not a true outlier.

Short honest verdict: only **bento** and **code_split** genuinely resist a clean `{type,props}` model; both have escape-hatch options. Everything else is generalisable — *if* we refuse to carry the static fake content across.

---

## 2e. Blast radius (live DB, project `uzibfawcwoapfbigpzum`)

17 clubs total: **13 draft, 4 published, 0 suspended.** Variant is derived (`selected_template_id → templates.template_key → TEMPLATE_VARIANT`, or a `club_content.site.variant` override, `loadClub.ts:8-31,237-238,443`).

| Effective variant | Backing layout | Published | Draft |
|---|---|---|---|
| `heritage` (template `default`) | **Classic** | 1 | (10 more `(none)` clubs also default to heritage/empty → Classic) |
| `broadcast` (template `club-modern`) | **Classic** | 1 | 0 |
| `arena` (template `afl-classic` + 1 override) | **Classic** | 2 | 1 |
| `fastbreak` (override) | Fastbreak | 0 | 1 |
| `poster` (override) | Poster | 0 | 1 |

- **All 4 published clubs render through `Classic`** (arena/broadcast/heritage are legacy → Classic). 
- **The 20 bespoke structural variants have ZERO published clubs** (fastbreak and poster have 1 *draft* each; the other 18 have none).
- **Total published: 4.** Only 3 clubs even set `selected_template_id`; 4 use a `site.variant` override; 10 have neither (→ heritage/Classic default).

Porting order writes itself: **Classic covers 100% of published traffic.** The bespoke variants are effectively dead in production.

---

## 2f. Content-key collision report

18 distinct `content_key`s in `club_content`; **every key is unique per club** (`rows == clubs` for all), so **nothing is currently doubled** — the flat KV isn't broken *yet*, but it *cannot* represent the same section twice on a page (e.g. two `hero`s both wanting `hero.title`).

| Bucket | Keys | Fate |
|---|---|---|
| **Global club data** (stays in `club_content`, sections bind to it) | `site.variant`, `branding.logo`, `news.mode`, `contact.email`, `contact.facebook`, `contact.instagram` | keep |
| **Section-local copy** (must move **into section props**) | `hero.title/subtitle/eyebrow/image/video`, `about.body.0`, `about.photo`, `join.heading/blurb`, `footer.acknowledgement`, `footer.logo.0/1` | migrate to `club_sections.props` |

Inert keys (in DB, not read by `loadClub`): `news.mode`, `about.photo`, `footer.logo.0`, `footer.logo.1`. Keys the code reads with zero DB rows: all `president.*`, `contact.phone`, `contact.address`. The section-local → props split touches only ~3 clubs that have content rows, so the data migration is trivially small.

---

## 2g. Section class + AI-fillability (per canonical type)

| Type | Class | Data home | Table exists? | AI-fillable | Notes / empty state |
|---|---|---|---|---|---|
| `hero` | Content | props | — | **Clean** — yes | `{eyebrow,title,subtitle,cta[],media:{kind,url}}`. Watch: media union — typeable. |
| `announcement_bar` | Content | props | — | Clean — yes | — |
| `rich_text` | Content | props | — | **Messy** — the free-form body. Fix: structured blocks (heading/paragraph/list), not raw HTML. |
| `quick_links` | Content | props | — | Clean — yes | `links[]` of `{label,href}` |
| `cta_band` | Content | props | — | Clean — yes | — |
| `president_welcome` | Content | props | — | Clean — yes | |
| `news` | Collection | `news` | ✓ | config-only | Empty: hide or "News coming soon". |
| `events` | Collection | `events` | ✓ | config-only | Empty: hide. |
| `teams` | Collection | `teams` | ✓ (**but rendered static today**) | config-only | **Wire to table.** Empty: hide. |
| `sponsors` | Collection | `sponsors` | ✓ | config-only | Empty: hide the strip. |
| `committee` | Collection | `people` (filtered) | ✓ | config-only | Empty: hide. |
| `documents` | Collection | **`documents`** | **✗ does not exist** | config-only | **Table to build.** |
| `match_data` | Module | `matches`,`ladder` | ✓ | config-only (grade/mode) | Entitlement-gate to a Match Centre module. Not entitled → **hide entirely**. Entitled, no data → "Fixtures to be confirmed" / "Ladder in-season". |
| `scoreboard` | Module | `matches`,`results`,`ladder` | ✓ | config-only | Not entitled → hide. No data → "Season ahead". |
| `social_feed` | Module/external | **`social_links`** | **✗ does not exist** | config-only | Needs a social-config source. Not connected → hide. |

**AI readiness:** of ~15 types, the **7 Content types are Clean/Messy** and are the only ones an LLM authors free-form; **Collection/Module types are config-only** (AI picks count/mode/grade, records come from tables). **One Messy field: `rich_text` body** — close it into structured blocks and the Content set is fully AI-emittable. **Content/presentation entanglement to name:** (1) the static `teams`/grades arrays baked into variant JSX (content *is* markup); (2) `hero.image` vs `hero.video` smuggled as separate keys rather than a typed `media` union; (3) any future `rich_text` that accepts raw HTML. These three are the AI-path threats.

> Could Claude generate each from a two-line club brief? **Content types: yes.** Collection/Module: **only config** (it can't invent a club's real fixtures/sponsors — nor should it). `rich_text`: only once the schema is closed.

---

## 2h. Honest sizing

1. **Which world?** The **~12–16-type world.** ~15 canonical types (or ~20 if you keep feature/grid and strip/wall as separate types). The registry is maintainable. We are **not** in the 40+ world — *provided* we refuse to treat the 28 variants as 28 templates (see #4).

2. **First variant to port: `Classic`.** It is both the *representative* one (a data-driven, toggle-on/off section list — already the closest thing to the target model) **and** the one that carries **100% of published traffic** (all 4 published clubs). Porting it proves the model on real production sites and de-risks the only layout that can actually break a live club. Porting a bespoke variant first would prove nothing (zero published clubs). This is the rare case where representative and highest-value coincide.

3. **Where this goes wrong:** (a) **the static fake content** — grades/steps/divisions hardcoded in variant JSX; port them as real Collection/`rich_text` or you ship placeholder data as defaults; (b) **`teams` looks done but isn't wired** — the table exists, the sections ignore it; (c) **Module empty states** — every match section needs a non-embarrassing empty state and entitlement gate; (d) **theme vs structure discipline** — if any pressure creeps in to keep bespoke layouts "just for this variant," the registry rots back into 28 layouts.

4. **What the kickoff plan gets wrong (push-back):**
   - **`club_pages` / `club_sections` already exist** — `club_sections(id, club_id, page_id, type, sort, visible, props jsonb, ...)` is *exactly* the JSONB-per-section model, and `club_pages(key,title,nav_label,path,sort,visible,is_system)` is the page table. **The schema decision is largely made.** Don't design it from scratch — audit and adopt/extend the existing tables (and note both currently have `public_read USING(true)` — the Brief 01 leak class — and 0 rows).
   - **"One club at a time" migration is over-engineered for 4 published clubs.** Port `Classic`, migrate the 4 published clubs (all Classic) in one pass, done. The long-tail "dual `render_engine` flag for a slow per-club rollout" is machinery for a scale that doesn't exist here.
   - **The 20 bespoke variants shouldn't be "ported" at all as-is** — 0 published clubs use them, and they're mostly theme differences + fake static content. Rebuild them as **themes over ~6 templates**, not as 20 section arrangements. Porting them 1:1 *is* the 40-type trap.

5. **The three-way split.** Of ~15 canonical types: **Content 7 · Collection 6 · Module 3** (counting `committee`/`documents`/`social_feed`). **Depending on something that does not exist yet: 2 tables (`documents`, `social_links`) + 1 wiring gap (`teams` static→table).** That's the hidden second project — small (2 tables + 1 rewire), but real, and it's concentrated in Collection class. The Module tables (`matches`/`ladder`) exist but there is **no formal "Match Centre" module/entitlement row today** — decide whether match sections are entitlement-gated before building them.

6. **AI readiness.** Of the 7 author-able Content types: **6 Clean, 1 Messy** (`rich_text` body). Collection/Module are config-only by design. So the AI authoring path is **viable now** for the Content set with one cleanup (close `rich_text` into structured blocks; define `hero.media` as a typed union instead of `hero.image`/`hero.video`). Cleaning cost: **low** — a handful of zod schemas + dropping the static-content pattern. The larger AI-adjacent cost is not schema, it's **decoupling content from the hardcoded JSX** (the teams/grades arrays) so there's a props surface for Claude to write into at all.

---

## Appendix — data sources exist for everything except documents/social

Confirmed present: `news, events, sponsors, teams, people, matches, ladder, club_modules, modules, club_pages, club_sections`. **Absent:** `documents`, `social_links`, `committee` (committee derives from `people`). `club_pages`/`club_sections` exist but are **empty and unwired** to the front end (no `src` reference).
