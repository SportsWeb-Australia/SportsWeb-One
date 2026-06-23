import { supabase } from "./supabase";

export interface ClubRetention {
  have_two_seasons: boolean;
  current_season: string | null;
  previous_season: string | null;
  members_prev: number;
  members_curr: number;
  retained: number;
  new: number;
  churned: number;
  retention_rate: number;
  churn_rate: number;
}

/** Season-over-season player retention for one club. */
export async function clubRetention(clubId: string): Promise<ClubRetention | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("club_retention", { p_club_id: clubId });
  if (error || !data) return null;
  return data as ClubRetention;
}

export interface PlatformRetention {
  members_prev: number;
  retained: number;
  retention_rate: number;
}

/** Aggregate returning-player rate across every club (platform admins only). */
export async function platformRetention(): Promise<PlatformRetention | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("platform_retention");
  if (error || !data) return null;
  return data as PlatformRetention;
}
