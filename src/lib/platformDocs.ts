// ============================================================================
// platformDocs.ts — data layer for DB-backed SOP / help docs.
// ----------------------------------------------------------------------------
// public.platform_docs holds markdown SOPs rendered by the styled in-app viewer
// (see admin/SopViewer.tsx). RLS lets platform admins read all rows and club
// users read visibility='club' rows. Docs carry onboarding_step_keys[] so the
// right SOP can be opened contextually from a club's onboarding step.
// ============================================================================
import { supabase } from "./supabase";

export interface PlatformDoc {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  body_md: string;
  visibility: "platform_admin" | "club";
  roles: string[];
  onboarding_step_keys: string[];
  icon: string | null;
  sort_order: number;
  status: "draft" | "published";
  updated_at: string;
}

const COLS =
  "id,slug,title,category,summary,body_md,visibility,roles,onboarding_step_keys,icon,sort_order,status,updated_at";

/** Published docs, ordered for a Help index. */
export async function listPlatformDocs(): Promise<PlatformDoc[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("platform_docs")
    .select(COLS)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (error || !data) return [];
  return data as PlatformDoc[];
}

/** A single doc by slug (e.g. 'migrate-vercel-to-cloudflare'). */
export async function getPlatformDoc(slug: string): Promise<PlatformDoc | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("platform_docs").select(COLS).eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return data as PlatformDoc;
}

/** The first published doc linked to an onboarding step key (e.g. 'hosting_dns'). */
export async function getDocForStep(stepKey: string): Promise<PlatformDoc | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("platform_docs")
    .select(COLS)
    .contains("onboarding_step_keys", [stepKey])
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as PlatformDoc;
}
