#!/usr/bin/env node
// Alarms the HTML door for the rich_text paste path + section layer.
//
// The real risk was never textContent leaking markup -- it can't. The risk is someone six months
// from now reaching for a raw-HTML sink for a "small improvement" (keep a link, preserve a bold),
// which is exactly how Word's markup would get from a paste into stored/rendered props. This FAILS
// THE BUILD if innerHTML / outerHTML / insertAdjacentHTML / dangerouslySetInnerHTML appears anywhere
// under src/sections. Same shape as the variant drift guard: a closed door is not enough -- alarmed.
//
// Comments are stripped before scanning, so a comment that NAMES the ban (like this file, or the
// paste parsers) does not trip it -- only real code does.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "src/sections";
const SINKS = /\b(innerHTML|outerHTML|insertAdjacentHTML|dangerouslySetInnerHTML)\b/;

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "")) // line comments
    .join("\n");
}

const offenders = [];
function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) scan(p);
    else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(p))) {
      const code = stripComments(readFileSync(p, "utf8"));
      code.split("\n").forEach((line, i) => {
        if (SINKS.test(line)) offenders.push(`  ${p}:${i + 1}: ${line.trim()}`);
      });
    }
  }
}
scan(ROOT);

if (offenders.length) {
  console.error(
    "\n\x1b[31mHTML SINK DETECTED in the section/paste layer -- the door is alarmed.\x1b[0m\n" +
      "These APIs let raw HTML reach the DOM/props. Use typed blocks + textContent instead.\n",
  );
  offenders.forEach((o) => console.error(o));
  process.exit(1);
}
console.log("No HTML sinks under src/sections -- door stays shut.");
