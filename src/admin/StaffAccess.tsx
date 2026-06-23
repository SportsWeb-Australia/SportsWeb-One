import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type StaffRow = {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  granted_at: string;
};

type AuditRow = {
  id: number;
  at: string;
  actor_email: string | null;
  target_email: string | null;
  action: string;
  old_role: string | null;
  new_role: string | null;
  reason: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Super Admin",
  sportsweb_manager: "SportsWeb Manager",
  sportsweb_admin: "SportsWeb Admin (builder)",
};

// Roles this screen can assign. 'superadmin' is seed-only and never offered.
const ASSIGNABLE = ["sportsweb_manager", "sportsweb_admin"];

const ACTION_LABEL: Record<string, string> = {
  granted: "granted",
  role_changed: "changed",
  revoked: "revoked",
};

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function roleName(r: string | null): string {
  if (!r) return "—";
  return ROLE_LABEL[r] ?? r;
}

export function StaffAccess({
  onAddPerson,
  canManageSuper,
  currentUserId,
}: {
  onAddPerson?: () => void;
  canManageSuper: boolean;
  currentUserId?: string | null;
}) {
  const [rows, setRows] = useState<StaffRow[] | null>(null);
  const [log, setLog] = useState<AuditRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  // Pending action awaiting an optional reason + confirm.
  const [pending, setPending] = useState<
    { user_id: string; kind: "role" | "revoke"; role?: string } | null
  >(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setErr(null);
    const [staffRes, auditRes] = await Promise.all([
      supabase.rpc("admin_list_platform_staff"),
      supabase
        .from("access_audit")
        .select("id,at,actor_email,target_email,action,old_role,new_role,reason")
        .eq("scope", "platform")
        .order("at", { ascending: false })
        .limit(40),
    ]);
    if (staffRes.error) {
      setErr(
        staffRes.error.message +
          " — if this mentions a missing function, run governance-staff-access.sql."
      );
      setRows([]);
      return;
    }
    setRows((staffRes.data as StaffRow[]) ?? []);
    if (!auditRes.error) setLog((auditRes.data as AuditRow[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function canTouch(r: StaffRow): boolean {
    if (r.user_id === currentUserId) return false; // not yourself, from here
    if (r.role === "superadmin" || r.role === "sportsweb_manager")
      return canManageSuper;
    return true;
  }

  async function confirmPending() {
    if (!pending) return;
    setBusy(pending.user_id);
    setErr(null);
    const rsn = reason.trim() || null;
    const res =
      pending.kind === "revoke"
        ? await supabase.rpc("admin_revoke_platform_role", {
            p_user_id: pending.user_id,
            p_reason: rsn,
          })
        : await supabase.rpc("admin_set_platform_role", {
            p_user_id: pending.user_id,
            p_role: pending.role,
            p_reason: rsn,
          });
    setBusy(null);
    if (res.error) {
      setErr(res.error.message);
      return;
    }
    setPending(null);
    setReason("");
    await load();
  }

  function cancelPending() {
    setPending(null);
    setReason("");
  }

  // ── styles (inline; admin accent comes from --accent which is SportsWeb blue)
  const card: React.CSSProperties = {
    border: "1px solid #e6e8ec",
    borderRadius: 14,
    background: "#fff",
    padding: "1.1rem 1.2rem",
  };
  const badge = (r: string): React.CSSProperties => ({
    display: "inline-block",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
    padding: "0.2rem 0.6rem",
    borderRadius: 999,
    border: "1px solid",
    borderColor:
      r === "superadmin"
        ? "color-mix(in srgb, var(--accent) 40%, #e6e8ec)"
        : "#e6e8ec",
    background:
      r === "superadmin"
        ? "color-mix(in srgb, var(--accent) 10%, #fff)"
        : "#f4f5f7",
    color:
      r === "superadmin" ? "var(--accent-on-bg, #1e293b)" : "#475467",
  });

  return (
    <div className="sw-staffaccess">
      <p style={{ color: "#667085", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 0.3rem", fontFamily: "var(--font-mono, monospace)" }}>
        Governance
      </p>
      <h1 style={{ fontFamily: "var(--font-display, inherit)", fontSize: "clamp(1.8rem, 1.3rem + 1.6vw, 2.6rem)", margin: "0 0 0.35rem" }}>
        Staff &amp; access
      </h1>
      <p style={{ color: "#475467", maxWidth: "60ch", margin: "0 0 1.4rem" }}>
        Everyone with platform-level access, and what they can do. Change a role
        or revoke access here — every change is recorded in an append-only
        governance log.
      </p>

      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.2rem" }}>
        {onAddPerson && (
          <button
            onClick={onAddPerson}
            style={{
              background: "var(--accent, #2F6BFF)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "0.6rem 1.05rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Add a person
          </button>
        )}
        <button
          onClick={load}
          style={{
            background: "#fff",
            color: "#475467",
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            padding: "0.6rem 1.05rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {err && (
        <div
          style={{
            border: "1px solid #f3c2c2",
            background: "#fdecec",
            color: "#8a1c1c",
            borderRadius: 10,
            padding: "0.7rem 0.9rem",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {err}
        </div>
      )}

      {/* ── Roster ─────────────────────────────────────────── */}
      <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: "1.8rem" }}>
        {rows === null ? (
          <div style={{ padding: "1.2rem", color: "#667085" }}>Loading staff…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "1.2rem", color: "#667085" }}>
            No platform staff found.
          </div>
        ) : (
          rows.map((r, i) => {
            const isPending = pending?.user_id === r.user_id;
            const editable = canTouch(r);
            return (
              <div
                key={r.user_id}
                style={{
                  borderTop: i === 0 ? "none" : "1px solid #eef0f3",
                  padding: "0.95rem 1.15rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.8rem",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.full_name}
                      </span>
                      {r.user_id === currentUserId && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent-on-bg, #2F6BFF)" }}>
                          (you)
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#667085", fontSize: "0.85rem" }}>
                      {r.email}
                    </div>
                    <div style={{ color: "#98a2b3", fontSize: "0.74rem", marginTop: "0.15rem" }}>
                      since {fmtWhen(r.granted_at)}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    {!editable ? (
                      <span style={badge(r.role)}>{roleName(r.role)}</span>
                    ) : (
                      <>
                        <select
                          value={r.role}
                          disabled={busy === r.user_id}
                          onChange={(e) => {
                            const role = e.target.value;
                            if (role !== r.role) {
                              setReason("");
                              setPending({ user_id: r.user_id, kind: "role", role });
                            }
                          }}
                          style={{
                            border: "1px solid #cbd5e1",
                            borderRadius: 8,
                            padding: "0.4rem 0.6rem",
                            fontWeight: 600,
                            background: "#fff",
                          }}
                        >
                          {/* keep current role visible even if it's superadmin */}
                          {[r.role, ...ASSIGNABLE.filter((x) => x !== r.role)].map((rl) => (
                            <option key={rl} value={rl}>
                              {roleName(rl)}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={busy === r.user_id}
                          onClick={() => {
                            setReason("");
                            setPending({ user_id: r.user_id, kind: "revoke" });
                          }}
                          style={{
                            border: "1px solid #f0c5c5",
                            color: "#a12727",
                            background: "#fff",
                            borderRadius: 8,
                            padding: "0.4rem 0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* reason + confirm strip */}
                {isPending && (
                  <div
                    style={{
                      marginTop: "0.8rem",
                      padding: "0.8rem 0.9rem",
                      background: "var(--accent-soft, #eef3ff)",
                      border: "1px solid color-mix(in srgb, var(--accent) 20%, #e6e8ec)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                      {pending?.kind === "revoke"
                        ? `Revoke all access for ${r.full_name}?`
                        : `Change ${r.full_name} to ${roleName(pending?.role ?? "")}?`}
                    </div>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason (optional — recorded in the log)"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        padding: "0.5rem 0.7rem",
                        marginBottom: "0.6rem",
                      }}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        disabled={busy === r.user_id}
                        onClick={confirmPending}
                        style={{
                          background: pending?.kind === "revoke" ? "#a12727" : "var(--accent, #2F6BFF)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "0.5rem 1rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {busy === r.user_id ? "Working…" : "Confirm"}
                      </button>
                      <button
                        disabled={busy === r.user_id}
                        onClick={cancelPending}
                        style={{
                          background: "#fff",
                          color: "#475467",
                          border: "1px solid #cbd5e1",
                          borderRadius: 8,
                          padding: "0.5rem 1rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Recent activity (governance log) ───────────────── */}
      <h2 style={{ fontFamily: "var(--font-display, inherit)", fontSize: "1.3rem", margin: "0 0 0.7rem" }}>
        Recent access changes
      </h2>
      <div style={card}>
        {log.length === 0 ? (
          <div style={{ color: "#667085" }}>
            No changes recorded yet. Activity will appear here as access is
            granted, changed or revoked.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {log.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  gap: "0.7rem",
                  fontSize: "0.88rem",
                  borderBottom: "1px solid #f1f2f5",
                  paddingBottom: "0.7rem",
                }}
              >
                <div style={{ color: "#98a2b3", whiteSpace: "nowrap", minWidth: 130 }}>
                  {fmtWhen(a.at)}
                </div>
                <div style={{ color: "#344054" }}>
                  <strong>{a.actor_email ?? "system"}</strong>{" "}
                  {ACTION_LABEL[a.action] ?? a.action}{" "}
                  {a.action === "role_changed" ? (
                    <>
                      <strong>{a.target_email}</strong> from {roleName(a.old_role)} to{" "}
                      {roleName(a.new_role)}
                    </>
                  ) : a.action === "revoked" ? (
                    <>
                      <strong>{a.target_email}</strong> ({roleName(a.old_role)})
                    </>
                  ) : (
                    <>
                      <strong>{a.target_email}</strong> as {roleName(a.new_role)}
                    </>
                  )}
                  {a.reason ? (
                    <span style={{ color: "#667085" }}> — “{a.reason}”</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
