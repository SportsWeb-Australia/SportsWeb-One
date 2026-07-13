// F2 PR 2 -- turn pasted plain text into clean Block[] for the rich_text editor.
//
// The safety line: we read the clipboard's text/plain ONLY, never text/html. Word's mso-styled
// HTML is discarded at the door; nothing here can produce markup -- every output is a plain string
// in a typed Block (see ./blocks). This function is the whole paste story.
//
// Rules (locked with Carson):
//   * A run of consecutive lines that UNIFORMLY start with a bullet (- * unicode bullet/dash) or a
//     number becomes ONE list block. Uniform only -- no partial guessing. Mixed -> paragraphs.
//   * Everything else splits into paragraph blocks so a Word paste never lands as one wall of text.
//   * Blank lines separate runs; empty blocks are pruned (an empty paragraph is a deleted one).
//   * Whatever it decides is visible in the editor before save, so a wrong guess is one edit to fix.
import type { Block } from "./blocks";

// Leading bullet markers + whitespace. Includes Word's HTML bullet glyph U+00B7 (middle dot, what
// its MsoListParagraph mso-list:Ignore span renders to in text), plus the unicode bullet/triangle/
// ring/square, en/em dash, hyphen and asterisk.
const BULLET = /^[•·‣◦▪–—\-*]\s+/;
// Leading number: "1." or "1)" then whitespace.
const NUMBERED = /^\d+[.)]\s+/;

export function pasteToBlocks(raw: string): Block[] {
  // Normalise CRLF -> LF and non-breaking spaces (Word emits both).
  const lines = raw.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++;
      continue;
    }
    // Gather a run of consecutive non-blank lines.
    let j = i;
    while (j < lines.length && lines[j].trim()) j++;
    const run = lines.slice(i, j).map((l) => l.trim());
    i = j;

    if (run.every((l) => BULLET.test(l))) {
      const items = run.map((l) => l.replace(BULLET, "").trim()).filter(Boolean);
      if (items.length) blocks.push({ kind: "list", ordered: false, items });
    } else if (run.every((l) => NUMBERED.test(l))) {
      const items = run.map((l) => l.replace(NUMBERED, "").trim()).filter(Boolean);
      if (items.length) blocks.push({ kind: "list", ordered: true, items });
    } else {
      // Not a uniform list: each non-blank line becomes its own paragraph (no wall of text,
      // no partial list-guessing -- a stray bullet line stays visible as text for her to fix).
      for (const l of run) if (l) blocks.push({ kind: "paragraph", text: l });
    }
  }
  return blocks;
}
