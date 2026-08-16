import { useEffect, useRef, useState, type ReactNode } from "react";
import { uploadToStorage } from "../lib/upload";

/**
 * Lightweight rich-text editor. Outputs HTML into the field value, which the
 * article page renders inside .sw-prose. Dependency-free: uses a contentEditable
 * surface + the browser's formatting commands. Initialised from `value` once on
 * mount; remount it (via a key) to load a different record.
 *
 * Pass `clubId` (and optionally `folder`) to enable inline image upload — images
 * go to the club's own Storage folder via uploadToStorage, same path the rest of
 * the admin uses.
 */

/** Friendly font choices -> the CSS stack applied. Cross-platform safe. */
const FONTS: { label: string; stack: string }[] = [
  { label: "Sans-serif", stack: "Arial, Helvetica, sans-serif" },
  { label: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { label: "Rounded", stack: "'Trebuchet MS', Verdana, sans-serif" },
  { label: "Monospace", stack: "'Courier New', monospace" },
];

/** Size labels -> legacy execCommand fontSize levels (become CSS keywords with styleWithCSS on). */
const SIZES: { label: string; level: string }[] = [
  { label: "Small", level: "2" },
  { label: "Normal", level: "3" },
  { label: "Large", level: "5" },
  { label: "X-Large", level: "6" },
];

/** Quick colour swatches. Custom colours come from the native picker beside them. */
const COLOURS = ["#111827", "#2563eb", "#b23a2c", "#15803d", "#b45309", "#7c3aed", "#0891b2", "#6b7280"];

/** Tags kept when cleaning pasted HTML (Word / Google Docs). Everything else is unwrapped. */
const PASTE_ALLOWED = new Set([
  "B", "STRONG", "I", "EM", "U", "A", "H2", "H3", "P", "BR", "UL", "OL", "LI", "BLOCKQUOTE",
]);
/** Block-ish tags that should leave a space behind when unwrapped, so words don't run together. */
const PASTE_SPACERS = /^(DIV|P|LI|TR|SECTION|ARTICLE|H[1-6])$/;

/** Strip Word/Docs style soup: keep a small allowlist of tags, drop all attributes bar safe hrefs. */
function sanitizePaste(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const walk = (node: Node): string => {
    let out = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        out += esc(child.textContent || "");
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      const tag = el.tagName;
      const inner = walk(el);
      if (PASTE_ALLOWED.has(tag)) {
        if (tag === "A") {
          const href = el.getAttribute("href") || "";
          const safe = /^(https?:|mailto:)/i.test(href) ? href.replace(/"/g, "&quot;") : "";
          out += safe ? `<a href="${safe}">${inner}</a>` : inner;
        } else if (tag === "BR") {
          out += "<br>";
        } else {
          const t = tag.toLowerCase();
          out += `<${t}>${inner}</${t}>`;
        }
      } else {
        out += inner;
        if (inner && PASTE_SPACERS.test(tag)) out += " ";
      }
    });
    return out;
  };
  return walk(doc.body).replace(/[ \t]+\n/g, "\n").trim();
}

export function RichText({
  value,
  onChange,
  clubId,
  folder = "articles",
}: {
  value: string;
  onChange: (html: string) => void;
  clubId?: string;
  folder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  // Which commands are active for the current selection, so the toolbar can light up.
  const [active, setActive] = useState<Record<string, boolean>>({});
  // Selects, the colour picker and the file dialog take focus away from the editable,
  // which drops the text selection. We stash the range on mousedown (before focus
  // moves) and restore it before running the command.
  const savedRange = useRef<Range | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // mount only -- re-initialising on every value change would fight the cursor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };
  const restoreSel = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  // Reflect the current selection's formatting in the toolbar (bold on, H2 on, etc.).
  const refreshActive = () => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || !el.contains(sel.anchorNode)) return;
    const q = (c: string) => {
      try { return document.queryCommandState(c); } catch { return false; }
    };
    let block = "";
    try { block = (document.queryCommandValue("formatBlock") || "").toLowerCase(); } catch { /* ignore */ }
    setActive({
      bold: q("bold"),
      italic: q("italic"),
      underline: q("underline"),
      insertUnorderedList: q("insertUnorderedList"),
      insertOrderedList: q("insertOrderedList"),
      justifyLeft: q("justifyLeft"),
      justifyCenter: q("justifyCenter"),
      justifyRight: q("justifyRight"),
      h2: block === "h2",
      h3: block === "h3",
      blockquote: block === "blockquote",
    });
  };

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Plain commands keep the browser's semantic markup (<b>, <i>, <h2>...).
  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    sync();
    refreshActive();
  };

  // Styling commands (font, size, colour) emit inline CSS so they survive save/render.
  const execStyled = (command: string, arg: string, fromMenu: boolean) => {
    ref.current?.focus();
    if (fromMenu) restoreSel();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    document.execCommand("styleWithCSS", false, "false");
    sync();
  };

  // Walk up from the selection to find an enclosing <a>, so link edits can pre-fill it.
  const selectionAnchor = (): HTMLAnchorElement | null => {
    const sel = window.getSelection();
    let n: Node | null = sel?.anchorNode ?? null;
    while (n && n !== ref.current) {
      if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName === "A") {
        return n as HTMLAnchorElement;
      }
      n = n.parentNode;
    }
    return null;
  };

  // External links open in a new tab and get rel="noopener" for safety + SEO.
  const normalizeLinks = () => {
    const origin = window.location.origin;
    ref.current?.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const external = /^https?:/i.test(href) && !href.startsWith(origin);
      if (external) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      } else {
        a.removeAttribute("target");
        a.removeAttribute("rel");
      }
    });
  };

  const addLink = () => {
    const current = selectionAnchor()?.getAttribute("href") || "";
    const url = window.prompt("Link URL (include https://)", current || "https://");
    if (url === null) return; // cancelled
    const trimmed = url.trim();
    ref.current?.focus();
    if (!trimmed) {
      document.execCommand("unlink");
    } else {
      document.execCommand("createLink", false, trimmed);
    }
    normalizeLinks();
    sync();
  };

  const onImagePicked = async (file: File | undefined) => {
    if (!file) return;
    if (!clubId) {
      window.alert("Sign in to a club before adding images.");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadToStorage(file, clubId, folder);
      ref.current?.focus();
      restoreSel();
      document.execCommand("insertImage", false, url);
      sync();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Clean pasted content so Word / Google Docs don't inject style soup.
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    if (!html && !text) return;
    e.preventDefault();
    if (html) {
      document.execCommand("insertHTML", false, sanitizePaste(html));
      normalizeLinks();
    } else {
      document.execCommand("insertText", false, text);
    }
    sync();
  };

  // preventDefault on mousedown keeps the text selection while clicking a button
  const tool = (label: ReactNode, title: string, fn: () => void, key?: string) => (
    <button
      type="button"
      title={title}
      className={key && active[key] ? "is-active" : undefined}
      onMouseDown={(e) => e.preventDefault()}
      onClick={fn}
    >
      {label}
    </button>
  );

  return (
    <div className="sw-rt">
      <div className="sw-rt-toolbar">
        {tool(<b>B</b>, "Bold", () => exec("bold"), "bold")}
        {tool(<i>I</i>, "Italic", () => exec("italic"), "italic")}
        {tool(<u>U</u>, "Underline", () => exec("underline"), "underline")}

        <span className="sw-rt-sep" />

        {/* Font family */}
        <select
          className="sw-rt-sel"
          defaultValue=""
          title="Font"
          onMouseDown={saveSel}
          onChange={(e) => {
            const v = e.target.value;
            e.currentTarget.selectedIndex = 0;
            if (v) execStyled("fontName", v, true);
          }}
        >
          <option value="" disabled>Font</option>
          {FONTS.map((f) => (
            <option key={f.stack} value={f.stack} style={{ fontFamily: f.stack }}>{f.label}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          className="sw-rt-sel"
          defaultValue=""
          title="Text size"
          onMouseDown={saveSel}
          onChange={(e) => {
            const v = e.target.value;
            e.currentTarget.selectedIndex = 0;
            if (v) execStyled("fontSize", v, true);
          }}
        >
          <option value="" disabled>Size</option>
          {SIZES.map((s) => (
            <option key={s.level} value={s.level}>{s.label}</option>
          ))}
        </select>

        <span className="sw-rt-sep" />

        {/* Colour swatches + custom picker */}
        <span className="sw-rt-swatches">
          {COLOURS.map((c) => (
            <button
              key={c}
              type="button"
              className="sw-rt-swatch"
              title={`Text colour ${c}`}
              style={{ background: c }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execStyled("foreColor", c, false)}
            />
          ))}
          <label className="sw-rt-swatch sw-rt-swatch--custom" title="Custom colour">
            <input
              type="color"
              onMouseDown={saveSel}
              onChange={(e) => execStyled("foreColor", e.target.value, true)}
            />
          </label>
        </span>

        <span className="sw-rt-sep" />

        {/* Alignment */}
        {tool("≡←", "Align left", () => exec("justifyLeft"), "justifyLeft")}
        {tool("≡", "Align centre", () => exec("justifyCenter"), "justifyCenter")}
        {tool("≡→", "Align right", () => exec("justifyRight"), "justifyRight")}

        <span className="sw-rt-sep" />

        {tool("H2", "Heading", () => exec("formatBlock", "h2"), "h2")}
        {tool("H3", "Subheading", () => exec("formatBlock", "h3"), "h3")}
        {tool("¶", "Normal text", () => exec("formatBlock", "p"))}
        {tool("• List", "Bulleted list", () => exec("insertUnorderedList"), "insertUnorderedList")}
        {tool("1. List", "Numbered list", () => exec("insertOrderedList"), "insertOrderedList")}
        {tool("❝", "Quote", () => exec("formatBlock", "blockquote"), "blockquote")}
        {tool("Link", "Add link", addLink)}
        {tool("Unlink", "Remove link", () => exec("unlink"))}

        <span className="sw-rt-sep" />

        {/* Inline image upload */}
        {tool(busy ? "Uploading…" : "Image", "Insert image", () => {
          if (busy) return;
          saveSel();
          fileRef.current?.click();
        })}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onImagePicked(e.target.files?.[0])}
        />

        {tool("Clear", "Clear formatting", () => exec("removeFormat"))}
      </div>
      <div
        ref={ref}
        className="sw-rt-area sw-prose"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onPaste={onPaste}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        data-placeholder="Write the article…"
      />
    </div>
  );
}
