#!/usr/bin/env node
/**
 * Repo hygiene audit — surfaces work that is at risk of being lost, and refs that
 * are just noise.
 *
 * Written after an audit found ~3,600 lines on a four-week-old branch that never
 * had a PR, 43 uncommitted files in a working tree, and 93 dead branch refs. All
 * three were invisible until someone went looking. This makes them visible in
 * seconds, so run it often — weekly on a schedule, and before you start anything
 * big in this repo.
 *
 *   node scripts/repo-hygiene.mjs            # human-readable report
 *   node scripts/repo-hygiene.mjs --json     # machine-readable
 *   node scripts/repo-hygiene.mjs --quiet    # print only if something needs action
 *
 * Exit code is 1 when anything needs attention, so a scheduled run can alert on it.
 *
 * `gh` is optional: without it, branch classification degrades to ancestor-of-main
 * only, which cannot see squash-merged PRs — so more branches look orphaned than
 * really are. The report says so when that happens.
 */
import { execSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const AS_JSON = args.has("--json");
const QUIET = args.has("--quiet");
const STALE_PR_DAYS = 7;

const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};
const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);

const hasGh = !!sh("command -v gh");
sh("git fetch origin --prune");

// --- 1. Uncommitted work, across every worktree -----------------------------
const worktrees = sh("git worktree list --porcelain")
  .split("\n\n")
  .map((block) => {
    const path = block.match(/^worktree (.+)$/m)?.[1];
    const branch = block.match(/^branch refs\/heads\/(.+)$/m)?.[1] ?? "(detached)";
    return path ? { path, branch } : null;
  })
  .filter(Boolean);

const dirty = [];
for (const wt of worktrees) {
  const status = sh(`git -C "${wt.path}" status --porcelain`);
  const entries = lines(status);
  if (entries.length) {
    dirty.push({ ...wt, count: entries.length, sample: entries.slice(0, 5) });
  }
}

// --- 2. Local branches holding commits that exist nowhere on the remote ------
const unpushed = [];
for (const branch of lines(sh("git for-each-ref --format='%(refname:short)' refs/heads"))) {
  // Commits on this branch that no remote ref contains at all.
  const count = lines(sh(`git rev-list --count ${branch} --not --remotes`)).at(0);
  if (count && count !== "0") {
    unpushed.push({ branch, commits: Number(count), last: sh(`git log -1 --format=%cr ${branch}`) });
  }
}

// --- 3. Remote branches with no pull request --------------------------------
let prState = null;
if (hasGh) {
  try {
    prState = {};
    for (const pr of JSON.parse(sh("gh pr list --state all --limit 500 --json number,state,headRefName") || "[]")) {
      (prState[pr.headRefName] ??= []).push(pr.state);
    }
  } catch {
    prState = null;
  }
}

const mergedRefs = new Set(
  lines(sh("git branch -r --merged origin/main")).map((r) => r.replace(/^origin\//, ""))
);

const orphans = [];
const deletable = [];
for (const ref of lines(sh("git for-each-ref --format='%(refname:short)' refs/remotes/origin"))) {
  if (ref === "origin" || ref === "origin/main" || ref.endsWith("/HEAD")) continue;
  const name = ref.replace(/^origin\//, "");
  const states = prState?.[name] ?? [];
  if (states.includes("OPEN")) continue; // live work, reported separately
  if (states.includes("MERGED") || mergedRefs.has(name)) {
    deletable.push(name);
    continue;
  }
  // Never had a PR and isn't in main: work that exists only here.
  orphans.push({
    name,
    commits: Number(lines(sh(`git rev-list --count origin/main..${ref}`)).at(0) || 0),
    files: lines(sh(`git diff origin/main...${ref} --name-only`)).length,
    last: sh(`git log -1 --format=%cr ${ref}`),
  });
}

// --- 4. Open PRs going stale ------------------------------------------------
const stalePrs = [];
if (hasGh) {
  try {
    for (const pr of JSON.parse(sh("gh pr list --state open --limit 100 --json number,title,headRefName,createdAt") || "[]")) {
      const days = Math.floor((Date.now() - Date.parse(pr.createdAt)) / 86400000);
      if (days >= STALE_PR_DAYS) stalePrs.push({ ...pr, days });
    }
  } catch {
    /* leave empty */
  }
}

// --- 5. Is the local main behind? -------------------------------------------
const mainBehind = Number(lines(sh("git rev-list --count main..origin/main")).at(0) || 0);

const report = { dirty, unpushed, orphans, deletable, stalePrs, mainBehind, ghAvailable: hasGh };
const needsAction =
  dirty.length > 0 || unpushed.length > 0 || orphans.length > 0 || stalePrs.length > 0 || mainBehind > 0;

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(needsAction ? 1 : 0);
}
if (QUIET && !needsAction) process.exit(0);

const H = (s) => `\n${s}\n${"─".repeat(s.length)}`;
console.log(H("Repo hygiene"));
if (!hasGh) {
  console.log("! gh not found — squash-merged PRs can't be detected, so the orphan list overstates.");
}

console.log(H(`Uncommitted work — ${dirty.length} worktree(s)`));
if (!dirty.length) console.log("  clean");
for (const d of dirty) {
  console.log(`  ${d.path}  [${d.branch}]  ${d.count} entries`);
  for (const s of d.sample) console.log(`      ${s}`);
  if (d.count > d.sample.length) console.log(`      ...and ${d.count - d.sample.length} more`);
}

console.log(H(`Local commits on no remote — ${unpushed.length} branch(es)`));
if (!unpushed.length) console.log("  none");
for (const u of unpushed) console.log(`  ${u.branch}  +${u.commits} commits, last ${u.last}`);

console.log(H(`Remote branches with no PR — ${orphans.length}`));
if (!orphans.length) console.log("  none");
for (const o of orphans) {
  console.log(`  ${o.name}  +${o.commits} commits, ${o.files} files, last ${o.last}`);
}

console.log(H(`Open PRs older than ${STALE_PR_DAYS} days — ${stalePrs.length}`));
if (!stalePrs.length) console.log("  none");
for (const p of stalePrs) console.log(`  #${p.number} [${p.headRefName}] ${p.days}d — ${p.title}`);

console.log(H("Noise"));
console.log(`  ${deletable.length} remote branch(es) already merged into main and safe to delete.`);
if (deletable.length > 20) {
  console.log("  Turn on the repo's 'Automatically delete head branches' setting to stop this recurring.");
}
if (mainBehind) console.log(`  local main is ${mainBehind} commit(s) behind origin/main — git pull`);

console.log("");
process.exit(needsAction ? 1 : 0);
