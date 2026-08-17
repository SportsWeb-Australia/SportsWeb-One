import type { ClubConfig } from "../../content/types";
import { teamLineupsEmbedUrl } from "../../lib/modules";

/**
 * Auto-embeds the Team Line-Ups public graphic inside the Match Centre block the
 * moment a club has the module enabled (club_modules) — same pattern as
 * FixturesLadderEmbed/LiveScoresEmbed right next to it: no manual embed-code
 * step, gated off enabledModules.includes(key), the one source of truth.
 *
 * Unlike those two, the line-ups app sends no resize postMessage (it renders a
 * fixed field graphic, not a variable-height table), so this uses a fixed aspect
 * ratio instead of a resize listener.
 *
 * Renders bare (no section/container wrapper) — MatchCentre supplies that.
 */
export function TeamLineupsEmbed({ club }: { club: ClubConfig }) {
  const enabled = (club.enabledModules ?? []).includes("team_lineups");
  const src = teamLineupsEmbedUrl(club.clubId);

  if (!enabled || !src) return null;

  return (
    <iframe
      src={src}
      title="Team Line-Ups"
      loading="lazy"
      style={{ width: "100%", aspectRatio: "3 / 4", border: 0, borderRadius: 18, background: "transparent", marginBottom: 20 }}
    />
  );
}
