// ============================================================================
// SiteMigrations — Super Admin -> Site Migrations.
// ----------------------------------------------------------------------------
// The admin power-view of public.site_migrations: a board of every club's
// website host migration (Vercel -> Cloudflare Pages) or green-field build,
// with per-club controls. One source of truth (site_migrations); the club
// onboarding "Hosting & DNS" step is the other surface onto the same records.
//
// Reads the site_migration_board / _progress views; writes via the guarded
// RPCs (start / step / status) and updateMigrationFields. Platform-admin gated
// in AdminApp via can("platform.clubs"); RLS enforces it server-side too.
// ============================================================================
import { useEffect, useMemo, useState } from "react";
import { listClubs, type AdminClub } from "../lib/superAdmin";
import { getPlatformDoc, type PlatformDoc } from "../lib/platformDocs";
import { SopViewer } from "./SopViewer";
import {
  listMigrations,
  getMigrationProgress,
  startMigration,
  setStep,
  setStatus,
  updateMigrationFields,
  verifyMigration,
  type VerifyResult,
  stepsForFlow,
  stepProgress,
  STATUS_ORDER,
  STATUS_LABEL,
  type MigrationBoardRow,
  type MigrationProgress,
  type MigrationFlow,
  type MigrationStatus,
  type StepKey,
} from "../lib/siteMigrations";

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";

// Status colour grouping for the badge.
const STATUS_TONE: Record<MigrationStatus, "idle" | "live" | "good" | "bad"> = {
  not_started: "idle",
  deploying: "live",
  testing: "live",
  dns_www: "live",
  dns_redirect: "live",
  verifying: "live",
  complete: "good",
  rolled_back: "bad",
};

export function SiteMigrations() {
  const [rows, setRows] = useState<MigrationBoardRow[]>([]);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  // filters
  const [fStatus, setFStatus] = useState<"all" | MigrationStatus>("all");
  const [fFlow, setFFlow] = useState<"all" | MigrationFlow>("all");

  const reload = async () => {
    const [r, p] = await Promise.all([listMigrations(), getMigrationProgress()]);
    setRows(r);
    setProgress(p);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [r, p, c] = await Promise.all([listMigrations(), getMigrationProgress(), listClubs()]);
      if (!alive) return;
      setRows(r);
      setProgress(p);
      setClubs(c);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) => (fStatus === "all" || r.status === fStatus) && (fFlow === "all" || r.flow === fFlow)
      ),
    [rows, fStatus, fFlow]
  );

  const selected = selectedClub ? rows.find((r) => r.club_id === selectedClub) ?? null : null;

  // Optimistically patch one row in local state (write handlers call the API
  // then reconcile with a reload on error).
  const patchRow = (clubId: string, patch: Partial<MigrationBoardRow>) =>
    setRows((rs) => rs.map((r) => (r.club_id === clubId ? { ...r, ...patch } : r)));

  return (
    <div className="sw-admin-panel sw1-mig">
      <div className="sw-admin-formhead">
        <h2>Site Migrations</h2>
      </div>
      <p className="sw-admin-note">
        Track each club's website host migration (Vercel &rarr; Cloudflare Pages) and green-field
        Cloudflare builds. DNS stays at VentraIP; club email is never touched.
      </p>

      {progress && progress.total > 0 && (
        <div className="sw1-mig-rollup">
          <ProgressPill
            label="Sites migrated"
            value={`${progress.completed}/${progress.total}`}
            pct={progress.pct_complete ?? 0}
          />
          <MiniStat label="In progress" value={progress.in_progress} />
          <MiniStat label="Not started" value={progress.not_started} />
          <MiniStat label="Migrations" value={progress.migrations} />
          <MiniStat label="Green-field" value={progress.greenfield} />
        </div>
      )}

      <StartMigrationForm
        clubs={clubs}
        existing={rows}
        onStarted={async (clubId) => {
          await reload();
          setSelectedClub(clubId);
        }}
      />

      {/* Filters */}
      <div className="sw1-mig-filters">
        <label>
          Status
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value as any)}>
            <option value="all">All</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Flow
          <select value={fFlow} onChange={(e) => setFFlow(e.target.value as any)}>
            <option value="all">All</option>
            <option value="migration">Migration</option>
            <option value="greenfield">Green-field</option>
          </select>
        </label>
        <span className="sw1-mig-count">
          {filtered.length} of {rows.length}
        </span>
      </div>

      {loading ? (
        <p className="sw-admin-note">Loading migrations…</p>
      ) : rows.length === 0 ? (
        <p className="sw-admin-note">
          No migrations yet. Start one above, or open a club's onboarding &rarr; Hosting &amp; DNS.
        </p>
      ) : (
        <div className="sw1-mig-tablewrap">
          <table className="sw1-mig-table">
            <thead>
              <tr>
                <th>Club</th>
                <th>Domain</th>
                <th>Flow</th>
                <th>Status</th>
                <th>Steps</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const prog = stepProgress(r.steps, r.flow);
                return (
                  <tr
                    key={r.id}
                    className={selectedClub === r.club_id ? "is-sel" : ""}
                    onClick={() => setSelectedClub(r.club_id)}
                  >
                    <td data-label="Club">{r.club_name}</td>
                    <td data-label="Domain" className="sw1-mig-mono">{r.domain}</td>
                    <td data-label="Flow">
                      <span className={`sw1-mig-flow is-${r.flow}`}>
                        {r.flow === "greenfield" ? "Green-field" : "Migration"}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`sw1-mig-badge tone-${STATUS_TONE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td data-label="Steps">
                      <span className="sw1-mig-steps">
                        {prog.done}/{prog.total}
                        {!r.email_untouched_confirmed && r.status !== "not_started" && (
                          <span className="sw1-mig-warn" title="Email-untouched not yet confirmed">
                            ⚠
                          </span>
                        )}
                      </span>
                    </td>
                    <td data-label="Updated">{fmtDate(r.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <MigrationDrawer
          row={selected}
          onClose={() => setSelectedClub(null)}
          patchRow={patchRow}
          reload={reload}
        />
      )}
    </div>
  );
}

// ── Start migration ──────────────────────────────────────────────────────────

function StartMigrationForm({
  clubs,
  existing,
  onStarted,
}: {
  clubs: AdminClub[];
  existing: MigrationBoardRow[];
  onStarted: (clubId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [clubId, setClubId] = useState("");
  const [domain, setDomain] = useState("");
  const [flow, setFlow] = useState<MigrationFlow>("migration");
  const [repo, setRepo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hasRow = useMemo(() => new Set(existing.map((e) => e.club_id)), [existing]);

  const submit = async () => {
    if (!clubId || !domain.trim()) {
      setErr("Pick a club and enter a domain.");
      return;
    }
    setBusy(true);
    setErr(null);
    const { error } = await startMigration(clubId, domain, flow, repo || null);
    setBusy(false);
    if (error) {
      setErr(error);
      return;
    }
    const started = clubId;
    setClubId("");
    setDomain("");
    setRepo("");
    setFlow("migration");
    setOpen(false);
    onStarted(started);
  };

  if (!open) {
    return (
      <div className="sw1-mig-startrow">
        <button type="button" className="sw-btn" onClick={() => setOpen(true)}>
          + Start a migration
        </button>
      </div>
    );
  }

  return (
    <div className="sw1-mig-start">
      <div className="sw1-mig-startgrid">
        <label className="sw-admin-field">
          <span>Club</span>
          <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
            <option value="">Select a club…</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {hasRow.has(c.id) ? " (has record — re-opens)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="sw-admin-field">
          <span>Domain</span>
          <input value={domain} placeholder="theclub.com.au" onChange={(e) => setDomain(e.target.value)} />
        </label>
        <label className="sw-admin-field">
          <span>Flow</span>
          <select value={flow} onChange={(e) => setFlow(e.target.value as MigrationFlow)}>
            <option value="migration">Migration (from Vercel)</option>
            <option value="greenfield">Green-field (new on Cloudflare)</option>
          </select>
        </label>
        <label className="sw-admin-field">
          <span>Repo (optional)</span>
          <input value={repo} placeholder="SportsWeb-Australia/the-club" onChange={(e) => setRepo(e.target.value)} />
        </label>
      </div>
      {err && <small className="sw1-onboard-err">{err}</small>}
      <div className="sw1-mig-startactions">
        <button type="button" className="sw-btn" disabled={busy} onClick={submit}>
          {busy ? "Starting…" : "Start migration"}
        </button>
        <button type="button" className="sw-btn sw-btn--ghost" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Row drawer (per-club controls) ───────────────────────────────────────────

function MigrationDrawer({
  row,
  onClose,
  patchRow,
  reload,
}: {
  row: MigrationBoardRow;
  onClose: () => void;
  patchRow: (clubId: string, patch: Partial<MigrationBoardRow>) => void;
  reload: () => Promise<void>;
}) {
  const [busyStep, setBusyStep] = useState<StepKey | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showSop, setShowSop] = useState(false);
  const [doc, setDoc] = useState<PlatformDoc | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  // editable free-text fields
  const [pagesProject, setPagesProject] = useState(row.pages_project ?? "");
  const [cname, setCname] = useState(row.www_cname_target ?? "");
  const [repo, setRepo] = useState(row.repo ?? "");
  const [savingFields, setSavingFields] = useState(false);

  useEffect(() => {
    setPagesProject(row.pages_project ?? "");
    setCname(row.www_cname_target ?? "");
    setRepo(row.repo ?? "");
  }, [row.club_id]); // reset when a different club is opened

  useEffect(() => {
    if (showSop && !doc) getPlatformDoc("migrate-vercel-to-cloudflare").then(setDoc);
  }, [showSop, doc]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 1800);
  };

  const toggleStep = async (key: StepKey, done: boolean) => {
    setBusyStep(key);
    patchRow(row.club_id, { steps: { ...row.steps, [key]: done } }); // optimistic
    const error = await setStep(row.club_id, key, done);
    setBusyStep(null);
    if (error) {
      await reload();
      flash(error);
    }
  };

  const changeStatus = async (status: MigrationStatus) => {
    if (status === "complete" && !row.email_untouched_confirmed) {
      flash("Confirm email untouched before completing.");
      return;
    }
    patchRow(row.club_id, { status }); // optimistic
    const error = await setStatus(row.club_id, status);
    if (error) {
      await reload();
      flash(error);
    } else {
      await reload(); // pick up auto-stamped started_at / completed_at
    }
  };

  const toggleEmail = async (val: boolean) => {
    patchRow(row.club_id, { email_untouched_confirmed: val });
    const error = await updateMigrationFields(row.club_id, { email_untouched_confirmed: val });
    if (error) {
      await reload();
      flash(error);
    }
  };

  const runVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    const r = await verifyMigration(row.club_id);
    setVerifying(false);
    setVerifyResult(r);
    if (r.live_verified_set) await reload(); // picks up the ticked live_verified step
  };

  const saveFields = async () => {
    setSavingFields(true);
    const error = await updateMigrationFields(row.club_id, {
      pages_project: pagesProject.trim() || null,
      www_cname_target: cname.trim() || null,
      repo: repo.trim() || null,
    });
    setSavingFields(false);
    if (error) {
      flash(error);
      return;
    }
    patchRow(row.club_id, {
      pages_project: pagesProject.trim() || null,
      www_cname_target: cname.trim() || null,
      repo: repo.trim() || null,
    });
    flash("Saved");
  };

  const steps = stepsForFlow(row.flow);
  const prog = stepProgress(row.steps, row.flow);
  const canComplete = row.email_untouched_confirmed;

  return (
    <div className="sw1-mig-drawer">
      <div className="sw1-mig-drawerhd">
        <div>
          <h3>{row.club_name}</h3>
          <span className="sw1-mig-mono">{row.domain}</span>
        </div>
        <button type="button" className="sw1-sop-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>

      {msg && <div className="sw1-mig-flash">{msg}</div>}

      {/* Status selector */}
      <div className="sw1-mig-drawersec">
        <label className="sw-admin-field">
          <span>Status</span>
          <select value={row.status} onChange={(e) => changeStatus(e.target.value as MigrationStatus)}>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s} disabled={s === "complete" && !canComplete}>
                {STATUS_LABEL[s]}
                {s === "complete" && !canComplete ? " (confirm email first)" : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="sw1-mig-prog">
          <div className="sw1-sop-bar">
            <i style={{ width: `${prog.total ? Math.round((100 * prog.done) / prog.total) : 0}%` }} />
          </div>
          <span className="sw1-sop-pct">
            {prog.done}/{prog.total}
          </span>
        </div>
      </div>

      {/* Email safety gate */}
      <label className={`sw1-mig-gate${row.email_untouched_confirmed ? " is-on" : ""}`}>
        <input
          type="checkbox"
          checked={row.email_untouched_confirmed}
          onChange={(e) => toggleEmail(e.target.checked)}
        />
        <span>
          <strong>Email untouched confirmed</strong> — MX / SPF / DKIM / _dmarc were left alone.
          Required before a migration can be marked complete.
        </span>
      </label>

      {/* Checklist */}
      <div className="sw1-mig-drawersec">
        <h4 className="sw1-mig-subh">Checklist</h4>
        <div className="sw1-sop-checklist">
          {steps.map((s, i) => {
            const done = !!row.steps?.[s.key];
            return (
              <label key={s.key} className={`sw1-sop-ck${done ? " is-on" : ""}`}>
                <input
                  type="checkbox"
                  checked={done}
                  disabled={busyStep === s.key}
                  onChange={(e) => toggleStep(s.key, e.target.checked)}
                />
                <span className="sw1-sop-cknum">{i + 1}</span>
                <span className="sw1-sop-cklbl">{s.label}</span>
              </label>
            );
          })}
        </div>
        <div className="sw1-mig-verify">
          <button type="button" className="sw-btn sw-btn--ghost" disabled={verifying} onClick={runVerify}>
            {verifying ? "Checking live site…" : "Verify live now"}
          </button>
          <span className="sw1-mig-verifyhint">
            Checks www is on Cloudflare over HTTPS and the bare domain redirects to www; ticks
            “Verify live” automatically when both pass.
          </span>
          {verifyResult && (
            <div className={`sw1-mig-verifyres ${verifyResult.verified ? "is-ok" : "is-no"}`}>
              {verifyResult.error ? (
                <strong>Couldn’t run the check: {verifyResult.error}</strong>
              ) : (
                <>
                  <strong>
                    {verifyResult.verified
                      ? verifyResult.live_verified_set
                        ? "✓ Live and verified — step ticked."
                        : "✓ Live and verified."
                      : "Not fully live yet."}
                  </strong>
                  <ul>
                    <li>{verifyResult.checks?.www.ok ? "✓" : "✗"} {verifyResult.checks?.www.hint}</li>
                    <li>{verifyResult.checks?.root_redirect.ok ? "✓" : "✗"} {verifyResult.checks?.root_redirect.hint}</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Free-text fields */}
      <div className="sw1-mig-drawersec">
        <h4 className="sw1-mig-subh">Details</h4>
        <div className="sw1-mig-fields">
          <label className="sw-admin-field">
            <span>Pages project</span>
            <input value={pagesProject} placeholder="the-club" onChange={(e) => setPagesProject(e.target.value)} />
          </label>
          <label className="sw-admin-field">
            <span>www CNAME target</span>
            <input value={cname} placeholder="the-club.pages.dev" onChange={(e) => setCname(e.target.value)} />
          </label>
          <label className="sw-admin-field">
            <span>Repo</span>
            <input value={repo} placeholder="SportsWeb-Australia/the-club" onChange={(e) => setRepo(e.target.value)} />
          </label>
        </div>
        <button type="button" className="sw-btn sw-btn--ghost" disabled={savingFields} onClick={saveFields}>
          {savingFields ? "Saving…" : "Save details"}
        </button>
      </div>

      {/* SOP reference */}
      <div className="sw1-mig-drawersec">
        <button type="button" className="sw-btn sw-btn--ghost" onClick={() => setShowSop((v) => !v)}>
          {showSop ? "Hide migration SOP" : "View migration SOP"}
        </button>
        {showSop && doc && (
          <div style={{ marginTop: 12 }}>
            <SopViewer doc={doc} migration={row} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small presentational bits ────────────────────────────────────────────────

function ProgressPill({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="sw1-mig-pill">
      <div className="sw1-mig-pilltop">
        <span className="sw1-mig-pilllbl">{label}</span>
        <span className="sw1-mig-pillval">{value}</span>
      </div>
      <div className="sw1-sop-bar">
        <i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <span className="sw1-mig-pillpct">{pct}% complete</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="sw1-mig-mini">
      <span className="sw1-mig-minival">{value}</span>
      <span className="sw1-mig-minilbl">{label}</span>
    </div>
  );
}
