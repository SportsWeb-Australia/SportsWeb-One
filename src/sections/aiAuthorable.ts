// F2 P2 -- PR 2 (extended): aiAuthorable. The fence for TRUTH, one layer up from zod.
// docs/F2-design-doc.md sec 4/5. zod stops malformed sections; aiAuthorable stops untrue
// ones. The manual AI test proved a schema-valid section can still fabricate club facts, so
// every field carries a classification the P7 generation path MUST honour:
//   free         -- the AI may write it (headings, CTAs, invitations, structural copy).
//   grounded     -- only from facts in the brief/club record (numbers, dates, counts, names,
//                   venues, media URLs). No fact supplied -> OMIT the field or the section.
//                   Never a placeholder, never invented.
//   enhance-only -- improve HUMAN-supplied input only (reword/tighten); never originate. No
//                   input -> the section is omitted. For any section in a named human's voice.
import type { SectionType } from "./schemas";

export type AiAuthorable = "free" | "grounded" | "enhance-only";

// Per-section, per-top-level-field overrides. A field not listed defaults to "free"
// (structural / display config -- Collections & Modules bind to data, so rule 9 already
// protects them). Nested fields inherit their top-level parent's class.
export const AI_AUTHORABLE: Record<SectionType, Record<string, AiAuthorable>> = {
  // Content -- prose is where fabrication lives.
  hero: { media: "grounded", stats: "grounded", note: "grounded", titleRich: "grounded" }, // real numbers/status only, never invented; title/subtitle/CTAs free
  announcement_bar: { text: "grounded", items: "grounded" }, // announcements state specifics (dates, states)
  rich_text: { body: "grounded", photo: "grounded" }, // the test proved stats + prose facts get fabricated here
  quick_links: {},
  cta_band: { media: "grounded" },
  president_welcome: {
    name: "grounded",
    role: "grounded",
    portrait: "grounded",
    body: "enhance-only", // a named human's voice: enhance, never forge (doc sec 5)
  },
  contact: {}, // toggles only; the data binds from the club record
  clubs_directory: { clubs: "grounded" }, // real member clubs only, never invented to fill a grid
  team_lineup: { players: "grounded" }, // real named players only
  photo_strip: { photos: "grounded" }, // real photo URLs only, never invented to fill a strip
  // Collection -- display config only; the rows come from tables (rule 9 at the data layer).
  news: {},
  events: {},
  sponsors: {},
  committee: {},
  teams: {},
  documents: {},
  social_feed: {},
  // Module -- config only; data is module-owned + entitlement-gated.
  match_data: {},
  scoreboard: {},
  ticker: {},
};

/** The class of a field, defaulting to "free". */
export function aiAuthorableFor(type: SectionType, field: string): AiAuthorable {
  return AI_AUTHORABLE[type]?.[field] ?? "free";
}
