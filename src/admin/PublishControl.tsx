import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type SiteStatus = "draft" | "published" | "suspended";

/**
 * Sidebar publish control — the single go-live toggle, paired with "View live
 * site" so preview + publish sit together. The only write is the SECURITY
 * DEFINER RPC set_website_status (gated server-side: club admins may toggle
 * draft/published only; suspended is platform-admin-only). Parent gates
 * visibility to admins; this component handles the three states + errors.
 */
export function PublishControl({
  clubId,
  status: initialStatus,
  isPlatformAdmin,
}: {
  clubId: string;
  status?: SiteStatus;
  isPlatformAdmin: boolean;
}) {
  const [status, setStatus] = useState<SiteStatus | undefined>(initialStatus);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Re-sync when the active club (or its loaded status) changes.
  useEffect(() => {
    setStatus(initialStatus);
    setErr(null);
  }, [initialStatus, clubId]);

  if (!status) return null;

  async function apply(next: SiteStatus, confirmMsg: string) {
    if (!supabase || busy) return;
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase.rpc("set_website_status", {
      p_club: clubId,
      p_status: next,
    });
    setBusy(false);
    if (error) {
      setErr(error.message || "Could not update the site status.");
      return;
    }
    setStatus((data as SiteStatus) ?? next);
  }

  const published = status === "published";
  const suspended = status === "suspended";

  const publishBtn = (
    <button
      type="button"
      className="sw-pub-btn sw-pub-btn--go"
      disabled={busy}
      onClick={() =>
        apply("published", "Publish this site? It will be visible to the public.")
      }
    >
      {busy ? "Working…" : "Publish site"}
    </button>
  );

  return (
    <div className="sw-pub">
      <div className="sw-pub-row">
        <span className={`sw-pub-pill sw-pub-pill--${status}`}>
          {published ? "Published ✓" : suspended ? "Suspended" : "Draft"}
        </span>
        {published && (
          <button
            type="button"
            className="sw-pub-btn sw-pub-btn--off"
            disabled={busy}
            onClick={() =>
              apply(
                "draft",
                "Unpublish this site? It will no longer be visible to the public."
              )
            }
          >
            {busy ? "Working…" : "Unpublish"}
          </button>
        )}
        {/* Draft → publish. Suspended → only a platform admin may act. */}
        {!published && (suspended ? isPlatformAdmin : true) && publishBtn}
      </div>
      {err && <div className="sw-pub-err">{err}</div>}
    </div>
  );
}
