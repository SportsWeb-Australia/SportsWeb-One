/**
 * Plan a legacy club's import onto the F2 renderer, and emit the SQL that applies it.
 *
 * Read-only. It resolves the club's real config, plans the page set (src/lib/importToF2.ts),
 * VALIDATES every planned section against the same zod schemas the renderer uses, and prints
 * both a summary and the SQL. Nothing is written -- the SQL goes to stdout or a file so it can be
 * read before it is run.
 *
 * Validating first is the point. PageRenderer is validate-or-skip: a section whose props fail
 * its schema is silently dropped rather than crashing the page, so an invalid import would look
 * like it worked and quietly serve a page missing half its content. This fails loudly instead.
 *
 *   node scripts/import-club-to-f2.mjs <club-uuid> [--out plan.sql]
 *
 * The club is resolved through the Supabase project the environment points at, so load the right
 * .env before running (.env.local is DEVELOP, not prod).
 */
import { build } from "esbuild";
import { writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (p) => resolve(root, p);

const clubId = process.argv[2];
const outFlag = process.argv.indexOf("--out");
const outPath = outFlag > -1 ? process.argv[outFlag + 1] : null;
if (!clubId) {
  console.error("usage: node scripts/import-club-to-f2.mjs <club-uuid> [--out plan.sql]");
  process.exit(1);
}

// The planner and the schemas are TypeScript; bundle them for node the same way the bake's
// renderer is bundled, rather than keeping a second hand-maintained copy of either.
const ENTRY = R("scripts/.import-entry.ts");
const OUT = R("scripts/.import-entry.mjs");
writeFileSync(
  ENTRY,
  `export { planF2Import } from "../src/lib/importToF2";
   export { getClubConfigForClubId } from "../src/lib/loadClub";
   export { SECTION_SCHEMAS, sectionInstanceSchema } from "../src/sections/schemas";
   export { CARDINALITY } from "../src/sections/cardinality";\n`,
);
try {
  await build({
    entryPoints: [ENTRY],
    outfile: OUT,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    jsx: "automatic",
    loader: { ".css": "empty", ".svg": "empty", ".png": "empty", ".jpg": "empty", ".jpeg": "empty", ".webp": "empty", ".gif": "empty", ".woff": "empty", ".woff2": "empty" },
    define: {
      "import.meta.env": JSON.stringify({
        DEV: false, PROD: true, MODE: "production",
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? undefined,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ?? undefined,
      }),
    },
    logLevel: "warning",
  });

  const mod = await import(`${OUT}?t=${process.hrtime.bigint()}`);
  const { planF2Import, getClubConfigForClubId, SECTION_SCHEMAS, sectionInstanceSchema, CARDINALITY } = mod;

  const club = await getClubConfigForClubId(clubId);
  console.log(`club:        ${club.identity.name}`);
  console.log(`status:      website_status=${club.websiteStatus} render_mode=${club.renderMode}`);
  console.log(
    `content:     news=${club.news?.length ?? 0} events=${club.events?.length ?? 0} teams=${club.teams?.length ?? 0}` +
      ` sponsors=${club.sponsors?.length ?? 0} committee=${club.committee?.length ?? 0} documents=${club.documents?.length ?? 0}`,
  );

  const { pages, warnings } = planF2Import(club);

  // --- validate before emitting anything ------------------------------------
  const problems = [];
  const counts = {};
  for (const p of pages) {
    for (const s of p.layout) {
      counts[s.type] = (counts[s.type] ?? 0) + 1;
      const shape = sectionInstanceSchema.safeParse({ id: s.id, type: s.type, props: s.props });
      if (!shape.success) problems.push(`${p.slug}/${s.id}: instance shape -- ${shape.error.issues[0]?.message}`);
      const schema = SECTION_SCHEMAS[s.type];
      if (!schema) { problems.push(`${p.slug}/${s.id}: unregistered section type "${s.type}"`); continue; }
      const props = schema.safeParse(s.props);
      if (!props.success) {
        for (const i of props.error.issues) problems.push(`${p.slug}/${s.id}: props.${i.path.join(".") || "(root)"} -- ${i.message}`);
      }
    }
    // Cardinality is per page, so it is checked per page.
    const perPage = {};
    for (const s of p.layout) perPage[s.type] = (perPage[s.type] ?? 0) + 1;
    for (const [type, n] of Object.entries(perPage)) {
      const max = CARDINALITY[type]?.max;
      if (typeof max === "number" && n > max) problems.push(`${p.slug}: ${n}x ${type} exceeds max ${max}`);
    }
  }
  // A reserved-slug collision is fatal (the insert would be rejected); a rewritten or dropped
  // link is not, but a human must see it before applying.
  for (const w of warnings) if (w.includes("WILL be rejected")) problems.push(w);

  console.log(`\nplanned ${pages.length} pages:`);
  for (const p of pages) {
    console.log(`  ${(p.isHome ? "/" : "/" + p.slug).padEnd(20)} ${String(p.layout.length).padStart(2)} sections  ${p.layout.map((s) => s.type).join(", ")}`);
  }
  console.log(`\nsection usage: ${Object.entries(counts).map(([t, n]) => `${t}x${n}`).join(" ")}`);

  if (warnings.length) {
    console.log(`\nlink changes (${warnings.length}) -- read these, they change what a visitor can click:`);
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (problems.length) {
    console.error(`\nREFUSING TO EMIT -- ${problems.length} validation problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(2);
  }
  console.log("\nvalidation: every section passes its schema, instance shape and cardinality.");

  // --- emit ------------------------------------------------------------------
  const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;
  const json = (v) => `${lit(JSON.stringify(v))}::jsonb`;
  const sql = [
    `-- GENERATED by scripts/import-club-to-f2.mjs for club ${clubId} (${club.identity.name}).`,
    `-- Writes club_pages ONLY. Does not touch clubs.render_mode and does not publish the club.`,
    `-- Idempotent on (club_id, slug): re-running updates the same rows.`,
    `begin;`,
    ...pages.map((p) =>
      [
        `insert into public.club_pages`,
        `  (club_id, slug, title, nav_label, nav_order, nav_visible, is_home, seo, draft_layout, draft_layout_mode)`,
        `values`,
        `  (${lit(clubId)}, ${lit(p.slug)}, ${lit(p.title)}, ${lit(p.navLabel)}, ${p.navOrder}, ${p.navVisible}, ${p.isHome}, ${json(p.seo)},`,
        `   ${json(p.layout)}, 'stack')`,
        `on conflict (club_id, slug) do update set`,
        `  title = excluded.title, nav_label = excluded.nav_label, nav_order = excluded.nav_order,`,
        `  nav_visible = excluded.nav_visible, is_home = excluded.is_home, seo = excluded.seo,`,
        `  draft_layout = excluded.draft_layout, draft_layout_mode = excluded.draft_layout_mode;`,
      ].join("\n"),
    ),
    // Publish by copying the draft column, rather than repeating every layout literal a second
    // time. Same result, half the SQL, and no chance of the two copies disagreeing.
    [
      `update public.club_pages set`,
      `  published_layout = draft_layout,`,
      `  published_layout_mode = draft_layout_mode,`,
      `  published_at = now()`,
      `where club_id = ${lit(clubId)}`,
      `  and slug in (${pages.map((p) => lit(p.slug)).join(", ")});`,
    ].join("\n"),
    `commit;`,
    ``,
  ].join("\n\n");

  if (outPath) {
    writeFileSync(outPath, sql);
    console.log(`\nSQL -> ${outPath} (${sql.length} bytes). Read it, then run it.`);
  } else {
    console.log(`\n${sql}`);
  }
} finally {
  for (const f of [ENTRY, OUT]) { try { unlinkSync(f); } catch { /* already gone */ } }
}
