# Codey Brief 10 — The design layer. Bin blocks.css. Port RDCA.

**Priority:** P0 — this blocks everything. Carson looked at the F2 render and rejected it.
**Reference:** `docs/F2-design-doc.md` — architecture unchanged. This brief replaces the skin, not the bones.
**Blocks:** the remaining 15 editors, P4, P5, launch.

## 0. What happened, and why it is not your fault

Carson opened the three theme URLs and the verdict was blunt: the output is worse than what he already has.

Nine of his real, shipped, hand-built club sites were then analysed. Here is what the numbers say.

### Finding 1 — the platform's design was never good

SportsWeb One's own hero, in `blocks.css`:

```css
.sw-hero        { position:relative; background:var(--hero-bg); color:var(--hero-text); overflow:hidden }
.sw-hero-inner  { max-width:760px; text-align:var(--hero-align) }
.sw-hero h1     { font-size:var(--fs-h1) }
```

Four properties. A background colour, a 760px centred box, and a font-size variable.

RDCA's hero — a real site Carson built by hand and shipped:

```css
.hero              { min-height:600px; display:flex; align-items:stretch }
.hero-photo::after { background:linear-gradient(105deg,rgba(8,16,30,.96) 0%,rgba(13,31,60,.88) 45%,rgba(13,31,60,.55) 100%) }
.hero-grid         { grid-template-columns:1fr 440px; gap:48px; padding:80px 20px 56px }
.hero-hed          { font:68px 'Bebas Neue'; line-height:.9 }
.hero-stats        { grid-template-columns:repeat(4,1fr); margin-top:auto }
.hmc               { backdrop-filter:blur(16px) }   /* a live-match card, INSIDE the hero */
```

You ported the platform faithfully. The platform had nothing to port. Your audit found "19 tokenizable, 4 structural" because there was barely any structure to find. The instruction — "port Classic" — was the error, and it was Claude's. Classic was never good.

Every good design Carson has, he built by hand as a static site, outside the platform. That is the whole problem SportsWeb One exists to solve, and the platform has never been able to do it.

### Finding 2 — there are TWO axes, and F2 only implements one

| Comparison | Result | Meaning |
|---|---|---|
| RDCA vs BHRDCA | 159 of 159 selectors shared. Identical hero, grid, chrome. Differ only in `:root` (navy/red vs navy/gold), plus a forced `.btn-red { color: var(--ink-gold) }` override. | Same design, different colours = a theme |
| Chadstone editorial / gameday / community | Byte-identical `:root`. Different fonts (Anton / Oswald / Poppins), different hero (paper / dark royal / gradient). | Same colours, different structure + type = different designs |
| Bor City ×4 | 14 shared selectors of 31–41 each. Four structurally different heroes. | different designs |

Colour tokens do not make a design. Structure and typography do. Carson has proven this in both directions on real client work.

F2 implements only the colour axis. Its "themes" are token swaps. Its structure axis — `hero.layout: centred | media-full | media-split | media-diagonal` — is four names invented from a CSS audit with generic CSS behind them.

That is why all three theme URLs felt like the same bland site with different fonts. Because that is exactly what they were.

## 1. The corrected model

What F2 has:

```
theme (colour + type tokens) × one generic structure = the site
```

What Carson actually does on every real client:

```
design (real structure, real typography, real CSS) × club brand colours = the site
```

He builds a club three or four design options (Chadstone: editorial / gameday / community). They pick one. Their colours flow in. That is the product.

A design is not a token block. It is a hand-built structural implementation.
The colour belongs to the club, not the design.
`clubs.theme_key` (colour) stays. `clubs.design_key` (structure + type) is the missing half.

## 2. Do NOT build an eight-design abstraction from theory

The temptation is to design a DesignPack abstraction covering all nine of Carson's designs. Don't. We would be inventing the abstraction from imagination — which is exactly the mistake that produced `sections.css`.

Build ONE design properly. Then a second. The second one tells you what the abstraction actually is.

- **Phase A (this brief):** port RDCA as the design. One design, done properly, all sections.
- **Phase B (next):** add Chadstone gameday — same colours as editorial, different structure and type. It isolates the structure axis and will reveal the real seams.
- **Phase C:** generalise into design packs, informed by A and B rather than by theory.

### Standing guardrails

- Branch off main. Show diffs. PR → merge. Never commit direct to main.
- All migrations → the `develop` Supabase branch. Never production. Promotion by `merge_branch`, authorized by name.
- Rule 9: no fake data, ever. Empty state or nothing.
- No raw HTML in props. The HTML-sink alarm stays wired into the build.
- Never write test data to a real club. Scratch tenant only.
- Admin chrome stays SportsWeb blue. Hand-written CSS, `sw-`/`sw1-` prefixes. No Tailwind.

## Step 1 — AUDIT (read-only, report before writing code)

Design sources are in the repo at `design-sources/`: RDCA (`_shared.css` 319 lines / 159 selectors, `_pages.css` 682 lines / ~327 classes, `index.html` 994 lines), plus BHRDCA, Bor City ×4, Chadstone ×3.

Produce `docs/rdca-port-audit.md`:

### 1a. RDCA's homepage, section by section

Walk `index.html` top to bottom. Its own comments name the sequence:

```
TOPBAR · NAV · TICKER · HERO · APP BUTTONS
MAIN LAYOUT → COL MAIN: NEWS · COMPETITION HUB · TOP PERFORMERS · REP CRICKET ·
              LINEUP · UMPIRES · EVENTS · CLUBS · NEWSLETTER
            → COL SIDE: IDENTITY · UPCOMING · PLAYER SPOTLIGHT · ALERTS · SW1 PROMO
PHOTO STRIP · CONTACT · SPONSOR CAROUSEL · FOOTER
```

For each: which of F2's 16 section types does it map to, or is it a new type? Expect several new ones (ticker, app_grid, photo_strip, player_spotlight, top_performers, newsletter, sponsor_carousel, identity, alerts). Propose the list — don't assume.

### 1b. The two things F2 structurally cannot express

🔴 **The sidebar.** RDCA is a two-column magazine layout — COL MAIN + COL SIDE. F2's page document is a flat array of full-width sections. There is no column. There is no sidebar. F2 could never have produced this page regardless of CSS quality.

🔴 **The hero holds a live-match card.** `.hmc`, glassmorphic, inside `.hero-grid`'s 440px right column. A previous audit found "hero-with-embedded-fixture" and proposed splitting it into hero + scoreboard. That was approved in error. It designed out the single most striking thing on the page. Do not re-derive that split. A separate module section renders full-width below the hero — that is not the design.

### 1c. The component base

`_shared.css` is 159 selectors of complete, shipped, twice-themed design system: `btn` (6 variants), `card`, `badge`, `eyebrow` (with its red rule), `s-hed`, `sec-hdr`, `view-all`, `divider`, `topbar`, `nav-wrap`, `mob-menu`, `ticker-bar`, `hero-*`, `hmc-*`, `live-dot`.

Which of these become F2's base component layer? This replaces `blocks.css` wholesale.

### 1d. The token gap — `--ink-*` pairs

BHRDCA proves it:

```css
--gold: #f6c21c;  --ink-gold: #0a2242;
.btn-red { background: var(--gold); color: var(--ink-gold); }
```

A light accent needs dark ink. F2 derives colours by `color-mix` from the club's brand — which cannot know that. Give a club a yellow primary and F2 produces white-on-gold. Unreadable.

Propose the token model that handles a club whose brand colour is light.

### 1e. Honest sizing

How big is the RDCA port, in your estimate? Where does it go wrong? What in this brief is wrong?

## Step 2 — Bin blocks.css and sections.css

`blocks.css` (2,908 lines) is not a design. It is the absence of one, expressed at length. It goes. So does the `sections.css` written for F2 — same problem, fewer lines.

The base component layer comes from `_shared.css`. Not "inspired by." Port it, adapted to the token model.

## Step 3 — Two schema additions (hand-over migration, to the branch)

These are the only genuinely new structural things. Everything else is a port.

### 3a. The sidebar

```
club_pages.layout_mode  text  not null default 'stack'   -- 'stack' | 'main-side'
```

And on the section instance in the layout document:

```jsonc
{ "id": "…", "type": "news", "visible": true, "column": "main", "props": {…} }
```

`column?: 'main' | 'side'` — optional, defaults to main.

The array stays flat. The renderer buckets by column when `layout_mode = 'main-side'`, and ignores column entirely when stack. Reorder, duplicate, cardinality, the fences, the AI seam — all unaffected. No nesting, no tree, no new document shape.

Note: `sectionInstanceSchema` is a plain `z.object` and silently strips unknown keys — a bare `column` would vanish on save with no error. Make it `.strict()` so an unknown key raises, then add `column` explicitly. Platform-side of the fence, like the variants.

The composer shows two drop zones when the page is main-side. That's the whole UI change.

### 3b. The hero's right slot

Do not nest sections. Add a prop:

```
hero.layout: 'feature' | 'centred' | 'broadcast' | 'heritage' | 'card' | 'matchday'
hero.showMatchCard?: boolean
```

When `layout = 'feature'` and `showMatchCard` is true and the club is entitled to Match Centre, the hero renders `.hmc` in its 440px right column, reading from the same source as scoreboard. Not entitled → the hero renders single-column. No empty box. Rule 9.

`hero.layout`'s enum values are now real designs lifted from Carson's files, not names invented from an audit. The variant fence + drift guard already cover the new enum. The enum change is a data migration for existing pages — map the old values across.

`.hmc` is a cricket scorecard (overs/wickets/RRR). Port the frame, keep the match model sport-neutral via `clubs.sport_type` inside the section. A cricket club sees overs/wickets; an AFL club sees quarters/goals. We are not shipping a cricket-only platform.

## Step 4 — Port RDCA

Rebuild every section component to emit RDCA's markup, styled by RDCA's CSS.

- `hero` → `.hero` / `.hero-photo` / `.hero-grid` (1fr 440px) / `.hero-hed` / `.hero-stats` / `.hmc`
- `news` → RDCA's news cards + newsFeatured
- `sponsors` → `.sponsor-carousel` (absorbing carousel/tiles/cards as a display variant)
- `contact` → RDCA's full-width contact
- …and the new types from 1a.

Real markup, real CSS, real type. Bebas Neue display, DM Sans body, 14px base, 10–11px labels. Copy the density — it is a large part of why RDCA reads like a broadcaster and F2 reads like a brochure.

Every section keeps its zod schema, cardinality, aiAuthorable, and empty state. The contract is unchanged; only the implementation is replaced.

**Position-independence, corrected:** the earlier instruction was "every section must look correct at any position." That was implemented as "make every section a generic full-width block." The rule is: no section may BREAK at any position. It may still be designed. A hero may assume it is first. That is design, not fragility.

**Live-data degradation:** the first real clubs will launch before Match Centre has a feed. RDCA's own CSS already handles this — `.hmc { display:none }` below 1060px, `.hero-grid → 1fr`, `.main-layout → 1fr`. Keep that behaviour. The page must hold up with the ticker, competition hub, top performers, lineup, sidebar fixtures and hero match card all absent. Prove it: hero with `showMatchCard: false`, and the two-column layout with a thin sidebar.

## Step 5 — THE ACCEPTANCE TEST

RDCA's homepage, rendered from `club_pages.published_layout`.

Sidebar. Ticker. Stats strip. Glassmorphic live-match card in the hero. Sponsor carousel. All of it.

Side by side with the static site, and Carson cannot tell which is which.

Nothing less counts. A scratch tenant with five generic blocks proved nothing — that is how we got here.

**Mock data:** RDCA's static homepage is full of illustrative content (ladder, top performers, announced XI, 4/187 · RRR 4.63). The acceptance-test club is `is_demo = true` — a demo tenant may hold fabricated content because the tenant is honestly labelled. Seed RDCA's content as real rows on the branch. Rule 9 is untouched; the live/AI/real-club path keeps its empty states.

Then: seed it on the branch, give Carson the URL, and he judges it against the static site.

## What survives — everything except the skin

✅ Page document, schema, RPCs, versioning · ✅ registry, zod schemas, cardinality, aiAuthorable, the AI seam · ✅ total renderer · ✅ every fence and grant · ✅ composer + the Block[] editor · ✅ staging environment · ✅ the drift guard and the HTML-sink alarm

The architecture is right. It was always right. We hung a skin on it that the platform never had.

## Not in this brief

- The other fifteen editors — resume after the design lands.
- Phase B (a second design) — after RDCA renders.
- Design packs as an abstraction — do not invent it. Build two designs, then extract it.
- P4, P5, SEO, BHRDCA.

Report the audit before writing code.
