import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// In-admin SitePulse surface for a CLUB admin: raise an issue + track their own.
// Writes are a direct authed insert (fb_insert allows an authenticated club admin
// to insert for their own club_id). Status is read-only here -- triage lives in the
// operator inbox (SuperSitePulse). Never surfaces sitepulse_comments (operator-internal).

const CATEGORIES: [string, string][] = [
  ["spelling", "Spelling or wording"], ["broken_link", "Broken link"], ["incorrect_info", "Incorrect information"],
  ["missing_info", "Missing information"], ["image_logo", "Image or logo issue"], ["mobile_display", "Looks wrong on mobile"],
  ["desktop_display", "Looks wrong on desktop"], ["sports_data", "Fixture / result / ladder issue"], ["sponsor", "Sponsor or advertiser"],
  ["event_ticketing", "Event or ticketing"], ["store", "Online store"], ["accessibility", "Accessibility"],
  ["improvement", "Improvement idea"], ["bug", "Something is broken"], ["other", "Other"],
];
const catLabel = (c: string) => CATEGORIES.find((x) => x[0] === c)?.[1] ?? c;

// Club-facing status labels (triage stays in the operator inbox; read-only here).
const CLUB_STATUS: Record<string, string> = {
  new: "Submitted", needs_review: "Submitted", accepted: "Under review", in_progress: "In progress",
  waiting_on_club: "Action needed from you", waiting_on_sportsweb: "In progress",
  resolved: "Completed", rejected: "Not proceeding", archived: "Archived",
};

function deviceType() { const w = window.innerWidth; return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop"; }
function browserName() {
  const u = navigator.userAgent;
  if (/Edg\//.test(u)) return "Edge"; if (/OPR\//.test(u)) return "Opera"; if (/Chrome\//.test(u)) return "Chrome";
  if (/Safari\//.test(u) && !/Chrome/.test(u)) return "Safari"; if (/Firefox\//.test(u)) return "Firefox"; return "Unknown";
}
function osName() {
  const u = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(u)) return "iOS"; if (/Android/.test(u)) return "Android"; if (/Mac OS X/.test(u)) return "macOS";
  if (/Windows/.test(u)) return "Windows"; if (/Linux/.test(u)) return "Linux"; return "Unknown";
}

type Row = { id: string; category: string; description: string; urgency_flag: boolean; created_at: string; status: string };

export function AdminFeedback({ clubId }: { clubId: string }) {
  const [view, setView] = useState<"report" | "mine">("report");
  return (
    <div className="sw-admin-page">
      <header className="sw-admin-head">
        <div>
          <h1>Feedback</h1>
          <p>Report an issue with your website, or track what you've reported.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className={`sw-btn${view === "report" ? "" : " sw-btn--ghost"}`} onClick={() => setView("report")}>Report an issue</button>
          <button className={`sw-btn${view === "mine" ? "" : " sw-btn--ghost"}`} onClick={() => setView("mine")}>My issues</button>
        </div>
      </header>
      {view === "report" ? <ReportForm clubId={clubId} onDone={() => setView("mine")} /> : <MyIssues clubId={clubId} />}
    </div>
  );
}

function ReportForm({ clubId, onDone }: { clubId: string; onDone: () => void }) {
  const [category, setCategory] = useState("bug");
  const [description, setDescription] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [page, setPage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null);

  const submit = async () => {
    if (!supabase) return;
    const desc = description.trim();
    if (!desc) { setErr("Please describe the issue."); return; }
    setBusy(true); setErr(null);
    const { data, error } = await supabase.from("sitepulse_feedback").insert({
      club_id: clubId,
      source: "report",
      category,
      description: desc,
      urgency_flag: urgent,
      contact_requested: false,
      user_type: "club_admin",        // tags it admin-raised vs public widget (no new column)
      page_url: page.trim() || null,
      device_type: deviceType(),
      browser: browserName(),
      os: osName(),
      viewport: window.innerWidth + "x" + window.innerHeight,
    }).select("id").single();
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setRef(String(data.id).slice(0, 8));
    setDescription(""); setUrgent(false); setPage(""); setCategory("bug");
  };

  if (ref) {
    return (
      <div className="sw-super-create" style={{ maxWidth: 560 }}>
        <h3>Thanks — we've logged it.</h3>
        <p className="sw-comms-note">Your issue is with the SportsWeb One team. Reference: {ref}. Track its status under <b>My issues</b>.</p>
        <div className="sw-comms-actions">
          <button className="sw-btn" onClick={() => { setRef(null); onDone(); }}>View my issues</button>
          <button className="sw-btn sw-btn--ghost" onClick={() => setRef(null)}>Report another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sw-super-create" style={{ maxWidth: 560 }}>
      <label className="sw-admin-field">
        <span>What's it about?</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </label>
      <label className="sw-admin-field">
        <span>What did you notice?</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue…" />
      </label>
      <label className="sw-admin-field">
        <span>Page this relates to (optional)</span>
        <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="e.g. Home, Fixtures, or a link" />
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 0", fontSize: 13, fontWeight: 500 }}>
        <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} style={{ width: 16, height: 16 }} />
        This is urgent
      </label>
      {err && <div className="sw-comms-result err" style={{ marginTop: 10 }}>{err}</div>}
      <div className="sw-comms-actions">
        <button className="sw-btn" disabled={busy} onClick={submit}>{busy ? "Sending…" : "Submit issue"}</button>
      </div>
    </div>
  );
}

function MyIssues({ clubId }: { clubId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [fStatus, setFStatus] = useState("");

  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true); setErr(null);
    const { data, error } = await supabase
      .from("sitepulse_feedback")
      .select("id,category,description,urgency_flag,created_at,status")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) { setErr(error.message); setRows([]); } else setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [clubId]);

  const filtered = useMemo(() => rows.filter((r) => !fStatus || r.status === fStatus), [rows, fStatus]);
  const fmt = (d: string) => { try { return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };
  const badge = (s: string) => (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#eef2f7", color: "#0d1f3c", whiteSpace: "nowrap" }}>
      {CLUB_STATUS[s] ?? s}
    </span>
  );

  return (
    <div>
      {err && <div className="sw-comms-result err">{err}</div>}
      {!loading && rows.length > 0 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "0 0 1rem" }}>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}>
            <option value="">All statuses</option>
            {[...new Set(rows.map((r) => r.status))].map((s) => <option key={s} value={s}>{CLUB_STATUS[s] ?? s}</option>)}
          </select>
          <span style={{ fontSize: 12.5, color: "#8a94a6", marginLeft: "auto" }}>{filtered.length} of {rows.length}</span>
        </div>
      )}
      {loading ? (
        <p className="sw-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="sw-muted">You haven't reported anything yet. Use “Report an issue” to raise one.</p>
      ) : filtered.length === 0 ? (
        <p className="sw-muted">No issues match that status.</p>
      ) : (
        <div className="sw-super-table-wrap">
          <table className="sw-admin-table">
            <thead><tr><th>About</th><th>Issue</th><th>Reported</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    {catLabel(r.category)}
                    {r.urgency_flag && <span className="sw-dev-pill" style={{ background: "#fee2e2", color: "#b91c1c", marginLeft: 6 }}>Urgent</span>}
                  </td>
                  <td style={{ maxWidth: 420 }}>{r.description.length > 120 ? r.description.slice(0, 120) + "…" : r.description}</td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 12.5, color: "#667085" }}>{fmt(r.created_at)}</td>
                  <td>{badge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
