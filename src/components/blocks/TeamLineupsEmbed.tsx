import type { ClubConfig } from "../../content/types";
import { getModule } from "../../lib/modules";

/**
 * Auto-embeds the Team Line-Ups public graphic inside the Match Centre block the
 * moment a club has the module enabled (club_modules) — same pattern as
 * FixturesLadderEmbed/LiveScoresEmbed right next to it: no manual embed-code
 * step, gated off enabledModules.includes(key), the one source of truth.
 *
 * Unlike those two, the line-ups app sends no resize postMessage (it renders a
 * fixed field graphic, not a variable-height table), so this uses a fixed aspect
 * ratio instead of a resize listener. Base URL comes from MODULE_CATALOG (the
 * same entry AdminModules' "Open" link uses) rather than a second hardcoded
 * copy — `?admin` is stripped off and swapped for `?embed=1&sw1club=`.
 * `sw1club`, never `club`: `?club=` is the app's own internal id and silently
 * resolves to nothing — see docs/team-lineups-integration.md.
 *
 * Renders bare (no section/container wrapper) — MatchCentre supplies that.
 */
export function TeamLineupsEmbed({ club }: { club: ClubConfig }) {
  const enabled = (club.enabledModules ?? []).includes("team_lineups");
  const base = getModule("team_lineups")?.appUrl?.split("?")[0];

  if (!enabled || !base || !club.clubId) return null;

  const src = `${base}?embed=1&sw1club=${encodeURIComponent(club.clubId)}`;

  return (
    <iframe
      src={src}
      title="Team Line-Ups"
      loading="lazy"
      style={{ width: "100%", aspectRatio: "3 / 4", border: 0, borderRadius: 18, background: "transparent", marginBottom: 20 }}
    />
  );
}
