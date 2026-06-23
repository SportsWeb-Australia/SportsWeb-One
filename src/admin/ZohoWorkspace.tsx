import type { ReactNode } from "react";

/**
 * Workspace + Zoho Partner screens — the operational tools, powered by Zoho.
 *
 * Two scopes:
 *  - scope="club"      → the club's tools. Until a club is on a plan that
 *                        includes them, each shows a "contact SportsWeb" state.
 *  - scope="sportsweb" → SportsWeb's own workspace + Zoho Partner apps. Each
 *                        opens straight into Zoho (deep link works whenever
 *                        you're signed into Zoho), and shows a connect prompt
 *                        until SportsWeb is connected to Zoho for live in-app data.
 *
 * URLs point at the Australian Zoho data centre (.com.au). They live in one
 * registry below so they're trivial to correct or repoint per app.
 */

const ic = (inner: ReactNode): ReactNode => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {inner}
  </svg>
);

export const WS_ICON: Record<string, ReactNode> = {
  email: ic(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  workdrive: ic(<><path d="M6 19a4 4 0 0 1-.9-7.9 5 5 0 0 1 9.7-1.6A4.5 4.5 0 0 1 18 19z" /></>),
  intranet: ic(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>),
  office: ic(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  writer: ic(<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>),
  sheets: ic(<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M4 15h16M10 4v16" /></>),
  show: ic(<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v4M8 20h8" /></>),
  meeting: ic(<><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>),
  calendar: ic(<><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M9 3v4M15 3v4" /></>),
  vault: ic(<><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></>),
  todo: ic(<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 12 3 3 5-5" /></>),
  committee: ic(<><path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z" /></>),
  // Zoho Partner
  crm: ic(<><path d="M3 7h18M3 12h18M3 17h10" /><circle cx="18" cy="17" r="2.4" /></>),
  books: ic(<><path d="M5 4a2 2 0 0 1 2-2h11v20H7a2 2 0 0 1-2-2z" /><path d="M9 7h7M9 11h7M9 15h4" /></>),
  analytics: ic(<><path d="M4 4v16h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>),
  campaigns: ic(<><path d="M3 11v2l13 5V6z" /><path d="M16 9a3.5 3.5 0 0 1 0 6" /></>),
  desk: ic(<><path d="M5 13v-1a7 7 0 0 1 14 0v1" /><rect x="3" y="13" width="4" height="6" rx="1" /><rect x="17" y="13" width="4" height="6" rx="1" /></>),
  projects: ic(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" /></>),
  tasks: ic(<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 11 2.5 2.5L16 8" /></>),
  billing: ic(<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>),
  bookmarks: ic(<><path d="M6 3h12v18l-6-4-6 4z" /></>),
};

export type WorkspaceApp = { label: string; title: string; blurb: string; zoho: string; url: string };

export const WORKSPACE: Record<string, WorkspaceApp> = {
  email: {
    label: "Email", title: "Email", zoho: "Zoho Mail", url: "https://mail.zoho.com.au",
    blurb:
      "Proper email for your office-bearers — send and receive from your own address, with shared role mailboxes like secretary@ and treasurer@ so handovers are painless.",
  },
  workdrive: {
    label: "WorkDrive", title: "WorkDrive", zoho: "Zoho WorkDrive", url: "https://workdrive.zoho.com.au",
    blurb:
      "Your shared file store — policies, logos, minutes, grant docs and exports, all in one secure place the whole team can reach (instead of buried in someone's personal drive).",
  },
  intranet: {
    label: "Intranet", title: "Intranet", zoho: "Zoho Connect", url: "https://connect.zoho.com.au",
    blurb:
      "A private internal space — post announcements, run groups, share a feed and keep everyone in the loop. The internal home page, separate from your public website.",
  },
  office: {
    label: "Office", title: "Office", zoho: "Zoho Office Suite", url: "https://office.zoho.com.au",
    blurb:
      "A full office suite — documents, spreadsheets and presentations. Works just like Microsoft Office and Google Workspace, and is compatible with them too: open, edit and save .docx, .xlsx and .pptx without converting. Open Writer, Sheets or Show from the menu.",
  },
  writer: {
    label: "Writer", title: "Writer", zoho: "Zoho Writer", url: "https://writer.zoho.com.au",
    blurb: "Word processor for letters, policies, reports and newsletters. Works like — and is compatible with — Microsoft Word and Google Docs (.docx in and out).",
  },
  sheets: {
    label: "Sheets", title: "Sheets", zoho: "Zoho Sheet", url: "https://sheet.zoho.com.au",
    blurb: "Spreadsheets for budgets, rosters, ladders and lists. Works like — and is compatible with — Microsoft Excel and Google Sheets (.xlsx in and out).",
  },
  show: {
    label: "Show", title: "Show", zoho: "Zoho Show", url: "https://show.zoho.com.au",
    blurb: "Slides for presentations, AGM decks and sponsor pitches. Works like — and is compatible with — PowerPoint and Google Slides (.pptx in and out).",
  },
  meeting: {
    label: "Meeting", title: "Meeting", zoho: "Zoho Meeting", url: "https://meeting.zoho.com.au",
    blurb: "Run meetings and AGMs by video, share your screen and record the session for anyone who couldn't make it.",
  },
  calendar: {
    label: "Calendar", title: "Calendar", zoho: "Zoho Calendar", url: "https://calendar.zoho.com.au",
    blurb: "One shared calendar — fixtures, events and meetings in a single view the whole team can see and add to.",
  },
  vault: {
    label: "Vault", title: "Vault", zoho: "Zoho Vault", url: "https://vault.zoho.com.au",
    blurb: "A secure, shared password vault for logins — portals, social accounts, banking — so access survives changeovers.",
  },
  todo: {
    label: "To-Do", title: "To-Do", zoho: "Zoho ToDo", url: "https://todo.zoho.com.au",
    blurb: "Personal and shared to-dos — assign actions, set due dates and see what's done, so nothing falls through the cracks.",
  },
  committee: {
    label: "Cliq", title: "Cliq", zoho: "Zoho Cliq", url: "https://cliq.zoho.com.au",
    blurb: "A private team chat — quick questions, decisions and discussion in one place, without clogging up email. The back-room for getting things done.",
  },

  // ── Zoho Partner apps (SportsWeb's business stack) ───────────────────────────
  crm: {
    label: "CRM", title: "CRM", zoho: "Zoho CRM", url: "https://crm.zoho.com.au",
    blurb: "Your sales engine — club leads, deals and pipeline, follow-ups and conversions. The source for the Sales KPIs on the platform dashboard.",
  },
  books: {
    label: "Financial", title: "Financial (Books)", zoho: "Zoho Books", url: "https://books.zoho.com.au",
    blurb: "The financial back-office — invoices, payments, expenses and reporting. The source for the Financial KPIs on the platform dashboard.",
  },
  analytics: {
    label: "Analytics", title: "Analytics", zoho: "Zoho Analytics", url: "https://analytics.zoho.com.au",
    blurb: "Cross-app dashboards and deep-dive reporting — blend CRM, Books and Campaigns data into the views you actually run the business on.",
  },
  campaigns: {
    label: "Campaigns", title: "Campaigns", zoho: "Zoho Campaigns", url: "https://campaigns.zoho.com.au",
    blurb: "Email marketing — newsletters, nurture journeys and broadcast lists. The source for the Marketing KPIs on the platform dashboard.",
  },
  desk: {
    label: "Desk", title: "Desk", zoho: "Zoho Desk", url: "https://desk.zoho.com.au",
    blurb: "Support tickets and help desk — track club requests and issues to resolution in one queue.",
  },
  projects: {
    label: "Projects", title: "Projects", zoho: "Zoho Projects", url: "https://projects.zoho.com.au",
    blurb: "Plan and run delivery — milestones, phases and dependencies for club onboarding and platform work.",
  },
  tasks: {
    label: "Tasks", title: "Tasks", zoho: "Zoho ToDo / Tasks", url: "https://todo.zoho.com.au",
    blurb: "Your day-to-day task list — quick, assignable actions across the business. (Confirm the exact deep link and I'll repoint it.)",
  },
  billing: {
    label: "Billing", title: "Billing", zoho: "Zoho Billing", url: "https://billing.zoho.com.au",
    blurb: "Subscriptions and recurring billing — plans, renewals and dunning for club accounts.",
  },
  bookmarks: {
    label: "Bookmarks", title: "Bookmarks", zoho: "Zoho Workplace", url: "https://workplace.zoho.com.au/#mail_app/links/list/7003904017/479963000000004002",
    blurb: "Your saved shortcuts and links in Zoho Workplace — jump straight to the pages and tools you use most.",
  },
};

export function ZohoWorkspace({
  appKey,
  scope = "club",
  connected = false,
  onConnect,
}: {
  appKey: string;
  scope?: "club" | "sportsweb";
  connected?: boolean;
  onConnect?: () => void;
}) {
  const a = WORKSPACE[appKey];
  if (!a) return null;

  return (
    <div className="sw-admin-panel sw-ws">
      <div className="sw-ws-hero">
        <span className="sw-ws-hero-ic">{WS_ICON[appKey]}</span>
        <div className="sw-ws-hero-copy">
          <h2>{a.title}</h2>
          <p>{a.blurb}</p>
        </div>
      </div>

      {scope === "sportsweb" ? (
        <div className="sw-ws-connect">
          <a className="sw-btn" href={a.url} target="_blank" rel="noreferrer">
            Open {a.label} in Zoho →
          </a>
          {connected ? (
            <p style={{ marginTop: 14, color: "#1f9d57", fontWeight: 600 }}>
              ✓ Connected to Zoho — live {a.label.toLowerCase()} data appears here.
            </p>
          ) : (
            <div style={{ marginTop: 16 }}>
              <span className="sw-ws-badge">Not connected to Zoho</span>
              <p>
                This needs to be connected to Zoho to show live {a.label.toLowerCase()} data inside SportsWeb. Connect{" "}
                {a.zoho} from Integrations — the button above still opens it in Zoho directly in the meantime.
              </p>
              {onConnect && (
                <button className="sw-btn sw-btn--ghost" onClick={onConnect}>
                  Connect Zoho →
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="sw-ws-connect">
          <span className="sw-ws-badge">Not connected yet</span>
          <p>
            Please contact SportsWeb to have your {a.label.toLowerCase()} connected. Once your club is on a plan that
            includes {a.zoho}, this screen opens straight into your club's {a.label.toLowerCase()}.
          </p>
          <a className="sw-btn" href={`mailto:support@sportsweb.com.au?subject=${encodeURIComponent("Connect " + a.label)}`}>
            Contact SportsWeb
          </a>
        </div>
      )}
    </div>
  );
}
