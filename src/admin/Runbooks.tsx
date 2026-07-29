import { useState } from "react";
import migration from "./guides/sop-live-migration.html?raw";
import editableBuild from "./guides/sop-editable-build.html?raw";
import scratch from "./guides/sop-build-from-scratch.html?raw";
import editor from "./guides/sop-sw1-editor.html?raw";
import b1 from "./guides/b1-runbook.html?raw";

/**
 * Runbooks & SOPs — platform-admin-only reference library.
 *
 * Renders the self-contained HTML how-to guides (authored in
 * ~/Developer/sportsweb-standards/sw1-guides and copied into ./guides) inside an
 * isolated iframe (srcDoc) so each guide keeps its own styling/theme. Reference
 * only — no writes, no club data. Gated by can("platform.clubs") in AdminApp.
 *
 * The Business One group is a temporary preview hosted here until Business One
 * ships its own editor; remove that group at that point.
 */
type Guide = { key: string; group: string; label: string; blurb: string; html: string };

const GUIDES: Guide[] = [
  { key: "migration", group: "SportsWeb One", label: "Live-Site Migration", blurb: "Move a live site to a rebuilt Astro site on Vercel without losing earned traffic.", html: migration },
  { key: "editable", group: "SportsWeb One", label: "Build an Editable Site", blurb: "Build a DB-driven site edited through this platform (read contract + publish gate).", html: editableBuild },
  { key: "scratch", group: "SportsWeb One", label: "Build from Scratch", blurb: "New build: content from an old site if any, design from inspiration sites + screenshots.", html: scratch },
  { key: "editor", group: "SportsWeb One", label: "Editor — How-To", blurb: "Step-by-step of this editor for you and the manager: edit, preview, publish.", html: editor },
  { key: "b1", group: "Business One (preview)", label: "Business One Runbook", blurb: "The business-site model: standard pages, editable content model, build & migrate.", html: b1 },
];

const GROUPS = GUIDES.reduce<string[]>((acc, g) => (acc.includes(g.group) ? acc : [...acc, g.group]), []);

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

      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "0 0 6px" }}>
        {GROUPS.map((group) => (
          <div key={group} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#8a8f98",
                minWidth: 96,
              }}
            >
              {group}
            </span>
            {GUIDES.filter((g) => g.group === group).map((g) => (
              <button
                key={g.key}
                type="button"
                className="sw-btn sw-btn--ghost"
                aria-pressed={g.key === active}
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
        ))}
      </div>
      <p className="sw-admin-note" style={{ marginTop: 0 }}>{guide.blurb}</p>

      <iframe
        key={guide.key}
        title={guide.label}
        srcDoc={guide.html}
        style={{
          width: "100%",
          height: "calc(100vh - 300px)",
          minHeight: 560,
          border: "1px solid #e4e4e7",
          borderRadius: 12,
          background: "#fff",
        }}
      />
    </div>
  );
}
