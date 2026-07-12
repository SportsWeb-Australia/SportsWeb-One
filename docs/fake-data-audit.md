# Fake-data audit (Brief 06 item 2, PR A — read-only)

Every fabricated-data fallback found in the front end, per rule 9 (no fake/sample/
placeholder/demo/other-club data — a section shows its defined empty state or nothing).
**This is the audit only. No fixes here** — the purge is PR B, after review.

## 🔴 URGENT — live on published customers right now

Confirmed on the live public sites of **Northside Lions, Eastside United, Riverside
Cricket** (all published), logged out, this session. Every non-Dookie club's pages
say "the Dooks" and the fixtures page pushes football/netball copy at a cricket club.

| Location (file:line) | What it fakes | Reaches | Live on a published club today? |
|---|---|---|---|
| `src/pages/Fixtures.tsx:12` | intro `"…where the Dooks sit on the ladder"` (Dookie) | every club's `/fixtures` | **YES** (screenshotted ×3) |
| `src/pages/Fixtures.tsx:29` | heading `"Following the Dooks"` | every `/fixtures` | **YES** |
| `src/pages/Fixtures.tsx:32-33` | `"Home games are played at {ground}."` (empty → `"played at ."`) + `"Football fixtures…GameDay; netball…PlayHQ"` — football/netball copy on **cricket** & soccer clubs | every `/fixtures` | **YES** (Riverside = cricket) |
| `src/pages/Teams.tsx:15` | intro `"…a place at the Dooks for every age and ability"` | every `/teams` | **YES** |
| `src/pages/Events.tsx:17` | `"Club events are a big part of life at the Dooks…"` | every `/events` | **YES** |
| `src/pages/Register.tsx:14` | eyebrow `"Join the Dooks"` | every `/register` | **YES** |
| `src/pages/Register.tsx:96` | `"PlayHQ / registration URLs for football and netball before launch"` (placeholder/TODO) | every `/register` | **YES** |

These are hardcoded Dookie strings baked into the shared page-hero/intro components — they render for **every** club, published included. This is the systemic pattern the brief called out, and it is live.

## 🟠 Match Centre no-data state

| Location | What it fakes | Reaches | Live on published? |
|---|---|---|---|
| `src/content/emptyClub.ts:79-85` + the MatchCentre block | `matchCentre { placeholder: true }` empty state renders a "MANUAL / SAMPLE DATA" affordance rather than an honest empty state | any club with **no** match rows | Possibly (a published club with no fixtures). Post-grant, clubs *with* data now show real fixtures ✅; the no-data path still needs a defined empty state, not a "sample" label. |

Note: `emptyClub.matchCentre.fixtures` is `[]` (not sample rows), so non-Dookie clubs don't get *fake fixtures* — but the "sample data" labelling/placeholder flag must go.

## 🟡 Bespoke-variant hardcoded arrays — NOT live on any published club

Hardcoded fake `teams`/grades/honours/etc. arrays. These render **only** on bespoke variants, which carry **zero published clubs** (Fastbreak/Poster = Carson's draft test tenants). They die in the P6 theme rebuild and under rule 9; listed for completeness.

| Location | Fakes |
|---|---|
| `HomeLayouts.tsx:939, 1026, 1102, 1187, 1255` | hardcoded `grades` arrays (leaguefooty, courtside, juniors, rugbyunion, rugbyleague) |
| `HomeLayouts.tsx:1108` | juniors parent-`info` array |
| `HomeLayouts.tsx:1193` | rugbyunion `honours = ["Premiers 2024","Club Champions 2023","Est. 1925"]` |
| `HomeLayouts.tsx:1329, 1336` | oztag `divisions` + `nights` |
| `HomeLayouts.tsx:1403` | touch `steps` (how-it-works) |

## 🟡 Admin-facing fake data (not public, but fabricated)

| Location | Fakes | Reaches |
|---|---|---|
| `src/admin/PresidentCentre.tsx:251, 259` | `SAMPLE_FIN` / `SAMPLE_MEM` — hardcoded finance + membership charts shown as if real | President Centre admin dashboard |
| `src/admin/ResourceManager.tsx:353` | `"Seniors,1,Dookie United,…"` sample CSV row | admin import example template |

## 🟢 Low / legitimate

| Location | Note |
|---|---|
| `src/styles/tokens.css:14` | default brand tokens = Dookie teal; a club with no stored colours inherits Dookie's default. Minor visual fake. |
| `src/content/club.config.ts` (`placeholder:true` items) | Dookie's **own** placeholder committee/docs; `staticClub` is used **only** for the Dookie demo (loadClub gates it to the demo slug), so it does not leak to other clubs. |

---

## Item 3 — the `pages` and `templates` tables (from the drift sweep)

| Table | Rows | Wired? | What it is | Verdict |
|---|---|---|---|---|
| **`pages`** | **0** | **No** (zero code references) | A SECOND page-composition model: `id, club_id, title, slug, page_type, content jsonb, seo_title, seo_description, hero_image_url, status, …` | **A competing model, and drift.** With `club_pages` and `club_sections` there are **three** empty page tables. `pages` is unwired and unpopulated — nothing is built on it. **Recommend: capture + DROP alongside `club_sections` in P2.** It is not a fourth model to build on; it's a third to delete. |
| **`templates`** | **3** | **Yes** (`loadClub.ts:159-160` reads `selected_template_id → template_key`) | The design-template **catalog**: `name, slug, sport_type, description, preview_image_url, template_key, status, package_level, is_default`. Rows: `default`/"Club Classic", `afl-classic`/"AFL Powerhouse", `club-modern`/"Club Modern". | **NOT a composition model.** It's the variant catalog that maps a club to a `DesignVariant`. Active and legit. F2's theme + page-template model eventually supersedes the *variant* concept (retire with `website_variant`), but `templates` does not compete with `club_pages` — it holds no layout/sections. Leave it for now. |

**Bottom line on item 3:** you are not building a fourth model on a third. There are three *empty* page tables (`pages`, `club_pages`, `club_sections`); F2 keeps a restructured `club_pages` and drops the other two. `templates` is a separate, live catalog and is not part of the composition-model question.
