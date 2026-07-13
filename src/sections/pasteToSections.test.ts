// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { pasteToSections, hasHeadings } from "./pasteToSections";

// These mirror the text/html Word/Docs put on the clipboard -- mso cruft, spans, styles and all.
// The parser must read tagName + textContent ONLY, so all of that is stripped to plain strings.

describe("pasteToSections -- headings become sections (sanitiser, not an HTML sink)", () => {
  it("a Word About page with two headings splits into two rich_text sections", () => {
    const word = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><body>
      <h1 style="mso-x:1">About Our Club</h1>
      <p class="MsoNormal"><span style="font-family:Calibri">Dookie United was founded in 1892.</span></p>
      <h2>Our History</h2>
      <p class="MsoNormal">For over a century the Dooks have fielded sides across the district.</p>
    </body></html>`;
    expect(pasteToSections(word)).toEqual([
      { heading: "About Our Club", body: [{ kind: "paragraph", text: "Dookie United was founded in 1892." }] },
      { heading: "Our History", body: [{ kind: "paragraph", text: "For over a century the Dooks have fielded sides across the district." }] },
    ]);
  });

  it("a heading over a bullet list -> heading + list block", () => {
    const html = `<body><h2>What to Bring</h2><ul><li>Boots</li><li>Water</li><li>Mouthguard</li></ul></body>`;
    expect(pasteToSections(html)).toEqual([
      { heading: "What to Bring", body: [{ kind: "list", ordered: false, items: ["Boots", "Water", "Mouthguard"] }] },
    ]);
  });

  it("Word's DEFAULT bullet list (MsoListParagraph, no <ul>) -> list block via the middle-dot marker", () => {
    // This is what Word actually emits: <p class=MsoListParagraph> with the bullet inside a
    // mso-list:Ignore span (a U+00B7 middle dot + non-breaking spaces), NOT a <ul>. textContent
    // carries "·   Boots", which the (now middle-dot-aware) parser collapses.
    const dot = "·";
    const word =
      `<body><h2>What to Bring</h2>` +
      `<p class=MsoListParagraphCxSpFirst style='mso-list:l0 level1 lfo1'><span style='mso-list:Ignore'>${dot}<span style='font:7.0pt'>&nbsp;&nbsp;&nbsp;</span></span>Boots</p>` +
      `<p class=MsoListParagraphCxSpMiddle style='mso-list:l0 level1 lfo1'><span style='mso-list:Ignore'>${dot}<span style='font:7.0pt'>&nbsp;&nbsp;&nbsp;</span></span>Water</p>` +
      `<p class=MsoListParagraphCxSpLast style='mso-list:l0 level1 lfo1'><span style='mso-list:Ignore'>${dot}<span style='font:7.0pt'>&nbsp;&nbsp;&nbsp;</span></span>Mouthguard</p>` +
      `</body>`;
    expect(pasteToSections(word)).toEqual([
      { heading: "What to Bring", body: [{ kind: "list", ordered: false, items: ["Boots", "Water", "Mouthguard"] }] },
    ]);
  });

  it("Word's DEFAULT numbered list (MsoListParagraph) -> ordered list via the number marker", () => {
    const word =
      `<body><h3>On Game Day</h3>` +
      `<p class=MsoListParagraphCxSpFirst><span style='mso-list:Ignore'>1.<span>&nbsp;&nbsp;</span></span>Arrive early</p>` +
      `<p class=MsoListParagraphCxSpMiddle><span style='mso-list:Ignore'>2.<span>&nbsp;&nbsp;</span></span>Sign in</p>` +
      `<p class=MsoListParagraphCxSpLast><span style='mso-list:Ignore'>3.<span>&nbsp;&nbsp;</span></span>Warm up</p>` +
      `</body>`;
    expect(pasteToSections(word)).toEqual([
      { heading: "On Game Day", body: [{ kind: "list", ordered: true, items: ["Arrive early", "Sign in", "Warm up"] }] },
    ]);
  });

  it("a real <ol> under a heading -> ordered list block", () => {
    const html = `<body><h3>On Game Day</h3><ol><li>Arrive early</li><li>Sign in</li><li>Warm up</li></ol></body>`;
    expect(pasteToSections(html)).toEqual([
      { heading: "On Game Day", body: [{ kind: "list", ordered: true, items: ["Arrive early", "Sign in", "Warm up"] }] },
    ]);
  });

  it("content BEFORE the first heading becomes a leading headless section", () => {
    const html = `<body><p>Welcome to our club.</p><h2>History</h2><p>Founded 1892.</p></body>`;
    expect(pasteToSections(html)).toEqual([
      { body: [{ kind: "paragraph", text: "Welcome to our club." }] },
      { heading: "History", body: [{ kind: "paragraph", text: "Founded 1892." }] },
    ]);
  });

  it("no headings -> ONE headless section, hasHeadings() false (caller uses the text/plain path)", () => {
    const html = `<body><p>Just one paragraph.</p><p>And another.</p></body>`;
    const secs = pasteToSections(html);
    expect(secs).toEqual([
      { body: [{ kind: "paragraph", text: "Just one paragraph." }, { kind: "paragraph", text: "And another." }] },
    ]);
    expect(hasHeadings(secs)).toBe(false);
  });

  it("empty / non-HTML -> [] so the caller falls back to text/plain", () => {
    expect(pasteToSections("")).toEqual([]);
    expect(pasteToSections("just some plain text, no tags")).toEqual([]);
  });

  it("never leaks markup or attributes -- inline tags and href are stripped by textContent", () => {
    const html = `<body><h1>Title</h1><p><b>Bold</b> and <i>italic</i> and <a href="http://evil.example">a link</a>.</p></body>`;
    const secs = pasteToSections(html);
    expect(secs).toEqual([{ heading: "Title", body: [{ kind: "paragraph", text: "Bold and italic and a link." }] }]);
    const json = JSON.stringify(secs);
    expect(json).not.toMatch(/[<>]/); // no tags
    expect(json).not.toMatch(/http/); // href never read
  });

  it("hasHeadings needs real headings AND more than one section", () => {
    expect(hasHeadings([{ heading: "A", body: [] }, { heading: "B", body: [] }])).toBe(true);
    expect(hasHeadings([{ heading: "A", body: [] }])).toBe(false); // one section = nothing to split
    expect(hasHeadings([{ body: [] }])).toBe(false);
  });
});
