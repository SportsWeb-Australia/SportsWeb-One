// ============================================================================
// siteMigrations.ts — data layer for the Site Migrations tracker.
// ----------------------------------------------------------------------------
// One row per club in public.site_migrations tracks the website host migration
// (Vercel -> Cloudflare Pages) or a green-field Cloudflare build. Reads go
// through the security_invoker views; writes go through the platform-admin
// guarded RPCs (start / step / status) plus a direct update for the free-text
// fields and the email safety toggle (all gated by is_platform_admin() in RLS).
//
// Mirrors the shape/error-handling convention of superAdmin.ts.
// ============================================================================
import { supabase } from "./supabase";

export type MigrationFlow = "migration" | "greenfield";

export type MigrationStatus =
  | "not_started"
  | "deploying"
  | "testing"
  | "dns_www"
  | "dns_redirect"
  | "verifying"
  | "complete"
  | "rolled_back";

export type StepKey =
  | "pages_deployed"
  | "pages_dev_tested"
  | "www_custom_domain_added"
  | "www_cname_set"
  | "root_redirect_set"
  | "live_verified"
  | "canonical_www_confirmed"
  | "vercel_domain_removed";

export type MigrationSteps = Record<StepKey, boolean>;

/** Ordered checklist (matches the SOP). `greenfieldHidden` hides the Vercel
 *  clean-up step for brand-new Cloudflare sites (no Vercel to remove). */
export const STEP_ORDER: { key: StepKey; label: string; greenfieldHidden?: boolean }[] = [
  { key: "pages_deployed", label: "Deploy to Pages" },
  { key: "pages_dev_tested", label: "Test .pages.dev" },
  { key: "www_custom_domain_added", label: "Add www custom domain" },
  { key: "www_cname_set", label: "Set www CNAME (VentraIP)" },
  { key: "root_redirect_set", label: "Set root redirect (VentraIP)" },
  { key: "live_verified", label: "Verify live" },
  { key: "canonical_www_confirmed", label: "Confirm canonical=www" },
  { key: "vercel_domain_removed", label: "Remove from Vercel", greenfieldHidden: true },
];

export const STATUS_ORDER: MigrationStatus[] = [
  "not_started",
  "deploying",
  "testing",
  "dns_www",
  "dns_redirect",
  "verifying",
  "complete",
  "rolled_back",
];

export const STATUS_LABEL: Record<MigrationStatus, string> = {
  not_started: "Not started",
  deploying: "Deploying",
  testing: "Testing",
  dns_www: "DNS: www",
  dns_redirect: "DNS: redirect",
  verifying: "Verifying",
  complete: "Complete",
  rolled_back: "Rolled back",
};

/** Visible steps for a flow (green-field skips the Vercel clean-up). */
export function stepsForFlow(flow: MigrationFlow) {
  return flow === "greenfield" ? STEP_ORDER.filter((s) => !s.greenfieldHidden) : STEP_ORDER;
}

/** Count of ticked visible steps, e.g. { done: 5, total: 8 } for the "5/8" chip. */
export function stepProgress(steps: MigrationSteps | null | undefined, flow: MigrationFlow) {
  const visible = stepsForFlow(flow);
  const done = visible.filter((s) => !!steps?.[s.key]).length;
  return { done, total: visible.length };
}

// Row from public.site_migration_board (joins club name/slug).
export interface MigrationBoardRow {
  id: string;
  club_id: string;
  club_name: string;
  club_slug: string;
  flow: MigrationFlow;
  domain: string;
  status: MigrationStatus;
  steps: MigrationSteps;
  email_untouched_confirmed: boolean;
  www_cname_target: string | null;
  pages_project: string | null;
  repo: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

// Roll-up from public.site_migration_progress (for the dashboard card).
export interface MigrationProgress {
  total: number;
  completed: number;
  in_progress: number;
  not_started: number;
  migrations: number;
  greenfield: number;
  pct_complete: number | null;
}

/** Full row returned by the RPCs (site_migrations.*). */
export interface SiteMigrationRow {
  id: string;
  club_id: string;
  flow: MigrationFlow;
  domain: string;
  repo: string | null;
  pages_project: string | null;
  www_cname_target: string | null;
  source_host: string;
  target_host: string;
  status: MigrationStatus;
  steps: MigrationSteps;
  email_untouched_confirmed: boolean;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  updated_at: string;
}

// ── Reads ──────────────────────────────────────────────────────────────────

export async function listMigrations(): Promise<MigrationBoardRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("site_migration_board")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as MigrationBoardRow[];
}

export async function getMigrationProgress(): Promise<MigrationProgress | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_migration_progress").select("*").maybeSingle();
  if (error || !data) return null;
  return data as MigrationProgress;
}

/** One club's migration row (via the board view so club name/slug ride along). */
export async function getClubMigration(clubId: string): Promise<MigrationBoardRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_migration_board")
    .select("*")
    .eq("club_id", clubId)
    .maybeSingle();
  if (error || !data) return null;
  return data as MigrationBoardRow;
}

// ── Writes (platform-admin RPCs + guarded direct updates) ───────────────────

export async function startMigration(
  clubId: string,
  domain: string,
  flow: MigrationFlow,
  repo?: string | null
): Promise<{ row?: SiteMigrationRow; error?: string }> {
  if (!supabase) return { error: "Supabase not configured." };
  const { data, error } = await supabase.rpc("start_site_migration", {
    p_club_id: clubId,
    p_domain: domain.trim(),
    p_flow: flow,
    p_repo: repo?.trim() || null,
  });
  if (error) return { error: error.message };
  return { row: data as SiteMigrationRow };
}

export async function setStep(clubId: string, step: StepKey, done: boolean): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const { error } = await supabase.rpc("set_site_migration_step", {
    p_club_id: clubId,
    p_step: step,
    p_done: done,
  });
  return error ? error.message : null;
}

export async function setStatus(clubId: string, status: MigrationStatus): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const { error } = await supabase.rpc("set_site_migration_status", {
    p_club_id: clubId,
    p_status: status,
  });
  return error ? error.message : null;
}

/** Free-text fields + the email safety gate — direct update, RLS-guarded to
 *  platform admins. Only the provided keys are written. */
export async function updateMigrationFields(
  clubId: string,
  fields: Partial<{
    pages_project: string | null;
    www_cname_target: string | null;
    repo: string | null;
    domain: string;
    email_untouched_confirmed: boolean;
    notes: string | null;
  }>
): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const { error } = await supabase.from("site_migrations").update(fields).eq("club_id", clubId);
  return error ? error.message : null;
}
