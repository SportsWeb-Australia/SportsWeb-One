# Team Line-Ups ↔ SportsWeb One integration

**Status:** the module opens the line-ups editor in a new tab, passing the club.
Identity and linking are automatic (§1). Entitlement is modelled and pushed (§2).
Writes are login-gated (§4). Remaining: gate writes on `club_entitlement()` so an
expired trial is actually stopped rather than merely reported.

| | |
|---|---|
| App | https://afl-team-line-ups.vercel.app |
| Repo | `SportsWeb-Australia/AFL-Team-Line-Ups` |
| Supabase | `wnxaydyhzwwrdwdmimab` (its own project, separate from SW1's `uzibfawcwoapfbigpzum`) |
| SW1 module key | `team_lineups` |

## What already exists

The app was built for the two-product model, not retrofitted to it. `src/lib/config.ts`
resolves a `CLIENT_TYPE` of `'sportsweb'` or `'app'` from `VITE_CLIENT_TYPE`
(overridable per-request with `?client=`), and branches behaviour: embed codes and
publishing to the club's own site in `sportsweb` mode, the app as its own
destination in `app` mode.

URL params it already honours:

| Param | Meaning |
|---|---|
| `?admin` | Open the editor. Without it the default view is the chrome-free public graphic. |
| `?embed=1` | Embedded render. |
| `?client=app\|sportsweb` | Override the deployment's client type. |
| `?club=<id>` | Load the latest published sheet for a club — **the line-ups app's own club id**. |
| `?fixture=<id>` / `?grade=` | Pin one team sheet / filter by grade. |

It also already reads SW1 read-only: `src/lib/sportsWebOne.ts` imports fixtures from
the Fixtures & Ladder module. Note its own comment — it matches clubs **by name**,
"the only identifier the two projects share, since there's no unified club id
across them."

## 1. Club identity — DONE

`clubs.sportsweb_club_id uuid` (nullable, unique) exists on the line-ups app's
Supabase, and the app resolves `?sw1club=<sw1 uuid>` through it
(`resolveClubIdFromSportsWeb` in its `src/lib/source.ts`). SW1 appends the param
via `moduleAppUrl()` in `src/lib/modules.ts`. Standalone customers leave it null.

An unlinked club shows "not linked yet" rather than falling through to the latest
sheet from any club — a club arriving from SW1 must never see another club's team.

Linking is automatic. Switching `team_lineups` on or off in Clubs & modules calls
`link_sportsweb_club()` on the line-ups project (`src/lib/teamLineups.ts`), which
creates the club there on first use and mirrors the switch into
`clubs.sportsweb_entitled`. It is idempotent, and failure is non-fatal on purpose
— the SportsWeb switch is the record of truth and the next toggle reconciles,
because a second product being unreachable must never make switching a module on
look like it failed.

### Why this shape



- **Not "line-ups adopts SW1 club ids".** Line-ups has customers who are not SW1
  clubs (its `clubs` table currently holds `Riverton Hawks`, `Hillcrest Cats` and
  five test `Geelong` rows). A product sold standalone cannot take its primary key
  from a system half its customers don't use.
- **Not name matching, which is what happens today.** It is already broken in the
  data: five rows named `Geelong` in one table, and SW1 has two clubs whose names
  differ only by suffix. `ilike` + `limit(1)` silently picks one. Name matching
  fails quietly and wrongly, which is the worst failure mode for an entitlement
  check.
- **A nullable column is additive.** No existing row changes, no migration risk,
  and the two products stay independently deployable — which is the whole point of
  the standalone/bundled model.

Direction matters: **SW1 is the identity authority only for clubs it provisioned.**
A club that signs up to line-ups directly is authoritative for itself until it is
linked. The column records the link; it does not imply ownership.

Once the column exists, SW1 passes `?sw1club=<uuid>` (a *new* param — do not reuse
`?club=`, which means the app's own id and would silently resolve to nothing) and
`src/lib/modules.ts` appends it the way Live Scores and Fixtures already append
`?clubId=`.

## 2. Billing — decided

**One rule: a club is billed by whoever provisioned it, and never by both.**

| | Entitlement source | Billed by |
|---|---|---|
| `sportsweb_club_id IS NULL` | this app's `lineup_subscriptions` | Team Line-Ups (Stripe, $19.99–$49.99/mo) |
| `sportsweb_club_id IS NOT NULL` | SportsWeb One's `club_modules`, mirrored into `sportsweb_entitled` | SportsWeb One |

`public.club_entitlement(club_id)` on the line-ups project is the single
implementation, returning `(entitled, source, reason, expires_at)`. Nothing else
should re-derive this.

`link_sportsweb_club()` deliberately creates **no** `lineup_subscriptions` row, so
a SportsWeb-billed club can never also hold a Stripe subscription here.

### Standalone trials expire hard

`start_lineup_trial(club, days := 14)` sets `status='trialing'` with a fixed
`trial_ends_at`. Entitlement stops the moment it passes — no grace period — and a
`trialing` row with a **null** end date counts as expired, so a missing date can
never become free access forever.

This is the opposite of SportsWeb One's `club_modules.trial_ends_at`, which is
written by nothing and read by nothing, so a `trial` status there never expires.
Do not copy that pattern here. For bundled clubs, grant `enabled`, not `trial`.

### "Free on plan X, small charge on plan Y"

Needs no line-ups change. The SportsWeb plan decides whether `team_lineups` is
switched on; any additional charge is an SportsWeb-side add-on on the existing
invoice. One invoice per club, which is the part clubs actually notice.

## 3. Not doing

No auth handoff. Live Scores and Fixtures each postMessage a session
(`sportsweb-live-scores-auth`, `sportsweb-fixtures-auth`) to an `authHandoff.ts` in
the target app; line-ups has no equivalent, so the module opens in a new tab and the
user signs in there. Revisit if it should be embedded — that needs the handoff on
both sides, and identity (§1) settled first.

## 4. Login-gated writes — DONE (16 Aug 2026)

The line-ups project no longer allows anonymous writes. `enable-auth.sql` was
applied after a login was created and `VITE_REQUIRE_AUTH=true` was deployed, in
that order — locking the database first would have left a window where the editor
looked open but every save failed silently.

All eight tables (`clubs, venues, teams, players, sponsors, fixtures, lineups,
lineup_positions`) now carry exactly `authenticated write` + `public read`.

Verified with the publishable key over HTTP after applying:

| Check | Result |
|---|---|
| anon write | blocked, HTTP 401 (RLS violation) |
| anon read | works — embeds and the public graphic are unaffected |
| `link_sportsweb_club()` from SportsWeb One | still works |

The auto-link survives because it is `SECURITY DEFINER` and the tables do not
`FORCE` row level security, so it runs as the table owner. This was proven in a
rolled-back transaction *before* applying, not assumed.

Rollback if ever needed: re-run `supabase/enable-writes.sql` in the line-ups repo.

## 5. Existing clubs are grandfathered

All seven clubs that predate billing were marked `active` with **no Stripe id**.
`club_entitlement()` reports those as `source='complimentary'` so a grandfathered
club is never counted as revenue. Nothing they already built can expire.

## 6. Bringing an existing line-ups club onto SportsWeb One

**Adopt the existing club first, then switch the module on.** Not the other way
around.

`link_sportsweb_club()` only finds a club by its existing link, so switching the
module on for a club that already uses Team Line-Ups standalone would create a
brand-new **empty** club and strand every team, player and line-up on the old row.

```sql
-- on the line-ups project, BEFORE toggling the module in SportsWeb One
select public.adopt_lineups_club_for_sportsweb(
         '<line-ups club uuid>', '<sportsweb club uuid>', true);
```

Then toggling the module updates that same row in place. Adoption also drops the
complimentary subscription, so the club is billed by SportsWeb One only.

Adoption is deliberately manual. Matching by name is the obvious shortcut and is
unsafe: five rows in the line-ups `clubs` table are called "Geelong", so a guess
would silently attach the wrong history.

Verified by simulating the whole handover in a rolled-back transaction: entitlement
moved `complimentary → sportsweb`, all 44 players stayed put, no duplicate club was
created, switching the module off correctly revoked access, and linking a second
row to the same SportsWeb club was refused.

## 7. Remaining: enforce entitlement
