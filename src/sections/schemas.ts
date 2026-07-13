// F2 P2 -- PR 2: the section prop schemas. THE CONTRACT.
// docs/F2-design-doc.md sec 4 (LOCKED). One zod schema per section type; the renderer
// (PR 3) validates props against these and skips any section that fails -- a total
// renderer that never white-screens on bad props. Both locked schema fixes live here:
//   1. hero.media is a single { kind, url?, poster? } union (was two separate keys).
//   2. rich_text.body is a closed Block[] union (see ./blocks) -- raw HTML banned.
//
// The section CLASS decides where content comes from, not how it validates:
//   Content    -- props hold the authored content. This is the AI authoring surface.
//   Collection -- records live in a typed table; props are display config only.
//   Module     -- data owned by a module; entitlement-gated (see ./entitlement); props
//                 are config only.
import { z } from "zod";
import { blockSchema } from "./blocks";

// ---- shared leaf schemas ----------------------------------------------------
/** A link. href may be an internal route ("/register") or an absolute URL. We reject
 *  javascript:/data: schemes at the schema boundary -- a section prop is never a script
 *  sink, and a bad href must fail validation (skip the section) rather than render. */
const safeHref = z
  .string()
  .min(1)
  .refine((h) => !/^\s*(javascript|data|vbscript):/i.test(h), { message: "unsafe href scheme" });

const linkRef = z.object({ label: z.string().min(1), href: safeHref });

// =============================================================================
// CONTENT (7) -- props hold the content.
// =============================================================================
export const heroSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  primaryCta: linkRef.optional(),
  secondaryCta: linkRef.optional(),
  // The media fix: one union, not separate image/video keys.
  media: z
    .object({
      kind: z.enum(["none", "image", "video"]),
      url: z.string().optional(),
      poster: z.string().optional(),
    })
    .optional(),
  // Hero LAYOUT is a section variant (a fixed menu), NOT a theme -- the one structural
  // difference the token thesis cannot express (stadium/editorial/momentum/coastal were
  // media-full / media-split / media-diagonal hero layouts in the legacy CSS). Absent =
  // 'centred'. This is the doc sec 7 "variants within a section", not an escape hatch.
  layout: z.enum(["centred", "media-full", "media-split", "media-diagonal"]).optional(),
});

export const announcementBarSchema = z.object({
  enabled: z.boolean(),
  text: z.string().min(1),
  link: linkRef.optional(),
});

export const richTextSchema = z.object({
  heading: z.string().optional(),
  body: z.array(blockSchema).min(1),
});

export const quickLinksSchema = z.object({
  heading: z.string().optional(),
  links: z.array(linkRef.extend({ icon: z.string().optional() })).min(1),
});

export const ctaBandSchema = z.object({
  heading: z.string().min(1),
  blurb: z.string().optional(),
  actions: z.array(linkRef).min(1),
});

export const presidentWelcomeSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  portrait: z.string().optional(),
  body: z.array(z.string().min(1)).min(1),
  signoff: z.string().optional(),
});

/** Contact binds GLOBAL club fields (identity/contact); props only toggle what shows. */
export const contactSchema = z.object({
  heading: z.string().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showAddress: z.boolean().optional(),
  showMap: z.boolean().optional(),
});

// =============================================================================
// COLLECTION (7) -- records live in a typed table; props are display config.
// social_feed is here, not under Module: sec 4 reclassified it as an owned
// collection (source: social_highlights), never a Meta integration.
// =============================================================================
export const newsSchema = z.object({
  heading: z.string().optional(),
  layout: z.enum(["feature", "grid", "list"]),
  count: z.number().int().positive().max(24),
});

export const eventsSchema = z.object({
  heading: z.string().optional(),
  count: z.number().int().positive().max(24),
  window: z.enum(["upcoming", "all"]).optional(),
});

export const sponsorsSchema = z.object({
  heading: z.string().optional(),
  display: z.enum(["strip", "wall", "tiered"]),
  showBlurb: z.boolean().optional(),
  tiers: z.array(z.enum(["platinum", "gold", "silver"])).optional(),
});

export const committeeSchema = z.object({
  heading: z.string().optional(),
  roles: z.array(z.string().min(1)).optional(),
});

export const teamsSchema = z.object({
  heading: z.string().optional(),
  groupBy: z.enum(["sport", "none"]).optional(),
  linkTo: z.enum(["page", "none"]).optional(),
});

export const documentsSchema = z.object({
  heading: z.string().optional(),
  kinds: z.array(z.enum(["policy", "form", "guide", "welfare"])).optional(),
});

export const socialFeedSchema = z.object({
  heading: z.string().optional(),
  source: z.literal("highlights"), // the only source today; a Meta adapter is a future source
  count: z.number().int().positive().max(24),
});

// =============================================================================
// MODULE (2) -- data owned by a module; entitlement-gated (see ./entitlement).
// Props are config only.
// =============================================================================
export const matchDataSchema = z.object({
  mode: z.enum(["fixtures", "results", "ladder", "combined"]),
  grade: z.string().optional(),
  count: z.number().int().positive().max(50).optional(),
});

export const scoreboardSchema = z.object({
  showLast: z.boolean().optional(),
  showNext: z.boolean().optional(),
  showLadderPos: z.boolean().optional(),
});

// ---- the type union + per-type schema map -----------------------------------
export const SECTION_SCHEMAS = {
  // content
  hero: heroSchema,
  announcement_bar: announcementBarSchema,
  rich_text: richTextSchema,
  quick_links: quickLinksSchema,
  cta_band: ctaBandSchema,
  president_welcome: presidentWelcomeSchema,
  contact: contactSchema,
  // collection
  news: newsSchema,
  events: eventsSchema,
  sponsors: sponsorsSchema,
  committee: committeeSchema,
  teams: teamsSchema,
  documents: documentsSchema,
  social_feed: socialFeedSchema,
  // module
  match_data: matchDataSchema,
  scoreboard: scoreboardSchema,
} as const;

export type SectionType = keyof typeof SECTION_SCHEMAS;
export type SectionClass = "content" | "collection" | "module";

/** Props type for a given section type, inferred from its schema. */
export type PropsOf<T extends SectionType> = z.infer<(typeof SECTION_SCHEMAS)[T]>;

/** A single entry in a page's layout document (club_pages.draft_layout / published_layout). */
export interface SectionInstance<T extends SectionType = SectionType> {
  /** Stable id for reordering + version diffs. */
  id: string;
  type: T;
  /** Validated against SECTION_SCHEMAS[type] by the renderer before use. */
  props: PropsOf<T>;
  /** false -> renderer skips it (sec 5, rule 5). Absent = visible. */
  visible?: boolean;
}

/** The raw (unvalidated) instance shape as it arrives from the layout document. */
export const sectionInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.unknown(),
  visible: z.boolean().optional(),
});
