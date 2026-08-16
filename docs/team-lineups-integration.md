# Team Line-Ups ↔ SportsWeb One integration

**Status:** the module opens the line-ups editor in a new tab. Club identity and
billing are not yet joined up. This is the plan for both.

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

## 1. Club identity — recommendation

**Add a nullable `sportsweb_club_id uuid unique` to the line-ups app's `clubs`
table.** SW1 then links a club by passing its own uuid; line-ups resolves that to
its internal club row. Standalone customers leave the column null.

Why this and not the alternatives:

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

## 2. Billing — recommendation

The model asked for: line-ups sells standalone, and an SW1 plan can include it free
or for a small extra charge. Both systems currently believe they own entitlement —
line-ups has `lineup_plans` / `lineup_subscriptions` (with Stripe price ids and
`team_limit`), SW1 has `club_modules`.

**One rule: a club is billed by whoever provisioned it, and never by both.**

- `sportsweb_club_id IS NULL` → standalone. Line-ups' own Stripe subscription is
  the entitlement. SW1 is not involved.
- `sportsweb_club_id IS NOT NULL` → SW1-provisioned. **SW1's `club_modules` row is
  the entitlement**, and line-ups skips its own Stripe gate entirely. It should not
  hold a `lineup_subscriptions` row at all.

"Free on plan X, small charge on plan Y" is then purely an SW1-side concern, and
needs no line-ups change: the SW1 plan decides whether `team_lineups` is switched
on, and any additional charge is an SW1 add-on on the existing invoice. That keeps
one invoice per club, which is the part clubs actually care about.

Implement the check as a single function in the line-ups app — `isEntitled(club)` —
so the precedence lives in one place rather than being re-derived at each call site.

### Watch out

- `club_modules.trial_ends_at` in SW1 is written by no code path and read by none,
  so a `trial` status never expires. If a bundled line-ups entitlement is granted as
  `trial`, it is currently permanent. Either expire trials or grant `enabled`.
- The line-ups Supabase has its **own** `club_modules` table mirroring SW1's schema.
  Don't confuse the two when writing the entitlement check.

## 3. Not doing

No auth handoff. Live Scores and Fixtures each postMessage a session
(`sportsweb-live-scores-auth`, `sportsweb-fixtures-auth`) to an `authHandoff.ts` in
the target app; line-ups has no equivalent, so the module opens in a new tab and the
user signs in there. Revisit if it should be embedded — that needs the handoff on
both sides, and identity (§1) settled first.
