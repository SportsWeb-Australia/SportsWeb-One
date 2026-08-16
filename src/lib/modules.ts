/**
 * SportsWeb One module catalogue. The same catalogue ships with every club;
 * which modules are live is per-club (ClubConfig.enabledModules). Each module
 * has a "pre-page": an overview + quick-start the club sees before opening the
 * tool — or, when it isn't on their plan, an upgrade / free-trial prompt.
 */
export interface ModuleQuickStep {
  title: string;
  body: string;
}
export interface ModuleVideo {
  title: string;
  url: string;
}
export interface ModuleDef {
  key: string;
  name: string;
  /** Short letters for the tile badge (we avoid external icon deps). */
  badge: string;
  tagline: string;
  summary: string;
  overview: string[];
  quickstart: ModuleQuickStep[];
  videos?: ModuleVideo[];
  /** Where "Open" goes when the module is enabled. */
  appUrl?: string;
  /** Plan label shown on the tile + pre-page. */
  plan: string;
  /**
   * `clubs.sport_type` values this module is offered to. Omit for the usual case
   * of a module that suits every sport — only set it for genuinely sport-specific
   * tools, e.g. Cricket Pro's ball-by-ball scoring.
   */
  sports?: string[];
}

/**
 * Is this module offered to a club playing `sportType`?
 *
 * Fails open: a module with no `sports` list suits everyone, and an unknown or
 * missing sport shows the full catalogue rather than silently hiding tools from
 * a club whose sport simply hasn't been set.
 */
export function moduleSuitsSport(mod: ModuleDef, sportType?: string | null): boolean {
  if (!mod.sports || mod.sports.length === 0) return true;
  if (!sportType) return true;
  return mod.sports.includes(sportType);
}

export const MODULE_CATALOG: ModuleDef[] = [
  {
    key: "volunteers",
    name: "Volunteer One",
    badge: "VM",
    tagline: "Rosters, reminders and thank-yous — sorted.",
    summary:
      "Build fair game-day rosters, fill gaps fast, and message your volunteers across SMS, email and push from one place.",
    overview: [
      "AI-assisted roster builder proposes a fair draft you approve — it never sends anything on its own.",
      "Track availability, roles and hours per person across the season.",
      "One-tap dispatch to volunteers via SMS, email or app push.",
      "See who's confirmed, who's pending, and who still needs a nudge.",
    ],
    quickstart: [
      { title: "Add your people", body: "Import or add volunteers with their roles and contact details." },
      { title: "Build a roster", body: "Pick a date and let the roster builder propose a fair draft, then adjust." },
      { title: "Send it out", body: "Dispatch the roster and reminders, and watch confirmations come back in." },
    ],
    plan: "SportsWeb add-on",
  },
  {
    key: "ticketing",
    name: "Ticket One",
    badge: "T1",
    tagline: "Sell tickets and run events end to end.",
    summary:
      "Create events, sell tickets, scan entry at the gate and reconcile takings — all from one place, branded to your club.",
    overview: [
      "Paid and free tickets with QR / PIN entry scanning at the gate.",
      "Tickets emailed on purchase, with save-as-PDF for buyers.",
      "Attendance and break-even reporting with simple charts.",
    ],
    quickstart: [
      { title: "Create an event", body: "Set the date, venue and ticket types." },
      { title: "Share the link", body: "Put tickets on your site and socials." },
      { title: "Scan at the gate", body: "Use the gate-code scanner on the day." },
    ],
    plan: "SportsWeb add-on",
  },
  {
    key: "live-scores",
    name: "Live Scores",
    badge: "LS",
    tagline: "Live scores, results and AI-curated match reports.",
    summary:
      "Score the match live, then turn a few dot points into a full match report instantly with AI — published straight to your site and embeddable anywhere. Built for OzTag first, with AFL support included.",
    overview: [
      "Live score entry with a public scoreboard that updates in real time — no refresh needed.",
      "Post-game: jot dot points and get an AI-curated match report in seconds, editable before you publish.",
      "Works as an in-page module here, or as a standalone embeddable widget on any page.",
      "Sport-aware scoring (OzTag tries, AFL goals/behinds) — more sports to follow.",
    ],
    quickstart: [
      { title: "Start a match", body: "Create a match, set the teams, competition and venue." },
      { title: "Score it live", body: "Tap the score buttons as it happens — the public widget updates instantly." },
      { title: "Publish the report", body: "Add a few dot points after the match, generate the AI report, review and publish." },
    ],
    plan: "SportsWeb add-on",
  },
  {
    key: "fixtures-ladder",
    name: "Fixtures & Ladder",
    badge: "FX",
    tagline: "The season draw, results and a ladder that keeps itself up to date.",
    summary:
      "Build the season fixture list, enter results as they come in, and the ladder computes itself — always current, always correct, published straight to your site and embeddable anywhere. Shares the same team directory as Live Scores, so a team's logo only ever needs entering once.",
    overview: [
      "Enter fixtures round by round — competition, grade, venue, date and time.",
      "Enter a result and the ladder recalculates instantly, from the results themselves.",
      "Works as an in-page Match Centre module here, or as a standalone embeddable widget on any page.",
      "Same team directory as Live Scores — logos and colours carry across automatically.",
    ],
    quickstart: [
      { title: "Build the draw", body: "Add each round's fixtures — teams, venue, date and time." },
      { title: "Enter results", body: "Mark a fixture completed and add the score." },
      { title: "Watch the ladder update", body: "No extra step — the ladder recalculates from results automatically." },
    ],
    plan: "SportsWeb add-on",
  },
  {
    key: "live-scores-cricket-pro",
    name: "Cricket Pro",
    badge: "CP",
    tagline: "Full ball-by-ball cricket scoring, batting & bowling cards.",
    summary:
      "The premium cricket tier on top of Live Scores — score every ball, get live batting and bowling scorecards, run rate and required run rate, all published to your site automatically. Requires Live Scores to be enabled.",
    overview: [
      "Ball-by-ball entry: runs, wides, no-balls, byes/leg-byes and wickets with dismissal type.",
      "Live batting and bowling scorecards, generated automatically from every ball bowled.",
      "Run rate and required run rate for a run chase.",
      "Undo the last ball if you mis-key — every figure recalculates from what's left.",
    ],
    quickstart: [
      { title: "Enable Live Scores first", body: "Cricket Pro is an upgrade on top of the base Live Scores module." },
      { title: "Start a Cricket match", body: "Create a match and pick Cricket as the sport." },
      { title: "Score ball by ball", body: "Open the Cricket Pro tab and score every ball as it happens." },
    ],
    plan: "SportsWeb add-on — premium",
    // Ball-by-ball scoring is meaningless outside cricket, so it is only offered
    // to cricket clubs rather than sitting locked on every other club's grid.
    sports: ["cricket"],
  },
  {
    // Key matches the existing club_modules rows written while this was a
    // "coming soon" tile, so clubs already switched off stay switched off.
    key: "team_lineups",
    name: "Team Line-Ups",
    badge: "TL",
    tagline: "Pick your teams on a branded field graphic and share them everywhere.",
    summary:
      "Select each team on a club-branded field graphic, add sponsors and headshots, then export a clean image for socials or embed it on your site.",
    overview: [
      "Drag players onto positions on a club-branded field.",
      "Add sponsor banners, headshots and competition logos.",
      "Export to PNG / Instagram, or embed straight on your website.",
      "Save by round and clone last week's team to start fast.",
    ],
    quickstart: [
      { title: "Pick a team & round", body: "Choose the grade and round you're selecting for." },
      { title: "Place your players", body: "Drop players onto their positions and add any sponsors." },
      { title: "Share it", body: "Export the image or grab the embed link for your site." },
    ],
    // Opens the line-ups editor in a new tab. `?admin` because the app's default
    // view is the chrome-free public graphic meant for embedding, not the editor.
    // No `?club=` yet: that param takes the line-ups app's OWN club id, and the
    // two products share no club identity — see docs/team-lineups-integration.md.
    appUrl: "https://afl-team-line-ups.vercel.app/?admin",
    plan: "SportsWeb module",
  },
  {
    key: "learn",
    name: "Club Learn",
    badge: "LN",
    tagline: "Onboarding and accreditation, all in one library.",
    summary:
      "Powered by Zoho Learn — give coaches, officials and committee members a single place for courses, policies and inductions.",
    overview: [
      "Host coach and volunteer inductions as short, trackable courses.",
      "Keep child-safety, first-aid and policy docs in one searchable library.",
      "See who has completed what, and send reminders for what's outstanding.",
    ],
    quickstart: [
      { title: "Create a course", body: "Group your induction videos and documents into a simple course." },
      { title: "Invite members", body: "Add coaches and volunteers and assign the courses they need." },
      { title: "Track completion", body: "Use the dashboard to see progress and follow up on gaps." },
    ],
    appUrl: "https://learn.zoho.com.au",
    plan: "Zoho-powered add-on",
  },
  {
    key: "books",
    name: "Club Finance",
    badge: "BK",
    tagline: "Invoices, payments and a clean set of books.",
    summary:
      "Powered by Zoho Books — raise sponsor invoices, track payments and hand your treasurer a tidy end-of-season report.",
    overview: [
      "Send branded sponsor and membership invoices and track what's paid.",
      "Reconcile club bank transactions without spreadsheets.",
      "Produce treasurer and committee reports in a couple of clicks.",
    ],
    quickstart: [
      { title: "Set up the club", body: "Add your club details, bank account and a logo for invoices." },
      { title: "Raise an invoice", body: "Invoice a sponsor or member and send it straight from the app." },
      { title: "Reconcile", body: "Match payments to invoices so your books always balance." },
    ],
    appUrl: "https://books.zoho.com.au",
    plan: "Zoho-powered add-on",
  },
  {
    key: "bookings",
    name: "Club Bookings",
    badge: "BO",
    tagline: "Ground, rooms and events — bookable online.",
    summary:
      "Powered by Zoho Bookings — let members and the community book your facilities, with confirmations and reminders handled for you.",
    overview: [
      "Take online bookings for the clubrooms, ground or function space.",
      "Automatic confirmations and reminders cut down no-shows.",
      "Set availability, buffers and who gets notified for each space.",
    ],
    quickstart: [
      { title: "Add a space", body: "Create a bookable resource — clubrooms, ground or a coach." },
      { title: "Set availability", body: "Choose the hours and rules for when it can be booked." },
      { title: "Share the link", body: "Drop the booking link on your site and socials." },
    ],
    appUrl: "https://bookings.zoho.com.au",
    plan: "Zoho-powered add-on",
  },
  {
    key: "forms",
    name: "Club Forms",
    badge: "FM",
    tagline: "Registrations and sign-ups without the paper.",
    summary:
      "Powered by Zoho Forms — collect registrations, expressions of interest and consent forms with everything flowing into one place.",
    overview: [
      "Build registration and EOI forms that match your club branding.",
      "Collect payments and consents alongside the details you need.",
      "Export responses or pipe them into your other club tools.",
    ],
    quickstart: [
      { title: "Pick a template", body: "Start from a registration or EOI template and tweak the fields." },
      { title: "Add it to your site", body: "Embed the form or share its link." },
      { title: "Manage responses", body: "Review submissions and export them whenever you need." },
    ],
    appUrl: "https://forms.zoho.com.au",
    plan: "Zoho-powered add-on",
  },
];

export function getModule(key: string | undefined): ModuleDef | null {
  if (!key) return null;
  return MODULE_CATALOG.find((m) => m.key === key) ?? null;
}
