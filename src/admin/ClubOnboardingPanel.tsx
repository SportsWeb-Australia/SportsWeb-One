// ============================================================================
// ClubOnboardingPanel - SuperAdmin -> Clubs & modules -> "Onboard this club"
// ----------------------------------------------------------------------------
// The onboarding hub for one club. It:
//  1) auto-builds the onboarding link with THIS club's id (no manual uuid),
//     plus &drive=<encoded> when the club has an upload-drive link set,
//  2) reads the latest club_onboarding row and shows LIVE status + a checklist,
//  3) reads/writes clubs.onboarding_drive_url directly (rides on the existing
//     clubs RLS: clubs_super_admin_all / clubs_admin_read).
//
// Everything keys off club_id (never organisation_id).
// ============================================================================
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Deployed onboarding-form host. Set VITE_ONBOARDING_URL in Vercel; the fallback
// keeps local/preview builds working out of the box.
const ONBOARDING_URL =
  import.meta.env.VITE_ONBOARDING_URL ?? "https://sportsweb-onboarding.vercel.app";

type Club = { id: string; name: string; slug?: string };
type Submission = {
  id: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  contact_name: string | null;
  contact_email: string | null;
  answers: any; // { sections:[{section,fields:[{label,value}],choices:[]}], uploads?:[{label,name,path?,error?}] }
} | null;

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted - awaiting review",
  in_review: "In review",
  actioned: "Actioned",
  archived: "Archived",
};

// SitePulse feedback shown in the Website check section (read-only; triage lives
// in the SuperSitePulse inbox). Labels mirror the widget/inbox vocabulary.
type FeedbackRow = {
  id: string;
  category: string;
  description: string;
  urgency_flag: boolean;
  status: string;
  created_at: string;
};
const FB_CATEGORY: Record<string, string> = {
  spelling: "Spelling or wording", broken_link: "Broken link", incorrect_info: "Incorrect information",
  missing_info: "Missing information", image_logo: "Image or logo issue", mobile_display: "Looks wrong on mobile",
  desktop_display: "Looks wrong on desktop", sports_data: "Fixture / result / ladder", sponsor: "Sponsor or advertiser",
  event_ticketing: "Event or ticketing", store: "Online store", accessibility: "Accessibility",
  improvement: "Improvement idea", bug: "Something is broken", other: "Other",
};
const FB_STATUS: Record<string, string> = {
  new: "New", needs_review: "Needs review", accepted: "Accepted", in_progress: "In progress",
  waiting_on_club: "Waiting on club", waiting_on_sportsweb: "Waiting on us",
  resolved: "Resolved", rejected: "Rejected", archived: "Archived",
};
// A feedback item is "open" until it's resolved/rejected/archived.
const FB_CLOSED = ["resolved", "rejected", "archived"];

export function ClubOnboardingPanel({ club, onOpenInbox }: { club: Club; onOpenInbox?: () => void }) {
  const [copied, setCopied] = useState<"" | "id" | "link">("");
  const [sub, setSub] = useState<Submission>(null);
  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState("");
  const [savedDrive, setSavedDrive] = useState("");
  const [savingDrive, setSavingDrive] = useState(false);
  const [driveMsg, setDriveMsg] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Website check: shareable draft-review link (reuses PR #9 preview_token +
  // rotate_club_preview_token) and this club's returning SitePulse feedback.
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [shareErr, setShareErr] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);

  // Link auto-fills with THIS club's id AND its upload drive (if set) - the form
  // reads both from the URL, so the club gets its own drive + submissions return linked.
  const link =
    `${ONBOARDING_URL}/?club_id=${club.id}` +
    (savedDrive ? `&drive=${encodeURIComponent(savedDrive)}` : "");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setDriveMsg(null);
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [subRes, clubRes, fbRes] = await Promise.all([
        supabase
          .from("club_onboarding")
          .select("id,status,submitted_at,created_at,contact_name,contact_email,answers")
          .eq("club_id", club.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("clubs").select("onboarding_drive_url,preview_token").eq("id", club.id).maybeSingle(),
        supabase
          .from("sitepulse_feedback")
          .select("id,category,description,urgency_flag,status,created_at")
          .eq("club_id", club.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (!alive) return;
      setSub((subRes.data as Submission) ?? null);
      const d = (clubRes.data?.onboarding_drive_url as string) ?? "";
      setDrive(d);
      setSavedDrive(d);
      setPreviewToken((clubRes.data?.preview_token as string) ?? null);
      setFeedback((fbRes.data as FeedbackRow[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [club.id]);

  const submitted = !!sub;
  const actioned = sub?.status === "actioned";

  const copy = async (text: string, what: "id" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      window.prompt("Copy this:", text);
    }
  };

  // Uploaded files live in the private club-onboarding Storage bucket; mint a
  // short-lived signed URL to view/download (operator is authed via RLS SELECT).
  const openFile = async (path: string) => {
    if (!supabase) return;
    const { data, error } = await supabase.storage.from("club-onboarding").createSignedUrl(path, 60);
    if (!error && data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const saveDrive = async () => {
    if (!supabase) return;
    setSavingDrive(true);
    setDriveMsg(null);
    const value = drive.trim() || null;
    const { error } = await supabase.from("clubs").update({ onboarding_drive_url: value }).eq("id", club.id);
    setSavingDrive(false);
    if (error) {
      setDriveMsg(error.message);
      return;
    }
    setSavedDrive(value ?? "");
    setDriveMsg("Saved");
    setTimeout(() => setDriveMsg(null), 1600);
  };

  // "Email to club" - a plain mailto: (no backend). Prefills the club's contact
  // if a submission has one; otherwise the operator fills the recipient.
  const mailto = () => {
    const to = sub?.contact_email ?? "";
    const subject = `Your SportsWeb One website onboarding link - ${club.name}`;
    const body =
      `Hi${sub?.contact_name ? " " + sub.contact_name : ""},\n\n` +
      `We're ready to build your SportsWeb One site. Please fill in your onboarding form here:\n\n` +
      `${link}\n\n` +
      `Anything you leave blank we'll set with smart defaults. Big files (photos, logos, videos) go to your upload drive linked inside the form.\n\n` +
      `Thanks,\nThe SportsWeb One team`;
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Draft-review link (shareable, read-only, no login) + rotate to invalidate.
  const previewUrl = previewToken ? `${window.location.origin}/?preview=${previewToken}` : "";
  const copyPreview = async () => {
    if (!previewUrl) return;
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 1600);
    } catch {
      window.prompt("Copy this review link:", previewUrl);
    }
  };
  const regeneratePreview = async () => {
    if (!supabase || rotating) return;
    if (!window.confirm("Regenerate the review link? The current link will stop working.")) return;
    setRotating(true);
    setShareErr(null);
    const { data, error } = await supabase.rpc("rotate_club_preview_token", { p_club_id: club.id });
    setRotating(false);
    if (error) {
      setShareErr(error.message);
      return;
    }
    setPreviewToken((data as string) ?? null);
    setCopiedPreview(false);
  };
  const openFeedback = feedback.filter((f) => !FB_CLOSED.includes(f.status)).length;

  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "";

  // Steps tick themselves off from real signals where we can detect them.
  const steps: { label: string; done?: boolean }[] = [
    { label: "Create the club", done: true },
    { label: "Set the club's upload drive (Zoho WorkDrive -> Collect Files)", done: !!savedDrive },
    { label: "Send the onboarding link to the club (or fill it in for them)" },
    { label: "Club submits the onboarding form", done: submitted },
    { label: "Review the submission and seed the site (fill-empty)", done: actioned },
    { label: "Build & preview -> approve -> publish. Club is live." },
  ];

  return (
    <section className="sw1-onboard">
      <h3 className="sw1-onboard-title">Onboard this club</h3>

      {/* LIVE STATUS */}
      <div className={`sw1-onboard-status ${submitted ? "is-in" : "is-wait"}`}>
        {loading ? (
          <span>Checking onboarding status...</span>
        ) : submitted ? (
          <>
            <span>
              <strong>{STATUS_LABEL[sub!.status] ?? sub!.status}</strong>
              {" - submitted "}
              {fmt(sub!.submitted_at ?? sub!.created_at)}
              {sub!.contact_name ? ` by ${sub!.contact_name}` : ""}
            </span>
            <button type="button" className="sw-btn sw-btn--ghost" onClick={() => setShowDetails((v) => !v)}>
              {showDetails ? "Hide details" : "View submitted details"}
            </button>
          </>
        ) : (
          <span>Not submitted yet - send the club their onboarding link below.</span>
        )}
      </div>

      {/* SUBMITTED ANSWERS + UPLOADED FILES (inline drill-down) */}
      {submitted && showDetails && (
        <div className="sw1-onboard-answers">
          {(sub!.answers?.sections ?? []).length === 0 && (
            <small>No structured answers captured.</small>
          )}
          {(sub!.answers?.sections ?? []).map((s: any, i: number) => (
            <div key={i} className="sw1-onboard-ansec">
              <h4>{s.section}</h4>
              {(s.fields ?? []).map((f: any, j: number) => (
                <div key={j} className="sw1-onboard-kv">
                  <span className="k">{f.label}</span>
                  <span className="v">{f.value}</span>
                </div>
              ))}
              {(s.choices ?? []).length > 0 && (
                <div className="sw1-onboard-chips">
                  {s.choices.map((c: string, k: number) => (
                    <span key={k}>{c}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(sub!.answers?.uploads ?? []).length > 0 && (
            <div className="sw1-onboard-ansec">
              <h4>Uploaded files</h4>
              {sub!.answers.uploads.map((u: any, i: number) => (
                <div key={i} className="sw1-onboard-kv">
                  <span className="k">{u.label}</span>
                  <span className="v">
                    {u.path ? (
                      <button type="button" className="sw-btn sw-btn--ghost" onClick={() => openFile(u.path)}>
                        {u.name} &darr;
                      </button>
                    ) : (
                      <em>{u.name} - {u.error || "not uploaded"}</em>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROGRESS CHECKLIST */}
      <ol className="sw1-onboard-steps">
        {steps.map((s, i) => (
          <li key={i} className={s.done ? "is-done" : ""}>
            <span className="sw1-onboard-tick">{s.done ? "✓" : "○"}</span> {s.label}
          </li>
        ))}
      </ol>

      {/* CLUB ID */}
      <label className="sw-admin-field sw1-onboard-row">
        <span>Club ID</span>
        <div className="sw1-onboard-field">
          <code className="sw1-onboard-mono">{club.id}</code>
          <button type="button" className="sw-btn sw-btn--ghost" onClick={() => copy(club.id, "id")}>
            {copied === "id" ? "Copied" : "Copy ID"}
          </button>
        </div>
      </label>

      {/* UPLOAD DRIVE (this club's WorkDrive Collect Files link) */}
      <label className="sw-admin-field sw1-onboard-row">
        <span>Upload drive link (this club's Zoho WorkDrive -&gt; Collect Files)</span>
        <div className="sw1-onboard-field">
          <input
            value={drive}
            placeholder="Paste this club's Collect Files link..."
            onChange={(e) => setDrive(e.target.value)}
          />
          <button
            type="button"
            className="sw-btn sw-btn--ghost"
            disabled={savingDrive || drive.trim() === savedDrive.trim()}
            onClick={saveDrive}
          >
            {savingDrive ? "Saving..." : driveMsg === "Saved" ? "Saved" : "Save"}
          </button>
        </div>
        {driveMsg && driveMsg !== "Saved" && <small className="sw1-onboard-err">{driveMsg}</small>}
        <small>Baked into the onboarding link below as &amp;drive=, so this club's uploads land in its own folder.</small>
      </label>

      {/* ONBOARDING LINK (auto-filled) */}
      <label className="sw-admin-field sw1-onboard-row">
        <span>Onboarding link (auto-filled with this club's ID)</span>
        <div className="sw1-onboard-field">
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className="sw-btn" onClick={() => copy(link, "link")}>
            {copied === "link" ? "Copied" : "Copy link"}
          </button>
          <a className="sw-btn sw-btn--ghost" href={mailto()}>
            Email to club
          </a>
          <a className="sw-btn sw-btn--ghost" href={link} target="_blank" rel="noreferrer">
            Open
          </a>
        </div>
        <small>Send this to the club - their submission comes back linked to this club automatically.</small>
      </label>

      {/* WEBSITE CHECK - draft-review link + returning SitePulse feedback */}
      <div className="sw1-onboard-websitecheck" style={{ marginTop: 20, borderTop: "1px solid #e4e4e7", paddingTop: 16 }}>
        <h4 className="sw1-onboard-title" style={{ fontSize: "1.02rem", margin: "0 0 10px" }}>Website check</h4>

        {/* Draft review link */}
        <label className="sw-admin-field sw1-onboard-row">
          <span>Draft review link (share with the club - no login)</span>
          <div className="sw1-onboard-field">
            <input readOnly value={previewUrl} placeholder="Review link..." onFocus={(e) => e.currentTarget.select()} />
            <button type="button" className="sw-btn" disabled={!previewUrl} onClick={copyPreview}>
              {copiedPreview ? "Copied" : "Copy link"}
            </button>
            <button type="button" className="sw-btn sw-btn--ghost" disabled={rotating} onClick={regeneratePreview}>
              {rotating ? "..." : "Regenerate"}
            </button>
            {previewUrl && (
              <a className="sw-btn sw-btn--ghost" href={previewUrl} target="_blank" rel="noreferrer">Open</a>
            )}
          </div>
          {shareErr && <small className="sw1-onboard-err">{shareErr}</small>}
          <small>Send this to the club so they can review their draft and leave feedback - no login needed. This is the same link the "Feedback" button rides on in draft.</small>
        </label>

        {/* Returning feedback (read-only; triage in the inbox) */}
        <div className="sw-admin-field sw1-onboard-row">
          <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            Review feedback
            {!loading && feedback.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, background: "#eff4ff", color: "#2563eb", borderRadius: 20, padding: "2px 10px" }}>
                {feedback.length} item{feedback.length !== 1 ? "s" : ""} from the club's review
                {openFeedback > 0 ? ` - ${openFeedback} open` : ""}
              </span>
            )}
          </span>

          {loading ? (
            <small>Loading feedback...</small>
          ) : feedback.length === 0 ? (
            <small>No feedback yet - share the review link above.</small>
          ) : (
            <>
              <div className="sw1-onboard-answers" style={{ marginTop: 6 }}>
                {feedback.map((f) => (
                  <div key={f.id} className="sw1-onboard-kv" style={{ alignItems: "start" }}>
                    <span className="k">
                      {FB_CATEGORY[f.category] ?? f.category}
                      {f.urgency_flag ? <b style={{ color: "#b91c1c" }}> - urgent</b> : ""}
                      <br />
                      <small style={{ color: "#8a94a6", fontWeight: 400 }}>
                        {fmt(f.created_at)} &middot; {FB_STATUS[f.status] ?? f.status}
                      </small>
                    </span>
                    <span className="v">{f.description}</span>
                  </div>
                ))}
              </div>
              {onOpenInbox && (
                <div style={{ marginTop: 10 }}>
                  <button type="button" className="sw-btn sw-btn--ghost" onClick={onOpenInbox}>
                    Open in inbox for triage &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
