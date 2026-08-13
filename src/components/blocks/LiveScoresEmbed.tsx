import { useEffect, useRef } from "react";
import type { ClubConfig } from "../../content/types";

/**
 * Auto-embeds the Live Scores module on the homepage the moment a club has it
 * enabled (club_modules) — no manual embed-code step. Gated the same way as
 * everything else module-driven: enabledModules.includes(key), the one source of
 * truth (see SW1's own entitlement.ts rule 9 / F2-design-doc sec 4). Points at the
 * club's clubId with no matchId, so the Live Scores app auto-picks whichever match
 * that club updated most recently.
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
    <section className="sw-section sw-section--alt">
      <div className="sw-container">
        <iframe
          ref={iframeRef}
          src={src}
          title="Live Scores"
          loading="lazy"
          style={{ width: "100%", minHeight: 500, border: 0, borderRadius: 18 }}
        />
      </div>
    </section>
  );
}
