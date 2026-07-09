import { useEffect } from "react";

/**
 * Mounts the public-site SitePulse feedback widget, tagged with THIS club's id.
 * The widget itself is a self-contained shadow-DOM script served statically from
 * /sitepulse-widget.js (isolated styles, no deps); this component just injects
 * the <script data-club-id> once the club id is known.
 *
 * Only rendered inside the club public-site layout in App.tsx -- never in the
 * admin chrome. Keyed off club_id (the widget POSTs to sitepulse-ingest).
 */
export function SitePulseWidget({ clubId }: { clubId?: string }) {
  useEffect(() => {
    if (!clubId) return; // no club context resolved yet -> don't render
    if (document.getElementById("sitepulse-widget-script")) return; // inject once
    const s = document.createElement("script");
    s.id = "sitepulse-widget-script";
    s.src = "/sitepulse-widget.js";
    s.async = true;
    s.setAttribute("data-club-id", clubId);
    document.body.appendChild(s);
  }, [clubId]);

  return null;
}
