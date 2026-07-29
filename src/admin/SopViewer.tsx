// ============================================================================
// SopViewer — styled in-app viewer for a platform_docs SOP.
// ----------------------------------------------------------------------------
// Renders a doc's markdown body (via lib/markdown) inside a card that matches
// the visual target (sop-viewer-mockup.html): gradient header with an optional
// "opened from onboarding" context pill, category/role tags, a live migration
// status bar, and — when wired to a club's migration — a tick-able checklist
// bound to set_site_migration_step. House CSS (sw1- prefix), SportsWeb blue.
// ============================================================================
import { useMemo } from "react";
import { renderMarkdown } from "../lib/markdown";
import type { PlatformDoc } from "../lib/platformDocs";
import {
  stepsForFlow,
  stepProgress,
  STATUS_LABEL,
  type MigrationBoardRow,
  type StepKey,
} from "../lib/siteMigrations";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  superadmin: "Super Admin",
  sportsweb_manager: "SW1 Manager",
};

export function SopViewer({
  doc,
  contextLabel,
  migration,
  onToggleStep,
  busyStep,
  onClose,
}: {
  doc: PlatformDoc;
  contextLabel?: string;
  migration?: MigrationBoardRow | null;
  onToggleStep?: (key: StepKey, done: boolean) => void;
  busyStep?: StepKey | null;
  onClose?: () => void;
}) {
  const html = useMemo(() => renderMarkdown(doc.body_md), [doc.body_md]);
  const prog = migration ? stepProgress(migration.steps, migration.flow) : null;
  const pct = prog && prog.total ? Math.round((100 * prog.done) / prog.total) : 0;
  const checklist = migration ? stepsForFlow(migration.flow) : [];

  return (
    <article className="sw1-sop">
      <div className="sw1-sop-hd">
        {contextLabel && (
          <span className="sw1-sop-ctx">
            <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {contextLabel}
          </span>
        )}
        <div className="sw1-sop-hdrow">
          <h1>{doc.title}</h1>
          {onClose && (
            <button type="button" className="sw1-sop-close" aria-label="Close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        {doc.summary && <p>{doc.summary}</p>}
      </div>

      <div className="sw1-sop-bd">
        <div className="sw1-sop-tags">
          {doc.category && <span className="sw1-sop-tag">{doc.category}</span>}
          {doc.roles.map((r) => (
            <span key={r} className="sw1-sop-tag is-role">
              {ROLE_LABEL[r] ?? r}
            </span>
          ))}
        </div>

        {migration && prog && (
          <div className="sw1-sop-status">
            <span className="sw1-sop-status-lbl">
              Migration status
              <span className="sw1-sop-statuschip" data-status={migration.status}>
                {STATUS_LABEL[migration.status]}
              </span>
            </span>
            <div className="sw1-sop-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${pct}%` }} />
            </div>
            <span className="sw1-sop-pct">
              {prog.done}/{prog.total}
            </span>
          </div>
        )}

        {migration && onToggleStep && (
          <div className="sw1-sop-checklist">
            {checklist.map((s, i) => {
              const done = !!migration.steps?.[s.key];
              return (
                <label key={s.key} className={`sw1-sop-ck${done ? " is-on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={busyStep === s.key}
                    onChange={(e) => onToggleStep(s.key, e.target.checked)}
                  />
                  <span className="sw1-sop-cknum">{i + 1}</span>
                  <span className="sw1-sop-cklbl">{s.label}</span>
                </label>
              );
            })}
          </div>
        )}

        <div className="sw1-sop-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
