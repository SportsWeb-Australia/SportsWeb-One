import { useEffect, useMemo, useState } from "react";
import { useActiveClub } from "./ActiveClub";
import {
  CHECK_TYPES,
  COMPLIANCE_ROLES,
  ROLE_LABEL,
  isRequired,
  type CheckTypeKey,
  type ComplianceRequirementOverride,
} from "../lib/complianceTypes";
import { listComplianceRequirementOverrides, setComplianceRequirement, resetComplianceRequirements } from "../lib/complianceRequirements";

/**
 * Which checks does each role need at THIS club? A grid over the platform
 * default (src/lib/complianceTypes.ts PLATFORM_REQUIRED_ROLES) — tick a box
 * to require a check for a role here, untick to say this club doesn't need
 * it. Cells with no explicit choice for this club follow the platform
 * default (shown as "· default" underneath).
 */
export function ComplianceSettings({ onBack }: { onBack: () => void }) {
  const { clubId } = useActiveClub();
  const [overrides, setOverrides] = useState<ComplianceRequirementOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const load = () => {
    if (!clubId) return;
    setLoading(true);
    listComplianceRequirementOverrides(clubId).then((o) => {
      setOverrides(o);
      setLoading(false);
    });
  };
  useEffect(load, [clubId]);

  const overrideMap = useMemo(() => {
    const m = new Map<string, boolean>();
    overrides.forEach((o) => m.set(`${o.role}:${o.check_type}`, o.required));
    return m;
  }, [overrides]);

  async function toggle(role: string, checkType: CheckTypeKey) {
    if (!clubId) return;
    const key = `${role}:${checkType}`;
    const next = !isRequired(overrides, role, checkType);
    setBusyKey(key);
    setOverrides((prev) => [...prev.filter((o) => !(o.role === role && o.check_type === checkType)), { role, check_type: checkType, required: next }]);
    await setComplianceRequirement(clubId, role, checkType, next);
    setBusyKey(null);
  }

  async function handleReset() {
    if (!clubId) return;
    if (!window.confirm("Clear every custom rule and go back to the platform defaults for this club?")) return;
    setResetting(true);
    await resetComplianceRequirements(clubId);
    setResetting(false);
    load();
  }

  if (loading) return <div className="sw-admin-loading">Loading compliance settings…</div>;

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2>Compliance settings</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {overrides.length > 0 && (
            <button className="sw-btn sw-btn--sm sw-btn--ghost" disabled={resetting} onClick={handleReset}>
              {resetting ? "Resetting…" : "Reset to defaults"}
            </button>
          )}
          <button className="sw-btn sw-btn--sm" onClick={onBack}>Back to register</button>
        </div>
      </div>
      <p className="sw-admin-note">
        Which checks does each role need at your club? Ticked = required — someone in that role without a valid check
        shows up as at risk in the compliance register. These are sensible defaults for most clubs; untick anything
        your club doesn't need, or tick on extras (e.g. RSA for volunteers who run the bar).
      </p>

      <div style={{ overflowX: "auto" }}>
        <table className="sw-admin-table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Check</th>
              {COMPLIANCE_ROLES.map((role) => (
                <th key={role} style={{ textAlign: "center", fontWeight: 500, whiteSpace: "nowrap" }}>{ROLE_LABEL[role] ?? role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHECK_TYPES.map(([checkType, label]) => (
              <tr key={checkType}>
                <td style={{ fontWeight: 600 }}>{label}</td>
                {COMPLIANCE_ROLES.map((role) => {
                  const key = `${role}:${checkType}`;
                  const checked = isRequired(overrides, role, checkType);
                  const customised = overrideMap.has(key);
                  return (
                    <td key={role} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={busyKey === key}
                        onChange={() => toggle(role, checkType)}
                        title={customised ? "Custom for this club" : "Platform default"}
                      />
                      {customised && <div style={{ fontSize: 10, color: "#7a2e2e" }}>custom</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
