# Gameday design-pack port — structural audit (Phase B)

*Read-only audit, per the process in `docs/codey-brief-10-the-design-layer.md`: "AUDIT (read-only, report before writing code)." Report before code — this doc is that report.*

**Source of truth used:** the pristine 14-page gameday mirror captured directly from the approved
Chadstone Redbacks concept deployment (`chadstone-redbacks-website/_design/`, fetched via the
Vercel share-bypass before any local edits) — not the single-page mockup in
`design-sources/chadstone-redbacks-design-options.zip` (`design-2-gameday.html`), which is only a
one-page pitch mockup and lacks the full page set. Both are the same design; the 14-page mirror is
the fuller/cleaner reference.

**Confirms the design-layer doc's own finding:** editorial / gameday / community share a
byte-identical base `:root`, then gameday layers a **second `:root` override** at the end of the
cascade (`--display:'Oswald'` vs the base `'Anton'`, navy `--navbg`/`--herobg:#27397A`,
`--rad:10px` vs `6px`, `--paper/--surface:#fff`). That's the theme-layering mechanism the source
design itself uses — colour + font + radius as overridable tokens, structure and markup untouched.
Confirms: colour tokens don't make a design; structure and type do.

## 1. Page inventory (14 pages)

`index` (home) · `about` · `what-is-lacrosse` · `teams` · `match-centre` · `news` ·
`membership` · `play-at-chaddy` · `history` · `contact` · `store` · `privacy` · `terms` · `cookies`

## 2. Section-level blocks, by page

| Page | Sections (top-level `<section class>`) |
|---|---|
| index (home) | `hero` → `news` → `edu` → `split` → `teams-teaser` → `spon` |
| about, contact, history, membership, play-at-chaddy, what-is-lacrosse | `page-hero` → (`bg-soft` variant on the first content section, some pages) → `spon` |
| teams, match-centre, news, store | `page-hero` → `spon` |
| privacy, terms, cookies | `page-hero` only (legal boilerplate, no sponsor strip) |

`bg-soft` is a modifier (light-tint background), not a distinct block — applied to whichever
content section directly follows `page-hero` on about/contact/history/membership/play-at-
chaddy/what-is-lacrosse.

## 3. Mapping against Dookie's existing block library

Dookie (`src/components/blocks/`): `Hero`, `FeaturedNews`, `JoinCTA`, `MatchCentre`,
`QuickLinks`, `SponsorPlate`, `SponsorStrip`; plus `PageHero`, `Header`, `Footer`,
`AccentBars`, `AnnouncementBar`, `Chevron`, `SeoHead`, `SmartLink` at the shell level.

| Gameday block | Platform equivalent | Verdict |
|---|---|---|
| `page-hero` (every inner page) | `PageHero.astro` | **Reuse** — same job (eyebrow/H1/intro on a coloured band), likely a straight theme + copy swap. |
| `hero` (home) | `Hero.astro` | **Extend, don't duplicate** — same job (headline/lede/CTAs) but gameday's home hero has a large translucent crest watermark and a two-line headline with a coloured `<em>` line Dookie's Hero doesn't have. Needs a look at `Hero.astro`'s existing prop surface before deciding new variant vs new prop. |
| `spon` (sponsor strip) | `SponsorStrip.astro` / `SponsorPlate.astro` | **Reuse the platform component, not the source markup.** The design mockup uses static text chips; Carson's standing rule (all SW1 builds, see `sportsweb-standards` design-defaults memory) is large-logo carousel + dedicated Sponsors page regardless of what the original mockup shows. Port the *slot* (position in page flow), not the chip markup. |
| `news` (home news grid) | `FeaturedNews.astro` | **Likely reuse w/ theming** — need to diff card markup (`ncard`: tag/title/excerpt/CTA over an uncropped image) against FeaturedNews's current card shape. |
| `teams-teaser` (home 3-card preview) | `QuickLinks.astro`? | **Check, probably a new variant** — QuickLinks is a nav-style block in Dookie; gameday's teams-teaser is program cards with a meta line + description + CTA, closer to a mini `tcard`. May need a new `ProgramTeaser` block rather than forcing it into QuickLinks. |
| `edu` (education/"why this sport" icon-card section, royal bg) | *none* | **Net new block.** 3-col icon+heading+body cards on an accent-colour section background, with a section-level CTA. Not present anywhere in Dookie. Likely valuable beyond Chadstone (any club selling "why our sport" to prospective members) — worth building as a real reusable block, not a one-off. |
| `split` (video/CTA split, lazy YouTube mount on scroll) | *none* | **Net new block**, and the only one with non-trivial JS (IntersectionObserver-gated iframe mount/unmount so autoplaying video doesn't run off-screen). Needs the runtime-neutral treatment (no `window`/DOM assumptions that break Workers SSR — this is client-side-only JS shipped as a `<script>`, so it's fine, just needs to ship correctly through Astro's script handling). |
| `mc-tabs`/`mc-pane` (match-centre Fixtures/Ladders/Results tab switcher) | `MatchCentre.astro` | **Compare directly** — Dookie's MatchCentre reads `matches`/`ladder` tables live; gameday's version is a client-side tab UI over static content in the mockup. Porting this properly means gameday's tab UI *wrapping* the platform's real match-centre data, not the static markup. |

## 4. Card/content patterns with no direct Dookie equivalent (used inside the pages above)

- `.tcard`/`.tgrid` — team-program cards (teams page): title, meta line, description, coordinator/training info rows, CTA. Border-top accent stripe.
- `.dcard`/`.dgrid` — icon cards inside `edu` (see above).
- `.pgrid`/`.pcard` — people/honour-board cards (history page): photo box, meta, name, blurb. Includes a `.holder` placeholder state for missing photos.
- `.sgrid`/`.scard` — store product cards: image, title, price, blurb.
- `.step`/numbered steps — membership page's "how to register" 2-step flow with a numbered badge.
- `.tbl` — fee/pricing table (membership page), royal header row, zebra striping.
- `.callout` — bordered highlight box (bank details, publish-gate-style warnings, CTAs after a table).
- `.contact-list` + `.mapwrap` — contact page: address/phone/email list beside an embedded map iframe.
- Footer acknowledgement-of-country block with inline SVG flags (Aboriginal/Torres Strait/Pride) — likely platform-standard already; check `Footer.astro` before rebuilding.

## 5. Design tokens (for the theme layer)

```
--display: 'Oswald'   (base design uses 'Anton')
--body: 'Inter'
--rad: 10px            (base design uses 6px)
--red / --red2:  #DD3D39 / #C2302C
--royal / --royal2: #334B97 / #27397A
--paper / --surface: #fff (base design uses off-white #F7F4EE for paper)
--navbg: #27397A (solid navy header, not the base design's translucent light navbg)
--herobg: #27397A (solid, vs base design's light gradient)
```
Confirms gameday is a genuinely dark/high-contrast theme relative to the base — header and hero
both go to solid navy with white text, where the base design keeps a light paper header. This is
a bigger visual delta than a simple colour-variable swap; several components will need a
`data-variant`-aware light/dark text-colour branch (nav link colour, brand wordmark colour, etc.),
not just custom-property overrides. Confirmed pattern already exists for this in the source CSS's
own mobile media query (`@media(max-width:960px){.brand span{color:#fff}}` etc.) — same technique,
just needs to apply at the `data-variant="gameday"` level instead of a breakpoint.

## 6. Responsive behaviour

Two breakpoints only: `960px` (nav → drawer, grids 3→2 cols) and `620px` (grids 2/3→1 col). Simpler
than Dookie's breakpoint set is likely to be — worth checking Dookie's `base.css` for its own
breakpoint scale before deciding whether gameday reuses it directly or needs its own.

## 7. Open questions before writing component code

1. **Hero variant strategy** — new prop on `Hero.astro`, or a genuinely separate `HeroGameday.astro`? Depends on how much Hero's existing markup can flex to the watermark-crest treatment.
2. **`edu` and `split` as reusable platform blocks** — recommend building them as real, generically-named blocks (not `EduChadstone.astro`) since "why this sport" and "video pitch" sections are generically useful to any club, not gameday-specific. Needs a design-system naming decision from whoever owns the block library conventions.
3. **`teams-teaser` vs `QuickLinks`** — needs a look at `QuickLinks.astro`'s actual current markup/props before deciding reuse vs new `ProgramTeaser` block.
4. **Sponsor markup** — confirmed: use the platform's real `SponsorStrip`/`SponsorPlate` + Sponsors page pattern, not the source mockup's static chips. No open question, just flagging so it isn't re-litigated mid-build.
5. **`data-variant="gameday"` dark-header handling** — confirm the platform's existing variant/theme system supports a variant-level (not just colour-token) branch for header text colour, or whether this needs a small system extension.

**Not started:** no component code, no `design_key`/variant registration, no `allowedVariants.ts`
change. This audit is the report; next step is Carson's call on the open questions in §7 before
any `.astro` file is touched.
