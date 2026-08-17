# Engineering Conventions — SportsWeb One (SW1)

**Canonical reference for how SW1 club sites actually work.** Every SOP under
`~/Developer/sportsweb-standards/` and every guide in `src/admin/guides/` must agree with
this doc. On conflict, this doc wins — go fix the SOP, don't follow it as written.

Written 2026-08-03 after an SOP audit found the build/migration/editable SOPs describing an
architecture that was never built (see §1). 🔴 marks load-bearing rules — the ones that cost
real time when broken.

---

## 1. One renderer, not one repo per club

🔴 **Every SW1 club site renders through this one app** (`sportsweb-one-club-template`,
Vite + React + TypeScript, `react-router-dom`, this repo). There is **no per-club Astro
build, no per-club SSR, no per-club Vercel/Cloudflare project.** Grounded in the code, not
a proposal:

- [`src/App.tsx`](../src/App.tsx) resolves which club to render from the request's **domain**
  — "domains never reach here; their root renders the club's public homepage." This is already
  true today, for both renderer generations below — there is no per-club repo inside this
  platform, and there never has been.
- Two renderer generations exist inside that one app — **legacy** (current default) and
  **F2** (the target, committed to as of 2026-08-03):
  - **Legacy** — `getClubConfig()`/`lib/loadClub.ts`, the hardcoded-variant system
    (`club_content` keys, `clubs.selected_template_id`, 28 fixed designs). Fully working,
    currently what every request gets by default.
  - **F2 / `PageRenderer`** — [`src/sections/usePublicClubPage.ts`](../src/sections/usePublicClubPage.ts)
    is the single data entry point: one RPC, `public_club_page(club_id, slug, preview_token)`.
    Published clubs get `published_layout`, a valid preview token gets `draft_layout`, otherwise
    **zero rows** — existence is never leaked. No direct table access from the client.
    [`src/sections/PageRenderer.tsx`](../src/sections/PageRenderer.tsx) walks that layout
    document against a 16-type section registry and renders it, with a per-section error
    boundary so one broken section is skipped, never a white screen.
    🔴 **F2 is opt-in today, behind `?f2` in `src/App.tsx`, and stale since 2026-07-13** — see
    `docs/F2-design-doc.md` §10. It is tested only against Carson's own demo clubs; **no
    customer has ever been live on it.** That doc states the blast radius is zero and the
    kill-switch is optional for exactly that reason — there is nothing to protect yet.
    **F2 is the committed build target starting 2026-08-03** (first real use: a live prospect
    build) — building on it now means finishing open registry/design-doc items as they're hit,
    not dropping into a proven, finished path. Treat any SOP step that assumes F2 is fully
    built as provisional until proven on that build.
- Onboarding a new club is a **database row + content import** through
  [`src/admin/SiteMigrations.tsx`](../src/admin/SiteMigrations.tsx) / `Import a club` in the
  admin panel — never a new codebase, never a new deployment. (`SiteMigrations.tsx`'s own
  "Vercel → Cloudflare Pages" host-migration tracking refers to *pre-platform* standalone club
  sites being brought onto SW1, not to a per-club deployment inside SW1 itself.)

🔴 **"Editable Astro / SSR" is not the SW1 pattern and never was.** The build/migration SOPs
inherited that language from work aimed at a different, unbuilt product (§2). Any SOP text
telling you to spin up an Astro SSR repo per client for a *sports club* site is describing
something that doesn't exist — fix the SOP, don't follow it.

## 2. Astro is a Business One (B1) concern, and B1 is deferred

- **Astro, per-tenant SSR, its own editable-fields data layer** — that was the intended shape
  of **Business One**, the not-yet-built product for non-sport client businesses.
- 🔴 **B1 does not belong in the SW1 standards.** It is a separate product, to be built later
  by duplicating a finished SW1, not a variant path inside the SW1 SOPs. `BUSINESS-ONE-RUNBOOK.md`
  and the B1 preview tab in the admin Runbooks panel are removed as of this doc (2026-08-03).
- Static Astro business sites (the proven stopgap path — see
  `SPORTSWEB-BUSINESS-SITE-PLAYBOOK.md`) are a **separate, legitimate thing**: one-off
  client business sites built static, not SW1, not B1. Don't confuse the two just because
  both happen to use Astro.

## 3. Two surfaces, opposite goals

🔴 **The Builder** (Carson + Codey/Claude) is a power tool: speed, best possible look, deep
API/DB access, minimal fences. **The Club Editor** (volunteers, via the platform's edit UI)
is content-only, with hard fences — see `docs/managing-people.md` / the platform's edit
surfaces for what a club admin can actually touch.

Every SOP under `sportsweb-standards/` is written **for the Builder** (Carson and SportsWeb
managers operating Codey), not for the end volunteer using the Club Editor. Keep that framing
explicit at the top of each SOP — a reader must never mistake "how to build a site" for "how
a club edits their site."

## 4. Embeds are platform-admin-only

🔴 **Clubs never get raw HTML.** Any embed capability (video, social, custom code) is
server-gated and sandboxed, wired by a platform admin — never exposed as free-text HTML in
the Club Editor. The existing pattern:
[`src/components/blocks/MediaEmbed.tsx`](../src/components/blocks/MediaEmbed.tsx) accepts a
URL, not markup — it whitelists YouTube/Vimeo/direct-video hosts and builds the iframe/`<video>`
itself. **No `dangerouslySetInnerHTML`, no arbitrary `srcdoc`, no club-supplied `<iframe>` src.**
Any new embed type follows the same shape: typed input → server/whitelist-validated → the
platform renders it, the club never pastes HTML.

## 5. Two sources of truth (the thing that got us here)

🔴 **Any rule expressed in two places will drift.** This audit exists because
`src/admin/guides/*.html` (the live, imported-`?raw` guides shown in the admin Runbooks
panel) and `sportsweb-standards/sw1-guides/*.html` (a stale mirror) had already diverged —
despite a code comment claiming one was "authored in… and copied into" the other. Nobody was
maintaining that copy step.

Fix: `sportsweb-standards/SPORTSWEB-*.md` is the single canonical source. HTML is
**generated**, not hand-edited, straight into `src/admin/guides/`. The `sw1-guides/` mirror
in the standards repo is retired — one canonical `.md`, one generated output, not three files
that can disagree.

## 6. Every design renders correctly on every device, for every club

🔴 **"One app renders every club" (§1) means every club, on every device.** There is no
per-club, per-device escape hatch — the same renderer, same section components, same CSS
serve a phone, a tablet, and a desktop for whichever club's domain resolved the request. A
section or design that only looks right at one viewport width is not done, the same way a
section that only looks right with live data present is not done (Rule 9,
`docs/F2-design-doc.md` §5).

Concretely, for every new section component or design:
- **Test at phone, tablet, and desktop widths before calling it finished** — not just desktop,
  which is what a browser defaults to and what's easiest to forget to leave.
- **Breakpoints degrade, they don't disappear.** A two-column layout (`layout_mode:
  'main-side'`, `docs/codey-brief-10-the-design-layer.md` §3a) collapses to one column on
  narrow viewports; a hero's embedded module (e.g. the match-card slot, §3b) hides below the
  width it can no longer sit in cleanly. `src/sections/sections.css`'s main-side/hero-match
  rules use RDCA's own real breakpoint (1060px, ported directly from `_shared.css`, not
  invented) — reuse it rather than picking new numbers per section.
- **This is a renderer/CSS concern, not a per-club concern.** A club's brand colours or
  content never change whether a layout holds together at a given width — if a section
  breaks on mobile for one club, it breaks on mobile for every club using that section.

## 7. Verify against the real reference before committing, and again before calling it done

🔴 **Architectural "correctness" never overrides "would this embarrass us in front of a client."**
This rule exists because of the AFLVM incident (2026-08-04): a build was committed to F2 as the
target renderer without weighing that F2 was, by this doc's own §1, unproven and unfinished —
the wrong foundation for something that had to look client-ready immediately. Hours were spent
before anyone checked what the actual comparison baseline (RDCA's real live site) was even built
on.

**Before committing to an architecture or approach for anything client/prospect-facing:**
verify it against the real reference implementation for the quality bar you're being judged on
— not a doc describing it, not a self-report from a prior session claiming something is
"verified" or "essentially complete." Open both side by side. A written audit is a starting
point, not proof.

**Before calling a client-facing build done:** the same check, again. Self-assessment inside the
same session that did the build is not verification — it's the failure mode repeating. Confirm
against the live reference, and confirm the brand tokens actually applied (colour, logo, type),
not just that the structure/sections are present.

## 8. Bespoke build first, thin content-only editor after — never the reverse

🔴 **The site and the editor are not the same effort, and F2's job in that split is narrower than
this doc originally implied.** A club's public site is a **bespoke, hand-built, high-spec build**
— reusing a proven reference design/section set where one fits, occasionally a genuinely new one
— built to the standard of a hand-crafted site like RDCA's real one. It is never assembled from
generic swappable blocks as an end in itself; if a new section type or design gets built for one
club, it becomes a registered, reusable piece (a variant, a design-pack port, a new section type)
for the next one — not a one-off.

**The editor is a separate, later, deliberately thin layer on top of a finished bespoke build.**
It changes content only — write a news article, swap an image, edit an SEO title/H1/H2/meta
description — and **never** touches layout, design, or code. Think Wix/Webwave, but simpler and
more constrained, not more powerful: there is no page builder, no drag-and-drop layout, no style
picker beyond what the bespoke build already locked in. This is the same "constrain the
destructive freedom, keep the useful freedom" principle as the wider platform (§3) — the club
expresses *what changed*, never *how it looks*.

🔴 **There is exactly one editor, not one per club.** It already lives in the SW1 admin
dashboard (`Import a club` / `Site Migrations` / the club's own admin login) and is not built or
duplicated per site. A club admin logs into that one shared UI, and it loads *their* club's
content because every read/write is keyed by `club_id` — same code, same screens, different row.
The editor has no idea what any given club's site looks like; it only knows how to write to a
fixed set of named fields (`club_content` keys, the `news`/`events`/`sponsors`/etc. tables,
`clubs.primary_colour` and siblings) — see the content model in
`SPORTSWEB-EDITABLE-SITE-SOP.md` Part B.

**What a new bespoke build actually has to do, therefore, is not "add an editor" — it's wire its
components to *read from* that same existing shape** (the hero pulls `hero.title` from
`club_content`, news pulls from the `news` table, brand colours from the `clubs` row) instead of
hardcoding content. If a design genuinely needs a field that doesn't exist yet (e.g. a match
ticker with no home in the current shape), that is a **one-time extension of the shape** — one
new key or column — after which the existing editor can edit it for **every** club, not just the
one that needed it first. Never invent a parallel content mechanism per site; extend the one
shape everyone reads from (`SPORTSWEB-EDITABLE-SITE-SOP.md` Part E already forbids inventing new
tables/columns/keys per build — this is the *why*).

**What this means for F2 concretely:** its RPC/publish-gate/draft-preview plumbing is still sound
infrastructure for the editor layer once one exists. But F2 must not be treated as the thing that
produces the site's design — genuinely bespoke, reference-faithful builds are the bar, whichever
renderer they're built on, and that choice gets made per §7, not assumed.

---

## The one-line version

> **SW1 is one app that renders every club. B1 doesn't exist yet — don't build for it inside
> SW1's docs. If a rule lives in two files, write a generator, not a promise to keep them in sync.
> Build bespoke against the real reference, verify against it before you start and again before
> you call it done — never against a doc or a prior session's self-report. The editor only ever
> touches content, never design.**
