# F2 — Section model, page document & data-driven renderer
## The design doc. Lock this, then build against it.

**Status: LOCKED** — approved by Carson.
**Written against:** `docs/section-taxonomy-audit.md` (PR #21/#24), repo `main`.
**Supersedes:** all ad-hoc architecture discussion to date.

This is the document Codey builds against, and the document any future chat (including a future Claude
with no memory of this one) is pointed at before proposing anything. **If a proposal contradicts this
doc, the proposal is wrong until this doc is changed on purpose.** Changing it is allowed — silently
building against something else is not.

### Locked decisions

| # | Decision | Section |
|---|---|---|
| 1 | **JSONB page document.** `club_sections` is dropped. Composition lives in `club_pages.draft_layout` / `published_layout`. | §2, §3 |
| 2 | **No `custom_html` escape hatch. Ever.** Some designs become impossible. Accepted. | §4 |
| 3 | **Free-canvas drag-drop is rejected, not deferred.** Nudge room, if ever, = section variants from a menu. | §7 |
| 4 | **Two mandatory schema fixes inside the registry build:** `hero.media` union; `rich_text.body` → typed `Block[]`. **Raw HTML in props is banned.** | §4 |
| 5 | **Freeze the variant picker to Classic + themes**, before any F2 code. | §6 |
| 6 | **NO FAKE DATA. EVER.** No fallback to sample content, placeholder content, or another club's data. A section with no data renders its defined empty state, or renders nothing. | §5 |

Still open: §11 Q3 (`social_feed`), Q4 (Fastbreak/Poster draft clubs), Q5 (BHRDCA contacts model).
None of them block P2.

---

## 0. Vocabulary — locked

Three words, three meanings, permanently. Do not use them loosely again.

| Word | Means | Who controls it |
|---|---|---|
| **Theme** | The *look*. Colours, type scale, radii, spacing rhythm, card treatment, hero style. **Zero structure.** | Platform (Carson + Claude) |
| **Page template** | The *structure*. An ordered list of section instances with placeholder content. | Platform (Carson + Claude) |
| **Section** | One brick. A typed `{ id, type, props, visible }` instance inside a page. | Club may reorder / toggle / edit content |
| **Registry** | The code-side contract: for each section type — component + zod schema + admin editor form. | Platform only |

A club gets **a theme + a page template**. It then edits **content within sections**. It never touches
theme or structure.

---

## 1. The one-paragraph model

A club's website is a set of **pages**. Each page holds an **ordered array of section instances** in a
single JSONB document. Each section instance is `{ id, type, props, visible }`, where `type` names an
entry in the **section registry** (code), and `props` must validate against that entry's schema. A
**renderer** walks the array and renders each section. A **theme** supplies the CSS tokens. Publishing
copies the draft document to the published document. That is the whole system.

Three consumers use the same registry: the **renderer**, the **admin editor**, and **Claude**.

```
                  SECTION REGISTRY  (code — the contract)
                  type + zod schema + component + editor form
                    ^              ^                 ^
                    |              |                 |
              RENDERER      ADMIN EDITOR          CLAUDE
             (read-only)   (club: content only)  (fill, then design, then import)
                                   |
                                   v
                    club_pages.draft_layout  (jsonb)
                                   |  publish = one column copy
                                   v
                    club_pages.published_layout  (jsonb)  →  the live site
```

---

## 2. DECISION: JSONB page document, not `club_sections` rows

**This is the one place I am overruling Codey, and it is the most consequential call in the doc.**

Codey found `club_pages` and `club_sections(id, club_id, page_id, type, sort, visible, props jsonb)`
already exist in the DB. Both are **empty (0 rows), unwired, and undocumented** — the same off-repo
schema drift already flagged in F0. His push-back was "don't redesign the schema, it's already there."

**"It already exists" carries no weight when it is empty and load-bearing on nothing.** Changing an
empty table costs zero. The question is only: which model serves the requirements?

### Why rows lose

`club_sections` as rows has **no draft/published layer**. Every headline use case of this platform is a
**whole-page operation**, and the row model is optimised for the opposite:

| Operation | JSONB document | `club_sections` rows |
|---|---|---|
| Publish | one column copy — atomic | update N rows in a transaction |
| Undo / revert to published | one column copy | reconstruct N rows |
| Version history (Club Digital Legacy) | snapshot the jsonb | serialise N rows... into jsonb anyway |
| **Claude generates a page** | one write | N inserts |
| **Import a club's old site** | one write | N inserts |
| Reorder a section | array splice | churn `sort` integers across rows |
| Duplicate a section | array push | insert + resequence |
| Read a page publicly | one row | one query + ORDER BY |

The row model buys: cross-club queryability ("which clubs use a sponsor section") and concurrent partial
edits. **We consume neither.** There is one editor per page, and we will never run that query.

### The RLS point that settles it

`draft_layout` and `published_layout` are two **columns**. "Which one do I serve you" is a **conditional
column selection**. RLS gates rows; it cannot pick a column. And the preview token cannot be threaded
through a policy at all.

**Therefore the public page read is a `SECURITY DEFINER` RPC no matter which model we choose.** Given
that, the row model's supposed RLS advantage evaporates, and the document model's advantages are free.

### The decision

- **`club_pages`** is restructured (below) and becomes the single home of page composition.
- **`club_sections` is DROPPED.** It is empty. Dropping it costs nothing and prevents a second,
  contradictory model existing in the DB for someone to find in six months.
- Both tables are captured into migration files regardless — this is F0 drift and it gets documented.

**Overrule me if there is an argument I have not heard. "It's already scaffolded" is not one.**

---

## 3. Schema

```sql
club_pages
  id            uuid pk
  club_id       uuid not null references clubs(id) on delete cascade
  slug          text not null              -- 'home', 'juniors', 'contact'
  title         text not null
  nav_label     text
  nav_order     int
  nav_visible   boolean not null default true
  nav_parent_id uuid null references club_pages(id)   -- one level of dropdown. BHRDCA needs it.
  is_home       boolean not null default false
  seo           jsonb not null default '{}'::jsonb     -- page-level overrides; club-level is the fallback
  draft_layout      jsonb not null default '[]'::jsonb
  published_layout  jsonb                               -- null = never published
  published_at  timestamptz
  updated_at    timestamptz not null default now()
  updated_by    uuid
  unique (club_id, slug)
```

### The layout document

```jsonc
[
  {
    "id": "b7c1…",            // stable uuid. NEVER regenerated. This is SitePulse's anchor.
    "type": "hero",
    "visible": true,
    "props": { "title": "…", "media": { "kind": "image", "url": "…" } }
  },
  { "id": "3f9a…", "type": "match_data", "visible": true, "props": { "mode": "combined" } }
]
```

**The instance `id` is non-negotiable.** It is what SitePulse feedback attaches to ("this bit of my
homepage is wrong"), what the admin editor keys off, and what makes reorder and duplicate safe. It is
generated once, on insert, and survives reorder, edit, publish and revert.

### Versioning

```sql
club_page_versions
  id, club_id, page_id, layout jsonb, label text, created_at, created_by
```

Snapshot on every publish. This is **Club Digital Legacy** landing as a side effect rather than a
project. Revert = copy a version back into `draft_layout`.

### Themes

```sql
club_themes            -- platform-owned presets
  id, key, name, tokens jsonb, is_preset boolean
clubs.theme_key        -- which theme this club uses
clubs.theme_overrides  jsonb   -- club's own primary/secondary colours, logo. Nothing structural.
```

`clubs.website_variant` is **retired** at the end of the migration. During it, it is the fallback for
clubs still on the legacy renderer.

### Public read

```sql
public_club_page(p_club_id uuid, p_slug text, p_preview_token text default null)
```

`SECURITY DEFINER`. Returns `published_layout` when the club is published; returns `draft_layout` when a
valid preview token is supplied; returns **zero rows** otherwise (never an error — do not leak
existence). Granted to `anon` and `authenticated`.

**`club_content`'s public read folds into this RPC when F2 lands.** Until then it stays as-is
(published-only policy + anon grant, verified working). One door, built once — no interim churn.

### RLS

`club_pages` / `club_page_versions`: **no anon grant at all.** Public reads happen only through the RPC.
Member/platform-admin policies for read and write, using the existing `vm_is_club_member` pattern.
The tables are locked *before* a single row is written to them.

---

## 4. The registry — 15 types, 3 classes

From the audit. **Only the 7 Content types hold authored content.** Collection and Module props are pure
display config. **That means the AI authoring surface is 7 schemas, not 15.** That is the number that
makes this tractable.

### Content — props hold the content. This is Claude's canvas.

| Type | Props | Rating |
|---|---|---|
| `hero` | `{ eyebrow?, title, subtitle?, primaryCta?{label,href}, secondaryCta?, media?{kind:'none'\|'image'\|'video', url?, poster?} }` | Clean **after the media fix** |
| `announcement_bar` | `{ enabled, text, link?{label,href} }` | Clean |
| `rich_text` | `{ heading?, body: Block[] }`, `Block = paragraph \| list \| stat` | **Messy — must be fixed** |
| `quick_links` | `{ heading?, links: {label,href,icon?}[] }` | Clean |
| `cta_band` | `{ heading, blurb?, actions: {label,href}[] }` | Clean |
| `president_welcome` | `{ name, role?, portrait?, body: string[], signoff? }` | Clean |
| `contact` | `{ heading?, showEmail?, showPhone?, showAddress?, showMap? }` (binds global club fields) | Clean |

### Collection — records live in a typed table. Props are display config.

| Type | Source table | Props | Status |
|---|---|---|---|
| `news` | `news` | `{ heading?, layout:'feature'\|'grid'\|'list', count }` | ✅ exists |
| `events` | `events` | `{ heading?, count, window? }` | ✅ exists |
| `sponsors` | `sponsors` | `{ heading?, display:'strip'\|'wall'\|'tiered', showBlurb?, tiers? }` | ✅ exists |
| `committee` | `people` | `{ heading?, roles? }` | ✅ exists |
| `teams` | `teams` | `{ heading?, groupBy?, linkTo? }` | ⚠️ **table exists, renderer uses a hardcoded static array — wiring debt** |
| `documents` | — | `{ heading?, kinds? }` | ❌ **table does not exist** |

### Module — data owned by a module. Entitlement-gated. Props are config.

| Type | Props | Status |
|---|---|---|
| `match_data` | `{ mode:'fixtures'\|'results'\|'ladder'\|'combined', grade?, count? }` | ⚠️ **entitlement undefined; may never have rendered publicly — see §9** |
| `scoreboard` | `{ showLast?, showNext?, showLadderPos? }` | ⚠️ same |
| `social_feed` | `{ heading?, source:'highlights', count }` | ⚠️ **reclassified — see below. It is a Collection, not a Module.** |

### `social_feed` — DECIDED: an owned collection, never a Meta integration

The frictionless path is dead. Instagram's Basic Display API was switched off on 4 Dec 2024, and there is
no successor that supports personal accounts. The only official route is the Graph API / Instagram API
with Instagram Login, which requires — **per club** — a Professional account conversion, an OAuth flow
into our Meta app, a long-lived token refreshed on a schedule (~60-day life), aggressive caching against
a ~200-calls/hour limit, **Meta App Review for Advanced Access** (a multi-tenant app is one Meta app used
by thousands of unrelated owners; review is commonly a 60+ day wait), and a Graph API version bump every
~2 years, forever.

Our customer is a volunteer club secretary. Asking her to convert the club's Instagram to a Professional
account and complete an OAuth flow — and then handling the support ticket in 60 days when a token silently
fails to refresh — is a **permanent liability**, not a feature. Most Australian clubs also live on
**Facebook**, which is locked down the same way.

**Decision: build a source we own.**

```sql
social_highlights ( club_id, platform, post_url, image_url, caption, posted_at, sort, visible )
```

A Collection, exactly like `sponsors`. The club pastes a post URL or uploads the image + caption. Ships
in a day. No tokens, no app review, never silently breaks, works across every platform. Claude can help
write the caption — it is just another collection.

**The `social_feed` section type does not change.** It reads from a source. Today that source is
`social_highlights`. If a real Meta integration is ever wanted, it becomes a second **adapter** behind the
same section — registry, renderer and page document all untouched. **We get the outcome without the
integration debt.**

**Every Module section needs two defined states, in the registry, from day one:**
- **Not entitled** → renders **nothing**. Not an empty box. Not a "coming soon". Nothing.
- **Entitled, no data** → a defined, non-embarrassing empty state ("Fixtures will appear here once the
  season draw is published").

### The two schema fixes — do these inside the registry build, not later

1. **`hero.media` union.** Today `hero.image` and `hero.video` are two separate content keys. Collapse
   to `media: { kind, url, poster? }`. Without this, the schema is not closed and Claude cannot emit it
   reliably.
2. **`rich_text.body` → `Block[]`.** Today it is a blob / raw HTML. It must become a closed
   `Block[]` union (`paragraph | list | stat`). **Raw HTML in props is banned** — it is simultaneously
   the "club breaks the site" vector, the XSS vector, and the reason an LLM can't be trusted to author
   it.

### The outliers — `bento_grid`, `feature_split`

Rated Not-typeable. The audit proposes an **escape hatch** for them. **Rejected.**

Both live only in `bento` and `fieldcourt` — bespoke variants carrying **zero clubs, published or draft**.
There is no customer to protect and no reason to contort the model around them.

**Decision: do not build a `custom_html` or `bento_grid`-cell escape hatch.** An escape hatch is a hole in
every guarantee this platform makes — clubs can break it, Claude cannot author it, the renderer cannot
validate it, and it will quietly become where every hard case goes to hide. Rebuild those two visual
effects as **theme treatments** over standard sections, or do not ship them. If a layout genuinely cannot
be expressed without an escape hatch, that layout does not ship. **The fence is the product.**

The audit's other outlier calls are **accepted**:
- **Hero-with-embedded-fixture** (`matchday`, `rugbyleague`, `scorecard`) → split into `hero` +
  `scoreboard` / `match_data`. Correct — it was never one section.
- **Static content strips** (juniors parent-info, touch how-it-works, oztag comp-nights, rugbyunion
  honours, all teams/grades) → generalise to `rich_text`, wire `teams` to its table. **Do not port the
  hardcoded arrays.** See rule 9 in §5 — those arrays are fake data and they die with the rest.

---

## 5. The renderer contract

1. Fetch one layout document. Walk the array in order.
2. For each instance: look up `type` in the registry. **Validate `props` against its zod schema.**
3. **On validation failure: skip that section, log it, render the rest.** The page must never white-screen
   because one section has bad props. Total renderer, always.
4. On unknown `type` (a section removed from the registry): skip silently.
5. `visible: false` → skip.
6. Module sections: check entitlement → not entitled, render nothing.
7. Theme tokens are applied as CSS custom properties at the page root. **Sections never carry colours.**
8. **Every section must look correct at any position in the stack.** That is what makes free reordering
   safe, and it is a hard requirement on every section's CSS. No section may assume it is first, last, or
   adjacent to any other.
9. **NO FAKE DATA. EVER.** No fallback to sample content, placeholder content, demo content, or another
   club's data — not in the renderer, not in `loadClub`, not in a section component, not anywhere.

### Rule 9 is not a style preference. It is the core of the product promise.

The audit found this pattern is **systemic**, not incidental:

- `loadClub` **falls back to static sample fixtures** when it cannot read `matches` / `ladder` — which
  meant three published clubs (Northside, Eastside, Riverside) were serving **"MANUAL / SAMPLE DATA"** and
  Dookie's **"Following the Dooks"** placeholder on their live public fixtures pages, to real parents
  checking real match times.
- `teams` sections render **hardcoded static grade arrays** despite the `teams` table existing.
- `juniors` parent-info, `touch` how-it-works, `oztag` comp-nights, `rugbyunion` honours — all hardcoded
  fake content shipped as if it were the club's.

**A site that silently lies is worse than a site that is broken.** A broken site gets reported in an hour.
A plausible-looking fixtures page showing another club's sample data sits there for a year.

It also poisons the AI path: if the renderer invents data, Claude cannot distinguish real content from
fabricated content, and neither can the club, and neither can we.

**The only permitted behaviours when a section has no data:**
1. Render the section's **defined empty state** (a real, honest, non-embarrassing message).
2. Render **nothing at all**.

There is no third option. No sample data, no lorem, no demo club's content, no "example" rows.

**A kill-switch flag stays.** Not the elaborate per-club `render_engine` rollout I originally proposed —
Codey is right that is overkill for 4 published clubs — but one flag that flips a club back to the legacy
renderer. Twenty lines, and it is the difference between "flip one club back" and "revert a deploy at
9pm."

---

## 6. The 28 variants → themes + templates

From the audit: **28 variants → ~6 structural templates**, ~19 of them theme-only.

| Effective variant | Layout | Draft | Published |
|---|---|---|---|
| (none)→heritage | Classic | 10 | 0 |
| arena | Classic | 1 | 1 |
| broadcast | Classic | 0 | 1 |
| heritage | Classic | 0 | 1 |
| **fastbreak** | Fastbreak | **1** | 0 |
| **poster** | Poster | **1** | 0 |
| 18 other bespoke | — | 0 | 0 |

**Classic carries 15 of 17 clubs.** Port Classic → 100% of published traffic and 88% of all clubs.

**Fastbreak and Poster hold Carson's own test tenants — not customers.** (Confirmed.) So the blast
radius is genuinely **zero outside Classic**: 4 published clubs, all Classic, and nothing else that
matters. Delete or reset the two test tenants at P6; there is no customer conversation to have.

**Therefore all 20 bespoke variants are free.** They get rebuilt as themes over the ~6 templates —
never ported 1:1. That is the 40-type trap, and Codey is right to refuse it. P6 is a rebuild, not a
migration.

### ⚠️ FREEZE THE VARIANT PICKER NOW

Every new club that picks a bespoke variant **joins the blast radius**. This is the cheapest possible
action and it should ship this week, before any F2 code: **restrict the variant picker to Classic +
theme presets.** Bespoke variants remain rendered for the two draft clubs already on them, but nobody
new can select one. The blast radius stops growing while F2 is built.

---

## 7. What a club can and cannot do — the promise, in code

This *is* "simple to update, impossible to break," expressed precisely.

**A club admin CAN:**
edit text within a section's typed slots · upload/swap images and video · reorder sections · show/hide
sections · add/remove a section from an allowed list · manage collection records (news, events, sponsors,
committee, teams) · configure module sections (which grade) · edit page-level SEO · publish, unpublish,
revert · share a preview link.

**A club admin CANNOT:**
write CSS or HTML · create section types · change the theme's structure · position elements freely ·
white-screen the site (the renderer is total) · make an unpublishable state (validation blocks publish,
not editing) · see or edit another club's anything.

**Free-canvas drag-drop is not "deferred." It is rejected.** Every pixel of freedom handed to a volunteer
is a pixel of "broken on mobile" the platform owns. If clubs later want nudge room, the safe form is
**variants within a section** (`hero: image-left | image-right | centred`) — three good options from a
menu. Not a canvas.

---

## 8. The AI path — Fill, then Design

Both, in this order. Each is only *possible* because of the one before.

**Stage 1 — FILL** (ships shortly after F2)
Claude writes **props into existing section types**. Match report from three bullet points → `news`
record. Club brief → `hero` + `president_welcome` + `cta_band` props. Constrained by the zod schema:
**the validator is the safety rail — an invalid generation is rejected at the door, it never reaches a
page.** Low risk, immediately sellable.

**Stage 2 — IMPORT** (same machinery, pointed at someone else's site)
Scrape a club's existing site → map content to section types → emit a **draft** page document → human
reviews before publish. Never auto-publishes.

**Stage 3 — DESIGN** (Template Studio)
Claude emits **theme tokens + a page template** — an arrangement of sections, not just their contents.
Safe *only* because the registry constrains what it can emit. It is Stage 1 pointed at the layout instead
of the words.

**The registry is the fence that stops both the volunteer and the AI from producing a broken site. Same
fence. That is not a coincidence — it is the design.**

---

## 9. Data debt register — the hidden second project

Surfaced by the audit. **This is not F2, but F2 is not sellable without it.** Track it explicitly or it
ambushes you at BHRDCA.

| # | Item | Impact | Phase |
|---|---|---|---|
| 1 | `teams` renders a **hardcoded static array** despite the table existing | The `teams` section is a lie today | P5 |
| 2 | `documents` table **does not exist** | No documents section. BHRDCA needs one. | P5 |
| 3 | `social_highlights` table does not exist | Build it — see §4. Cheap. | P5 |
| 4 | **Match Centre entitlement undefined** | Module sections cannot be gated correctly | P2 (define) / P5 (wire) |
| 5 | **Fixtures/ladder may never have rendered to logged-out visitors** (no anon grant on `ladder`/`matches`) | If true, the three Module types have never worked in public. **Check today** — Brief 03 §3. | NOW |
| 6 | `honours` table does not exist | BHRDCA needs it | P5 |
| 7 | `people` has **no `is_public` flag** | See §9b — PII. Blocks publishing any contacts. | P5 |

**Item 5 is the one to check today.** If confirmed, the three section types that most differentiate this
platform from a generic website builder have never worked for the public.

---

## 9b. Association tenancy — DECIDED

BHRDCA's "51 club contacts" are not contacts. They are **member clubs of the association**, each with a
contact person. Getting this right is the difference between an association being "a club with more
pages" and an association being a **sales flywheel**.

### The model

- `clubs` gains **`club_type`** (`'club' | 'association'`) and **`parent_club_id`** (nullable).
- An association's member clubs become **real `clubs` rows** — stubs. No login, no site,
  `is_claimed = false`.
- **Contacts live in the existing `people` table**, scoped by `club_id`. Same table, same Collection
  section, same editor. **One contacts model across the platform, not two.**
- A new Collection section type, **`member_clubs`** — `{ heading?, groupBy?, showContact? }` — renders
  an association's children with each one's primary public contact. That is BHRDCA's Club Contacts page.

### Why not a flat `association_contacts` table

It ships a day sooner and throws away the point. With parent/child:

**Every association onboarded hands us a pre-loaded prospect list of member clubs, already in the
database.** BHRDCA alone gives ~20 cricket clubs with names and contact people. When one signs up, its
stub *becomes* the tenant. That is worth two columns.

### Two hard constraints

1. **PII.** `people` is member-only RLS today, and correctly so — volunteer names, phones, emails.
   **Every `people` row needs an `is_public` boolean, defaulting to `false`.** Only `is_public` rows are
   ever readable by the public RPC. Never blanket-publish that table. BHRDCA publishes contacts on its
   static site today, but doing it from this platform is a deliberate, per-record act.
2. **Scope.** `parent_club_id` + stubs is **P5**. The **claim flow** — a stub club signing up and taking
   ownership of its own row — is **P7**. Do not let it creep in. A stub is a `clubs` row with no login and
   no site. Nothing more.

### RLS shape

An association admin may write to a child club's `people` rows **while the child is unclaimed**. Once a
child is claimed, the child owns its own data and the association loses write access (keeps read of
`is_public` rows). Write this policy at P5; do not improvise it.

---

## 10. Build sequence

| Phase | What | Gate |
|---|---|---|
| **P0** | Publish-gate migration (Brief 03). Per-club SEO plumbing (edge-injected `<head>`, dynamic sitemap/robots — **club-level only**, page-level lands at P4). **Freeze the variant picker.** F0 hygiene: capture off-repo SQL, delete dead `LaunchTracker.tsx`. | — |
| **P1** | ✅ Done — taxonomy audit | |
| **P2** | Schema (`club_pages` restructured, `club_sections` dropped, `club_page_versions`, themes, `public_club_page` RPC) + registry + renderer + **Classic ported as one template + themes**. Layout seeded by SQL. **No admin UI.** Kill-switch flag. | **One published club renders identically from `published_layout`.** That is the whole proof. |
| **P3** | Admin composition UI: reorder, toggle, add, remove, duplicate, edit content. Draft → publish → revert visibly works. Home page only. | A club admin can rearrange their home page and cannot break it |
| **P4** | Multi-page: page CRUD, DB-driven nav (kills the hardcoded routes in `App.tsx`), page-level SEO | |
| **P5** | Collections build-out (data debt §9) + **BHRDCA ported as a real tenant.** | **BHRDCA is the acceptance test for the whole arc.** |
| **P6** | AI Fill · rebuild remaining variants as themes · migrate Fastbreak/Poster drafts · retire `website_variant` | |
| **P7** | AI Import · AI Design (Template Studio) | |

---

## 11. Open questions — ALL CLOSED

| # | Question | Answer |
|---|---|---|
| 1 | Drop `club_sections` for the JSONB page document? | **Yes.** Dropped. §2 |
| 2 | No `custom_html` escape hatch, ever? | **Yes.** Banned. §4 |
| 3 | `social_feed` — build a source or cut it? | **Build a source we own** (`social_highlights`). Never a Meta integration. §4 |
| 4 | Fastbreak / Poster draft clubs — real or test? | **Carson's test tenants.** Blast radius outside Classic is zero. §6 |
| 5 | BHRDCA's 51 club contacts — how modelled? | **Member clubs as `clubs` stubs under `parent_club_id`; contacts in `people` with an `is_public` flag.** §9b |

Nothing is blocking. P2 can start.
