import { describe, it, expect } from "vitest";
import { pasteToBlocks } from "./pasteToBlocks";

// The clipboard's text/plain is what pasteToBlocks receives (we never read text/html). These
// samples mirror what Microsoft Word / Google Docs actually put on the plain-text clipboard.

describe("pasteToBlocks -- the Word-paste story", () => {
  it("a Word bullet list becomes ONE unordered list, glyphs stripped", () => {
    // Word puts a bullet + tab before each item.
    const paste = "•\tFooty boots\n•\tWater bottle\n•\tMouthguard";
    expect(pasteToBlocks(paste)).toEqual([
      { kind: "list", ordered: false, items: ["Footy boots", "Water bottle", "Mouthguard"] },
    ]);
  });

  it("a hyphen/dash bullet list also becomes an unordered list", () => {
    expect(pasteToBlocks("- Boots\n- Socks\n– Shorts")).toEqual([
      { kind: "list", ordered: false, items: ["Boots", "Socks", "Shorts"] },
    ]);
  });

  it("a Word numbered list becomes ONE ordered list, numbers stripped", () => {
    const paste = "1.\tArrive 15 minutes early\n2.\tSign in at the desk\n3.\tWarm up as a group";
    expect(pasteToBlocks(paste)).toEqual([
      { kind: "list", ordered: true, items: ["Arrive 15 minutes early", "Sign in at the desk", "Warm up as a group"] },
    ]);
  });

  it("blank-line-separated paragraphs (textarea style) split into paragraphs", () => {
    expect(pasteToBlocks("First paragraph.\n\nSecond paragraph.\n\nThird.")).toEqual([
      { kind: "paragraph", text: "First paragraph." },
      { kind: "paragraph", text: "Second paragraph." },
      { kind: "paragraph", text: "Third." },
    ]);
  });

  it("Word single-newline paragraphs also split -- never one wall of text", () => {
    // Word ends each paragraph with a single CRLF; this must NOT collapse into one block.
    expect(pasteToBlocks("Our club was founded in 1892.\r\nWe field four football sides.\r\nEveryone is welcome.")).toEqual([
      { kind: "paragraph", text: "Our club was founded in 1892." },
      { kind: "paragraph", text: "We field four football sides." },
      { kind: "paragraph", text: "Everyone is welcome." },
    ]);
  });

  it("an intro paragraph then a bullet list -> paragraph + list (per-run detection)", () => {
    const paste = "What to bring to training:\n\n•\tBoots\n•\tWater\n•\tA good attitude";
    expect(pasteToBlocks(paste)).toEqual([
      { kind: "paragraph", text: "What to bring to training:" },
      { kind: "list", ordered: false, items: ["Boots", "Water", "A good attitude"] },
    ]);
  });

  it("a MIXED run (heading jammed against bullets, no blank line) stays paragraphs -- no partial guessing", () => {
    // KNOWN CONSEQUENCE of "uniform only": a heading with no blank line before its bullets is not
    // a uniform run, so the bullets stay as paragraphs (glyphs visible, fixable). Copying just the
    // list -- or leaving a blank line -- gives a clean list. Flagged to Carson.
    const paste = "Gear list\n•\tBoots\n•\tWater";
    expect(pasteToBlocks(paste)).toEqual([
      { kind: "paragraph", text: "Gear list" },
      { kind: "paragraph", text: "•\tBoots" },
      { kind: "paragraph", text: "•\tWater" },
    ]);
  });

  it("prunes empty/whitespace-only lines -- an empty paragraph is a deleted one", () => {
    expect(pasteToBlocks("Real text.\n\n   \n\n\t\n\nMore text.")).toEqual([
      { kind: "paragraph", text: "Real text." },
      { kind: "paragraph", text: "More text." },
    ]);
  });

  it("normalises non-breaking spaces from Word", () => {
    const paste = "1. First step\n2. Second step"; // Word uses NBSP after the number sometimes
    expect(pasteToBlocks(paste)).toEqual([
      { kind: "list", ordered: true, items: ["First step", "Second step"] },
    ]);
  });

  it("empty / whitespace paste yields no blocks", () => {
    expect(pasteToBlocks("")).toEqual([]);
    expect(pasteToBlocks("   \n\n \t ")).toEqual([]);
  });

  it("Word HEADINGS arrive as bare paragraphs -- text/plain carries no heading marker", () => {
    // A real club About page copied from Word: two headings + body. In text/plain the heading
    // STYLE is gone -- "About Our Club" looks identical to a body line. So it flattens to
    // paragraphs and the document's structure is lost with no in-editor way to restore it.
    const aboutDoc =
      "About Our Club\n\n" +
      "Dookie United was founded in 1892 and has been the heart of the town ever since.\n\n" +
      "Our History\n\n" +
      "For over a century the Dooks have fielded football and netball sides across the district.";
    expect(pasteToBlocks(aboutDoc)).toEqual([
      { kind: "paragraph", text: "About Our Club" },
      { kind: "paragraph", text: "Dookie United was founded in 1892 and has been the heart of the town ever since." },
      { kind: "paragraph", text: "Our History" },
      { kind: "paragraph", text: "For over a century the Dooks have fielded football and netball sides across the district." },
    ]);
  });

  it("output is always plain strings -- no HTML, no residual bullet glyphs in items", () => {
    const paste = "•\tOne\n•\tTwo";
    const blocks = pasteToBlocks(paste);
    const json = JSON.stringify(blocks);
    expect(json).not.toMatch(/[<>]/); // no angle brackets => no HTML
    expect(json).not.toMatch(/•/); // bullet glyph stripped from items
  });
});
