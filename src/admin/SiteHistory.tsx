import { useEffect, useState } from "react";
import { useActiveClub } from "./ActiveClub";
import { listVersions, saveRestorePoint, restoreVersion, type SiteVersion } from "../lib/siteVersions";

// Website history / restore points. Every publish leaves an automatic restore point,
// draft edits leave a "before edits" point, and admins can stamp a manual one. Any
// point can be rolled back to (the rollback is itself snapshotted first).

const KIND_LABEL: Record<string, string> = {
  pre_publish: "Before a publish",
  pre_restore: "Before a restore",
  manual: "Manual restore point",
};
const KIND_TONE: Record<string, string> = { pre_publish: "on", pre_restore: "warn", manual: "on" };

function whenText(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export function SiteHistory() {
  const { clubId, clubName } = useActiveClub();
  const [rows, setRows] = useState<SiteVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!clubId) return;
    setLoading(true);
    try {
      setRows(await listVersions(clubId));
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't load history.");
    }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [clubId]);

  async function onSave() {
    if (!clubId || busy) return;
    setBusy(true); setMsg(null); setErr(null);
    try {
      await saveRestorePoint(clubId, note.trim() || undefined);
      setNote("");
      setMsg("Restore point saved.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save restore point.");
    }
    setBusy(false);
  }

  async function onRestore(id: string) {
    if (busy) return;
    setBusy(true); setMsg(null); setErr(null); setConfirmId(null);
    try {
      const n = await restoreVersion(id);
      setMsg(`Restored ${n} item${n === 1 ? "" : "s"} to that point. The change is live now.`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't restore.");
    }
    setBusy(false);
  }

  if (loading) return <div className="sw-admin-loading">Loading history…</div>;

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>Website history &amp; restore</h2>
      </div>
      <p className="sw-admin-note">
        Every time {clubName || "the club"}&apos;s site is published, a restore point is saved automatically — so a
        wrong or accidental change can always be rolled back. You can also stamp your own restore point before a big
        reshuffle. Rolling back is safe: the current state is snapshotted first, so a restore can itself be undone.
      </p>

      <div className="sw-restore-save">
        <input
          className="sw-mem-search"
          placeholder="Name this restore point (optional) — e.g. 'before season refresh'"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={120}
        />
        <button className="sw-btn" onClick={onSave} disabled={busy}>Save restore point now</button>
      </div>

      {msg && <p className="sw-admin-note" style={{ color: "#166534", fontWeight: 600 }}>{msg}</p>}
      {err && <p className="sw-admin-error">{err}</p>}

      {rows.length === 0 ? (
        <p className="sw-admin-note">No restore points yet. One is saved automatically the first time you edit or publish.</p>
      ) : (
        <div className="sw-md-list" style={{ marginTop: 12 }}>
          {rows.map((r) => (
            <div key={r.id} className="sw-md-compcard" style={{ border: "1px solid #e6e8ee", background: "#fff" }}>
              <div className="sw-md-roletop">
                <strong>{whenText(r.createdAt)}</strong>
                <span className={`sw-md-rolestate sw-md-rolestate--${KIND_TONE[r.kind] || "on"}`}>{KIND_LABEL[r.kind] ?? "Restore point"}</span>
              </div>
              <div className="sw-md-rolemeta">
                {r.note ? <span>{r.note} · </span> : null}
                {r.actor ? <span>by {r.actor}</span> : <span>system</span>}
              </div>
              <div style={{ marginTop: 10 }}>
                {confirmId === r.id ? (
                  <>
                    <button className="sw-btn sw-btn--sm" onClick={() => onRestore(r.id)} disabled={busy}>
                      Confirm — roll the site back to here
                    </button>
                    <button className="sw-btn sw-btn--sm sw-btn--ghost" style={{ marginLeft: 8 }} onClick={() => setConfirmId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="sw-btn sw-btn--sm sw-btn--ghost" onClick={() => setConfirmId(r.id)} disabled={busy}>
                    Restore this version
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
