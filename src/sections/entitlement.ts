// F2 P2 -- PR 2: the section data + entitlement contract.
// docs/F2-design-doc.md sec 4/5. Content sections render from their own props; Collection
// and Module sections render from CLUB DATA supplied here. This is the seam the renderer
// (PR 3) and loader (PR 5) satisfy -- the section components never fetch, they read this.
//
// RULE 9 (sec 5): a section with no data renders its defined empty state or nothing. It
// never falls back to sample/demo/other-club data. This context only ever carries the
// club's own records; there is no sample source to fall back to.
import type {
  ClubConfig,
  ClubEvent,
  DocItem,
  MatchCentreData,
  NewsPost,
  Person,
  Sponsor,
  TeamGroup,
} from "../content/types";
import type { SectionType } from "./schemas";

/** An owned social highlight (source for social_feed). The social_highlights table lands
 *  at P6; until then this is always empty and social_feed shows its empty state. */
export interface SocialHighlight {
  platform: string;
  postUrl: string;
  imageUrl?: string;
  caption?: string;
  postedAt?: string;
}

/** Everything a section component may read. Global fields for Content sections that bind
 *  them (contact), typed records for Collection sections, module data + entitlement for
 *  Module sections. No fetching happens in a component -- the renderer builds this once. */
export interface SectionContext {
  identity: ClubConfig["identity"];
  contact: ClubConfig["contact"];
  // collections
  news: NewsPost[];
  events: ClubEvent[];
  sponsors: Sponsor[];
  committee: Person[];
  teams: TeamGroup[];
  documents: DocItem[];
  socialHighlights: SocialHighlight[];
  // module-owned data
  matchCentre: MatchCentreData | null;
  /** Module entitlement check. True -> render (data or empty state). False -> render
   *  NOTHING (sec 5, rule 6). Content/Collection sections are never gated: for them
   *  entitlementKeyFor() is null and this returns true. */
  isEntitled: (type: SectionType) => boolean;
}

// ---- Match Centre entitlement -- DECIDED here (was undefined; sec 4/9) ------
//
// The Module class is entitlement-gated. Match data (fixtures/results/ladder) and the
// scoreboard are gated by ONE capability key, "match_centre", carried in the club's
// existing capability list (ClubConfig.enabledModules) -- the same list the paid add-on
// modules use. There is deliberately no bespoke flag: one capability list, checked one way.
//
//   WHERE IT LIVES:  ClubConfig.enabledModules includes "match_centre".
//   WHO GRANTS IT:   a "match_centre" catalog entry + a provisioning migration at P5/P6
//                    grants it to every club that already has Match Centre data. (Held with
//                    the rest of the backend -- not in this PR.)
//   HOW A SECTION CHECKS IT:  ctx.isEntitled(type).
//
// FLAG for Carson: "match_centre" is NOT yet a module in src/lib/modules.ts and no club has
// it enabled. Until that provisioning lands, sectionContextFromClub() below treats a club
// with REAL match data as entitled (the interim rule, in ONE place) so a working fixtures
// feature is not hidden behind an unprovisioned flag. This never invents data -- it only
// decides whether to show a section whose data already exists.
//
// This rule SELF-HEALS now that seeding is stripped (Brief 09 sec 2f): create_trial_club no
// longer seeds fake matches, so once no club is born with fabricated fixtures, "has match
// data" genuinely means the club entered a season -- and "real data => entitled" is a safe
// proxy, not a leak. It collapses to `enabled.has(key)` when P5 provisions the capability.
// (Demo clubs keep their labelled fixtures; clubs.is_demo says that is fine.)
const ENTITLEMENT_KEY: Partial<Record<SectionType, string>> = {
  match_data: "match_centre",
  scoreboard: "match_centre",
};

/** The capability key a section requires, or null if it is never entitlement-gated. */
export function entitlementKeyFor(type: SectionType): string | null {
  return ENTITLEMENT_KEY[type] ?? null;
}

/** Does this club have any real Match Centre data? Used only by the interim entitlement
 *  rule above; drops out once "match_centre" is a provisioned capability. */
function hasMatchCentreData(mc: MatchCentreData | null | undefined): boolean {
  if (!mc || mc.placeholder) return false;
  return (mc.fixtures?.length ?? 0) + (mc.results?.length ?? 0) + (mc.ladder?.length ?? 0) > 0;
}

/** Build the section data context from a resolved ClubConfig. The renderer (PR 3) calls
 *  this once per page render; components read the result. */
export function sectionContextFromClub(cfg: ClubConfig): SectionContext {
  const enabled = new Set(cfg.enabledModules ?? []);
  const matchCentre = cfg.matchCentre ?? null;

  return {
    identity: cfg.identity,
    contact: cfg.contact,
    news: cfg.news ?? [],
    events: cfg.events ?? [],
    sponsors: cfg.sponsors ?? [],
    committee: cfg.committee ?? [],
    teams: cfg.teams ?? [],
    documents: cfg.documents ?? [],
    // social_highlights table not built yet (P6): honest empty, never sample content.
    socialHighlights: [],
    matchCentre,
    isEntitled: (type) => {
      const key = entitlementKeyFor(type);
      if (key === null) return true; // content + collection: always entitled
      if (enabled.has(key)) return true; // provisioned capability
      // INTERIM (see note above): don't hide a real, working feature behind an
      // unprovisioned flag. Collapses to `enabled.has(key)` once P5/P6 provisions it.
      if (key === "match_centre") return hasMatchCentreData(matchCentre);
      return false;
    },
  };
}
