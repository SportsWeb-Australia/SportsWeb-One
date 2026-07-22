// F2 P2 -- PR 2 (extended): cardinality. The fence for a SENSIBLE page, one layer up again.
// docs/F2-design-doc.md sec 7 ("impossible to break"). zod stops invalid sections;
// aiAuthorable stops untrue ones; cardinality stops a page that validates but looks broken --
// three heroes, four sponsor strips, a contact section in the middle. Some sections are
// page SINGLETONS (max one); everything else is freely duplicable (the point of the model,
// proven by gate 4). This lives in the registry with the other invariants -- not a palette
// shortlist, a per-type property.
import type { SectionType } from "./schemas";

export type Cardinality = "single" | "many";

export const CARDINALITY: Record<SectionType, Cardinality> = {
  // Singletons -- max one per page, enforced (palette greys out once used; composer blocks the dup).
  hero: "single",
  announcement_bar: "single",
  contact: "single",
  president_welcome: "single",
  // RDCA additions: identity + newsletter + alerts are page singletons; the rest duplicable.
  identity: "single",
  newsletter: "single",
  alerts: "single",
  // Everything else -- freely duplicable.
  app_grid: "many",
  feature_banner: "many",
  photo_strip: "many",
  clubs_directory: "many",
  player_spotlight: "many",
  rich_text: "many",
  quick_links: "many",
  cta_band: "many",
  news: "many",
  events: "many",
  sponsors: "many",
  committee: "many",
  teams: "many",
  documents: "many",
  social_feed: "many",
  match_data: "many",
  scoreboard: "many",
};

export function cardinalityFor(type: SectionType): Cardinality {
  return CARDINALITY[type];
}

/** Can a section of `type` be added to a page that already contains `existingTypes`?
 *  Singletons may be added only if not already present. The composer uses this for both the
 *  palette (grey out) and the add/duplicate block. */
export function canAddSection(type: SectionType, existingTypes: readonly SectionType[]): boolean {
  return CARDINALITY[type] === "many" || !existingTypes.includes(type);
}
