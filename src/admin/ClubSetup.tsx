import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * ClubSetup — the club-facing "Getting started" checklist.
 *
 * Runs on the shared launch engine (launch_step_catalog / launch_step_progress)
 * filtered to audience='club'. Ensures the club has a launch (start_club_launch,
 * idempotent — also back-fills any newly added steps), shows a progress bar and
 * an ordered list of steps, deep-links each step to the right admin screen via
 * `onGo`, and lets the user tick steps done.
 *
 * Props:
 *   clubId   — the active club.
 *   clubName — for the heading.
 *   onGo     — (cta_route) => navigate the admin to that screen.
 */

type CatalogStep = {
  step_key: string;
  title: string;
  help_md: string | null;
  expected_label: string | null;
  cta_route: string | null;
  sort: number;
};

type StepStatus = "pending" | "done" | "skipped" | "blocked";

export function ClubSetup({
  clubId,
  clubName,
  onGo,
}: {
  clubId: string;
  clubName?: string;
  onGo: (route: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [launchId, setLaunchId] = useState<string | null>(null);
  const [steps, setSteps] = useState<CatalogStep[]>([]);
  const [status, setStatus] = useState<Record<string, StepStatus>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Ensure a launch exists (idempotent; back-fills new steps).
      const { data: lid, error: lerr } = await supabase.rpc("start_club_launch", {
        p_club_id: clubId,
      });
      if (lerr) throw lerr;
      const launch = lid as string;
      setLaunchId(launch);

      // 2) Club steps from the shared catalog, in checklist order.
      const { data: cat, error: cerr } = await supabase
        .from("launch_step_catalog")
        .select("step_key,title,help_md,expected_label,cta_route,sort")
        .eq("active", true)
        .in("audience", ["club", "both"])
        .order("sort");
      if (cerr) throw cerr;
      setSteps((cat ?? []) as CatalogStep[]);

      // 3) Progress for this launch.
      const { data: prog, error: perr } = await supabase
        .from("launch_step_progress")
        .select("step_key,status")
        .eq("launch_id", launch);
      if (perr) throw perr;
      const map: Record<string, StepStatus> = {};
      for (const r of prog ?? []) map[r.step_key as string] = r.status as StepStatus;
      setStatus(map);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Couldn't load the setup checklist.");
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) load();
  }, [clubId, load]);

  async function toggle(stepKey: string) {
    if (!launchId) return;
    const next: StepStatus = status[stepKey] === "done" ? "pending" : "done";
    setBusy(stepKey);
    const prev = status[stepKey];
    setStatus((s) => ({ ...s, [stepKey]: next })); // optimistic
    const { error: uerr } = await supabase
      .from("launch_step_progress")
      .update({ status: next })
      .eq("launch_id", launchId)
      .eq("step_key", stepKey);
    if (uerr) {
      setStatus((s) => ({ ...s, [stepKey]: prev })); // revert
      setError(uerr.message);
    }
    setBusy(null);
  }

  const total = steps.length;
  const done = steps.filter((s) => status[s.step_key] === "done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (loading) {
    return (
      <div className="sw-admin-screen">
        <h2 className="sw-admin-title">Getting started</h2>
        <p>Loading your setup checklist…</p>
      </div>
    );
  }

  return (
    <div className="sw-admin-screen">
      <h2 className="sw-admin-title">Getting started</h2>
      <p style={{ color: "#5b6573", marginTop: -4 }}>
        {clubName ? `${clubName} — ` : ""}work through these to get the club ready. You can do them in any order;
        each opens the right screen. DNS &amp; go-live are handled by SportsWeb.
      </p>

      {error && (
        <div style={{ background: "#fdecee", color: "#9b1c2b", padding: "10px 12px", borderRadius: 8, margin: "12px 0" }}>
          {error}
          {steps.length === 0 && (
            <div style={{ marginTop: 6, fontSize: 13 }}>
              If this is the first run, make sure <code>club-setup-steps.sql</code> has been run in Supabase.
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      <div style={{ margin: "14px 0 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5b6573", marginBottom: 6 }}>
          <span>{done} of {total} done</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "#e7e9ee", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100 ? "#1f9d57" : "var(--club-accent, #2F6BFF)",
              transition: "width .3s ease",
            }}
          />
        </div>
        {pct === 100 && (
          <p style={{ color: "#1f9d57", fontWeight: 600, marginTop: 10 }}>
            🎉 All set — the club is ready for SportsWeb to take live.
          </p>
        )}
      </div>

      {/* Steps */}
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
        {steps.map((s, i) => {
          const isDone = status[s.step_key] === "done";
          return (
            <li
              key={s.step_key}
              style={{
                border: "1px solid #e7e9ee",
                borderRadius: 12,
                padding: "14px 16px",
                background: isDone ? "#f4faf6" : "#fff",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <button
                onClick={() => toggle(s.step_key)}
                disabled={busy === s.step_key}
                aria-label={isDone ? "Mark not done" : "Mark done"}
                style={{
                  flex: "0 0 auto",
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  border: isDone ? "none" : "2px solid #c2c8d2",
                  background: isDone ? "#1f9d57" : "#fff",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 15,
                  lineHeight: "22px",
                  marginTop: 2,
                }}
              >
                {isDone ? "✓" : ""}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, textDecoration: isDone ? "line-through" : "none", color: isDone ? "#5b6573" : "#11161f" }}>
                    {i + 1}. {s.title}
                  </span>
                  {s.expected_label && (
                    <span style={{ fontSize: 12, color: "#7b8494", background: "#f1f3f6", padding: "2px 8px", borderRadius: 999 }}>
                      {s.expected_label}
                    </span>
                  )}
                </div>
                {s.help_md && (
                  <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5b6573" }}>{s.help_md}</p>
                )}
                {s.cta_route && (
                  <button
                    onClick={() => onGo(s.cta_route!)}
                    style={{
                      marginTop: 10,
                      border: "1px solid var(--club-accent, #2F6BFF)",
                      color: "var(--club-accent, #2F6BFF)",
                      background: "transparent",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 13.5,
                    }}
                  >
                    {isDone ? "Open again" : "Go there"} →
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
