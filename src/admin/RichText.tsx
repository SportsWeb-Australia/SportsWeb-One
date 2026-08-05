import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lightweight rich-text editor. Outputs HTML into the field value, which the
 * article page renders inside .sw-prose. Dependency-free: uses a contentEditable
 * surface + the browser's formatting commands. Initialised from `value` once on
 * mount; remount it (via a key) to load a different record.
 */

/** Friendly font choices → the CSS stack applied. Cross-platform safe. */
const FONTS: { label: string; stack: string }[] = [
  { label: "Sans-serif", stack: "Arial, Helvetica, sans-serif" },
  { label: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { label: "Rounded", stack: "'Trebuchet MS', Verdana, sans-serif" },
  { label: "Monospace", stack: "'Courier New', monospace" },
];

/** Size labels → legacy execCommand fontSize levels (become CSS keywords with styleWithCSS on). */
const SIZES: { label: string; level: string }[] = [
  { label: "Small", level: "2" },
  { label: "Normal", level: "3" },
  { label: "Large", level: "5" },
  { label: "X-Large", level: "6" },
];

/** Quick colour swatches. Custom colours come from the native picker beside them. */
const COLOURS = ["#111827", "#2563eb", "#b23a2c", "#15803d", "#b45309", "#7c3aed", "#0891b2", "#6b7280"];

export function RichText({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Selects and the colour picker take focus away from the editable, which drops
  // the text selection. We stash the range on mousedown (before focus moves) and
  // restore it before running the command.
  const savedRange = useRef<Range | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // mount only — re-initialising on every value change would fight the cursor
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

  // Plain commands keep the browser's semantic markup (<b>, <i>, <h2>…).
  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    sync();
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

  const addLink = () => {
    const url = window.prompt("Link URL (include https://)");
    if (url) exec("createLink", url.trim());
  };

  // preventDefault on mousedown keeps the text selection while clicking a button
  const tool = (label: ReactNode, title: string, fn: () => void) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={fn}>
      {label}
    </button>
  );

  return (
    <div className="sw-rt">
      <div className="sw-rt-toolbar">
        {tool(<b>B</b>, "Bold", () => exec("bold"))}
        {tool(<i>I</i>, "Italic", () => exec("italic"))}
        {tool(<u>U</u>, "Underline", () => exec("underline"))}

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

        {tool("H2", "Heading", () => exec("formatBlock", "h2"))}
        {tool("H3", "Subheading", () => exec("formatBlock", "h3"))}
        {tool("¶", "Normal text", () => exec("formatBlock", "p"))}
        {tool("• List", "Bulleted list", () => exec("insertUnorderedList"))}
        {tool("1. List", "Numbered list", () => exec("insertOrderedList"))}
        {tool("❝", "Quote", () => exec("formatBlock", "blockquote"))}
        {tool("Link", "Add link", addLink)}
        {tool("Unlink", "Remove link", () => exec("unlink"))}
        {tool("Clear", "Clear formatting", () => exec("removeFormat"))}
      </div>
      <div
        ref={ref}
        className="sw-rt-area sw-prose"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        data-placeholder="Write the article…"
      />
    </div>
  );
}
