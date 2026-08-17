import { supabase } from "./supabase";
import type { CheckTypeKey, ComplianceRequirementOverride } from "./complianceTypes";

/** This club's overrides to the platform-default requirement matrix (empty = pure defaults). */
export async function listComplianceRequirementOverrides(clubId: string): Promise<ComplianceRequirementOverride[]> {
  if (!supabase || !clubId) return [];
  const { data, error } = await supabase
    .from("club_compliance_requirements")
    .select("role, check_type, required")
    .eq("club_id", clubId);
  if (error || !data) return [];
  return data as ComplianceRequirementOverride[];
}

/** Turn a role/check-type requirement on or off for this club. */
export async function setComplianceRequirement(
  clubId: string,
  role: string,
  checkType: CheckTypeKey,
  required: boolean,
): Promise<string | null> {
  if (!supabase) return "Not connected.";
  const { error } = await supabase
    .from("club_compliance_requirements")
    .upsert({ club_id: clubId, role, check_type: checkType, required }, { onConflict: "club_id,role,check_type" });
  return error ? error.message : null;
}

/** Clear all overrides for this club — back to the platform defaults. */
export async function resetComplianceRequirements(clubId: string): Promise<string | null> {
  if (!supabase) return "Not connected.";
  const { error } = await supabase.from("club_compliance_requirements").delete().eq("club_id", clubId);
  return error ? error.message : null;
}
