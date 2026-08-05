import { supabase } from "./supabase";

// Content version history: restore points captured before every publish (and on
// demand), so a bad or wrong-club publish can be undone. Backed by
// public.club_content_versions + the save/restore RPCs (see
// supabase/club-content-versions.sql).

export type VersionKind = "pre_publish" | "manual" | "pre_restore" | string;

export interface SiteVersion {
  id: string;
  clubId: string;
  kind: VersionKind;
  note: string | null;
  actor: string | null;
  createdAt: string;
}

/** Most-recent-first list of a club's restore points. */
export async function listVersions(clubId: string, limit = 40): Promise<SiteVersion[]> {
  if (!supabase || !clubId) return [];
  const { data, error } = await supabase
    .from("club_content_versions")
    .select("id, club_id, kind, note, actor, created_at")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    clubId: r.club_id as string,
    kind: r.kind as VersionKind,
    note: (r.note as string | null) ?? null,
    actor: (r.actor as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

/** Snapshot the current live content as a named restore point. Returns its id. */
export async function saveRestorePoint(clubId: string, note?: string): Promise<string> {
  if (!supabase) throw new Error("Not available right now.");
  const { data, error } = await supabase.rpc("save_content_restore_point", {
    p_club_id: clubId,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** Roll the live content back to a restore point. Returns keys restored. */
export async function restoreVersion(versionId: string): Promise<number> {
  if (!supabase) throw new Error("Not available right now.");
  const { data, error } = await supabase.rpc("restore_content_version", { p_version_id: versionId });
  if (error) throw error;
  return (data as number) ?? 0;
}

/** Newest "before this publish" restore point for a club, or null. Used for one-tap undo. */
export async function newestUndoPoint(clubId: string): Promise<SiteVersion | null> {
  if (!supabase || !clubId) return null;
  const { data, error } = await supabase
    .from("club_content_versions")
    .select("id, club_id, kind, note, actor, created_at")
    .eq("club_id", clubId)
    .eq("kind", "pre_publish")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id as string,
    clubId: data.club_id as string,
    kind: data.kind as VersionKind,
    note: (data.note as string | null) ?? null,
    actor: (data.actor as string | null) ?? null,
    createdAt: data.created_at as string,
  };
}
