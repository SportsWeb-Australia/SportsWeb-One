import { useEffect, useRef } from "react";
import type { ClubConfig } from "../../content/types";

/**
 * Auto-embeds Live Scores inside the Match Centre block the moment a club has the
 * module enabled (club_modules) — no manual embed-code step, and it lives where a
 * visitor actually expects live/current match info, alongside fixtures/results/
 * ladder. Gated the same way as everything else module-driven:
 * enabledModules.includes(key), the one source of truth (see SW1's own
 * entitlement.ts rule 9 / F2-design-doc sec 4). Points at the club's clubId with no
 * matchId, so the Live Scores app auto-picks whichever match was updated most
 * recently. Renders bare (no section/container wrapper) — MatchCentre supplies that.
 */
export function LiveScoresEmbed({ club }: { club: ClubConfig }) {
  const enabled = (club.enabledModules ?? []).includes("live-scores");
  const appUrl = club.platform?.liveScoresAppUrl;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!event.data || event.data.type !== "sportsweb-live-scores-resize") return;
      if (iframeRef.current) iframeRef.current.style.height = `${Number(event.data.height) || 500}px`;
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
      title="Live Scores"
      loading="lazy"
      style={{ width: "100%", minHeight: 500, border: 0, borderRadius: 18, background: "transparent", marginBottom: 20 }}
    />
  );
}
