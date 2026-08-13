import { useEffect, useRef } from "react";
import type { ClubConfig } from "../../content/types";

/**
 * Auto-embeds Fixtures & Ladder inside the Match Centre block the moment a club has
 * the module enabled (club_modules) — same pattern as LiveScoresEmbed right next to
 * it: no manual embed-code step, gated off enabledModules.includes(key), the one
 * source of truth. Renders bare (no section/container wrapper) — MatchCentre
 * supplies that.
 */
export function FixturesLadderEmbed({ club }: { club: ClubConfig }) {
  const enabled = (club.enabledModules ?? []).includes("fixtures-ladder");
  const appUrl = club.platform?.fixturesLadderAppUrl;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!event.data || event.data.type !== "sportsweb-fixtures-resize") return;
      if (iframeRef.current) iframeRef.current.style.height = `${Number(event.data.height) || 400}px`;
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!enabled || !appUrl || !club.clubId) return null;

  const src = `${appUrl}${appUrl.includes("?") ? "&" : "?"}mode=public&clubId=${club.clubId}`;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title="Fixtures & Ladder"
      loading="lazy"
      style={{ width: "100%", minHeight: 400, border: 0, borderRadius: 18, background: "transparent", marginBottom: 20 }}
    />
  );
}
