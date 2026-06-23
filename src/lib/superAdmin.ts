import { supabase } from "./supabase";

export interface AdminClub {
  id: string;
  name: string;
  slug: string;
  sport_type?: string | null;
  account_status?: string | null;
  plan?: string | null;
}

/** Canonical option lists for the Clubs & Modules setters (free-form in the DB,
 *  so add more here any time without a migration). */
export const ACCOUNT_STATUSES = ["demo", "trial", "active", "paused", "churned"] as const;
export const PLAN_TIERS = ["free", "starter", "growth", "pro", "association", "enterprise"] as const;

export interface AdminModuleRow {
  club_id: string;
  module_key: string;
  status: string;
}

export async function listClubs(): Promise<AdminClub[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("admin_list_clubs");
  if (error || !data) return [];
  return data as AdminClub[];
}

export async function listModuleStatuses(): Promise<AdminModuleRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("admin_list_modules");
  if (error || !data) return [];
  return data as AdminModuleRow[];
}

/** Classify a club: set its plan + account status (platform admins only). */
export async function setClubAccount(clubId: string, accountStatus: string, plan: string): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const { error } = await supabase.rpc("admin_set_club_account", {
    p_club_id: clubId,
    p_account_status: accountStatus,
    p_plan: plan,
  });
  return error ? error.message : null;
}

export async function setModuleStatus(clubId: string, moduleKey: string, status: "enabled" | "locked" | "trial"): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const { error } = await supabase.rpc("admin_set_module", { p_club: clubId, p_key: moduleKey, p_status: status });
  return error ? error.message : null;
}

export interface CreateClubInput {
  name: string;
  slug: string;
  primary: string;
  secondary: string;
  tertiary?: string;
  sport?: string;
  contact?: string;
  adminEmail?: string;
}

export interface CreateClubResult {
  slug: string;
  admin: "none" | "linked" | "no_account";
}

export async function createClub(input: CreateClubInput): Promise<{ result?: CreateClubResult; error?: string }> {
  if (!supabase) return { error: "Supabase not configured." };
  const { data, error } = await supabase.rpc("admin_create_club", {
    p_name: input.name.trim(),
    p_slug: input.slug.trim(),
    p_primary: input.primary,
    p_secondary: input.secondary,
    p_tertiary: input.tertiary?.trim() || null,
    p_contact: input.contact?.trim() || null,
    p_sport: input.sport?.trim() || "other",
    p_admin_email: input.adminEmail?.trim() || null,
  });
  if (error) return { error: error.message };
  return { result: data as CreateClubResult };
}
