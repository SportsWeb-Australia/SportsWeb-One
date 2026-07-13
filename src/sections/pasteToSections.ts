// F2 PR 2 -- split a pasted Word/Docs document into rich_text sections on its headings.
//
// This reads the clipboard's text/html, but it is a SANITISER, not an HTML sink: it touches only
// element tagName + textContent -- never innerHTML, never a single attribute. textContent strips
// all markup by definition, so nothing but plain strings ever leaves this function. No HTML string
// can reach props. Absent or malformed HTML -> [] -> the caller falls back to the text/plain path
// (pasteToBlocks), which is already proven.
//
// A Word "Heading 1"/"Heading 2" becomes a new section's `heading`; the paragraphs/lists beneath it
// become that section's `body` (via pasteToBlocks, so Word's bullet lists still collapse cleanly).
// Three headings -> three rich_text sections. rich_text.heading already exists; zero schema cost.
import type { Block } from "./blocks";
import { pasteToBlocks } from "./pasteToBlocks";

export interface PastedSection {
  heading?: string;
  body: Block[];
}

const HEADING = /^h[1-6]$/;
// Leaf content blocks: take their text, don't descend. Everything else with children is a wrapper.
const LEAF = new Set(["p", "blockquote", "pre", "li"]);

export function pasteToSections(html: string): PastedSection[] {
  if (!html || typeof DOMParser === "undefined") return [];
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(html, "text/html");
  } catch {
    return [];
  }
  if (!doc || !doc.body) return [];

  const sections: PastedSection[] = [];
  let cur: PastedSection = { body: [] };
  let pending: string[] = []; // accumulated plain text lines for the current section

  const flush = () => {
    const text = pending.join("\n").trim();
    pending = [];
    if (text) cur.body.push(...pasteToBlocks(text)); // reuse the proven bullet/paragraph logic
  };
  const startSection = (heading?: string) => {
    flush();
    if (cur.heading || cur.body.length) sections.push(cur);
    cur = { body: [], ...(heading ? { heading } : {}) };
  };

  const walk = (node: Element) => {
    for (const el of Array.from(node.children)) {
      const tag = el.tagName.toLowerCase();
      if (HEADING.test(tag)) {
        startSection((el.textContent || "").trim() || undefined);
      } else if (tag === "ul" || tag === "ol") {
        flush();
        const items = Array.from(el.querySelectorAll("li"))
          .map((li) => (li.textContent || "").trim())
          .filter(Boolean);
        if (items.length) cur.body.push({ kind: "list", ordered: tag === "ol", items });
      } else if (el.children.length && !LEAF.has(tag)) {
        walk(el); // wrapper (div/section/span container) -> descend to find headings + lists
      } else {
        const t = (el.textContent || "").trim();
        if (t) pending.push(t);
      }
    }
  };

  walk(doc.body);
  flush();
  if (cur.heading || cur.body.length) sections.push(cur);
  return sections;
}

/** True when the pasted HTML actually carries headings worth offering a split for. */
export function hasHeadings(sections: PastedSection[]): boolean {
  return sections.filter((s) => s.heading).length > 0 && sections.length > 1;
}
