import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// SitePulse super-admin inbox: read + triage captured website feedback.
// Reads sitepulse_feedback via the app's supabase client; RLS scopes rows
// (platform admin: all clubs; club admin: own club). Status changes persist
// through the fb_update policy. Keys off club_id. No new tables/notifications.

// Element picker (v1 capture-only). Held in element_meta jsonb; all optional.
// element_selector / element_confidence exist in the schema but are v2 (always
// null in v1), so the inbox does not read or show them.
type ElementMeta = {
  src?: string;
  href?: string;
  heading?: string;
  rect?: { x: number; y: number; w: number; h: number };
  page?: { w: number; h: number };
  scroll?: { x: number; y: number };
  fixed?: boolean;
};

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
  element_tag: string | null;
  element_label: string | null;
  element_meta: ElementMeta | null;
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
  "submitted_by_name,submitted_by_email,device_type,browser,os,viewport," +
  "element_tag,element_label,element_meta,status,priority,created_at,clubs(name)";

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

type Comment = { id: string; author_type: string; body: string; visibility: string; created_at: string };

// Internal notes on a feedback row. cm_select/cm_insert RLS: platform admins see
// and add all; internal notes are never shown to the person who submitted feedback.
function Comments({ feedbackId, clubId }: { feedbackId: string; clubId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supabase) { setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase
        .from("sitepulse_comments")
        .select("id,author_type,body,visibility,created_at")
        .eq("feedback_id", feedbackId)
        .order("created_at", { ascending: false });
      if (alive) { setComments((data as Comment[]) ?? []); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [feedbackId]);

  const add = async () => {
    if (!supabase) return;
    const body = note.trim();
    if (!body) return;
    setSaving(true); setErr(null);
    const { data, error } = await supabase
      .from("sitepulse_comments")
      .insert({ feedback_id: feedbackId, club_id: clubId, author_type: "team", visibility: "internal", body })
      .select("id,author_type,body,visibility,created_at")
      .single();
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setComments((c) => [data as Comment, ...c]);
    setNote("");
  };

  const fmt = (d: string) => {
    try { return new Date(d).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  return (
    <div style={{ marginTop: 12, borderTop: "1px solid #e4e4e7", paddingTop: 10 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "#2563eb", marginBottom: 6 }}>Internal notes</div>
      {loading ? (
        <div className="sw-muted" style={{ fontSize: 12.5 }}>Loading notes...</div>
      ) : comments.length === 0 ? (
        <div className="sw-muted" style={{ fontSize: 12.5, marginBottom: 6 }}>No internal notes yet.</div>
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 8px", padding: 0 }}>
          {comments.map((c) => (
            <li key={c.id} style={{ fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ whiteSpace: "pre-wrap" }}>{c.body}</span>
              <span style={{ color: "#8a94a6", marginLeft: 8 }}>
                {c.visibility === "internal" ? "internal" : "client-visible"} &middot; {fmt(c.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add an internal note (not shown to the person who reported it)..."
          rows={2}
          style={{ flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #d7dbe3", resize: "vertical" }}
        />
        <button className="sw-btn sw-btn--ghost" disabled={saving || !note.trim()} onClick={add}>
          {saving ? "Adding..." : "Add note"}
        </button>
      </div>
      {err && <div className="sw1-onboard-err" style={{ marginTop: 4 }}>{err}</div>}
    </div>
  );
}

// ---- Element picker display (Phase D) --------------------------------------
const TAG_LABEL: Record<string, string> = {
  img: "image", picture: "image", svg: "image", canvas: "image",
  video: "video", a: "link", iframe: "embed", button: "button",
};
function friendlyTag(t?: string | null) {
  return (t && (TAG_LABEL[t] || t)) || "element";
}

function ElIcon({ tag }: { tag?: string | null }) {
  const t = tag || "";
  const common = { width: 15, height: 15, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (["img", "picture", "svg", "video", "source", "canvas"].includes(t)) {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" />
        <path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (t === "a") {
    return (
      <svg {...common}>
        <path d="M10 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-6-.5l-2 2A4 4 0 0 0 11.7 17l1-1"
          fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function rowHasElement(r: Row) {
  const m = r.element_meta || {};
  return !!(r.element_tag || r.element_label || m.src || m.href || m.heading);
}

// A short, exact-ish snippet for Scroll-To-Text-Fragment (#:~:text=). Prefer the
// element's own text label; fall back to its nearest heading. Skip filename-ish
// labels (an img's src) since those won't appear as page text.
function elementSnippet(r: Row): string | null {
  const m = r.element_meta || {};
  const label = (r.element_label || "").trim();
  const texty = label && label !== r.element_tag && !/^\S+\.\w{2,5}$/.test(label);
  const base = (texty ? label : (m.heading || "")).trim();
  if (!base) return null;
  return base.split(/\s+/).slice(0, 8).join(" ").slice(0, 60);
}

// Open the reported page and, where the browser supports it, jump straight to
// the element via a text fragment. Falls back to opening the page at the top.
function openTarget(r: Row) {
  if (!r.page_url) return;
  let url = r.page_url;
  const snip = elementSnippet(r);
  if (snip) {
    const frag = ":~:text=" + encodeURIComponent(snip);
    url += url.includes("#") ? frag : "#" + frag;
  }
  window.open(url, "_blank", "noopener");
}

function positionPct(m: ElementMeta): number | null {
  if (m.rect && m.page && m.page.h > 0) {
    return Math.max(0, Math.min(100, Math.round((m.rect.y / m.page.h) * 100)));
  }
  return null;
}

function ElementInfo({ r }: { r: Row }) {
  if (!rowHasElement(r)) return null;
  const m = r.element_meta || {};
  const primary = r.element_label || m.src || friendlyTag(r.element_tag);
  const pct = positionPct(m);
  const canJump = !!elementSnippet(r);
  return (
    <div style={{ margin: "0 0 10px", padding: "8px 10px", background: "#eef2ff", border: "1px solid #dbe1fb", borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ display: "flex", color: "#4f46e5", flex: "0 0 auto" }}><ElIcon tag={r.element_tag} /></span>
        <strong style={{ color: "#3730a3", textTransform: "capitalize" }}>{friendlyTag(r.element_tag)}</strong>
        <span style={{ color: "#667085", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>· {primary}</span>
        {m.fixed && <span className="sw-dev-pill" style={{ background: "#e0e7ff", color: "#4338ca" }}>fixed / sticky</span>}
      </div>
      <div style={{ fontSize: 12, color: "#667085", marginTop: 3, display: "flex", flexWrap: "wrap", gap: "1px 12px" }}>
        {m.src && <span>file: {m.src}</span>}
        {m.href && <span>link: {m.href}</span>}
        {m.heading && <span>near heading: "{m.heading}"</span>}
        {pct != null && <span>~{pct}% down the page</span>}
      </div>
      {r.page_url && (
        <button
          onClick={(e) => { e.stopPropagation(); openTarget(r); }}
          className="sw-btn sw-btn--ghost"
          style={{ marginTop: 7, fontSize: 12, padding: "3px 10px" }}
          title={canJump ? "Opens the page and jumps to the element" : "Opens the page (no text anchor to jump to)"}
        >
          Open page {canJump ? "→ jump to element" : ""} ↗
        </button>
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
        <td style={{ maxWidth: 360 }}>
          {rowHasElement(r) && (
            <span title="A page element is attached" style={{ display: "inline-flex", verticalAlign: "middle", color: "#4f46e5", marginRight: 6 }}>
              <ElIcon tag={r.element_tag} />
            </span>
          )}
          {r.description.length > 90 ? r.description.slice(0, 90) + "..." : r.description}
        </td>
        <td style={{ whiteSpace: "nowrap", fontSize: 12.5, color: "#667085" }}>{fmt(r.created_at)}</td>
        <td>{statusSelect}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ background: "#fbfbfc" }}>
            <div style={{ padding: "0.6rem 0.4rem", fontSize: 13, lineHeight: 1.6 }}>
              <ElementInfo r={r} />
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
              <Comments feedbackId={r.id} clubId={r.club_id} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
