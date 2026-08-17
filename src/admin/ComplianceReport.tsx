import { useEffect, useMemo, useState } from "react";
import { useActiveClub } from "./ActiveClub";
import { supabase } from "../lib/supabase";
import { listClubMembers, type ClubMember } from "../lib/people";

// Club-wide WWCC / compliance risk. Surfaces adults in child-facing roles who don't
// hold a valid Working with Children Check (missing / expired / expiring soon), plus
// coach/trainer accreditation for roles that require it.

const CHILD_FACING = ["coach", "assistant_coach", "team_manager", "trainer", "committee", "volunteer", "official", "administrator"];
const EXPIRING_DAYS = 60;

// Roles that also need an accreditation check_type on top of WWCC.
const ACCRED_CHECK_TYPE: Record<string, string> = {
  coach: "coach_accreditation",
  assistant_coach: "coach_accreditation",
  trainer: "trainer_accreditation",
};
const ACCRED_LABEL: Record<string, string> = {
  coach_accreditation: "Coach accreditation",
  trainer_accreditation: "Trainer accreditation",
};

type Comp = { person_id: string; check_type: string; expires_on: string | null; status: string | null };
type CheckState = "valid" | "expiring" | "expired" | "missing";
const STATE_ORDER: CheckState[] = ["missing", "expired", "expiring", "valid"];

function checkStateFor(recs: Comp[], checkType: string): CheckState {
  const w = recs.filter((r) => r.check_type === checkType && r.status !== "rejected");
  if (w.length === 0) return "missing";
  const now = Date.now();
  const soon = now + EXPIRING_DAYS * 86_400_000;
  let best: CheckState = "expired";
  for (const r of w) {
    const exp = r.expires_on ? new Date(r.expires_on).getTime() : null;
    let s: CheckState;
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

const STATE_LABEL: Record<CheckState, string> = { valid: "Valid", expiring: "Expiring soon", expired: "Expired", missing: "No WWCC on file" };
const STATE_TONE: Record<CheckState, string> = { valid: "ok", expiring: "warn", expired: "bad", missing: "bad" };
const ACCRED_STATE_LABEL: Record<CheckState, string> = { valid: "Valid", expiring: "Expiring soon", expired: "Expired", missing: "Not recorded" };

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
      .map((m) => {
        const recs = byPerson.get(m.personId) ?? [];
        const wwcc = checkStateFor(recs, "wwcc");
        const accredType = m.roles.map((r) => ACCRED_CHECK_TYPE[r]).find(Boolean) ?? null;
        const accred = accredType ? checkStateFor(recs, accredType) : null;
        return { member: m, wwcc, accredType, accred };
      })
      .sort((a, b) => {
        const worst = (r: (typeof a)) => Math.min(STATE_ORDER.indexOf(r.wwcc), r.accred ? STATE_ORDER.indexOf(r.accred) : 99);
        return worst(a) - worst(b);
      });
  }, [members, comp]);

  const counts = useMemo(() => {
    const c = { valid: 0, expiring: 0, expired: 0, missing: 0 };
    rows.forEach((r) => { c[r.wwcc]++; });
    return c;
  }, [rows]);
  const accredGaps = useMemo(() => rows.filter((r) => r.accredType && r.accred !== "valid").length, [rows]);
  const atRiskRows = useMemo(() => rows.filter((r) => r.wwcc !== "valid" || (r.accredType && r.accred !== "valid")), [rows]);
  const atRisk = atRiskRows.length;

  function exportCsv() {
    const header = ["Name", "Roles", "WWCC status", "Accreditation type", "Accreditation status"];
    const lines = rows.map((r) => [
      r.member.fullName,
      r.member.roles.filter((role) => CHILD_FACING.includes(role)).join("; "),
      STATE_LABEL[r.wwcc],
      r.accredType ? ACCRED_LABEL[r.accredType] : "",
      r.accred ? ACCRED_STATE_LABEL[r.accred] : "",
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-register-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="sw-admin-loading">Loading compliance…</div>;

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2>WWCC &amp; compliance</h2>
        {rows.length > 0 && <button className="sw-btn sw-btn--sm" onClick={exportCsv}>Export CSV</button>}
      </div>
      <p className="sw-admin-note">
        Everyone in a child-facing role (coach, committee, volunteer, official) who should hold a current Working with
        Children Check — plus coach/trainer accreditation where the role requires it. Record checks on each
        member&apos;s profile → Compliance tab.
      </p>

      <div className="sw-sales-rungs" style={{ marginBottom: 16 }}>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#16a06a" }}>{counts.valid}</div><div className="sw-stat-l">Valid</div></div>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#c0801a" }}>{counts.expiring}</div><div className="sw-stat-l">Expiring ≤{EXPIRING_DAYS}d</div></div>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#dc4a45" }}>{counts.expired}</div><div className="sw-stat-l">Expired</div></div>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: "#dc4a45" }}>{counts.missing}</div><div className="sw-stat-l">No WWCC</div></div>
        <div className="sw-stat"><div className="sw-stat-n" style={{ color: accredGaps > 0 ? "#c0801a" : "#16a06a" }}>{accredGaps}</div><div className="sw-stat-l">Accreditation gaps</div></div>
      </div>

      {atRisk === 0 ? (
        <p className="sw-admin-note" style={{ color: "#166534" }}>
          {rows.length === 0
            ? "No one is in a child-facing role yet — add roles on member profiles to track WWCC."
            : "Everyone in a child-facing role has a valid WWCC (and accreditation, where required) on file. 🎉"}
        </p>
      ) : (
        <>
          <p className="sw-admin-note" style={{ fontWeight: 600, color: "#7a2e2e" }}>
            {atRisk} {atRisk === 1 ? "person needs" : "people need"} attention:
          </p>
          <div className="sw-md-list">
            {atRiskRows.map(({ member, wwcc, accredType, accred }) => (
              <button key={member.personId} className="sw-md-compcard" style={{ textAlign: "left", width: "100%", border: "1px solid #e6e8ee", cursor: "pointer", background: "#fff" }} onClick={() => onOpen(member.personId)}>
                <div className="sw-md-roletop">
                  <strong>{member.fullName}</strong>
                  <span style={{ display: "flex", gap: 6 }}>
                    <span className={`sw-pay sw-pay--${STATE_TONE[wwcc]}`}>{STATE_LABEL[wwcc]}</span>
                    {accredType && accred !== "valid" && (
                      <span className={`sw-pay sw-pay--${STATE_TONE[accred!]}`}>{ACCRED_LABEL[accredType]}: {ACCRED_STATE_LABEL[accred!]}</span>
                    )}
                  </span>
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
