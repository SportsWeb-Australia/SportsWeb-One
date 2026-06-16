import { supabase } from "./supabase";

export interface AdminClub {
  id: string;
  name: string;
  slug: string;
}

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

export async function setModuleStatus(clubId: string, moduleKey: string, status: "enabled" | "locked" | "trial"): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const { error } = await supabase.rpc("admin_set_module", { p_club: clubId, p_key: moduleKey, p_status: status });
  return error ? error.message : null;
}
