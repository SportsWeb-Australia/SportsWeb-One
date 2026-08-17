// Club quick-start / "what's next" guide. A friendly, plain-English walk-through for a
// committee that has just had their website built: get members in, communicate, run
// reports, stay compliant. Each step jumps straight to the screen that does it.

type Step = {
  n: number;
  title: string;
  body: string;
  cta: string;
  go: string;
  tone?: "crit";
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "Finish your website",
    body: "Edit any page's text and images under Website → Pages & text. Add news, events and sponsors from the tabs alongside it. Changes save as a draft — hit Preview to check, then Publish to make them live.",
    cta: "Edit your website",
    go: "__site",
  },
  {
    n: 2,
    title: "Get your members in",
    body: "Members → Import CSV: export your list from Excel or Google Sheets and paste it in — we match the columns for you. Or add people one at a time. Then open a profile to give them roles (player, coach, committee…).",
    cta: "Add members",
    go: "__members",
  },
  {
    n: 3,
    title: "Record compliance checks",
    body: "On each member's profile, the Compliance tab records Working with Children Checks, first aid, coach/trainer accreditation and anything else your club tracks, with their expiry. Then Members → Compliance register shows what's done, coming up, expired or missing across everyone in a role that requires it.",
    cta: "Check compliance",
    go: "__compliance",
    tone: "crit",
  },
  {
    n: 4,
    title: "Message your members",
    body: "Communications → choose Everyone or a role (Coaches, Committee…), write once, and send by email, SMS or app notification. Every send is logged.",
    cta: "Send a message",
    go: "__comms",
  },
  {
    n: 5,
    title: "See your numbers",
    body: "Member reports show your totals — active members, juniors, by team and by role, paid vs unpaid. Communication reports show what you've sent and how it landed.",
    cta: "Open reports",
    go: "__reports_members",
  },
  {
    n: 6,
    title: "Switch on modules",
    body: "Modules adds tools as you need them — volunteers, ticketing, learning and more. Turn on what suits your club.",
    cta: "Browse modules",
    go: "__modules",
  },
];

export function ClubGuide({ go }: { go: (key: string) => void }) {
  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>Quick-start guide</h2>
      </div>
      <p className="sw-admin-note">
        Your website&apos;s set up — here&apos;s how to run the rest of your club in SportsWeb One. Work down the list;
        each step opens the right screen.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 6 }}>
        {STEPS.map((s) => (
          <div
            key={s.n}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              background: "#fff",
              border: "1px solid #e6e8ee",
              borderRadius: 12,
              padding: "15px 16px",
            }}
          >
            <div
              style={{
                flex: "0 0 auto",
                width: 30,
                height: 30,
                borderRadius: 9,
                background: s.tone === "crit" ? "#fbe7e5" : "#eef0fe",
                color: s.tone === "crit" ? "#c0392b" : "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {s.n}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 750, fontSize: 15.5, color: "#161d2b", marginBottom: 3 }}>{s.title}</div>
              <p style={{ margin: "0 0 10px", fontSize: 13.5, color: "#5b6573", lineHeight: 1.5 }}>{s.body}</p>
              <button className="sw-btn sw-btn--sm" onClick={() => go(s.go)}>{s.cta} →</button>
            </div>
          </div>
        ))}
      </div>

      <p className="sw-admin-note" style={{ marginTop: 16 }}>
        Stuck on anything? Use the <strong>Website feedback</strong> button on your site, or reach out to SportsWeb — we&apos;re here to help.
      </p>
    </div>
  );
}
