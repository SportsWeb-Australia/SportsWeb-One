// F2 PR 2 -- the rich_text editor. The surface a club treasurer lives in: obvious, mobile-first,
// nothing lost by accident. Three block kinds (paragraph | list | stat), each a plain-text form --
// no formatting toolbar, no raw HTML anywhere (typed Block[] by construction). Paste is the whole
// story: a Word doc with headings offers to become separate sections; anything else becomes clean
// paragraphs/lists via the proven parsers.
import { useRef, useState } from "react";
import type { Block, ListBlock, ParagraphBlock, StatBlock } from "./blocks";
import { pasteToBlocks } from "./pasteToBlocks";
import { pasteToSections, hasHeadings } from "./pasteToSections";

export interface RichTextValue {
  heading?: string;
  body: Block[];
}

type Props = {
  value: RichTextValue;
  onChange: (v: RichTextValue) => void;
  /** She pasted a multi-heading document and chose "separate parts" -> the composer splices these
   *  in as new rich_text sections. Absent -> the split option is not offered. */
  onSplitIntoSections?: (sections: RichTextValue[]) => void;
};

type PastePrompt = { sections: RichTextValue[]; plainBlocks: Block[]; at: number } | null;

const newBlock = (kind: Block["kind"]): Block =>
  kind === "paragraph"
    ? { kind: "paragraph", text: "" }
    : kind === "list"
      ? { kind: "list", ordered: false, items: [""] }
      : { kind: "stat", value: "", label: "" };

/** Strip empty blocks -- an empty paragraph is a deleted one (pruned on save, see composer). */
export function pruneBlocks(body: Block[]): Block[] {
  return body.filter((b) =>
    b.kind === "paragraph"
      ? b.text.trim() !== ""
      : b.kind === "list"
        ? b.items.some((i) => i.trim() !== "")
        : b.value.trim() !== "" || b.label.trim() !== "",
  );
}

export function RichTextEditor({ value, onChange, onSplitIntoSections }: Props) {
  const body = value.body.length ? value.body : [newBlock("paragraph")];
  const [addOpen, setAddOpen] = useState(false);
  const [prompt, setPrompt] = useState<PastePrompt>(null);
  const [undo, setUndo] = useState<null | { label: string; restore: () => void }>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setBody = (next: Block[]) => onChange({ ...value, body: next });
  const setBlock = (i: number, b: Block) => setBody(body.map((x, k) => (k === i ? b : x)));

  const flashUndo = (label: string, restore: () => void) => {
    setUndo({ label, restore });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= body.length) return;
    const next = body.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setBody(next);
  };
  const remove = (i: number) => {
    const removed = body[i];
    setBody(body.filter((_, k) => k !== i));
    // Nothing lost by accident: remove is an Undo, never a silent delete.
    flashUndo("Block removed.", () => setBody([...body.slice(0, i), removed, ...body.slice(i)]));
  };
  const add = (kind: Block["kind"]) => {
    setBody([...body, newBlock(kind)]);
    setAddOpen(false);
  };

  // --- paste: the whole Word story ---
  const onPaste = (e: React.ClipboardEvent, at: number) => {
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    const sections = html ? pasteToSections(html) : [];
    // A multi-heading document: ask before restructuring (never silently split).
    if (onSplitIntoSections && hasHeadings(sections)) {
      e.preventDefault();
      setPrompt({ sections, plainBlocks: pasteToBlocks(plain), at });
      return;
    }
    // Otherwise: only intercept when it's more than a single plain paragraph (lists, multi-para) --
    // a simple text paste falls through to the textarea's own behaviour.
    const blocks = pasteToBlocks(plain);
    if (blocks.length > 1 || (blocks[0] && blocks[0].kind !== "paragraph")) {
      e.preventDefault();
      setBody([...body.slice(0, at), ...blocks, ...body.slice(at + 1)]);
    }
  };

  const choosePlain = () => {
    if (!prompt) return;
    setBody([...body.slice(0, prompt.at), ...prompt.plainBlocks, ...body.slice(prompt.at + 1)]);
    setPrompt(null);
  };
  const chooseSplit = () => {
    if (!prompt || !onSplitIntoSections) return;
    onSplitIntoSections(prompt.sections);
    setPrompt(null);
  };

  return (
    <div className="sw-rte">
      <label className="sw-rte-field">
        <span className="sw-rte-label">Heading (optional)</span>
        <input
          className="sw-rte-input"
          value={value.heading ?? ""}
          placeholder="e.g. About our club"
          onChange={(e) => onChange({ ...value, heading: e.target.value || undefined })}
        />
      </label>

      <div className="sw-rte-blocks">
        {body.map((block, i) => (
          <div className="sw-rte-block" key={i}>
            <div className="sw-rte-block-body">
              {block.kind === "paragraph" && (
                <textarea
                  className="sw-rte-textarea"
                  value={(block as ParagraphBlock).text}
                  placeholder="Write a paragraph…"
                  rows={Math.max(2, (block as ParagraphBlock).text.split("\n").length)}
                  onPaste={(e) => onPaste(e, i)}
                  onChange={(e) => setBlock(i, { kind: "paragraph", text: e.target.value })}
                />
              )}

              {block.kind === "list" && (
                <ListEditor
                  block={block as ListBlock}
                  onChange={(b) => setBlock(i, b)}
                  onPaste={(e) => onPaste(e, i)}
                />
              )}

              {block.kind === "stat" && (
                <div className="sw-rte-stat">
                  <input
                    className="sw-rte-input"
                    value={(block as StatBlock).value}
                    placeholder="1892"
                    aria-label="Stat value"
                    onChange={(e) => setBlock(i, { ...(block as StatBlock), value: e.target.value })}
                  />
                  <input
                    className="sw-rte-input"
                    value={(block as StatBlock).label}
                    placeholder="Founded"
                    aria-label="Stat label"
                    onChange={(e) => setBlock(i, { ...(block as StatBlock), label: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="sw-rte-block-ctrls">
              <button className="sw-rte-ic" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                &uarr;
              </button>
              <button
                className="sw-rte-ic"
                onClick={() => move(i, 1)}
                disabled={i === body.length - 1}
                aria-label="Move down"
              >
                &darr;
              </button>
              <button className="sw-rte-ic sw-rte-ic-remove" onClick={() => remove(i)} aria-label="Remove block">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="sw-rte-add" onClick={() => setAddOpen((o) => !o)}>
        + Add
      </button>
      {addOpen && (
        <div className="sw-rte-palette" role="menu">
          <button className="sw-rte-palette-item" onClick={() => add("paragraph")}>
            Paragraph
          </button>
          <button className="sw-rte-palette-item" onClick={() => add("list")}>
            List
          </button>
          <button className="sw-rte-palette-item" onClick={() => add("stat")}>
            Stat
          </button>
        </div>
      )}

      {undo && (
        <div className="sw-rte-undo" role="status">
          <span>{undo.label}</span>
          <button
            onClick={() => {
              undo.restore();
              setUndo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}

      {prompt && (
        <PasteSplitDialog
          count={prompt.sections.filter((s) => s.heading).length}
          onKeepParts={chooseSplit}
          onOneBlock={choosePlain}
          onCancel={() => setPrompt(null)}
        />
      )}
    </div>
  );
}

function ListEditor({
  block,
  onChange,
  onPaste,
}: {
  block: ListBlock;
  onChange: (b: ListBlock) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}) {
  const items = block.items.length ? block.items : [""];
  const setItem = (i: number, text: string) => onChange({ ...block, items: items.map((x, k) => (k === i ? text : x)) });
  return (
    <div className="sw-rte-list">
      <div className="sw-rte-list-kind" role="group" aria-label="List style">
        <button
          className={"sw-rte-toggle" + (!block.ordered ? " is-on" : "")}
          onClick={() => onChange({ ...block, ordered: false })}
        >
          • Bulleted
        </button>
        <button
          className={"sw-rte-toggle" + (block.ordered ? " is-on" : "")}
          onClick={() => onChange({ ...block, ordered: true })}
        >
          1. Numbered
        </button>
      </div>
      {items.map((item, i) => (
        <div className="sw-rte-list-item" key={i}>
          <span className="sw-rte-list-marker">{block.ordered ? `${i + 1}.` : "•"}</span>
          <input
            className="sw-rte-input"
            value={item}
            placeholder="List item"
            aria-label={`Item ${i + 1}`}
            onPaste={onPaste}
            onChange={(e) => setItem(i, e.target.value)}
          />
          <button
            className="sw-rte-ic sw-rte-ic-remove"
            onClick={() => onChange({ ...block, items: items.filter((_, k) => k !== i) })}
            disabled={items.length === 1}
            aria-label="Remove item"
          >
            &times;
          </button>
        </div>
      ))}
      <button className="sw-rte-additem" onClick={() => onChange({ ...block, items: [...items, ""] })}>
        + Add item
      </button>
    </div>
  );
}

function PasteSplitDialog({
  count,
  onKeepParts,
  onOneBlock,
  onCancel,
}: {
  count: number;
  onKeepParts: () => void;
  onOneBlock: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="sw-rte-modal" role="dialog" aria-modal="true" aria-label="How to paste">
      <div className="sw-rte-modal-card">
        <strong>Your document has headings.</strong>
        <p>
          It looks like this has {count} heading{count === 1 ? "" : "s"}. Keep them as separate parts of your page, or
          paste it all as one block of text?
        </p>
        <div className="sw-rte-modal-actions">
          <button className="sw-rte-btn sw-rte-btn-primary" onClick={onKeepParts}>
            Keep as separate parts
          </button>
          <button className="sw-rte-btn" onClick={onOneBlock}>
            Paste as one block
          </button>
        </div>
        <button className="sw-rte-modal-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
