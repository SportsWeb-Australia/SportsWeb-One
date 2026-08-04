import { useEffect, useMemo, useState } from "react";
import { useActiveClub } from "./ActiveClub";
import { supabase } from "../lib/supabase";
import { listClubMembers, type ClubMember } from "../lib/people";

// Club-wide WWCC / compliance risk. Surfaces adults in child-facing roles who don't
// hold a valid Working with Children Check (missing / expired / expiring soon).

const CHILD_FACING = ["coach", "assistant_coach", "team_manager", "trainer", "committee", "volunteer", "official", "administrator"];
const EXPIRING_DAYS = 60;

type Comp = { person_id: string; check_type: string; expires_on: string | null; status: string | null };
type WwccState = "valid" | "expiring" | "expired" | "missing";

function wwccStateFor(recs: Comp[]): WwccState {
  const w = recs.filter((r) => r.check_type === "wwcc" && r.status !== "rejected");
  if (w.length === 0) return "missing";
  const now = Date.now();
  const soon = now + EXPIRING_DAYS * 86_400_000;
  let best: WwccState = "expired";
  for (const r of w) {
    const exp = r.expires_on ? new Date(r.expires_on).getTime() : null;
    let s: WwccState;
    if (r.status === "expired") s = "expired";
    else if (exp == null) s = r.status === "valid" ? "valid" : "expiring";
    else if (exp < now) s = "expired";
    else if (exp < soon) s = "expiring";
    else s = "valid";
    if (s === "valid") return "valid";
    if (s === "expiring") best = "expiring";
  }
  return best;
}

const STATE_LABEL: Record<WwccState, string> = { valid: "Valid", expiring: "Expiring soon", expired: "Expired", missing: "No WWCC on file" };
const STATE_TONE: Record<WwccState, string> = { valid: "ok", expiring: "warn", expired: "bad", missing: "bad" };

export function ComplianceReport({ onOpen }: { onOpen: (personId: string) => void }) {
  const { clubId } = useActiveClub();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [comp, setComp] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId || !supabase) return;
    setLoading(true);
    Promise.all([
      listClubMembers(clubId),
      supabase.from("compliance_records").select("person_id, check_type, expires_on, status").eq("club_id", clubId),
    ]).then(([mem, cRes]) => {
      setMembers(mem);
      setComp(((cRes.data as Comp[]) ?? []));
      setLoading(false);
    });
  }, [clubId]);

  const rows = useMemo(() => {
    const byPerson = new Map<string, Comp[]>();
    for (const c of comp) {
      const arr = byPerson.get(c.person_id) ?? [];
      arr.push(c);
      byPerson.set(c.person_id, arr);
    }
    return members
      .filter((m) => !m.isMinor && m.roles.some((r) => CHILD_FACING.includes(r)))
      .map((m) => ({ member: m, state: wwccStateFor(byPerson.get(m.id) ?? []) }))
      .sort((a, b) => {
        const order: WwccState[] = ["missing", "expired", "expiring", "valid"];
        return order.indexOf(a.state) - order.indexOf(b.state);
      });
  }, [members, comp]);

  const counts = useMemo(() => {
    const c = { valid: 0, expiring: 0, expired: 0, missing: 0 };
    rows.forEach((r) => { c[r.state]++; });
    return c;
  }, [rows]);
  const atRisk = counts.missing + counts.expired + counts.expiring;

  if (loading) return <div className="sw-admin-loading">Loading compliance…</div>;

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>WWCC &amp; compliance</h2>
      </div>
      <p className="sw-admin-note">
        Everyone in a child-facing role (coach, committee, volunteer, official) who should hold a current Working with
        Children Check. Record checks on each member&apos;s profile → Compliance tab.
      </p>

      <div className="sw-sales-rungs" style={{ marginBottom: 16 }}>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#16a06a" }}>{counts.valid}</div><div className="sw-stat-l">Valid</div></div>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#c0801a" }}>{counts.expiring}</div><div className="sw-stat-l">Expiring ≤{EXPIRING_DAYS}d</div></div>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#dc4a45" }}>{counts.expired}</div><div className="sw-stat-l">Expired</div></div>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#dc4a45" }}>{counts.missing}</div><div className="sw-stat-l">No WWCC</div></div>
      </div>

      {atRisk === 0 ? (
        <p className="sw-admin-note" style={{ color: "#166534" }}>
          {rows.length === 0
            ? "No one is in a child-facing role yet — add roles on member profiles to track WWCC."
            : "Everyone in a child-facing role has a valid WWCC on file. 🎉"}
        </p>
      ) : (
        <>
          <p className="sw-admin-note" style={{ fontWeight: 600, color: "#7a2e2e" }}>
            {atRisk} {atRisk === 1 ? "person needs" : "people need"} attention:
          </p>
          <div className="sw-md-list">
            {rows.filter((r) => r.state !== "valid").map(({ member, state }) => (
              <button key={member.id} className="sw-md-compcard" style={{ textAlign: "left", width: "100%", border: "1px solid #e6e8ee", cursor: "pointer", background: "#fff" }} onClick={() => onOpen(member.id)}>
                <div className="sw-md-roletop">
                  <strong>{member.fullName}</strong>
                  <span className={`sw-pay sw-pay--${STATE_TONE[state]}`}>{STATE_LABEL[state]}</span>
                </div>
                <div className="sw-md-rolemeta">
                  {member.roles.filter((r) => CHILD_FACING.includes(r)).map((r) => r.replace(/_/g, " ")).join(", ") || "child-facing role"}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
