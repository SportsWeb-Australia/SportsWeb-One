import { useState } from "react";
import migration from "./guides/sop-live-migration.html?raw";
import editableBuild from "./guides/sop-editable-build.html?raw";
import editor from "./guides/sop-sw1-editor.html?raw";

/**
 * Runbooks & SOPs — platform-admin-only reference library.
 *
 * Renders the self-contained HTML how-to guides (authored in
 * ~/Developer/sportsweb-standards/sw1-guides and copied into ./guides) inside an
 * isolated iframe (srcDoc) so each guide keeps its own styling/theme. Reference
 * only — no writes, no club data. Gated by can("platform.clubs") in AdminApp.
 */
const GUIDES: { key: string; label: string; blurb: string; html: string }[] = [
  {
    key: "migration",
    label: "Live-Site Migration",
    blurb: "Move a live site to a rebuilt Astro site on Vercel without losing earned traffic.",
    html: migration,
  },
  {
    key: "editable",
    label: "Build an Editable Site",
    blurb: "Build a DB-driven site edited through this platform (the read contract + publish gate).",
    html: editableBuild,
  },
  {
    key: "editor",
    label: "Editor — How-To",
    blurb: "Step-by-step of this editor for you and the manager: edit, preview, publish.",
    html: editor,
  },
];

export function Runbooks() {
  const [active, setActive] = useState(GUIDES[0].key);
  const guide = GUIDES.find((g) => g.key === active) ?? GUIDES[0];

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>Runbooks &amp; SOPs</h2>
      </div>
      <p className="sw-admin-note">
        Standard operating procedures for building and migrating sites. Reference only — visible to
        platform admins.
      </p>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 6px" }}
        role="tablist"
        aria-label="Runbooks"
      >
        {GUIDES.map((g) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            aria-selected={g.key === active}
            className="sw-btn sw-btn--ghost"
            onClick={() => setActive(g.key)}
            style={
              g.key === active
                ? { fontWeight: 700, borderColor: "#0e7c86", color: "#0a5a62" }
                : undefined
            }
          >
            {g.label}
          </button>
        ))}
      </div>
      <p className="sw-admin-note" style={{ marginTop: 0 }}>{guide.blurb}</p>

      <iframe
        key={guide.key}
        title={guide.label}
        srcDoc={guide.html}
        style={{
          width: "100%",
          height: "calc(100vh - 260px)",
          minHeight: 560,
          border: "1px solid #e4e4e7",
          borderRadius: 12,
          background: "#fff",
        }}
      />
    </div>
  );
}
