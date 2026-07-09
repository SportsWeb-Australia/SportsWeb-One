import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// SitePulse super-admin inbox: read + triage captured website feedback.
// Reads sitepulse_feedback via the app's supabase client; RLS scopes rows
// (platform admin: all clubs; club admin: own club). Status changes persist
// through the fb_update policy. Keys off club_id. No new tables/notifications.

type Row = {
  id: string;
  club_id: string;
  source: string;
  page_url: string | null;
  category: string;
  description: string;
  urgency_flag: boolean;
  contact_requested: boolean;
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  viewport: string | null;
  status: string;
  priority: string;
  created_at: string;
  clubs?: { name: string | null } | null;
};

const CATEGORIES: Record<string, string> = {
  spelling: "Spelling / wording", broken_link: "Broken link", incorrect_info: "Incorrect info",
  missing_info: "Missing info", image_logo: "Image / logo", mobile_display: "Mobile display",
  desktop_display: "Desktop display", sports_data: "Fixture / result / ladder", sponsor: "Sponsor",
  event_ticketing: "Event / ticketing", store: "Store", accessibility: "Accessibility",
  improvement: "Improvement", bug: "Bug", other: "Other",
};
const STATUSES = [
  "new", "needs_review", "accepted", "in_progress",
  "waiting_on_club", "waiting_on_sportsweb", "resolved", "rejected", "archived",
];
const STATUS_LABEL: Record<string, string> = {
  new: "New", needs_review: "Needs review", accepted: "Accepted", in_progress: "In progress",
  waiting_on_club: "Waiting on club", waiting_on_sportsweb: "Waiting on SportsWeb",
  resolved: "Resolved", rejected: "Rejected", archived: "Archived",
};

const SELECT_COLS =
  "id,club_id,source,page_url,category,description,urgency_flag,contact_requested," +
  "submitted_by_name,submitted_by_email,device_type,browser,os,viewport,status,priority,created_at,clubs(name)";

export function SuperSitePulse() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const [fClub, setFClub] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }
    setLoading(true); setError(null);
    const { data, error: err } = await supabase
      .from("sitepulse_feedback")
      .select(SELECT_COLS)
      .order("created_at", { ascending: false })
      .limit(300);
    if (err) { setError(err.message); setRows([]); }
    else setRows((data as unknown as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clubName = (r: Row) => r.clubs?.name ?? r.club_id.slice(0, 8);

  const clubOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) m.set(r.club_id, clubName(r));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => rows.filter((r) =>
    (!fClub || r.club_id === fClub) &&
    (!fStatus || r.status === fStatus) &&
    (!fCategory || r.category === fCategory) &&
    (!q || r.description.toLowerCase().includes(q))
  ), [rows, fClub, fStatus, fCategory, q]);

  const setStatus = async (r: Row, status: string) => {
    if (!supabase || status === r.status) return;
    setSaving(r.id); setError(null);
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error: err } = await supabase.from("sitepulse_feedback").update(patch).eq("id", r.id);
    setSaving(null);
    if (err) { setError(err.message); return; }
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
  };

  const fmt = (d: string) => {
    try { return new Date(d).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  return (
    <div className="sw-admin-page">
      <header className="sw-admin-head">
        <div>
          <h1>SitePulse</h1>
          <p>Website feedback and issue reports from club sites. Read, filter and triage.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="sw-btn sw-btn--ghost" onClick={load}>Refresh</button>
        </div>
      </header>

      {error && <div className="sw-comms-result err">{error}</div>}

      {/* Filters */}
      {!loading && rows.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", margin: "0 0 1rem" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search descriptions..."
            style={{ flex: "1 1 220px", minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }} />
          <select value={fClub} onChange={(e) => setFClub(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}>
            <option value="">All clubs</option>
            {clubOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select value={fCategory} onChange={(e) => setFCategory(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}>
            <option value="">All categories</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <span style={{ fontSize: 12.5, color: "#8a94a6", marginLeft: "auto" }}>
            {filtered.length} of {rows.length}
          </span>
        </div>
      )}

      {loading ? (
        <p className="sw-muted">Loading feedback...</p>
      ) : rows.length === 0 ? (
        <p className="sw-muted">No feedback yet.</p>
      ) : filtered.length === 0 ? (
        <p className="sw-muted">No feedback matches these filters.</p>
      ) : (
        <div className="sw-super-table-wrap">
          <table className="sw-admin-table">
            <thead>
              <tr><th>Club</th><th>Category</th><th>Summary</th><th>When</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <FeedbackRow
                  key={r.id} r={r} open={openId === r.id}
                  onToggle={() => setOpenId((id) => (id === r.id ? null : r.id))}
                  onStatus={(s) => setStatus(r, s)} saving={saving === r.id}
                  clubName={clubName(r)} fmt={fmt}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FeedbackRow({
  r, open, onToggle, onStatus, saving, clubName, fmt,
}: {
  r: Row; open: boolean; onToggle: () => void; onStatus: (s: string) => void;
  saving: boolean; clubName: string; fmt: (d: string) => string;
}) {
  const statusSelect = (
    <select
      value={r.status}
      disabled={saving}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onStatus(e.target.value)}
      style={{ fontSize: 12.5, padding: "4px 6px", borderRadius: 6 }}
    >
      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
    </select>
  );
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: "pointer" }}>
        <td>
          <strong>{clubName}</strong>
          {r.urgency_flag && <span className="sw-dev-pill" style={{ background: "#fee2e2", color: "#b91c1c", marginLeft: 6 }}>Urgent</span>}
        </td>
        <td>{CATEGORIES[r.category] ?? r.category}</td>
        <td style={{ maxWidth: 360 }}>{r.description.length > 90 ? r.description.slice(0, 90) + "..." : r.description}</td>
        <td style={{ whiteSpace: "nowrap", fontSize: 12.5, color: "#667085" }}>{fmt(r.created_at)}</td>
        <td>{statusSelect}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ background: "#fbfbfc" }}>
            <div style={{ padding: "0.6rem 0.4rem", fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{r.description}</div>
              {r.page_url && (
                <div><b>Page:</b> <a href={r.page_url} target="_blank" rel="noreferrer">{r.page_url}</a></div>
              )}
              <div><b>Source:</b> {r.source} &middot; <b>Category:</b> {CATEGORIES[r.category] ?? r.category} &middot; <b>Priority:</b> {r.priority}</div>
              {r.contact_requested && (
                <div><b>Reply requested:</b> {r.submitted_by_name || "(no name)"}{r.submitted_by_email ? ` <${r.submitted_by_email}>` : ""}</div>
              )}
              <div style={{ color: "#667085" }}>
                {[r.device_type, r.browser, r.os, r.viewport].filter(Boolean).join(" &middot; ").replace(/&middot;/g, "·")}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
