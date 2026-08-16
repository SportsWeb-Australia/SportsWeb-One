import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Change-request queue.
 *
 * Clubs raise these from the on-page editor when they want something the editor
 * deliberately doesn't let them do themselves (a new section, a layout change, a
 * new page). Platform admins triage here; a club sees its own history read-only,
 * because club_requests' RLS only grants UPDATE to platform admins.
 */

type Status = "new" | "in_progress" | "done" | "declined";
type Urgency = "whenever" | "soon" | "urgent";

interface Row {
  id: string;
  club_id: string;
  what: string;
  why: string;
  urgency: Urgency;
  status: Status;
  page_path: string | null;
  response: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  in_progress: "In progress",
  done: "Done",
  declined: "Not proceeding",
};

const URGENCY_LABEL: Record<Urgency, string> = {
  whenever: "Whenever",
  soon: "Soon",
  urgent: "Urgent",
};

// Urgent first, then oldest — a queue sorted purely by date buries the thing on fire.
const URGENCY_RANK: Record<Urgency, number> = { urgent: 0, soon: 1, whenever: 2 };

function fmt(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function AdminRequests({ isPlatformAdmin }: { isPlatformAdmin: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [clubNames, setClubNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    setErr(null);
    // RLS scopes this: platform admins see every club, a club admin sees only theirs.
    const { data, error } = await supabase
      .from("club_requests")
      .select("id, club_id, what, why, urgency, status, page_path, response, created_at")
      .order("created_at", { ascending: false });
    if (error) { setErr(error.message); setLoading(false); return; }
    const list = (data ?? []) as Row[];
    setRows(list);

    // Resolve club names in one round trip so the queue reads as clubs, not UUIDs.
    const ids = [...new Set(list.map((r) => r.club_id))];
    if (ids.length) {
      const { data: clubs } = await supabase.from("clubs").select("id, name").in("id", ids);
      const map: Record<string, string> = {};
      for (const c of clubs ?? []) map[(c as { id: string }).id] = (c as { name: string }).name;
      setClubNames(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function setStatus(id: string, status: Status) {
    if (!supabase) return;
    setBusyId(id);
    const { error } = await supabase
      .from("club_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    setBusyId(null);
    if (error) { setErr(error.message); return; }
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const visible = useMemo(() => {
    const list = filter === "open"
      ? rows.filter((r) => r.status === "new" || r.status === "in_progress")
      : rows;
    return [...list].sort((a, b) => {
      const u = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
      if (u !== 0) return u;
      return a.created_at.localeCompare(b.created_at);
    });
  }, [rows, filter]);

  const openCount = rows.filter((r) => r.status === "new" || r.status === "in_progress").length;

  return (
    <div className="sw-admin-page">
      <header className="sw-admin-head">
        <div>
          <h1>Change requests</h1>
          <p className="sw-muted">
            {isPlatformAdmin
              ? "What clubs have asked us to change for them, newest urgent first."
              : "Changes you've asked the SportsWeb team to make, and where they're up to."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className={`sw-btn ${filter === "open" ? "" : "sw-btn--ghost"}`}
            onClick={() => setFilter("open")}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            className={`sw-btn ${filter === "all" ? "" : "sw-btn--ghost"}`}
            onClick={() => setFilter("all")}
          >
            All ({rows.length})
          </button>
        </div>
      </header>

      {err && <p className="sw-admin-note" style={{ color: "#b91c1c" }}>{err}</p>}
      {loading && <p className="sw-admin-loading">Loading…</p>}

      {!loading && visible.length === 0 && (
        <p className="sw-admin-empty">
          {filter === "open" ? "Nothing outstanding." : "No requests yet."}
        </p>
      )}

      <div className="sw-req-list">
        {visible.map((r) => (
          <article key={r.id} className={`sw-req-card sw-req-card--${r.urgency}`}>
            <div className="sw-req-top">
              <span className={`sw-req-urg sw-req-urg--${r.urgency}`}>{URGENCY_LABEL[r.urgency]}</span>
              {isPlatformAdmin && <strong className="sw-req-club">{clubNames[r.club_id] ?? "Unknown club"}</strong>}
              <span className="sw-req-status" data-status={r.status}>{STATUS_LABEL[r.status]}</span>
              <span className="sw-req-when">{fmt(r.created_at)}</span>
            </div>

            <p className="sw-req-what">{r.what}</p>
            <p className="sw-req-why"><span>Why:</span> {r.why}</p>
            {r.page_path && <p className="sw-req-page">Page: <code>{r.page_path}</code></p>}
            {r.response && <p className="sw-req-response"><span>Our reply:</span> {r.response}</p>}

            {isPlatformAdmin && (
              <div className="sw-req-acts">
                {(["new", "in_progress", "done", "declined"] as Status[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busyId === r.id || r.status === s}
                    className={`sw-btn sw-btn--sm ${r.status === s ? "" : "sw-btn--ghost"}`}
                    onClick={() => setStatus(r.id, s)}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
