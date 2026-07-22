// F2 P2 -- PR 2: THE REGISTRY. One entry per section type -- class, schema, render
// component, (stub) editor, entitlement key. This is the single source of truth the
// renderer (PR 3), the editor palette (later), and the AI authoring path (P6) all read.
// docs/F2-design-doc.md sec 4/5 (LOCKED).
import type { ComponentType } from "react";
import type { ZodTypeAny } from "zod";
import type { SectionContext } from "./entitlement";
import { entitlementKeyFor } from "./entitlement";
import { AI_AUTHORABLE, type AiAuthorable } from "./aiAuthorable";
import { CARDINALITY, type Cardinality } from "./cardinality";
import {
  SECTION_SCHEMAS,
  sectionInstanceSchema,
  type PropsOf,
  type SectionClass,
  type SectionInstance,
  type SectionType,
} from "./schemas";
import {
  AnnouncementBarSection,
  ContactSection,
  CtaBandSection,
  HeroSection,
  PresidentWelcomeSection,
  QuickLinksSection,
  RichTextSection,
} from "./components/content";
import {
  CommitteeSection,
  DocumentsSection,
  EventsSection,
  NewsSection,
  SocialFeedSection,
  SponsorsSection,
  TeamsSection,
} from "./components/collection";
import { MatchDataSection, ScoreboardSection } from "./components/module";
import {
  AppGridSection,
  FeatureBannerSection,
  NewsletterSection,
  PhotoStripSection,
  ClubsDirectorySection,
  IdentitySection,
  PlayerSpotlightSection,
  AlertsSection,
} from "./components/rdca";

/** What the renderer passes a section component: validated props + the club data context. */
export type SectionComponent<T extends SectionType = SectionType> = ComponentType<{
  props: PropsOf<T>;
  ctx: SectionContext;
}>;

/** What a section editor receives (stubbed in this PR; real editors land with the admin UI). */
export type SectionEditor<T extends SectionType = SectionType> = ComponentType<{
  value: PropsOf<T>;
  onChange: (next: PropsOf<T>) => void;
}>;

export interface SectionDef<T extends SectionType = SectionType> {
  type: T;
  /** Human label for the section palette. */
  label: string;
  sectionClass: SectionClass;
  schema: ZodTypeAny;
  Component: SectionComponent<T>;
  Editor: SectionEditor<T>;
  /** Capability required to render (Module class), or null if never gated. */
  entitlementKey: string | null;
  /** Per-field AI-authoring class (free | grounded | enhance-only). The truth fence the P7
   *  generation path honours; a field not listed is "free". See ./aiAuthorable + doc sec 4/5. */
  aiAuthorable: Record<string, AiAuthorable>;
  /** Page cardinality: "single" (max one per page, enforced) or "many" (freely duplicable).
   *  The composer greys out / blocks a used singleton. See ./cardinality + doc sec 7. */
  cardinality: Cardinality;
}

// A stub editor -- the admin editing UI is a later PR. Real, non-embarrassing placeholder.
function makeStubEditor<T extends SectionType>(type: T, label: string): SectionEditor<T> {
  const Stub: SectionEditor<T> = () => (
    <div className="sw-sec-editor-stub" data-section-type={type}>
      <strong>{label}</strong>
      <span>Editing UI arrives with the admin composer. Content is edited as page-document JSON for now.</span>
    </div>
  );
  Stub.displayName = `StubEditor(${type})`;
  return Stub;
}

// Build one registry entry. Widens the component/schema to the map's shared type while the
// per-type argument keeps each registration type-checked at the call site.
function def<T extends SectionType>(
  type: T,
  label: string,
  sectionClass: SectionClass,
  Component: SectionComponent<T>,
): SectionDef {
  return {
    type,
    label,
    sectionClass,
    schema: SECTION_SCHEMAS[type],
    Component: Component as SectionComponent,
    Editor: makeStubEditor(type, label) as SectionEditor,
    entitlementKey: entitlementKeyFor(type),
    aiAuthorable: AI_AUTHORABLE[type],
    cardinality: CARDINALITY[type],
  };
}

export const SECTION_REGISTRY: Record<SectionType, SectionDef> = {
  // content (7)
  hero: def("hero", "Hero", "content", HeroSection),
  announcement_bar: def("announcement_bar", "Announcement bar", "content", AnnouncementBarSection),
  rich_text: def("rich_text", "Rich text", "content", RichTextSection),
  quick_links: def("quick_links", "Quick links", "content", QuickLinksSection),
  cta_band: def("cta_band", "Call to action", "content", CtaBandSection),
  president_welcome: def("president_welcome", "President welcome", "content", PresidentWelcomeSection),
  contact: def("contact", "Contact", "content", ContactSection),
  // content -- RDCA additions (Brief 10)
  app_grid: def("app_grid", "App buttons", "content", AppGridSection),
  feature_banner: def("feature_banner", "Feature banner", "content", FeatureBannerSection),
  newsletter: def("newsletter", "Newsletter", "content", NewsletterSection),
  photo_strip: def("photo_strip", "Photo strip", "content", PhotoStripSection),
  clubs_directory: def("clubs_directory", "Clubs directory", "content", ClubsDirectorySection),
  identity: def("identity", "Identity card", "content", IdentitySection),
  player_spotlight: def("player_spotlight", "Player spotlight", "content", PlayerSpotlightSection),
  alerts: def("alerts", "Alerts", "content", AlertsSection),
  // collection (7) -- social_feed reclassified here (sec 4)
  news: def("news", "News", "collection", NewsSection),
  events: def("events", "Events", "collection", EventsSection),
  sponsors: def("sponsors", "Sponsors", "collection", SponsorsSection),
  committee: def("committee", "Committee", "collection", CommitteeSection),
  teams: def("teams", "Teams", "collection", TeamsSection),
  documents: def("documents", "Documents", "collection", DocumentsSection),
  social_feed: def("social_feed", "Social highlights", "collection", SocialFeedSection),
  // module (2) -- entitlement-gated
  match_data: def("match_data", "Match centre", "module", MatchDataSection),
  scoreboard: def("scoreboard", "Scoreboard", "module", ScoreboardSection),
};

export const SECTION_TYPES = Object.keys(SECTION_REGISTRY) as SectionType[];

/** Type guard: is this string a registered section type? */
export function isSectionType(type: string): type is SectionType {
  return Object.prototype.hasOwnProperty.call(SECTION_REGISTRY, type);
}

// ---- the renderer's validate-or-skip resolver (sec 5, rules 2-5) ------------
export type ResolvedSection =
  | { ok: true; def: SectionDef; instance: SectionInstance }
  | { ok: false; reason: string; id?: string; type?: string };

/**
 * Validate one raw layout entry against the registry. The renderer (PR 3) walks the layout
 * array, calls this per entry, renders `def.Component` with the validated props on ok, and
 * SKIPS (logging `reason`) otherwise -- never white-screening on one bad section.
 */
export function resolveSection(raw: unknown): ResolvedSection {
  const shell = sectionInstanceSchema.safeParse(raw);
  if (!shell.success) return { ok: false, reason: "malformed section instance" };
  const { id, type, props, visible, column } = shell.data;

  if (visible === false) return { ok: false, reason: "hidden", id, type };
  if (!isSectionType(type)) return { ok: false, reason: "unknown section type", id, type };

  const parsed = SECTION_REGISTRY[type].schema.safeParse(props);
  if (!parsed.success) return { ok: false, reason: `invalid props: ${parsed.error.issues[0]?.message ?? "?"}`, id, type };

  return {
    ok: true,
    def: SECTION_REGISTRY[type],
    instance: { id, type, props: parsed.data, visible, column },
  };
}
