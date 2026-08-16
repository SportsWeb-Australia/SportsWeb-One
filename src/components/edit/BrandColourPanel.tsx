import { useState } from "react";
import { useEdit, type BrandColours } from "../../lib/edit";

/**
 * Brand colours, on the page.
 *
 * Deliberately the same three-swatch palette the admin form already exposes —
 * primary drives the theme, secondary supports it, tertiary is captured but not
 * yet used. Colour is a site-wide decision, so it is NOT offered per element:
 * letting clubs paint individual headings is the fastest way to end up with
 * unreadable contrast and a site that stops looking designed.
 */
export function BrandColourPanel({ onClose }: { onClose: () => void }) {
  const { colours, saveColours } = useEdit();
  const [draft, setDraft] = useState<BrandColours>(colours);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (patch: Partial<BrandColours>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setMsg(null);
  };

  const swatch = (v: string) => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : "#000000");

  async function submit() {
    setBusy(true);
    const err = await saveColours(draft);
    setBusy(false);
    if (err) { setMsg(err); return; }
    // Colours are read at load, so a reload is the honest way to show the result
    // rather than leaving the club looking at stale theme variables.
    window.location.reload();
  }

  const ROWS: { key: keyof BrandColours; label: string; badge?: string; hint: string; placeholder: string }[] = [
    {
      key: "primary",
      label: "Primary",
      badge: "Drives your site",
      hint: "Your main club colour — fills the hero on colour-forward styles and sets the site accent.",
      placeholder: "#ed2129",
    },
    {
      key: "secondary",
      label: "Secondary",
      badge: "Used where it fits",
      hint: "A supporting colour, used for contrast where it works with your primary.",
      placeholder: "#ffffff",
    },
    {
      key: "tertiary",
      label: "Tertiary",
      badge: "Coming soon",
      hint: "Captured now, but not yet used on your site — leave blank if unsure.",
      placeholder: "Optional",
    },
  ];

  return (
    <div className="sw-edit-panel sw-edit-panel--colours" role="dialog" aria-label="Brand colours">
      <div className="sw-edit-panelhead">
        <strong>Brand colours</strong>
        <button type="button" className="sw-edit-panelx" onClick={onClose} aria-label="Close">×</button>
      </div>

      {ROWS.map((row) => (
        <div className="sw-edit-colrow" key={row.key}>
          <input
            type="color"
            className="sw-col-swatch"
            aria-label={`${row.label} colour`}
            value={swatch(draft[row.key])}
            onChange={(e) => set({ [row.key]: e.target.value } as Partial<BrandColours>)}
          />
          <div className="sw-edit-colfields">
            <label className="sw-edit-collabel">
              {row.label}
              {row.badge && <span className="sw-col-badge">{row.badge}</span>}
            </label>
            <input
              className="sw-edit-colhex"
              value={draft[row.key]}
              spellCheck={false}
              placeholder={row.placeholder}
              onChange={(e) => set({ [row.key]: e.target.value } as Partial<BrandColours>)}
            />
            <p className="sw-edit-colhint">{row.hint}</p>
          </div>
        </div>
      ))}

      <p className="sw-edit-colnote">Colours apply straight away — they don't wait for Publish.</p>
      {msg && <p className="sw-edit-panelerr">{msg}</p>}

      <div className="sw-edit-panelacts">
        <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={onClose}>Cancel</button>
        <button type="button" className="sw-btn sw-btn--sm" onClick={submit} disabled={busy}>
          {busy ? "Saving…" : "Save colours"}
        </button>
      </div>
    </div>
  );
}
