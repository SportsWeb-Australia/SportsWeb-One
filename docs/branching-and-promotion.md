# Branching & promotion — the merge-only workflow

**Read this before touching the database.** SportsWeb One runs a persistent Supabase **staging branch**
so schema and RLS changes are proven against a faithful copy of production before they ever reach a
live club site.

## The two environments

| | Project ref | Vercel | Purpose |
|---|---|---|---|
| **Production** | `uzibfawcwoapfbigpzum` | `main` → Production deploys | Live club sites |
| **develop (staging)** | `jgziqwowavhuqpbmzxhs` | feature branches → Preview deploys | All schema/RLS/fence work |

Vercel env vars: **Production** `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` → `uzibfawcwoapfbigpzum`;
**Preview** → `jgziqwowavhuqpbmzxhs`. Never let the branch creds reach Production scope (every club site
would read the empty staging DB), and never let prod creds reach Preview.

## The one hard rule

**From branch creation onward, you NEVER apply anything to production.** Not a migration, not a grant,
not a data fix. The only way schema reaches production is **`merge_branch`**, and only:

1. with **Carson's authorization by name**, every time, and
2. with **a summary of every migration** included in the promotion.

Iterate as freely as you like *on the branch* (via the Supabase MCP `apply_migration` / `execute_sql`
against `jgziqwowavhuqpbmzxhs`). The branch is the sandbox; production is merge-only.

## Code ↔ DB promotion is coordinated — DB first, code second

Application code that calls a new RPC (e.g. `save_club_page_draft`) only works once that RPC exists in
the target database. So at promotion time:

1. **Merge the DB branch to production first** (`merge_branch`, authorized) — the RPCs/grants land.
2. **Then push the app code to `main`** — the Production deploy that calls them.

Never the reverse, or the live composer calls RPCs that aren't there yet. On feature branches this is
automatically safe: a feature branch builds a **Preview** (branch DB), which already has the migrations.

## Rebuilding the branch (parity gate)

If the branch is ever recreated, prove parity before trusting it — **diff, don't confirm.** Compare
prod vs branch with md5 fingerprints (not counts) across: table grants, per-column grants (all three
roles), RLS policies (USING/WITH CHECK), functions (SECURITY DEFINER + search_path + bodies), triggers,
indexes, constraints, enums. **The diff must be empty.** If it isn't, stop — do not seed, do not test.

### The grants gotcha (this cost three broken branches)

`supabase db pull` / pg_dump / Supabase branching **do not carry privileges on the `anon` /
`authenticated` / `service_role` roles** — a fresh branch comes up with those roles **wide open**
(every column of every public table). This project's entire security model is column grants, so a
naive branch is a staging environment where every RLS test passes and every result is a lie.

Fix: reconstruct prod's exact grant state from `information_schema.role_table_grants` +
`role_column_grants` as an explicit migration (blanket `REVOKE ALL`, then prod's precise grants) and
apply it. `supabase/migrations/…_grants.sql` should be folded into the baseline so future branches
reproduce it. Also verify extensions (`pgcrypto`, `uuid-ossp`, …) land in the `extensions` schema.

## Fixtures

`supabase/seed.sql` seeds the branch only (scratch tenant, club-admin + platform-admin test users,
theme rows, render-test club). It contains **no production data, ever**. Passwords are `:PW_*`
placeholders supplied at apply time — never commit real values. Test auth lives on the branch, never
in production auth.
