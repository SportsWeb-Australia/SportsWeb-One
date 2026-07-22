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
  /** Optional styled headline: an ordered run of plain-text segments, each optionally
   *  emphasised. Renders as spans (accent = brand colour, ghost = outline stroke). A closed
   *  union of styles -- raw HTML stays banned; `title` is the plain fallback + AI surface. */
  titleRich: z
    .array(z.object({ text: z.string().min(1), style: z.enum(["accent", "ghost"]).optional(), break: z.boolean().optional() }))
    .max(12)
    .optional(),
  subtitle: z.string().optional(),
  primaryCta: linkRef.optional(),
  secondaryCta: linkRef.optional(),
  /** Small badges above the stat strip (e.g. season / round). `live` shows the pulse dot. */
  badges: z.array(z.object({ text: z.string().min(1), live: z.boolean().optional() })).max(3).optional(),
  /** A short note beside the badges ("Round 14 of 18 underway"). */
  note: z.string().optional(),
  /** Up to 6 headline club stats pinned to the bottom of the feature hero. `icon` is a
   *  Tabler icon name (e.g. "ti-trophy"); validated as a plain token, never markup. */
  stats: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1), icon: z.string().optional() }))
    .max(6)
    .optional(),
  // The media fix: one union, not separate image/video keys.
  media: z
    .object({
      kind: z.enum(["none", "image", "video"]),
      url: z.string().optional(),
      poster: z.string().optional(),
    })
    .optional(),
  // Hero LAYOUT is a section variant (a fixed menu), NOT a theme -- the one structural
  // difference the token thesis cannot express. 'feature' is the RDCA two-column hero (content
  // + a 440px right slot that can hold the Home Match Centre card). Absent = 'centred'.
  layout: z.enum(["centred", "feature", "media-full", "media-split", "media-diagonal"]).optional(),
  /** Feature hero only: render the live-match card in the 440px right slot, reading from the
   *  same source as `scoreboard` (ctx.matchCentre.current) and gated by Match Centre
   *  entitlement. Not entitled / no current match -> single-column hero, no empty box (Rule 9). */
  showMatchCard: z.boolean().optional(),
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

// ---- RDCA content types (Brief 10 / audit sec 1a) ---------------------------
/** App-launcher: a grid of icon tiles (Fixtures / Results / Ladders / ...). Distinct icon-tile
 *  form, not quick_links (audit sec 3). `icon` is a Tabler token; `image` an optional logo tile. */
export const appGridSchema = z.object({
  heading: z.string().optional(),
  tiles: z
    .array(z.object({ label: z.string().min(1), href: safeHref, icon: z.string().optional(), image: z.string().optional() }))
    .min(1)
    .max(8),
});

/** Feature banner: a photo band with an eyebrow / headline / blurb and one CTA. Absorbs the RDCA
 *  "Rep Cricket" (tall) and "Umpires" (compact) sections -- one type, a size variant (audit sec 7/9). */
export const featureBannerSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  blurb: z.string().optional(),
  image: z.string().optional(),
  cta: linkRef.optional(),
  variant: z.enum(["tall", "compact"]).optional(),
});

/** Newsletter signup band. The input is display-only for now (no list backend); the CTA is the real
 *  action. `heading` free; copy is structural. */
export const newsletterSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  blurb: z.string().optional(),
  placeholder: z.string().optional(),
  cta: linkRef.optional(),
});

/** Photo strip: a scrolling row of images (a gallery teaser). `url` real media, never invented. */
export const photoStripSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  viewAllHref: safeHref.optional(),
  images: z.array(z.object({ url: z.string().min(1), href: safeHref.optional(), caption: z.string().optional() })).min(1).max(20),
});

/** Clubs directory: member clubs grouped by division (association-level). Author-provided tiles
 *  (there is no member-club table); `logo`/`href` are real when supplied. */
export const clubsDirectorySchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  viewAllHref: safeHref.optional(),
  divisions: z
    .array(
      z.object({
        name: z.string().min(1),
        clubs: z.array(z.object({ name: z.string().min(1), href: safeHref.optional(), logo: z.string().optional() })).min(1),
      }),
    )
    .min(1)
    .max(12),
});

/** Identity card (sidebar): the club's own identity, over an optional cover image. Binds global
 *  club fields (name/founded/ground) via ctx; props add the cover + a short blurb. */
export const identitySchema = z.object({
  heading: z.string().optional(),
  image: z.string().optional(),
  blurb: z.string().optional(),
  showFounded: z.boolean().optional(),
  showGround: z.boolean().optional(),
});

/** Player spotlight (sidebar): a featured player card. `name`/`stat` are grounded facts. */
export const playerSpotlightSchema = z.object({
  heading: z.string().optional(),
  image: z.string().optional(),
  name: z.string().min(1),
  meta: z.string().optional(),
  stat: z.object({ value: z.string().min(1), label: z.string().min(1) }).optional(),
  blurb: z.string().optional(),
  href: safeHref.optional(),
});

/** Alerts band (sidebar): a notices / match-day alert prompt (red-accented). The toggle is display
 *  only for now; `cta` is the real action. */
export const alertsSchema = z.object({
  heading: z.string().optional(),
  blurb: z.string().optional(),
  cta: linkRef.optional(),
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
  /** RDCA competition hub: 'tabs' shows ladder/fixtures/results as switchable tabs (one at a time);
   *  'stacked' (default) shows each enabled block in sequence. Display only. */
  display: z.enum(["stacked", "tabs"]).optional(),
});

/** Ticker: a live-score strip. Module (Match Centre). Data from ctx.matchCentre.ticker; config only. */
export const tickerSchema = z.object({
  heading: z.string().optional(),
});

/** Top performers: a leaderboard. Module (Match Centre). Data from ctx.matchCentre.performers. */
export const topPerformersSchema = z.object({
  heading: z.string().optional(),
  category: z.string().optional(),
  count: z.number().int().positive().max(20).optional(),
});

/** Lineup: an announced team. Module (Match Centre). Data from ctx.matchCentre.lineup. */
export const lineupSchema = z.object({
  heading: z.string().optional(),
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
  // content -- RDCA additions (Brief 10)
  app_grid: appGridSchema,
  feature_banner: featureBannerSchema,
  newsletter: newsletterSchema,
  photo_strip: photoStripSchema,
  clubs_directory: clubsDirectorySchema,
  identity: identitySchema,
  player_spotlight: playerSpotlightSchema,
  alerts: alertsSchema,
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
  ticker: tickerSchema,
  top_performers: topPerformersSchema,
  lineup: lineupSchema,
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
  /** Column placement when the page's layout_mode is 'main-side' (Brief 10 sec 3a). Absent =
   *  full-width (the natural stack flow, e.g. the hero); 'main'/'side' place it in the two-column
   *  region. Ignored entirely when layout_mode is 'stack'. Platform-side, like the variants. */
  column?: "main" | "side";
}

/** The raw (unvalidated) instance shape as it arrives from the layout document.
 *  STRICT: an unknown key raises rather than being silently stripped -- a bare `column` (or any
 *  future field) that isn't declared here would otherwise vanish on save with no error, and the
 *  feature would die quietly. Reject-not-sanitize, applied to the schema itself (Brief 10 sec 3a). */
export const sectionInstanceSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.unknown(),
    visible: z.boolean().optional(),
    column: z.enum(["main", "side"]).optional(),
  })
  .strict();
