import { createClient } from "@supabase/supabase-js";

/**
 * Write-side bridge to the Team Line-Ups app — a separate product in a separate
 * Supabase project. Mirror of that app's read-only bridge back to us.
 *
 * Team Line-Ups has its own `clubs` table with its own ids, because it is also
 * sold standalone to clubs that are not on SportsWeb One. The link is a nullable
 * `clubs.sportsweb_club_id` on its side; `link_sportsweb_club()` creates the club
 * on first use and mirrors whether we have the module switched on.
 *
 * Entitlement is PUSHED rather than pulled: that app answers "is this club
 * entitled?" from its own row, so a page load there never waits on us and keeps
 * working if we're down. See docs/team-lineups-integration.md.
 *
 * The publishable key is public by design — it is already shipped in that app's
 * browser bundle, exactly as its bridge hardcodes ours.
 */
const LINEUPS_URL = "https://wnxaydyhzwwrdwdmimab.supabase.co";
const LINEUPS_PUBLISHABLE_KEY = "sb_publishable_8mBsFAf0wC9c5gxxHS5m4A_OEsH_zlB";

const lineups = createClient(LINEUPS_URL, LINEUPS_PUBLISHABLE_KEY);

/**
 * Create-or-link this club in Team Line-Ups and mirror its entitlement.
 *
 * Idempotent — safe to call on every toggle. Returns null on failure, and the
 * caller should treat that as non-fatal: the SportsWeb-side switch is the record
 * of truth, and the next toggle (or a manual link) can reconcile. Never block
 * switching a module on because a second product was unreachable.
 */
export async function syncTeamLineupsClub(
  sw1ClubId: string,
  clubName: string,
  entitled: boolean,
): Promise<string | null> {
  const { data, error } = await lineups.rpc("link_sportsweb_club", {
    p_sw1_club_id: sw1ClubId,
    p_name: clubName,
    p_entitled: entitled,
  });
  if (error) {
    console.error("Team Line-Ups link failed", error);
    return null;
  }
  return (data as string | null) ?? null;
}
