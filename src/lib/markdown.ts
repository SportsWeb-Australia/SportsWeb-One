// ============================================================================
// markdown.ts — tiny, dependency-free Markdown -> HTML renderer.
// ----------------------------------------------------------------------------
// Just enough Markdown to render platform_docs.body_md in the styled SOP viewer
// (headings, ordered/unordered lists, paragraphs, inline `code` and **bold**).
// Content is authored by platform admins (trusted), but we still escape HTML
// first so a stray < or & can never break the layout or inject markup. No deps,
// per the house "minimal deps" rule.
//
// Bonus: a heading whose text is "Step N - Title" renders as a numbered step
// chip (matches the SOP viewer mockup) via <h3 class="sw1-sop-step">.
// ============================================================================

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Inline: `code` and **bold** (escape first, so the output is safe).
function inline(src: string): string {
  let s = esc(src);
  s = s.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, (_m, b) => `<strong>${b}</strong>`);
  return s;
}

const STEP_RE = /^Step\s+(\d+)\s*[-–:]\s*(.*)$/i;

function heading(level: number, text: string): string {
  const step = text.match(STEP_RE);
  if (step) {
    return `<h3 class="sw1-sop-step"><span class="sw1-sop-stepn">${esc(
      step[1]
    )}</span><span>${inline(step[2])}</span></h3>`;
  }
  const tag = level <= 1 ? "h2" : level === 2 ? "h3" : "h4";
  return `<${tag} class="sw1-sop-h">${inline(text)}</${tag}>`;
}

/** Render a small Markdown subset to an HTML string for dangerouslySetInnerHTML. */
export function renderMarkdown(md: string): string {
  const lines = (md ?? "").replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((i) => `<li>${inline(i)}</li>`).join("");
      out.push(`<${list.type}>${items}</${list.type}>`);
      list = null;
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushAll();
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushAll();
      out.push(heading(h[1].length, h[2].trim()));
      continue;
    }
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ol[1]);
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ul) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(ul[1]);
      continue;
    }
    // plain text -> accumulate into the current paragraph
    flushList();
    para.push(line.trim());
  }
  flushAll();
  return out.join("\n");
}
