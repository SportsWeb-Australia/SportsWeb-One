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

  // Shareable read-only draft-preview link (no login) for committee/testers.
  const [token, setToken] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareErr, setShareErr] = useState<string | null>(null);

  // Re-sync when the active club (or its loaded status) changes.
  useEffect(() => {
    setStatus(initialStatus);
    setErr(null);
  }, [initialStatus, clubId]);

  // Load this club's preview token (club admins can read their own clubs row).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from("clubs").select("preview_token").eq("id", clubId).single();
      if (alive) setToken((data?.preview_token as string) ?? null);
    })();
    return () => { alive = false; };
  }, [clubId]);

  const previewUrl = token ? `${window.location.origin}/?preview=${token}` : "";

  const copyLink = async () => {
    if (!previewUrl) return;
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this preview link:", previewUrl);
    }
  };

  const regenerate = async () => {
    if (!supabase || rotating) return;
    if (!window.confirm("Regenerate the preview link? The current link will stop working.")) return;
    setRotating(true);
    setShareErr(null);
    const { data, error } = await supabase.rpc("rotate_club_preview_token", { p_club_id: clubId });
    setRotating(false);
    if (error) { setShareErr(error.message); return; }
    setToken((data as string) ?? null);
    setCopied(false);
  };

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

      {/* Shareable read-only draft preview -- no login; reviewers can leave SitePulse feedback. */}
      <div style={{ marginTop: 10, borderTop: "1px solid #e4e4e7", paddingTop: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "#2563eb", marginBottom: 6 }}>
          Share draft for review
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <input
            readOnly
            value={previewUrl}
            placeholder="Preview link..."
            onFocus={(e) => e.currentTarget.select()}
            style={{ flex: "1 1 200px", minWidth: 160, fontSize: 12.5, padding: "7px 9px", borderRadius: 8, border: "1px solid #d7dbe3" }}
          />
          <button type="button" className="sw-btn sw-btn--ghost" disabled={!previewUrl} onClick={copyLink}>
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className="sw-btn sw-btn--ghost" disabled={rotating} onClick={regenerate}>
            {rotating ? "…" : "Regenerate"}
          </button>
        </div>
        <p className="sw-comms-note" style={{ marginTop: 6 }}>
          Anyone with this link can view the draft read-only and leave feedback. Regenerate to invalidate the old link.
        </p>
        {shareErr && <div className="sw-pub-err">{shareErr}</div>}
      </div>
    </div>
  );
}
