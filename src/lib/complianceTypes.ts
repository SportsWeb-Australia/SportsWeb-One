/**
 * Shared compliance check-type catalog. Single source of truth for the check
 * types clubs can record (MemberDetail's Compliance tab) and for what each
 * role is expected to hold (ComplianceReport's risk register).
 *
 * PLATFORM_REQUIRED_ROLES is the reasonable default across community sport,
 * not a per-sport/state rulebook — clubs vary (a lacrosse club doesn't need
 * umpire accreditation the way AFL does, some states fold police checks into
 * WWCC, etc). Individual clubs can override it — see club_compliance_requirements
 * (supabase/compliance-club-requirements.sql) and computeEffectiveRequirements
 * below, which merges the platform default with a club's own overrides.
 * "Optional" types (not in PLATFORM_REQUIRED_ROLES, and not overridden on for
 * a role) are still tracked (recorded, expiry-flagged) but nobody is marked
 * "at risk" for lacking one, since no role requires it.
 *
 * The equivalent merge logic lives server-side too, in
 * supabase/compliance-club-requirements.sql (compliance_risk_count /
 * compliance_alert_targets) — keep the two in sync if you change either.
 */

export type CheckTypeKey =
  | "wwcc"
  | "police_check"
  | "first_aid"
  | "cpr"
  | "coach_accreditation"
  | "trainer_accreditation"
  | "official_accreditation"
  | "safeguarding"
  | "anti_doping"
  | "rsa"
  | "food_safety"
  | "other";

export const CHECK_TYPES: [CheckTypeKey, string][] = [
  ["wwcc", "Working with Children Check"],
  ["police_check", "Police check"],
  ["first_aid", "First aid"],
  ["cpr", "CPR / resuscitation"],
  ["coach_accreditation", "Coach accreditation"],
  ["trainer_accreditation", "Sports trainer accreditation"],
  ["official_accreditation", "Umpire / official accreditation"],
  ["safeguarding", "Member protection / safeguarding training"],
  ["anti_doping", "Anti-doping / sport integrity training"],
  ["rsa", "RSA (Responsible Service of Alcohol)"],
  ["food_safety", "Food safety handling"],
  ["other", "Other"],
];

export const CHECK_TYPE_LABEL: Record<CheckTypeKey, string> = Object.fromEntries(CHECK_TYPES) as Record<CheckTypeKey, string>;

/** Every role compliance tracking applies to — fixed, not affected by per-club overrides (a club can change WHICH checks a role needs, not add new roles to the register). */
export const COMPLIANCE_ROLES = [
  "coach", "assistant_coach", "team_manager", "trainer", "committee", "volunteer", "official", "administrator",
];
export const ROLE_LABEL: Record<string, string> = {
  coach: "Coach", assistant_coach: "Assistant coach", team_manager: "Team manager", trainer: "Trainer",
  committee: "Committee", volunteer: "Volunteer", official: "Official", administrator: "Administrator",
};

/** Platform-default roles that must hold each check type. Clubs can override per role/check-type — see computeEffectiveRequirements. */
export const PLATFORM_REQUIRED_ROLES: Partial<Record<CheckTypeKey, string[]>> = {
  wwcc: ["coach", "assistant_coach", "team_manager", "trainer", "committee", "volunteer", "official", "administrator"],
  coach_accreditation: ["coach", "assistant_coach"],
  trainer_accreditation: ["trainer"],
  first_aid: ["trainer"],
  official_accreditation: ["official"],
  safeguarding: ["committee", "administrator"],
};

export interface ComplianceRequirementOverride {
  role: string;
  check_type: CheckTypeKey;
  required: boolean;
}

/**
 * Merge the platform default with a club's overrides: default MINUS any
 * (role, check_type) explicitly turned off, PLUS any explicitly turned on.
 * Mirrors the `requirements`/`req` CTEs in compliance-club-requirements.sql.
 */
export function computeEffectiveRequirements(
  overrides: ComplianceRequirementOverride[],
): Partial<Record<CheckTypeKey, string[]>> {
  const byType = new Map<CheckTypeKey, Set<string>>();
  for (const [checkType, roles] of Object.entries(PLATFORM_REQUIRED_ROLES) as [CheckTypeKey, string[]][]) {
    byType.set(checkType, new Set(roles));
  }
  for (const o of overrides) {
    const set = byType.get(o.check_type) ?? new Set<string>();
    if (o.required) set.add(o.role);
    else set.delete(o.role);
    byType.set(o.check_type, set);
  }
  const out: Partial<Record<CheckTypeKey, string[]>> = {};
  for (const [checkType, set] of byType) {
    if (set.size > 0) out[checkType] = Array.from(set);
  }
  return out;
}

/** Whether a club's effective rules require this role to hold this check type. */
export function isRequired(
  overrides: ComplianceRequirementOverride[],
  role: string,
  checkType: CheckTypeKey,
): boolean {
  const o = overrides.find((x) => x.role === role && x.check_type === checkType);
  if (o) return o.required;
  return (PLATFORM_REQUIRED_ROLES[checkType] ?? []).includes(role);
}

export type CheckState = "valid" | "expiring" | "expired" | "missing";
export const CHECK_STATE_ORDER: CheckState[] = ["missing", "expired", "expiring", "valid"];
export const EXPIRING_DAYS = 60;

export type ComplianceRecord = { person_id: string; check_type: string; expires_on: string | null; status: string | null };

/** Best state across a person's records of one check type. "missing" only if they hold none. */
export function checkStateFor(recs: ComplianceRecord[], checkType: string): CheckState {
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

export const STATE_LABEL: Record<CheckState, string> = { valid: "Done", expiring: "Coming up", expired: "Expired", missing: "At risk" };
export const STATE_TONE: Record<CheckState, string> = { valid: "ok", expiring: "warn", expired: "bad", missing: "bad" };
