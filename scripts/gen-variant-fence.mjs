#!/usr/bin/env node
// Generates the SQL variant-fence map from the single source of truth
// (src/sections/presentation-fields.json). The save-path fence (save_club_page_draft) uses these
// to force platform-controlled presentation fields to their stored-or-default value for a
// non-platform-admin -- so a club admin cannot set a variant the composer never offered, even by
// PATCHing draft_layout directly.
//
//   node scripts/gen-variant-fence.mjs           -> (re)writes the generated .sql
//   node scripts/gen-variant-fence.mjs --check    -> exit 1 if the checked-in .sql is stale
//
// The --check form runs in `npm run build`, so drift fails the build LOUDLY -- it is never a
// tidy convention someone has to remember.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../src/sections/presentation-fields.json");
const OUT = resolve(here, "../supabase/generated/variant-fence.gen.sql");

function build() {
  const raw = JSON.parse(readFileSync(SRC, "utf8"));
  // section -> { field: default }, ignoring the _comment key. Stable (sorted) order.
  const sections = Object.keys(raw).filter((k) => k !== "_comment").sort();

  const fieldsCases = sections
    .map((s) => {
      const fields = Object.keys(raw[s]).sort();
      const arr = fields.map((f) => `'${f}'`).join(", ");
      return `    when '${s}' then array[${arr}]::text[]`;
    })
    .join("\n");

  const defaultCases = sections
    .flatMap((s) => Object.keys(raw[s]).sort().map((f) => ({ s, f, d: raw[s][f] })))
    .map(({ s, f, d }) => `    when '${s}.${f}' then '${d}'`)
    .join("\n");

  return `-- GENERATED FILE -- do not edit by hand.
-- Source of truth: src/sections/presentation-fields.json
-- Regenerate: npm run gen:variant-sql   (the build fails if this file is stale)
--
-- The save-path variant fence (save_club_page_draft) uses these two functions to force
-- platform-controlled PRESENTATION fields to their stored-or-default value for non-admins.

create or replace function public._section_presentation_fields(sectype text)
returns text[] language sql immutable as $$
  select case sectype
${fieldsCases}
    else array[]::text[]
  end;
$$;

create or replace function public._section_variant_default(sectype text, field text)
returns text language sql immutable as $$
  select case sectype || '.' || field
${defaultCases}
    else null
  end;
$$;
`;
}

const want = build();
if (process.argv.includes("--check")) {
  let have = "";
  try {
    have = readFileSync(OUT, "utf8");
  } catch {
    /* missing -> stale */
  }
  if (have !== want) {
    console.error(
      "\n[31mVARIANT FENCE SQL IS STALE.[0m\n" +
        "presentation-fields.json changed but supabase/generated/variant-fence.gen.sql was not regenerated.\n" +
        "Run:  npm run gen:variant-sql\n",
    );
    process.exit(1);
  }
  console.log("variant-fence.gen.sql is up to date.");
} else {
  writeFileSync(OUT, want);
  console.log("Wrote " + OUT);
}
