import { useEffect, useMemo, useState } from "react";
import { useActiveClub } from "./ActiveClub";
import { supabase } from "../lib/supabase";
import { listClubMembers, type ClubMember } from "../lib/people";
import {
  listInjuryRecords,
  getInjuryRecord,
  createInjuryRecord,
  updateInjuryRecord,
  completeInjuryStage,
  getInjuryDashboardSummary,
  uploadInjuryDocument,
  getInjuryDocumentUrl,
  getInjuryRemindersEnabled,
  setInjuryRemindersEnabled,
  type InjurySummary,
  type InjuryDetail,
  type InjuryDashboardSummary,
} from "../lib/injuries";

const INJURY_TYPES: [string, string][] = [
  ["general", "General"],
  ["soft_tissue", "Soft tissue"],
  ["fracture", "Fracture"],
  ["concussion", "Concussion"],
  ["other", "Other"],
];
const SEVERITIES: [string, string][] = [
  ["minor", "Minor"],
  ["moderate", "Moderate"],
  ["severe", "Severe"],
];

function humanise(s: string): string {
  const t = s.replace(/_/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM = { personId: "", injuryType: "general", occurredOn: today(), description: "", severity: "" };

export function AdminInjuries({ onOpenMember }: { onOpenMember?: (personId: string) => void }) {
  const { clubId } = useActiveClub();
  const [records, setRecords] = useState<InjurySummary[]>([]);
  const [summary, setSummary] = useState<InjuryDashboardSummary | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [busy, setBusy] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<InjurySummary | null>(null);
  const [detail, setDetail] = useState<InjuryDetail | null>(null);
  const [accessLog, setAccessLog] = useState<{ id: number; at: string; actor_id: string | null; action: string }[]>([]);

  function load() {
    if (!clubId) return;
    setLoading(true);
    Promise.all([listInjuryRecords(clubId), getInjuryDashboardSummary(clubId), listClubMembers(clubId)]).then(
      ([r, s, m]) => {
        setRecords(r);
        setSummary(s);
        setMembers(m);
        setLoading(false);
      },
    );
  }
  useEffect(load, [clubId]);
  useEffect(() => {
    if (clubId) getInjuryRemindersEnabled(clubId).then(setRemindersOn);
  }, [clubId]);

  async function onToggleReminders() {
    if (!clubId) return;
    const next = !remindersOn;
    setRemindersOn(next); // optimistic
    const err = await setInjuryRemindersEnabled(clubId, next);
    if (err) { setRemindersOn(!next); setMsg(err); }
  }

  async function openRecord(row: InjurySummary) {
    setSelectedId(row.id);
    setSelectedSummary(row);
    setDetail(null);
    setAccessLog([]);
    const d = await getInjuryRecord(row.id);
    setDetail(d);
    // RLS restricts this to senior admins — empty for anyone else, which is fine to show as "no entries".
    if (supabase) {
      const { data } = await supabase
        .from("injury_access_log")
        .select("id, at, actor_id, action")
        .eq("record_id", row.id)
        .order("at", { ascending: false })
        .limit(20);
      if (data) setAccessLog(data as typeof accessLog);
    }
  }

  function closeRecord() {
    setSelectedId(null);
    setSelectedSummary(null);
    setDetail(null);
    setAccessLog([]);
  }

  async function refreshSelected() {
    if (!selectedId) return;
    const d = await getInjuryRecord(selectedId);
    setDetail(d);
    load();
  }

  const memberOptions = useMemo(
    () => members.filter((m) => m.status !== "archived").sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [members],
  );

  async function createRecord() {
    if (!clubId) return;
    if (!form.personId) {
      setMsg("Pick a member.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await createInjuryRecord(clubId, {
      personId: form.personId,
      injuryType: form.injuryType,
      occurredOn: form.occurredOn,
      description: form.description.trim() || null,
      severity: form.severity || null,
    });
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    load();
    if (res.id) {
      const row: InjurySummary = {
        id: res.id,
        personId: form.personId,
        fullName: members.find((m) => m.personId === form.personId)?.fullName ?? "",
        teamId: null,
        teamName: null,
        injuryType: form.injuryType,
        occurredOn: form.occurredOn,
        status: "open",
        severity: form.severity || null,
        nextStageNo: null,
        nextStageLabel: null,
        nextStageDue: null,
        stagesTotal: 0,
        stagesCompleted: 0,
      };
      openRecord(row);
    }
  }

  async function onMarkCleared() {
    if (!selectedId) return;
    setBusy(true);
    setMsg(null);
    const err = await updateInjuryRecord(selectedId, { status: "cleared" });
    setBusy(false);
    if (err) { setMsg(err); return; }
    refreshSelected();
  }

  async function onCompleteStage(stageId: string) {
    setBusy(true);
    setMsg(null);
    const err = await completeInjuryStage(stageId);
    setBusy(false);
    if (err) { setMsg(err); return; }
    refreshSelected();
  }

  async function onUploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedId || !detail || !clubId) return;
    setBusy(true);
    setMsg(null);
    const res = await uploadInjuryDocument(clubId, detail.record.person_id, selectedId, file);
    setBusy(false);
    if (res.error) { setMsg(res.error); return; }
    e.target.value = "";
    refreshSelected();
  }

  async function onOpenDoc(path: string) {
    const url = await getInjuryDocumentUrl(path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else setMsg("Could not open that document.");
  }

  if (loading) return <div className="sw-admin-loading">Loading injuries…</div>;

  if (selectedId) {
    const firstIncomplete = detail?.stages.find((s) => !s.completed_at) ?? null;
    return (
      <div className="sw-admin-panel">
        <div className="sw-admin-formhead">
          <button className="sw-btn sw-btn--sm" onClick={closeRecord}>← Back to injuries</button>
          <h2 style={{ marginTop: 8 }}>{selectedSummary?.fullName ?? "Injury record"}</h2>
        </div>
        {msg && <p className="sw-admin-note" style={{ color: "#dc4a45" }}>{msg}</p>}
        {!detail ? (
          <div className="sw-admin-loading">Loading…</div>
        ) : (
          <>
            <div className="sw-sales-rungs" style={{ marginBottom: 16 }}>
              <div className="sw-stat"><div className="sw-stat-n">{humanise(detail.record.injury_type)}</div><div className="sw-stat-l">Type</div></div>
              <div className="sw-stat"><div className="sw-stat-n">{humanise(detail.record.status)}</div><div className="sw-stat-l">Status</div></div>
              <div className="sw-stat"><div className="sw-stat-n">{fmtDate(detail.record.occurred_on)}</div><div className="sw-stat-l">Occurred</div></div>
              <div className="sw-stat"><div className="sw-stat-n">{detail.record.severity ? humanise(detail.record.severity) : "—"}</div><div className="sw-stat-l">Severity</div></div>
            </div>

            {detail.record.description && <p className="sw-admin-note">{detail.record.description}</p>}

            {detail.record.status !== "cleared" && (
              <button className="sw-btn sw-btn--sm" disabled={busy} onClick={onMarkCleared} style={{ marginBottom: 16 }}>
                Mark cleared (skip remaining stages)
              </button>
            )}

            <h3>Return-to-play stages</h3>
            {detail.stages.length === 0 ? (
              <p className="sw-admin-note">No graduated protocol attached to this record.</p>
            ) : (
              <div className="sw-md-list">
                {detail.stages.map((s) => (
                  <div className="sw-md-compcard" key={s.id}>
                    <div className="sw-md-roletop">
                      <strong>{s.stage_no}. {s.label}</strong>
                      <span className={`sw-md-rolestate sw-md-rolestate--${s.completed_at ? "on" : "off"}`}>
                        {s.completed_at ? "Complete" : "Pending"}
                      </span>
                    </div>
                    <div className="sw-md-rolemeta">
                      {s.completed_at ? `Signed off ${fmtDate(s.completed_at)}` : s.due_on ? `Due ${fmtDate(s.due_on)}` : "No date set"}
                      {!s.completed_at && s.id === firstIncomplete?.id && (
                        <button className="sw-sales-link" style={{ marginLeft: 8, background: "none", border: 0, cursor: "pointer" }} disabled={busy} onClick={() => onCompleteStage(s.id)}>
                          Mark complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ marginTop: 20 }}>Documents</h3>
            <p className="sw-admin-note">Medical clearances and reports. Stored privately — only people with access to this record can open them.</p>
            <label className="sw-btn sw-btn--sm" style={{ display: "inline-block", cursor: "pointer" }}>
              {busy ? "Uploading…" : "+ Upload document"}
              <input type="file" onChange={onUploadDoc} disabled={busy} style={{ display: "none" }} />
            </label>
            {detail.documents.length === 0 ? (
              <p className="sw-admin-note">No documents uploaded yet.</p>
            ) : (
              <div className="sw-md-list" style={{ marginTop: 10 }}>
                {detail.documents.map((d) => (
                  <button
                    key={d.id}
                    className="sw-md-compcard"
                    style={{ textAlign: "left", width: "100%", border: "1px solid #e6e8ee", cursor: "pointer", background: "#fff" }}
                    onClick={() => onOpenDoc(d.storage_path)}
                  >
                    <strong>{d.file_name}</strong>
                    <div className="sw-md-rolemeta">Uploaded {fmtDate(d.uploaded_at)}</div>
                  </button>
                ))}
              </div>
            )}

            {accessLog.length > 0 && (
              <>
                <h3 style={{ marginTop: 20 }}>Access log</h3>
                <p className="sw-admin-note">Senior admins only. Every view and change to this record, most recent first.</p>
                <div className="sw-md-list">
                  {accessLog.map((a) => (
                    <div className="sw-md-rolemeta" key={a.id}>
                      {fmtDate(a.at)} — {humanise(a.action)}
                    </div>
                  ))}
                </div>
              </>
            )}

            {onOpenMember && (
              <button className="sw-btn sw-btn--sm" style={{ marginTop: 20 }} onClick={() => onOpenMember(detail.record.person_id)}>
                View member profile
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>Injuries &amp; concussion</h2>
      </div>
      <p className="sw-admin-note">
        Active injuries, graduated return-to-play stages and medical documents. Visible to senior admins for the whole
        club, and to coaches / team managers for their own team&apos;s players.
      </p>

      {summary && (
        <div className="sw-sales-rungs" style={{ marginBottom: 16 }}>
          <div className="sw-stat"><div className="sw-stat-n" style={{ color: summary.active ? "#c0801a" : "#16a06a" }}>{summary.active}</div><div className="sw-stat-l">Active</div></div>
          <div className="sw-stat"><div className="sw-stat-n" style={{ color: summary.overdueStages ? "#dc4a45" : "#16a06a" }}>{summary.overdueStages}</div><div className="sw-stat-l">Overdue stages</div></div>
          <div className="sw-stat"><div className="sw-stat-n" style={{ color: summary.notCleared ? "#c0801a" : "#16a06a" }}>{summary.notCleared}</div><div className="sw-stat-l">Not cleared</div></div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5b6573" }}>
          <input type="checkbox" checked={remindersOn} onChange={onToggleReminders} />
          Email senior admins when a stage is due (senior admins only; needs deploying — ask your builder)
        </label>
        <button className="sw-btn sw-btn--sm" onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "+ Record injury"}</button>
      </div>

      {msg && <p className="sw-admin-note" style={{ color: "#dc4a45" }}>{msg}</p>}

      {showForm && (
        <div className="sw-mem-addform" style={{ marginBottom: 16 }}>
          <div className="sw-mem-addgrid">
            <label><span>Member</span>
              <select value={form.personId} onChange={(e) => setForm({ ...form, personId: e.target.value })}>
                <option value="">Select…</option>
                {memberOptions.map((m) => <option key={m.personId} value={m.personId}>{m.fullName}</option>)}
              </select>
            </label>
            <label><span>Type</span>
              <select value={form.injuryType} onChange={(e) => setForm({ ...form, injuryType: e.target.value })}>
                {INJURY_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label><span>Occurred</span><input type="date" value={form.occurredOn} onChange={(e) => setForm({ ...form, occurredOn: e.target.value })} /></label>
            <label><span>Severity</span>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="">Not recorded</option>
                {SEVERITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label style={{ gridColumn: "1 / -1" }}><span>Notes</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </label>
          </div>
          <p className="sw-admin-note">
            Concussion automatically attaches the graduated return-to-play template — confirm the seeded stage content
            against your governing body before relying on it (see the template notes).
          </p>
          <button className="sw-btn" disabled={busy} onClick={createRecord}>{busy ? "Saving…" : "Save record"}</button>
        </div>
      )}

      {records.length === 0 ? (
        <p className="sw-admin-note" style={{ color: "#166534" }}>No injuries on record. 🎉</p>
      ) : (
        <div className="sw-md-list">
          {records.map((r) => (
            <button
              key={r.id}
              className="sw-md-compcard"
              style={{ textAlign: "left", width: "100%", border: "1px solid #e6e8ee", cursor: "pointer", background: "#fff" }}
              onClick={() => openRecord(r)}
            >
              <div className="sw-md-roletop">
                <strong>{r.fullName}</strong>
                <span className={`sw-md-rolestate sw-md-rolestate--${r.status === "cleared" ? "on" : r.status === "recovering" ? "warn" : "off"}`}>
                  {humanise(r.status)}
                </span>
              </div>
              <div className="sw-md-rolemeta">
                {humanise(r.injuryType)} · Occurred {fmtDate(r.occurredOn)}
                {r.status !== "cleared" && r.nextStageLabel ? ` · Next: ${r.nextStageLabel}${r.nextStageDue ? ` (due ${fmtDate(r.nextStageDue)})` : ""}` : ""}
                {r.stagesTotal > 0 ? ` · ${r.stagesCompleted}/${r.stagesTotal} stages` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
