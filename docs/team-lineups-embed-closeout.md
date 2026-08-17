# Team Line-Ups — close out the SW1 public-site embed

**Status:** Small, well-defined. The integration doc (`docs/team-lineups-integration.md`, on main) declares admin/editor access, identity linking, entitlement and billing "complete end to end". What is **not** built is the last mile: the line-ups graphic embedded on the club's own public SW1 website.

**Verified 2026-08-17:** the standalone app already supports being embedded — `?embed=1` renders the chrome-free public graphic, `?sw1club=<sw1 uuid>` resolves the club via `clubs.sportsweb_club_id`, and an unlinked club shows "not linked yet" rather than another club's team. So the app side is done; the SW1 site side has **no embed block**: nothing in `src/components/blocks/` or the F2 sections references the line-ups app.

---

## ⚠️ READ FIRST

1. Branch off current `origin/main`; commit early; PR (S21).
2. Two things that look related but are NOT this job:
   - The F2 `team_lineup` section on branch `f2-rdca-port-v2` renders SW1's own `teams` table natively — different thing entirely.
   - The Live Scores / Fixtures **auth handoff** (`postMessage` session) — not needed here; the public graphic needs no auth.

## The job

1. **`src/components/blocks/TeamLineupsEmbed.tsx`** — copy the shape of `src/components/blocks/FixturesLadderEmbed.tsx` / `LiveScoresEmbed.tsx` (iframe + height message listener). Src: `https://afl-team-line-ups.vercel.app/?embed=1&sw1club=<club.clubId>` (optionally `&fixture=` / `&grade=` later). **Use `sw1club`, never `club`** — `?club=` is the app's own id and silently resolves to nothing (documented in `docs/team-lineups-integration.md`).
2. **Gate on entitlement:** render only when `team_lineups` ∈ `club.enabledModules` (resolved in `src/lib/loadClub.ts` from `club_modules`). No module, no iframe.
3. **Placement:** Match Centre and/or Teams page — follow where Live Scores was placed ("Move Live Scores auto-embed into Match Centre, not the homepage" was a deliberate recent decision on main; match it).
4. **Empty state:** the app shows "not linked yet" for an unlinked club — decide whether SW1 hides the block entirely in that case (probably yes: module off ⇒ hidden already covers most of it).
5. If the publish-time pre-render (PR #125) is merged by then: iframes are fine in baked HTML (the iframe loads client-side), but confirm the embed block doesn't touch `window` at render time outside effects — same SSR rule as everything else in the public tree.

That's the whole close-out. Half a day including QA against a club with the module on (Northside Lions d4232df2 has been the VolunteerOne test club; check which club is linked in the line-ups app before testing).
