import { useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Mounts the SitePulse feedback widget on the club public site -- but ADMIN ONLY.
 * A public / anonymous visitor (no session, or a non-admin) never sees it. We
 * only inject the widget when the signed-in viewer is an admin for THIS club:
 * is_platform_admin() OR is_super_admin() OR is_club_admin(club_id), checked via
 * the is_site_admin(p_club_id) RPC.
 *
 * The widget itself is a self-contained shadow-DOM script served from
 * /sitepulse-widget.js. Rendered only inside the club public-site layout in
 * App.tsx (never in admin chrome). Keyed off club_id.
 */
export function SitePulseWidget({ clubId }: { clubId?: string }) {
  useEffect(() => {
    if (!clubId || !supabase) return; // no club resolved / no client -> nothing
    if (document.getElementById("sitepulse-widget-script")) return; // inject once
    const sb = supabase;
    let cancelled = false;

    (async () => {
      // Admin-only gate: an anonymous/public visitor must never see the widget.
      const { data: { session } } = await sb.auth.getSession();
      if (cancelled || !session) return;
      // ...and only an admin for THIS specific club.
      const { data: allowed, error } = await sb.rpc("is_site_admin", { p_club_id: clubId });
      if (cancelled || error || allowed !== true) return;

      if (document.getElementById("sitepulse-widget-script")) return;
      const s = document.createElement("script");
      s.id = "sitepulse-widget-script";
      s.src = "/sitepulse-widget.js";
      s.async = true;
      s.setAttribute("data-club-id", clubId);
      document.body.appendChild(s);
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId]);

  return null;
}
