import { useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Mounts the SitePulse feedback widget on the club public site, gated by the
 * site's PUBLISH LIFECYCLE (ClubConfig.websiteStatus):
 *   - draft / not-yet-published (review window): show to EVERYONE with the link,
 *     so committee/testers can leave feedback.
 *   - published / live: show ONLY to an authenticated admin of THIS club
 *     (is_platform_admin OR is_super_admin OR is_club_admin(club_id), via the
 *     is_site_admin RPC). A public/anonymous visitor to a live site never sees it.
 *
 * The switch is automatic on Publish -- no manual toggle. The widget only ever
 * injects when a real club has resolved (clubId set), and is rendered only inside
 * the club public-site layout in App.tsx (never admin chrome). Keyed off club_id.
 *
 * NOTE (dependency): non-admin "public in draft" feedback only has an audience once
 * a shareable read-only draft preview exists -- today draft sites are admin-only to
 * view. Until then the draft branch effectively reaches admins previewing the draft.
 */
export function SitePulseWidget({
  clubId,
  websiteStatus,
}: {
  clubId?: string;
  websiteStatus?: "draft" | "published" | "suspended";
}) {
  useEffect(() => {
    if (!clubId || !supabase) return; // no real club resolved / no client -> nothing
    if (document.getElementById("sitepulse-widget-script")) return; // inject once
    const sb = supabase;
    let cancelled = false;

    const inject = () => {
      if (cancelled || document.getElementById("sitepulse-widget-script")) return;
      const s = document.createElement("script");
      s.id = "sitepulse-widget-script";
      s.src = "/sitepulse-widget.js";
      s.async = true;
      s.setAttribute("data-club-id", clubId);
      document.body.appendChild(s);
    };

    if (websiteStatus === "published") {
      // Live site: admin-only. Anonymous/non-admin visitors must never see it.
      (async () => {
        const { data: { session } } = await sb.auth.getSession();
        if (cancelled || !session) return;
        const { data: allowed, error } = await sb.rpc("is_site_admin", { p_club_id: clubId });
        if (cancelled || error || allowed !== true) return;
        inject();
      })();
    } else {
      // Draft / review window (not yet published): open to anyone with the link.
      inject();
    }

    return () => {
      cancelled = true;
    };
  }, [clubId, websiteStatus]);

  return null;
}
