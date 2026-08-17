/**
 * Shared compliance check-type catalog. Single source of truth for the check
 * types clubs can record (MemberDetail's Compliance tab) and for what each
 * role is expected to hold (ComplianceReport's risk register).
 *
 * The role → required-checks matrix is a reasonable default across community
 * sport, not a per-sport/state rulebook — clubs vary (a lacrosse club doesn't
 * need umpire accreditation the way AFL does, some states fold police checks
 * into WWCC, etc). There's no per-club override today; tune the matrix below
 * if a club's real requirements differ. "Optional" types are still tracked
 * (recorded, expiry-flagged) but nobody is marked "at risk" for lacking one,
 * since no role here is defined to require it.
 *
 * The equivalent requirement matrix lives server-side too, in
 * supabase/compliance-completion.sql (compliance_risk_count /
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

/** Roles that must hold each check type for the club to be "covered". Drives the missing/at-risk count. */
export const REQUIRED_ROLES: Partial<Record<CheckTypeKey, string[]>> = {
  wwcc: ["coach", "assistant_coach", "team_manager", "trainer", "committee", "volunteer", "official", "administrator"],
  coach_accreditation: ["coach", "assistant_coach"],
  trainer_accreditation: ["trainer"],
  first_aid: ["trainer"],
  official_accreditation: ["official"],
  safeguarding: ["committee", "administrator"],
};

/** Every role that has at least one required check — the population ComplianceReport tracks. */
export const COMPLIANCE_ROLES = Array.from(new Set(Object.values(REQUIRED_ROLES).flat()));

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
