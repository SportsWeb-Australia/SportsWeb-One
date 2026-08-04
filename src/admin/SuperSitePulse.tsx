import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

// SitePulse super-admin inbox: read + triage captured website feedback.
// Reads sitepulse_feedback via the app's supabase client; RLS scopes rows
// (platform admin: all clubs; club admin: own club). Status changes persist
// through the fb_update policy. Feedback is grouped into collapsible per-club
// sections (collapsed by default). Client-visible replies surface on the club's
// public status page (sitepulse_public_status RPC).

type ElementMeta = {
  src?: string; href?: string; heading?: string;
  rect?: { x: number; y: number; w: number; h: number };
  page?: { w: number; h: number };
  scroll?: { x: number; y: number };
  fixed?: boolean;
  is_text?: boolean;
  selected_text?: string;
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
  waiting_on_club: "Waiting on club", waiting_on_sportsweb: "Waiting on us",
  resolved: "Resolved", rejected: "Rejected", archived: "Archived",
};
const STATUS_STYLE: Record<string, { color: string; bg: string; bd: string }> = {
  new: { color: "#1d4ed8", bg: "#eff4ff", bd: "#c7dafe" },
  needs_review: { color: "#7c3aed", bg: "#f4effe", bd: "#e2d5fb" },
  accepted: { color: "#0369a1", bg: "#eff8ff", bd: "#cbe6fb" },
  in_progress: { color: "#b45309", bg: "#fdf4e7", bd: "#f5e2c2" },
  waiting_on_club: { color: "#4f46e5", bg: "#eef0fe", bd: "#d7dbfb" },
  waiting_on_sportsweb: { color: "#0f766e", bg: "#effcf9", bd: "#c5ede6" },
  resolved: { color: "#15803d", bg: "#e9f6ee", bd: "#c6e8d2" },
  rejected: { color: "#b91c1c", bg: "#fdecec", bd: "#f4cccc" },
  archived: { color: "#64748b", bg: "#f1f5f9", bd: "#dbe2ea" },
};
const CLOSED = ["resolved", "rejected", "archived"];

// palette
const INK = "#14181f", MUTED = "#667085", FAINT = "#8a94a6", LINE = "#e6e8ee",
  LINE2 = "#eef0f4", SURFACE = "#ffffff", SURFACE2 = "#f7f8fa", INDIGO = "#4f46e5";
const titleCase = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const SELECT_COLS =
  "id,club_id,source,page_url,category,description,urgency_flag,contact_requested," +
  "submitted_by_name,submitted_by_email,device_type,browser,os,viewport," +
  "element_tag,element_label,element_meta,status,priority,created_at,clubs(name)";

const inputStyle: CSSProperties = {
  padding: "8px 11px", borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 14,
  background: SURFACE, color: INK,
};

export function SuperSitePulse() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [fClub, setFClub] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "newest" | "oldest">("priority");
  const [pendingByClub, setPendingByClub] = useState<Map<string, number>>(new Map());
  const [sendingClub, setSendingClub] = useState<string | null>(null);
  const [sendMsg, setSendMsg] = useState<string | null>(null);

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
    // Pending client replies per club (drives the "Send update (N)" button).
    const { data: pend } = await supabase
      .from("sitepulse_comments").select("club_id")
      .eq("visibility", "client_visible").eq("author_type", "team").is("emailed_at", null);
    const m = new Map<string, number>();
    for (const c of (pend ?? []) as { club_id: string }[]) m.set(c.club_id, (m.get(c.club_id) ?? 0) + 1);
    setPendingByClub(m);
    setLoading(false);
  };

  const sendUpdate = async (cid: string, clubNm: string) => {
    if (!supabase) return;
    setSendingClub(cid); setSendMsg(null);
    const { data, error: err } = await supabase.functions.invoke("sitepulse-send-update", { body: { club_id: cid } });
    setSendingClub(null);
    if (err) { setSendMsg(`Couldn't send to ${clubNm}: ${err.message}`); return; }
    const res = (data ?? {}) as { ok?: boolean; sent?: number; error?: string; result?: { status?: number } };
    if (res.ok && (res.sent ?? 0) > 0) {
      setSendMsg(`Sent ${res.sent} update${res.sent === 1 ? "" : "s"} to ${clubNm}.`);
      setPendingByClub((mp) => { const n = new Map(mp); n.delete(cid); return n; });
    } else if (res.error === "no-recipient") {
      setSendMsg(`No contact email on file for ${clubNm} — add one to send updates.`);
    } else {
      const st = res.result?.status;
      setSendMsg(`Couldn't send to ${clubNm}${st === 429 ? " — email credit exhausted (top up ZeptoMail)" : ""}. Replies stay queued.`);
    }
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

  // Sort within each club section. Default "priority": urgent, then reply-requested,
  // then the rest, then closed — oldest first within each tier so nothing goes stale.
  const sorted = useMemo(() => {
    const rank = (r: Row) =>
      CLOSED.includes(r.status) ? 3 : r.urgency_flag ? 0 : r.contact_requested ? 1 : 2;
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortBy === "newest") return b.created_at.localeCompare(a.created_at);
      if (sortBy === "oldest") return a.created_at.localeCompare(b.created_at);
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      return a.created_at.localeCompare(b.created_at); // oldest first within a tier
    });
    return arr;
  }, [filtered, sortBy]);

  // Group by club → collapsible sections (rows keep the sorted order).
  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of sorted) { const a = m.get(r.club_id) ?? []; a.push(r); m.set(r.club_id, a); }
    return [...m.entries()]
      .map(([cid, rs]) => ({ cid, name: rs[0].clubs?.name ?? cid.slice(0, 8), rows: rs }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sorted]);

  const anyFilter = !!(q || fStatus || fCategory || fClub);
  const toggleClub = (cid: string) =>
    setExpanded((s) => { const n = new Set(s); n.has(cid) ? n.delete(cid) : n.add(cid); return n; });

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
    try { return new Date(d).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  return (
    <div className="sw-admin-page">
      <header className="sw-admin-head">
        <div>
          <h1>SitePulse</h1>
          <p>Website feedback from club sites, grouped by club. Open a club to triage and reply.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="sw-btn sw-btn--ghost" onClick={load}>Refresh</button>
        </div>
      </header>

      {error && <div className="sw-comms-result err">{error}</div>}
      {sendMsg && <div className="sw-comms-result">{sendMsg}</div>}

      {!loading && rows.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", margin: "0 0 1rem" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search descriptions…"
            style={{ ...inputStyle, flex: "1 1 220px", minWidth: 180 }} />
          <select value={fClub} onChange={(e) => setFClub(e.target.value)} style={inputStyle}>
            <option value="">All clubs</option>
            {clubOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={inputStyle}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select value={fCategory} onChange={(e) => setFCategory(e.target.value)} style={inputStyle}>
            <option value="">All categories</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={inputStyle} title="Sort order">
            <option value="priority">Priority — urgent &amp; replies first</option>
            <option value="oldest">Oldest first</option>
            <option value="newest">Newest first</option>
          </select>
          <span style={{ fontSize: 12.5, color: FAINT, marginLeft: "auto" }}>
            {filtered.length} of {rows.length}
          </span>
        </div>
      )}

      {loading ? (
        <p className="sw-muted">Loading feedback…</p>
      ) : rows.length === 0 ? (
        <p className="sw-muted">No feedback yet.</p>
      ) : filtered.length === 0 ? (
        <p className="sw-muted">No feedback matches these filters.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {groups.map((g) => (
            <ClubSection
              key={g.cid} name={g.name} rows={g.rows}
              open={expanded.has(g.cid) || anyFilter}
              onToggle={() => toggleClub(g.cid)}
              openId={openId} setOpenId={setOpenId}
              onStatus={setStatus} saving={saving} fmt={fmt}
              pending={pendingByClub.get(g.cid) ?? 0}
              onSend={() => sendUpdate(g.cid, g.name)}
              sending={sendingClub === g.cid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ color, bg, children }: { color: string; bg: string; children: ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// One-click copy (for pasting the client's exact text into the fix).
function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="sw-btn sw-btn--ghost"
      style={{ fontSize: 12, padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: 6 }}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1400); });
      }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" strokeLinecap="round" />
      </svg>
      {done ? "Copied ✓" : label}
    </button>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
      style={{ flex: "0 0 auto", transition: "transform .18s ease", transform: open ? "rotate(90deg)" : "none", color: FAINT }}>
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClubSection({
  name, rows, open, onToggle, openId, setOpenId, onStatus, saving, fmt, pending, onSend, sending,
}: {
  name: string; rows: Row[]; open: boolean; onToggle: () => void;
  openId: string | null; setOpenId: (fn: (id: string | null) => string | null) => void;
  onStatus: (r: Row, s: string) => void; saving: string | null; fmt: (d: string) => string;
  pending: number; onSend: () => void; sending: boolean;
}) {
  const total = rows.length;
  const openCount = rows.filter((r) => !CLOSED.includes(r.status)).length;
  const urgent = rows.filter((r) => r.urgency_flag && !CLOSED.includes(r.status)).length;
  return (
    <section style={{ border: `1px solid ${LINE}`, borderRadius: 14, background: SURFACE, overflow: "hidden", boxShadow: "0 1px 2px rgba(20,24,31,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px",
        background: open ? SURFACE2 : SURFACE, borderBottom: open ? `1px solid ${LINE}` : "0" }}>
        <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, cursor: "pointer" }}>
          <Chevron open={open} />
          <strong style={{ fontSize: 15, color: INK }}>{name}</strong>
          <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {urgent > 0 && <Pill color="#b91c1c" bg="#fdecec">{urgent} urgent</Pill>}
            <Pill color={openCount ? "#1d4ed8" : "#15803d"} bg={openCount ? "#eff4ff" : "#e9f6ee"}>
              {openCount ? `${openCount} open` : "all done"}
            </Pill>
            <span style={{ color: FAINT, fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{total} total</span>
          </span>
        </div>
        {pending > 0 && (
          <button type="button" className="sw-btn" disabled={sending}
            onClick={(e) => { e.stopPropagation(); onSend(); }}
            style={{ fontSize: 12.5, padding: "5px 11px", whiteSpace: "nowrap", flex: "0 0 auto" }}
            title="Email all queued replies to this club as one update">
            {sending ? "Sending…" : `Send update (${pending})`}
          </button>
        )}
      </div>
      {open && (
        <div style={{ padding: "8px 10px 12px", display: "grid", gap: 8 }}>
          {rows.map((r) => (
            <ItemCard key={r.id} r={r} open={openId === r.id}
              onToggle={() => setOpenId((id) => (id === r.id ? null : r.id))}
              onStatus={(s) => onStatus(r, s)} saving={saving === r.id} fmt={fmt} />
          ))}
        </div>
      )}
    </section>
  );
}

function StatusControl({ value, onChange, saving }: { value: string; onChange: (s: string) => void; saving: boolean }) {
  const s = STATUS_STYLE[value] ?? STATUS_STYLE.new;
  return (
    <select value={value} disabled={saving} onClick={(e) => e.stopPropagation()} onChange={(e) => onChange(e.target.value)}
      style={{ fontSize: 12.5, fontWeight: 600, padding: "5px 9px", borderRadius: 8,
        border: `1px solid ${s.bd}`, background: s.bg, color: s.color, cursor: "pointer" }}>
      {STATUSES.map((st) => <option key={st} value={st} style={{ background: "#fff", color: INK }}>{STATUS_LABEL[st]}</option>)}
    </select>
  );
}

function ItemCard({
  r, open, onToggle, onStatus, saving, fmt,
}: {
  r: Row; open: boolean; onToggle: () => void; onStatus: (s: string) => void; saving: boolean; fmt: (d: string) => string;
}) {
  const desc = r.description.length > 150 && !open ? r.description.slice(0, 150) + "…" : r.description;
  return (
    <div style={{ border: `1px solid ${LINE2}`, borderRadius: 11, background: open ? SURFACE2 : SURFACE, overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 13px", cursor: "pointer" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", color: MUTED, background: SURFACE2, border: `1px solid ${LINE}`, borderRadius: 6, padding: "2px 7px" }}>
              {CATEGORIES[r.category] ?? r.category}
            </span>
            {r.urgency_flag && <Pill color="#b91c1c" bg="#fdecec">Urgent</Pill>}
            {rowHasElement(r) && (
              <span title="A page element is attached" style={{ display: "inline-flex", color: INDIGO }}>
                <ElIcon tag={r.element_tag} />
              </span>
            )}
            {r.device_type && (
              <span title={[r.device_type, r.browser, r.os, r.viewport].filter(Boolean).join(" · ")}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: MUTED, background: SURFACE2, border: `1px solid ${LINE}`, borderRadius: 6, padding: "2px 7px" }}>
                <DeviceIcon type={r.device_type} />{titleCase(r.device_type)}
              </span>
            )}
            <span style={{ marginLeft: "auto", fontSize: 12, color: FAINT, whiteSpace: "nowrap" }}>{fmt(r.created_at)}</span>
          </div>
          <div style={{ fontSize: 14, color: INK, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{desc}</div>
        </div>
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 9 }}>
          <div onClick={(e) => e.stopPropagation()}>
            <StatusControl value={r.status} onChange={onStatus} saving={saving} />
          </div>
          <Chevron open={open} />
        </div>
      </div>

      {open && (
        <div style={{ padding: "2px 13px 14px", fontSize: 13, lineHeight: 1.6, color: INK }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "2px 0 10px" }}>
            <CopyBtn text={r.description} label="Copy feedback text" />
            {r.element_label && r.element_meta?.is_text && (
              <CopyBtn text={r.element_label} label="Copy highlighted phrase" />
            )}
          </div>
          <ElementInfo r={r} />
          {r.page_url && (
            <div style={{ color: MUTED }}><b>Page:</b>{" "}
              <a href={r.page_url} target="_blank" rel="noreferrer">{r.page_url}</a></div>
          )}
          <div style={{ color: MUTED }}>
            <b>Source:</b> {r.source} · <b>Priority:</b> {r.priority}
          </div>
          {(r.device_type || r.browser) && (
            <div style={{ color: FAINT, fontSize: 12.5, marginTop: 2 }}>
              {[r.device_type, r.browser, r.os, r.viewport].filter(Boolean).join(" · ")}
            </div>
          )}
          {r.contact_requested && (
            <div style={{ marginTop: 4, color: MUTED }}>
              <b>Reply requested:</b> {r.submitted_by_name || "(no name)"}
              {r.submitted_by_email ? ` <${r.submitted_by_email}>` : ""}
            </div>
          )}
          <Comments feedbackId={r.id} clubId={r.club_id} />
        </div>
      )}
    </div>
  );
}

type Comment = { id: string; author_type: string; body: string; visibility: string; created_at: string };

// Notes + client replies on a feedback item. Internal notes stay internal;
// "Reply to client" posts a client_visible comment that shows on the club's
// public status page (sitepulse_public_status RPC reads the latest one).
function Comments({ feedbackId, clubId }: { feedbackId: string; clubId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<"internal" | "client_visible">("internal");
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
      .insert({ feedback_id: feedbackId, club_id: clubId, author_type: "team", visibility, body })
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
  const toClient = visibility === "client_visible";

  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${LINE}`, paddingTop: 10 }}>
      <div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>Notes &amp; replies</div>
      {loading ? (
        <div className="sw-muted" style={{ fontSize: 12.5 }}>Loading…</div>
      ) : comments.length === 0 ? (
        <div className="sw-muted" style={{ fontSize: 12.5, marginBottom: 6 }}>No notes yet.</div>
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 10px", padding: 0, display: "grid", gap: 6 }}>
          {comments.map((c) => {
            const fromClub = c.author_type === "club";
            const cv = c.visibility === "client_visible";
            const label = fromClub ? "From the club" : cv ? "Sent to client" : "Internal";
            const bg = fromClub ? "#f0fdf4" : cv ? "#eef6ff" : SURFACE2;
            const bd = fromClub ? "#c7ead6" : cv ? "#cfe4fb" : LINE;
            const lc = fromClub ? "#15803d" : cv ? "#1d4ed8" : FAINT;
            return (
              <li key={c.id} style={{ fontSize: 12.8, padding: "8px 10px", borderRadius: 8,
                background: bg, border: `1px solid ${bd}` }}>
                <span style={{ whiteSpace: "pre-wrap" }}>{c.body}</span>
                <div style={{ marginTop: 3, fontSize: 11, color: lc, fontWeight: 600 }}>
                  {label} · {fmt(c.created_at)}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ display: "inline-flex", padding: 2, gap: 2, background: SURFACE2, border: `1px solid ${LINE}`, borderRadius: 9, marginBottom: 7 }}>
        {([["internal", "Internal note"], ["client_visible", "Reply to client"]] as const).map(([v, label]) => (
          <button key={v} type="button" onClick={() => setVisibility(v)}
            style={{ border: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 600, padding: "4px 11px", borderRadius: 7,
              background: visibility === v ? (v === "client_visible" ? "#1d4ed8" : "#fff") : "transparent",
              color: visibility === v ? (v === "client_visible" ? "#fff" : INK) : MUTED,
              boxShadow: visibility === v && v === "internal" ? "0 1px 2px rgba(0,0,0,.08)" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder={toClient ? "Write a reply the club will see on their status page…" : "Add an internal note (never shown to the club)…"}
          rows={2}
          style={{ flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, resize: "vertical",
            border: `1px solid ${toClient ? "#cfe4fb" : LINE}`, background: toClient ? "#f6fbff" : SURFACE, color: INK }} />
        <button className={toClient ? "sw-btn" : "sw-btn sw-btn--ghost"} disabled={saving || !note.trim()} onClick={add}>
          {saving ? "Saving…" : toClient ? "Queue reply" : "Add note"}
        </button>
      </div>
      {toClient && <div style={{ fontSize: 11.5, color: FAINT, marginTop: 4 }}>Shows on the club's status page now; goes out in the next “Send update” email.</div>}
      {err && <div className="sw1-onboard-err" style={{ marginTop: 4 }}>{err}</div>}
    </div>
  );
}

// ---- Element picker display --------------------------------------------------
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
  // Generic "pinned element" — a crosshair (not a square, which read as a checkbox).
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DeviceIcon({ type }: { type?: string | null }) {
  const common = { width: 12, height: 12, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (type === "mobile") {
    return (
      <svg {...common}>
        <rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "tablet") {
    return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>;
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 20h6M12 16v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function rowHasElement(r: Row) {
  const m = r.element_meta || {};
  return !!(r.element_tag || r.element_label || m.src || m.href || m.heading);
}

function elementSnippet(r: Row): string | null {
  const m = r.element_meta || {};
  const label = (r.element_label || "").trim();
  const texty = label && label !== r.element_tag && !/^\S+\.\w{2,5}$/.test(label);
  const base = (texty ? label : (m.heading || "")).trim();
  if (!base) return null;
  return base.split(/\s+/).slice(0, 8).join(" ").slice(0, 60);
}

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
    <div style={{ margin: "8px 0 10px", padding: "9px 11px", background: "#eef2ff", border: "1px solid #dbe1fb", borderRadius: 9 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ display: "flex", color: INDIGO, flex: "0 0 auto" }}><ElIcon tag={r.element_tag} /></span>
        <strong style={{ color: "#3730a3", textTransform: "capitalize" }}>{friendlyTag(r.element_tag)}</strong>
        <span style={{ color: MUTED, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          · {m.is_text ? `“${primary}”` : primary}
        </span>
        {m.fixed && <Pill color="#4338ca" bg="#e0e7ff">fixed / sticky</Pill>}
      </div>
      <div style={{ fontSize: 12, color: MUTED, marginTop: 4, display: "flex", flexWrap: "wrap", gap: "1px 12px" }}>
        {m.src && <span>file: {m.src}</span>}
        {m.href && <span>link: {m.href}</span>}
        {m.heading && <span>near heading: "{m.heading}"</span>}
        {pct != null && <span>~{pct}% down the page</span>}
      </div>
      {r.page_url && (
        <button onClick={(e) => { e.stopPropagation(); openTarget(r); }}
          className="sw-btn sw-btn--ghost" style={{ marginTop: 8, fontSize: 12, padding: "3px 10px" }}
          title={canJump ? "Opens the page and jumps to the element" : "Opens the page (no text anchor to jump to)"}>
          Open page {canJump ? "→ jump to element" : ""} ↗
        </button>
      )}
    </div>
  );
}
