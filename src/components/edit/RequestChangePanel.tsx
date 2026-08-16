import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useEdit } from "../../lib/edit";

/**
 * "Ask us to change something" — the escape hatch.
 *
 * The editor deliberately only lets a club self-serve what it can't break: text,
 * photos, video links, brand colours, and its own News/Events items. Everything
 * else (a new section, a layout change, a whole new page) lands here instead of
 * being a dead end. We capture WHY as well as WHAT, because the reason is usually
 * what tells us the real fix — and how urgent it is, so triage has an order.
 */
type Urgency = "whenever" | "soon" | "urgent";

const URGENCY: { key: Urgency; label: string; hint: string }[] = [
  { key: "whenever", label: "Whenever", hint: "No rush at all" },
  { key: "soon", label: "Soon", hint: "In the next week or so" },
  { key: "urgent", label: "Urgent", hint: "It's wrong or broken right now" },
];

export function RequestChangePanel({ onClose }: { onClose: () => void }) {
  const { clubId } = useEdit();
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("soon");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!supabase || !clubId) { setErr("You need to be signed in to send a request."); return; }
    if (!what.trim()) { setErr("Tell us what you'd like changed."); return; }
    if (!why.trim()) { setErr("A quick note on why helps us get it right first time."); return; }
    setBusy(true);
    setErr(null);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("club_requests").insert({
      club_id: clubId,
      requested_by: auth?.user?.id ?? null,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      what: what.trim(),
      why: why.trim(),
      urgency,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="sw-edit-panel sw-edit-panel--request" role="dialog" aria-label="Request sent">
        <div className="sw-edit-panelhead">
          <strong>Request sent</strong>
          <button type="button" className="sw-edit-panelx" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="sw-edit-panelok">
          Thanks — that's with the SportsWeb team. We'll be in touch
          {urgency === "urgent" ? " as a priority." : "."}
        </p>
        <div className="sw-edit-panelacts">
          <button type="button" className="sw-btn sw-btn--sm" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sw-edit-panel sw-edit-panel--request" role="dialog" aria-label="Ask us to change something">
      <div className="sw-edit-panelhead">
        <strong>Ask us to change something</strong>
        <button type="button" className="sw-edit-panelx" onClick={onClose} aria-label="Close">×</button>
      </div>

      <p className="sw-edit-panelintro">
        Anything you can't change yourself — a new section, a different layout, an extra page —
        tell us here and we'll sort it.
      </p>

      <label className="sw-edit-panellabel" htmlFor="req-what">What would you like changed?</label>
      <textarea
        id="req-what"
        className="sw-edit-panelinput"
        rows={3}
        value={what}
        placeholder="e.g. We'd like a page for our junior program."
        onChange={(e) => { setWhat(e.target.value); setErr(null); }}
      />

      <label className="sw-edit-panellabel" htmlFor="req-why">Why? What's it for?</label>
      <textarea
        id="req-why"
        className="sw-edit-panelinput"
        rows={3}
        value={why}
        placeholder="e.g. Registrations open next month and parents keep asking where to find the details."
        onChange={(e) => { setWhy(e.target.value); setErr(null); }}
      />

      <span className="sw-edit-panellabel">How urgent is it?</span>
      <div className="sw-edit-urgency" role="radiogroup" aria-label="Urgency">
        {URGENCY.map((u) => (
          <button
            key={u.key}
            type="button"
            role="radio"
            aria-checked={urgency === u.key}
            className={`sw-edit-urgbtn${urgency === u.key ? " is-on" : ""}`}
            onClick={() => setUrgency(u.key)}
          >
            <strong>{u.label}</strong>
            <span>{u.hint}</span>
          </button>
        ))}
      </div>

      {err && <p className="sw-edit-panelerr">{err}</p>}

      <div className="sw-edit-panelacts">
        <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={onClose}>Cancel</button>
        <button type="button" className="sw-btn sw-btn--sm" onClick={submit} disabled={busy}>
          {busy ? "Sending…" : "Send request"}
        </button>
      </div>
    </div>
  );
}
