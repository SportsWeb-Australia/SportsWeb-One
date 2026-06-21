import type { ReactNode } from "react";
import type { Metrics } from "../lib/roleKpis";
import {
  buildHealth,
  buildRedFlags,
  buildTodos,
  type CentreLocal,
  type DataState,
  type Status,
} from "../lib/presidentCentre";

const STATE_LABEL: Record<DataState, string> = { live: "Live", mock: "Sample", setup: "Set up", manual: "Manual" };

function StateBadge({ state }: { state: DataState }) {
  return <span className={`sw-cc-state sw-cc-state--${state}`}>{STATE_LABEL[state]}</span>;
}

function dot(status: Status): ReactNode {
  return <span className={`sw-cc-dot sw-cc-dot--${status}`} aria-hidden="true" />;
}

const BUCKETS: { key: "urgent" | "week" | "month" | "season"; label: string }[] = [
  { key: "urgent", label: "Urgent" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "season", label: "Season planning" },
];

export function PresidentCentre({
  metrics,
  local,
  go,
}: {
  metrics: Metrics;
  local: CentreLocal;
  go: (key: string) => void;
}) {
  const health = buildHealth(metrics, local);
  const flags = buildRedFlags(metrics, local);
  const todos = buildTodos(metrics, local);

  return (
    <div className="sw-cc">
      {/* Club Health Score */}
      <section className="sw-cc-block">
        <div className="sw-cc-health">
          <div className={`sw-cc-score sw-cc-score--${health.status}`}>
            <span className="sw-cc-score-num">{health.overall ?? "—"}</span>
            <span className="sw-cc-score-cap">Club health</span>
          </div>
          <div className="sw-cc-health-copy">
            <h3>Club health score</h3>
            <p>
              An at-a-glance read on the whole club. Areas marked <em>Set up</em> or <em>Sample</em> light up with real
              numbers as you connect modules and Zoho.
            </p>
          </div>
        </div>

        <div className="sw-cc-areas">
          {health.areas.map((a) => (
            <div key={a.key} className={`sw-cc-area sw-cc-area--${a.status}`}>
              <div className="sw-cc-area-top">
                {dot(a.status)}
                <span className="sw-cc-area-label">{a.label}</span>
                <span className="sw-cc-area-score">{a.score == null ? "—" : `${a.score}`}</span>
              </div>
              <p className="sw-cc-area-reason">{a.reason}</p>
              <div className="sw-cc-area-foot">
                <span className="sw-cc-owner">{a.owner}</span>
                <StateBadge state={a.state} />
              </div>
              {a.action && (
                <button className="sw-cc-action" onClick={() => a.go && go(a.go)} disabled={!a.go}>
                  {a.action} →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Red Flag Alerts */}
      <section className="sw-cc-block">
        <h3 className="sw-cc-h">Red flag alerts</h3>
        <div className="sw-cc-flags">
          {flags.map((f) => (
            <div key={f.id} className={`sw-cc-flag sw-cc-flag--${f.severity}`}>
              <div className="sw-cc-flag-main">
                <span className="sw-cc-flag-title">{f.title}</span>
                <span className="sw-cc-flag-meta">
                  {f.category} · {f.severity} · {f.owner}
                  {f.due ? ` · due ${f.due}` : ""}
                </span>
              </div>
              <div className="sw-cc-flag-side">
                <StateBadge state={f.state} />
                <button className="sw-cc-flag-btn" onClick={() => f.go && go(f.go)} disabled={!f.go}>
                  {f.action} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* President To-Do Centre */}
      <section className="sw-cc-block">
        <h3 className="sw-cc-h">President to-do centre</h3>
        <div className="sw-cc-todos">
          {BUCKETS.map((b) => {
            const items = todos.filter((t) => t.bucket === b.key);
            return (
              <div key={b.key} className="sw-cc-todocol">
                <header className={`sw-cc-todohead sw-cc-todohead--${b.key}`}>
                  {b.label} <span>{items.length}</span>
                </header>
                {items.length === 0 ? (
                  <p className="sw-cc-todoempty">Nothing here.</p>
                ) : (
                  items.map((t) => (
                    <button key={t.id} className="sw-cc-todo" onClick={() => t.go && go(t.go)} disabled={!t.go}>
                      <span className="sw-cc-todo-title">{t.title}</span>
                      <span className="sw-cc-todo-foot">
                        <span>{t.owner}</span>
                        <StateBadge state={t.state} />
                      </span>
                    </button>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
