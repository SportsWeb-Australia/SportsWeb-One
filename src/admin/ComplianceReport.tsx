import { useEffect, useMemo, useState } from "react";
import { useActiveClub } from "./ActiveClub";
import { supabase } from "../lib/supabase";
import { listClubMembers, type ClubMember } from "../lib/people";
import { listComplianceRequirementOverrides } from "../lib/complianceRequirements";
import {
  CHECK_TYPES,
  CHECK_TYPE_LABEL,
  COMPLIANCE_ROLES,
  CHECK_STATE_ORDER,
  EXPIRING_DAYS,
  checkStateFor,
  computeEffectiveRequirements,
  STATE_LABEL,
  STATE_TONE,
  type CheckTypeKey,
  type CheckState,
  type ComplianceRecord,
  type ComplianceRequirementOverride,
} from "../lib/complianceTypes";

// Club-wide compliance register: every check type a role requires (WWCC, coach
// accreditation, first aid...), plus anything else a club chooses to record
// (RSA, food safety...), rolled up into what's Done / Coming up / Expired /
// At risk. Which checks each role requires can be customised per club — see
// ComplianceSettings.tsx and src/lib/complianceTypes.ts.

type Item = {
  personId: string;
  fullName: string;
  roles: string[];
  checkType: CheckTypeKey;
  state: CheckState;
  expiresOn: string | null;
  required: boolean;
};

type Bucket = "attention" | CheckState;

export function ComplianceReport({ onOpen, onOpenSettings }: { onOpen: (personId: string) => void; onOpenSettings: () => void }) {
  const { clubId } = useActiveClub();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [comp, setComp] = useState<ComplianceRecord[]>([]);
  const [overrides, setOverrides] = useState<ComplianceRequirementOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState<Bucket>("attention");
  const [typeFilter, setTypeFilter] = useState<CheckTypeKey | "all">("all");

  useEffect(() => {
    if (!clubId || !supabase) return;
    setLoading(true);
    Promise.all([
      listClubMembers(clubId),
      supabase.from("compliance_records").select("person_id, check_type, expires_on, status").eq("club_id", clubId),
      listComplianceRequirementOverrides(clubId),
    ]).then(([mem, cRes, ovr]) => {
      setMembers(mem);
      setComp(((cRes.data as ComplianceRecord[]) ?? []));
      setOverrides(ovr);
      setLoading(false);
    });
  }, [clubId]);

  const effectiveRequired = useMemo(() => computeEffectiveRequirements(overrides), [overrides]);
  const trackedOnlyTypes = useMemo(
    () => CHECK_TYPES.map(([k]) => k).filter((k) => !effectiveRequired[k]),
    [effectiveRequired],
  );

  const items = useMemo<Item[]>(() => {
    const byPerson = new Map<string, ComplianceRecord[]>();
    for (const c of comp) {
      const arr = byPerson.get(c.person_id) ?? [];
      arr.push(c);
      byPerson.set(c.person_id, arr);
    }
    const out: Item[] = [];

    // Required: every person holding a role that needs this check type (this club's effective rules).
    for (const m of members) {
      if (m.isMinor) continue;
      const recs = byPerson.get(m.personId) ?? [];
      for (const [checkType, roles] of Object.entries(effectiveRequired) as [CheckTypeKey, string[]][]) {
        if (!m.roles.some((r) => roles.includes(r))) continue;
        out.push({
          personId: m.personId,
          fullName: m.fullName,
          roles: m.roles,
          checkType,
          state: checkStateFor(recs, checkType),
          expiresOn: recs.find((r) => r.check_type === checkType)?.expires_on ?? null,
          required: true,
        });
      }
    }

    // Tracked-only: not required by any role, but shown (and expiry-flagged) for
    // whoever actually has one on file. Never "missing" — nobody's assigned it.
    for (const checkType of trackedOnlyTypes) {
      const holders = new Set(comp.filter((c) => c.check_type === checkType).map((c) => c.person_id));
      for (const personId of holders) {
        const m = members.find((x) => x.personId === personId);
        if (!m) continue;
        const recs = byPerson.get(personId) ?? [];
        out.push({
          personId,
          fullName: m.fullName,
          roles: m.roles,
          checkType,
          state: checkStateFor(recs, checkType),
          expiresOn: recs.find((r) => r.check_type === checkType)?.expires_on ?? null,
          required: false,
        });
      }
    }

    return out.sort((a, b) => {
      const s = CHECK_STATE_ORDER.indexOf(a.state) - CHECK_STATE_ORDER.indexOf(b.state);
      return s !== 0 ? s : a.fullName.localeCompare(b.fullName);
    });
  }, [members, comp, effectiveRequired, trackedOnlyTypes]);

  const counts = useMemo(() => {
    const c = { valid: 0, expiring: 0, expired: 0, missing: 0 };
    items.forEach((i) => { c[i.state]++; });
    return c;
  }, [items]);
  const needsAttention = counts.expiring + counts.expired + counts.missing;

  const typesInUse = useMemo(
    () => CHECK_TYPES.filter(([k]) => items.some((i) => i.checkType === k)),
    [items],
  );

  const visible = useMemo(() => {
    return items
      .filter((i) => (bucket === "attention" ? i.state !== "valid" : i.state === bucket))
      .filter((i) => typeFilter === "all" || i.checkType === typeFilter);
  }, [items, bucket, typeFilter]);

  function exportCsv() {
    const header = ["Name", "Roles", "Check type", "Required", "Status", "Expires"];
    const lines = items.map((i) => [
      i.fullName,
      i.roles.filter((r) => COMPLIANCE_ROLES.includes(r)).join("; "),
      CHECK_TYPE_LABEL[i.checkType],
      i.required ? "Yes" : "No",
      STATE_LABEL[i.state],
      i.expiresOn ?? "",
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

  const BUCKETS: { key: Bucket; label: string; n: number; color: string }[] = [
    { key: "valid", label: "Done", n: counts.valid, color: "#16a06a" },
    { key: "expiring", label: `Coming up (≤${EXPIRING_DAYS}d)`, n: counts.expiring, color: "#c0801a" },
    { key: "expired", label: "Expired", n: counts.expired, color: "#dc4a45" },
    { key: "missing", label: "At risk", n: counts.missing, color: "#dc4a45" },
  ];

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2>Compliance register</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sw-btn sw-btn--sm sw-btn--ghost" onClick={onOpenSettings}>Settings</button>
          {items.length > 0 && <button className="sw-btn sw-btn--sm" onClick={exportCsv}>Export CSV</button>}
        </div>
      </div>
      <p className="sw-admin-note">
        WWCC, coach/trainer accreditation, first aid, and anything else you record against a role — what&apos;s done,
        what&apos;s coming up for renewal, what&apos;s expired, and who&apos;s missing something their role requires.
        Record checks on each member&apos;s profile → Compliance tab.
      </p>

      <div className="sw-sales-rungs" style={{ marginBottom: 12 }}>
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            className="sw-stat"
            style={{ border: bucket === b.key ? "2px solid #333" : "1px solid transparent", cursor: "pointer", background: "none" }}
            onClick={() => setBucket((cur) => (cur === b.key ? "attention" : b.key))}
          >
            <div className="sw-stat-n" style={{ color: b.color }}>{b.n}</div>
            <div className="sw-stat-l">{b.label}</div>
          </button>
        ))}
      </div>

      {typesInUse.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <button
            className="sw-pay"
            style={{ cursor: "pointer", border: typeFilter === "all" ? "2px solid #333" : "1px solid #e6e8ee", background: "#fff" }}
            onClick={() => setTypeFilter("all")}
          >
            All types
          </button>
          {typesInUse.map(([k, label]) => (
            <button
              key={k}
              className="sw-pay"
              style={{ cursor: "pointer", border: typeFilter === k ? "2px solid #333" : "1px solid #e6e8ee", background: "#fff" }}
              onClick={() => setTypeFilter(k)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="sw-admin-note">
          No one is in a role that requires a compliance check yet — add roles ({COMPLIANCE_ROLES.join(", ").replace(/_/g, " ")}) on member profiles to start tracking.
        </p>
      ) : visible.length === 0 ? (
        <p className="sw-admin-note" style={{ color: "#166534" }}>
          {bucket === "attention" ? "Nothing needs attention right now. 🎉" : "Nothing in this view."}
        </p>
      ) : (
        <>
          {bucket === "attention" && (
            <p className="sw-admin-note" style={{ fontWeight: 600, color: "#7a2e2e" }}>
              {needsAttention} {needsAttention === 1 ? "record needs" : "records need"} attention:
            </p>
          )}
          <div className="sw-md-list">
            {visible.map((i) => (
              <button
                key={`${i.personId}:${i.checkType}`}
                className="sw-md-compcard"
                style={{ textAlign: "left", width: "100%", border: "1px solid #e6e8ee", cursor: "pointer", background: "#fff" }}
                onClick={() => onOpen(i.personId)}
              >
                <div className="sw-md-roletop">
                  <strong>{i.fullName}</strong>
                  <span className={`sw-pay sw-pay--${STATE_TONE[i.state]}`}>{STATE_LABEL[i.state]}</span>
                </div>
                <div className="sw-md-rolemeta">
                  {CHECK_TYPE_LABEL[i.checkType]}
                  {i.expiresOn ? ` · expires ${i.expiresOn}` : ""}
                  {" · "}
                  {i.roles.filter((r) => COMPLIANCE_ROLES.includes(r)).map((r) => r.replace(/_/g, " ")).join(", ") || "role"}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
