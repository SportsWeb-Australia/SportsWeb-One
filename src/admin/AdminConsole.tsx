// Full-screen admin console: a launcher + app-shell that replaces the old side-nav.
// Two modes, one shell:
//   - "platform" (isPlatformAdmin && no active club): the SportsWeb platform admin nav.
//   - "club" (any active club, incl. a platform admin acting-as): the club admin nav.
// It owns ONLY the navigation chrome -- every screen still renders through AdminApp's existing
// `active` chain, passed in as `screen`. Cards/rail call the same setActive/openZoho the old
// buttons did, gated by the same can(). Styles in ./admin-console.css (scoped .sw-console).
import { useState, type ReactNode } from "react";

export const CONSOLE_HOME = "__launcher";

type Can = (perm: string) => boolean;
interface WorkspaceApp { url: string; label?: string }

interface Props {
  active: string;
  setActive: (k: string) => void;
  can: Can;
  openZoho: (url: string) => void;
  signOut: () => void;
  email: string | null;
  workspace: Record<string, WorkspaceApp>;
  /** The current screen, rendered by AdminApp's existing `active` chain. */
  screen: ReactNode;
  /** "platform" (default) or "club". Selects the nav model + branding. */
  mode?: "platform" | "club";
  /** Breadcrumb/brand root label. Platform: "Platform Admin"; club: the club name. */
  crumbRoot?: string;
  /** When a platform admin is acting-as a club, show an "Exit to platform" control. */
  actingAs?: boolean;
  onExit?: () => void;
}

/* ---- icons (professional line set) ---- */
const P: Record<string, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="8" height="10" rx="1.6" /><rect x="13" y="3" width="8" height="6" rx="1.6" /><rect x="13" y="12" width="8" height="9" rx="1.6" /><rect x="3" y="16" width="8" height="5" rx="1.6" /></>,
  clubs: <path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5M9 11h.01M15 11h.01" />,
  staff: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 4.5a3.2 3.2 0 0 1 0 6.3M18 14.2a5.5 5.5 0 0 1 3 5" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5a3 3 0 0 1 0 6M18 14a5.5 5.5 0 0 1 3 5" /></>,
  userplus: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M19 8v6M22 11h-6" /></>,
  import: <path d="M12 3v11M8 10l4 4 4-4M4 20h16" />,
  pulse: <path d="M3 12h4l2 6 4-13 2 8 2-3h4" />,
  studio: <path d="M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 18l9 5 9-5" />,
  plug: <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5" />,
  sales: <path d="M5 19c7 0 12-5 12-12M14 5h3v3M8 16l3-3 2 2 4-4" />,
  email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  drive: <path d="M6 19a4 4 0 0 1-.9-7.9 5 5 0 0 1 9.7-1.6A4.5 4.5 0 0 1 18 19z" />,
  intranet: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  meeting: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M9 3v4M15 3v4" /></>,
  vault: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></>,
  todo: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 12 3 3 5-5" /></>,
  cliq: <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z" />,
  crm: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  money: <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M4 20h16" />,
  campaign: <path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM17 9a4 4 0 0 1 0 6" />,
  desk: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  projects: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 9h8M8 13h5" /></>,
  billing: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  bookmarks: <path d="M6 3h12v18l-6-4-6 4z" />,
  office: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /></>,
  megaphone: <path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM17 9a4 4 0 0 1 0 6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" /></>,
  cog: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M4.5 6l2 2M17.5 16l2 2M3 12h3M18 12h3M4.5 18l2-2M17.5 8l2-2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  ext: <path d="M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />,
  out: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
};
function Ic({ n }: { n: string }) { return <svg className="ic" viewBox="0 0 24 24">{P[n] ?? P.grid}</svg>; }
const ZOHO = (
  <span className="swc-zw"><i style={{ color: "#e42527" }}>Z</i><i style={{ color: "#f9b21d" }}>o</i><i style={{ color: "#226db4" }}>h</i><i style={{ color: "#009b48" }}>o</i></span>
);

/* ---- nav model types ---- */
type SubItem = [key: string, label: string, icon: string];
type MetaEntry = { label: string; icon: string; color: string };

/* ================= PLATFORM model ================= */
const PLATFORM_SUB: Record<string, SubItem[]> = {
  __staff: [["__staff", "Team", "users"], ["__super_team", "Add a person", "userplus"]],
  __partner_dashboard: [
    ["__partner_dashboard", "Partner Dashboard", "chart"],
    ["__partner_topup", "Top up account", "billing"],
    ["__partner_connect", "Add Zoho connection", "plug"],
    ["__partner_editclub", "Edit club Zoho", "office"],
  ],
};
const PLATFORM_APP_OF: Record<string, string> = {
  __biz: "__biz", __super_clubs: "__super_clubs",
  __staff: "__staff", __super_team: "__staff",
  __super_import: "__super_import", __super_sitepulse: "__super_sitepulse",
  __super_studio: "__super_studio", __super_integrations: "__super_integrations", __sales: "__sales",
  __partner_dashboard: "__partner_dashboard", __partner_topup: "__partner_dashboard",
  __partner_connect: "__partner_dashboard", __partner_editclub: "__partner_dashboard",
};
const PLATFORM_META: Record<string, MetaEntry> = {
  __biz: { label: "Dashboard", icon: "dashboard", color: "var(--c-operate)" },
  __super_clubs: { label: "Clubs & modules", icon: "clubs", color: "var(--c-operate)" },
  __staff: { label: "Staff & access", icon: "staff", color: "var(--c-operate)" },
  __super_import: { label: "Import a club", icon: "import", color: "var(--c-operate)" },
  __super_sitepulse: { label: "SitePulse", icon: "pulse", color: "var(--c-crit)" },
  __super_studio: { label: "Template Studio", icon: "studio", color: "var(--c-build)" },
  __super_integrations: { label: "Integrations", icon: "plug", color: "var(--c-build)" },
  __sales: { label: "Sales", icon: "sales", color: "var(--c-grow)" },
  __partner_dashboard: { label: "Zoho Partner", icon: "money", color: "var(--c-zoho)" },
};
const PLATFORM_RAIL = ["__biz", "__super_clubs", "__staff", "__super_sitepulse", "__super_studio", "__super_integrations", "__sales", "__partner_dashboard"];

/* ================= CLUB model ================= */
const CLUB_SUB: Record<string, SubItem[]> = {
  __dashboard: [
    ["__dashboard", "Overview", "dashboard"],
    ["__setup", "Get started", "todo"],
    ["__needs", "Needs analysis", "todo"],
  ],
  __site: [
    ["__site", "Edit content", "studio"],
    ["__website", "Style & theme", "cog"],
    ["__feedback", "Website feedback", "pulse"],
  ],
  __members: [
    ["__members", "Members", "users"],
    ["__people", "People & committee", "staff"],
    ["__reports_members", "Member reports", "chart"],
  ],
  __comms: [
    ["__comms", "Send a message", "megaphone"],
    ["__comms_reports", "Comms reports", "chart"],
  ],
};
const CLUB_APP_OF: Record<string, string> = {
  __dashboard: "__dashboard", __setup: "__dashboard", __needs: "__dashboard",
  __site: "__site", __website: "__site", __feedback: "__site",
  __members: "__members", __people: "__members", __reports_members: "__members",
  __teams_seasons: "__teams_seasons",
  __comms: "__comms", __comms_reports: "__comms",
  __modules: "__modules",
  __account: "__account",
};
const CLUB_META: Record<string, MetaEntry> = {
  __dashboard: { label: "Dashboard", icon: "dashboard", color: "var(--c-operate)" },
  __site: { label: "Website", icon: "globe", color: "var(--c-build)" },
  __members: { label: "Members & people", icon: "users", color: "var(--c-operate)" },
  __teams_seasons: { label: "Teams & seasons", icon: "clubs", color: "var(--c-operate)" },
  __comms: { label: "Communications", icon: "megaphone", color: "var(--c-grow)" },
  __modules: { label: "Modules", icon: "grid", color: "var(--c-build)" },
  __account: { label: "Account", icon: "billing", color: "var(--c-biz)" },
};
const CLUB_RAIL = ["__dashboard", "__site", "__members", "__teams_seasons", "__comms", "__modules", "__account"];

/** Resolve which rail app owns an active key (handles dynamic __page_/__member_/__mod_ prefixes). */
function resolveApp(active: string, appOf: Record<string, string>): string | undefined {
  if (active in appOf) return appOf[active];
  if (active.startsWith("__page_")) return appOf["__site"] ?? "__site";
  if (active.startsWith("__member_")) return appOf["__members"] ?? "__members";
  if (active.startsWith("__mod_")) return appOf["__modules"] ?? "__modules";
  return undefined;
}

export function AdminConsole({ active, setActive, can, openZoho, signOut, email, workspace, screen, mode = "platform", crumbRoot, actingAs, onExit }: Props) {
  const [q, setQ] = useState("");
  const isClub = mode === "club";
  const SUB = isClub ? CLUB_SUB : PLATFORM_SUB;
  const APP_OF = isClub ? CLUB_APP_OF : PLATFORM_APP_OF;
  const META = isClub ? CLUB_META : PLATFORM_META;
  const RAIL = isClub ? CLUB_RAIL : PLATFORM_RAIL;
  const rootLabel = crumbRoot ?? (isClub ? "Your club" : "Platform Admin");

  const railApp = resolveApp(active, APP_OF);
  const atHome = active === CONSOLE_HOME || !railApp;

  const zoho = (wsKey: string, label: string, desc: string, icon: string, color: string) => {
    const app = workspace[wsKey];
    return { label, desc, icon, color, ext: true, show: can("platform.clubs") && !!app, onClick: () => app && openZoho(app.url) };
  };
  const scr = (key: string, label: string, desc: string, icon: string, color: string, show: boolean, pill?: string, pillCrit?: boolean) =>
    ({ label, desc, icon, color, show, pill, pillCrit, onClick: () => setActive(key) });

  const PLATFORM_GROUPS = [
    { id: "operate", title: "Run the platform", color: "var(--c-operate)", cards: [
      scr("__biz", "Dashboard", "Platform health at a glance.", "dashboard", "var(--c-operate)", can("platform.clubs")),
      scr("__super_clubs", "Clubs & modules", "Every club, plan and add-on.", "clubs", "var(--c-operate)", can("platform.clubs")),
      scr("__staff", "Staff & access", "Team, roles and people.", "staff", "var(--c-operate)", can("platform.clubs")),
      scr("__super_import", "Import a club", "Bring a site's content in.", "import", "var(--c-operate)", can("platform.clubs")),
      scr("__super_sitepulse", "SitePulse", "Website feedback from every club.", "pulse", "var(--c-crit)", can("platform.clubs")),
    ] },
    { id: "build", title: "Build & configure", color: "var(--c-build)", cards: [
      scr("__super_studio", "Template Studio", "Designs, sections and themes.", "studio", "var(--c-build)", can("platform.clubs")),
      scr("__super_integrations", "Integrations", "Connected services and keys.", "plug", "var(--c-build)", can("platform.integrations")),
    ] },
    { id: "grow", title: "Grow", color: "var(--c-grow)", cards: [
      scr("__sales", "Sales", "Pipeline, quotes and the formula.", "sales", "var(--c-grow)", can("platform.clubs")),
    ] },
    { id: "workspace", title: "Club workspace", color: "var(--c-workspace)", cards: [
      zoho("email", "Email", "Club inboxes.", "email", "var(--c-workspace)"),
      zoho("workdrive", "WorkDrive", "Shared files.", "drive", "var(--c-workspace)"),
      zoho("intranet", "Intranet", "Team home.", "intranet", "var(--c-workspace)"),
      zoho("meeting", "Meeting", "Video calls.", "meeting", "var(--c-workspace)"),
      zoho("calendar", "Calendar", "Shared diary.", "calendar", "var(--c-workspace)"),
      zoho("vault", "Vault", "Shared passwords.", "vault", "var(--c-workspace)"),
      zoho("todo", "To-Do", "Tasks.", "todo", "var(--c-workspace)"),
      zoho("committee", "Cliq", "Team chat.", "cliq", "var(--c-workspace)"),
    ] },
    { id: "biz", title: "Business apps", color: "var(--c-biz)", cards: [
      zoho("crm", "CRM", "Leads & contacts.", "crm", "var(--c-biz)"),
      zoho("books", "Financial", "Invoicing & books.", "money", "var(--c-biz)"),
      zoho("analytics", "Analytics", "Reports & dashboards.", "chart", "var(--c-biz)"),
      zoho("campaigns", "Campaigns", "Email marketing.", "campaign", "var(--c-biz)"),
      zoho("desk", "Desk", "Support tickets.", "desk", "var(--c-biz)"),
      zoho("projects", "Projects", "Delivery & tasks.", "projects", "var(--c-biz)"),
      zoho("billing", "Billing", "Subscriptions.", "billing", "var(--c-biz)"),
      zoho("bookmarks", "Bookmarks", "Saved links.", "bookmarks", "var(--c-biz)"),
    ] },
    { id: "partner", title: "Zoho Partner", color: "var(--c-zoho)", cards: [
      { label: "Zoho Partner", desc: "Partner console, provisioning & commissions.", icon: "money", color: "var(--c-zoho)", zoho: true, show: can("platform.clubs"), onClick: () => setActive("__partner_dashboard") },
    ] },
  ];

  const CLUB_GROUPS = [
    { id: "club", title: "Your club", color: "var(--c-operate)", cards: [
      scr("__dashboard", "Dashboard", "Your club at a glance.", "dashboard", "var(--c-operate)", true),
      scr("__setup", "Get started", "Finish setting up your club.", "todo", "var(--c-operate)", true),
      scr("__feedback", "Website feedback", "Raise and track site issues.", "pulse", "var(--c-crit)", true),
    ] },
    { id: "website", title: "Your website", color: "var(--c-build)", cards: [
      scr("__site", "Edit website", "Change text, images and pages.", "globe", "var(--c-build)", can("club.website")),
      scr("__website", "Style & theme", "Your site's look and colours.", "cog", "var(--c-build)", can("club.settings")),
    ] },
    { id: "people", title: "People & teams", color: "var(--c-operate)", cards: [
      scr("__members", "Members", "Your membership list.", "users", "var(--c-operate)", can("club.users")),
      scr("__people", "People & committee", "Committee and contacts.", "staff", "var(--c-operate)", can("club.users")),
      scr("__teams_seasons", "Teams & seasons", "Manage teams and grades.", "clubs", "var(--c-operate)", can("club.users")),
    ] },
    { id: "communicate", title: "Communicate", color: "var(--c-grow)", cards: [
      scr("__comms", "Communications", "Email, SMS and push to members.", "megaphone", "var(--c-grow)", can("club.comms")),
      scr("__comms_reports", "Comms reports", "What you've sent.", "chart", "var(--c-grow)", can("club.comms")),
    ] },
    { id: "modules", title: "Modules & account", color: "var(--c-biz)", cards: [
      scr("__modules", "Modules", "Add-ons for your club.", "grid", "var(--c-build)", true),
      scr("__account", "Account", "Plan, billing and status.", "billing", "var(--c-biz)", true),
    ] },
  ];

  const GROUPS = isClub ? CLUB_GROUPS : PLATFORM_GROUPS;
  const ql = q.trim().toLowerCase();

  /* ---- launcher ---- */
  const launcher = (
    <div className="swc-wrap">
      <div className="swc-hello">
        <h1>{greeting(isClub ? crumbRoot : undefined)}</h1>
        <p>Pick an area to jump into, or search above.</p>
      </div>
      {GROUPS.map((g) => {
        const cards = g.cards.filter((c) => c.show && (!ql || (c.label + " " + c.desc).toLowerCase().includes(ql)));
        if (!cards.length) return null;
        return (
          <section className="swc-band" key={g.id}>
            <div className="swc-band-hd" style={{ ["--gc" as string]: g.color }}>
              <span className="sw-swatch" /><h2>{g.title}</h2><span className="sw-cnt num">{cards.length}</span>
            </div>
            <div className="swc-grid">
              {cards.map((c, i) => (
                <button key={i} className="swc-tile" style={{ ["--tc" as string]: c.color }} onClick={c.onClick}>
                  <div className="swc-tile-row">
                    {"zoho" in c && c.zoho
                      ? <div className="swc-tile-ic zoho">{ZOHO}</div>
                      : <div className="swc-tile-ic"><Ic n={c.icon} /></div>}
                    {"pill" in c && c.pill
                      ? <span className={`swc-pill num${c.pillCrit ? " crit" : ""}`}>{c.pill}</span>
                      : "ext" in c && c.ext
                        ? <span className="swc-go"><svg className="ic ic-sm" viewBox="0 0 24 24">{P.ext}</svg></span>
                        : <span className="swc-go"><svg className="ic ic-sm" viewBox="0 0 24 24">{P.arrow}</svg></span>}
                  </div>
                  <div><h3>{c.label}</h3><p>{c.desc}</p></div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  /* ---- app shell ---- */
  const meta = railApp ? META[railApp] : null;
  const subs = railApp ? SUB[railApp] : undefined;
  const appView = meta && (
    <div className={`swc-app${subs ? "" : " no-sub"}`}>
      <nav className="swc-rail" aria-label="Apps">
        <button className="swc-railb home" data-tip="All apps" aria-label="All apps" onClick={() => setActive(CONSOLE_HOME)}><Ic n="grid" /></button>
        <div className="swc-railsep" />
        {RAIL.map((k) => {
          const m = META[k];
          return (
            <button key={k} className="swc-railb" data-tip={m.label} aria-label={m.label} data-active={railApp === k}
              style={{ ["--rc" as string]: m.color }} onClick={() => setActive(k)}><Ic n={m.icon} /></button>
          );
        })}
      </nav>
      {subs && (
        <aside className="swc-sub" style={{ ["--rc" as string]: meta.color }}>
          <div className="swc-sub-hd"><div className="si"><Ic n={meta.icon} /></div><strong>{meta.label}</strong></div>
          <div className="swc-subnav">
            {subs.map((s) => (
              <button key={s[0]} data-active={active === s[0]} onClick={() => setActive(s[0])}><Ic n={s[2]} />{s[1]}</button>
            ))}
          </div>
        </aside>
      )}
      <div className="swc-stage" style={{ ["--rc" as string]: meta.color }}>
        <div className="swc-crumbs"><b>{rootLabel}</b><span className="sep">/</span><b>{meta.label}</b></div>
        {screen}
      </div>
    </div>
  );

  return (
    <div className="sw-console">
      <header className="swc-top">
        <div className="swc-brand">
          <div className="swc-mark">S1</div>
          <div><strong>SportsWeb One</strong><span>{isClub ? (crumbRoot ?? "Club Admin") : "Platform Admin"}</span></div>
        </div>
        <label className="swc-search">
          <svg className="ic ic-sm" viewBox="0 0 24 24">{P.search}</svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to anything…" aria-label="Search" />
        </label>
        <div className="swc-tacts">
          {actingAs && onExit && (
            <button className="swc-tbtn" onClick={onExit} aria-label="Exit to platform">
              <svg className="ic ic-sm" viewBox="0 0 24 24">{P.out}</svg><span>Exit to platform</span>
            </button>
          )}
          {!atHome && (
            <button className="swc-tbtn" onClick={() => setActive(CONSOLE_HOME)} aria-label="All apps">
              <svg className="ic ic-sm" viewBox="0 0 24 24">{P.grid}</svg><span>All apps</span>
            </button>
          )}
          {!actingAs && (
            <button className="swc-tbtn" onClick={signOut} title="Sign out" aria-label="Sign out">
              <svg className="ic ic-sm" viewBox="0 0 24 24">{P.out}</svg>
            </button>
          )}
          <div className="swc-avatar" title={email ?? ""}>{(email ?? "S")[0].toUpperCase()}</div>
        </div>
      </header>
      <div className="swc-body">{atHome ? launcher : appView}</div>
    </div>
  );
}

function greeting(name?: string | null) {
  const h = new Date().getHours();
  const who = name && name.trim() ? name : "Carson";
  return (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + ", " + who;
}
