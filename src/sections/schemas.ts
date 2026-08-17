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
  // 'feature' layout's real headline treatment: multi-line, per-line accent/ghost styling
  // (RDCA: "Cricket's" / "Home in" / "Melbourne's" accent / "East" ghost-outline). Present ->
  // rendered instead of plain `title` (which stays the required fallback/SEO/a11y text).
  titleRich: z
    .array(z.object({ text: z.string().min(1), break: z.boolean().optional(), style: z.enum(["accent", "ghost"]).optional() }))
    .optional(),
  subtitle: z.string().optional(),
  // Small live-status text near the CTAs, e.g. "Round 14 of 18 underway".
  note: z.string().optional(),
  badges: z.array(z.object({ text: z.string().min(1), live: z.boolean().optional() })).optional(),
  // Club/competition crest shown large in the hero itself (not just the nav lockup) --
  // e.g. AFLVM's Vic Metro shield. Optional: most clubs won't have one worth blowing up.
  crest: z.object({ url: z.string().min(1), alt: z.string().optional() }).optional(),
  stats: z.array(z.object({ icon: z.string().optional(), label: z.string().min(1), value: z.string().min(1) })).optional(),
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
  // difference the token thesis cannot express. Values are real designs lifted from
  // Carson's shipped sites (docs/codey-brief-10-the-design-layer.md sec 3b), replacing the
  // earlier audit-invented names (media-full/media-split/media-diagonal).
  //
  // ONLY the layouts that actually have a design are listed. 'broadcast', 'heritage', 'card'
  // and 'matchday' were named here before they were built: they passed validation and then
  // fell through to the generic renderer with a data-layout attribute no stylesheet matched,
  // so a real club page shipped a bare unstyled image-over-text block with nothing warning
  // anyone. A name that renders broken is worse than a name that doesn't exist -- the enum is
  // the menu, so it must only offer what it can deliver. Add each back in the same change
  // that ships its markup + CSS.
  //
  // Removing a value is not free: a stored layout carrying one now fails validation and the
  // renderer skips the whole hero. See supabase/f2-hero-layout-migrate.sql, which maps the
  // retired media-* names to 'feature' -- prod holds no hero rows at all (verified
  // 2026-08-17), but develop and any future environment do.
  layout: z.enum(["centred", "feature"]).optional(),
  // 'feature' + showMatchCard true + the club entitled to Match Centre -> the hero renders
  // a live-match card in its right-hand slot (RDCA's .hmc). Not entitled, no data, or a
  // different layout -> the hero renders single-column. No empty box (Rule 9). See
  // docs/rdca-port-audit-v2.md sec 1b -- this is NOT a separate section; do not re-split it.
  showMatchCard: z.boolean().optional(),
});

export const announcementBarSchema = z.object({
  enabled: z.boolean(),
  text: z.string().min(1),
  link: linkRef.optional(),
  // 'list' variant -- RDCA's sidebar "Community Notices" card (dated items, not one banner
  // message). Decided a display variant of the existing type, not a new "alerts" type
  // (docs/rdca-port-audit-v2.md sec 1a). display absent/'banner' = unchanged behaviour
  // (single text/link). 'list' uses `items` instead; `text`/`link` are ignored in that mode
  // but stay required so a page authored before this variant existed still validates.
  display: z.enum(["banner", "list"]).optional(),
  items: z.array(z.object({ text: z.string().min(1), link: linkRef.optional(), date: z.string().optional() })).optional(),
});

export const richTextSchema = z.object({
  heading: z.string().optional(),
  body: z.array(blockSchema).min(1),
  // 'spotlight' variant -- RDCA's sidebar "Player Spotlight" card: a photo + authored copy,
  // not pulled from a real roster table (decided a rich_text variant, docs/rdca-port-audit-v2
  // sec 1a). Absent/'default' = unchanged behaviour.
  layout: z.enum(["default", "spotlight"]).optional(),
  photo: z.string().optional(),
});

export const quickLinksSchema = z.object({
  heading: z.string().optional(),
  links: z.array(linkRef.extend({ icon: z.string().optional() })).min(1),
  // RDCA's "APP BUTTONS" row (12 icon tiles: Fixtures/Results/Ladders/Clubs/...) is the same
  // label+icon+url content model as a plain link list, just a denser display -- a variant,
  // not a new type (docs/rdca-port-audit-v2.md sec 1a, decided 2026-08-03). Absent = 'list'.
  display: z.enum(["list", "icon-grid"]).optional(),
});

export const ctaBandSchema = z.object({
  heading: z.string().min(1),
  blurb: z.string().optional(),
  actions: z.array(linkRef).min(1),
  // RDCA repeats one full-bleed photo-banner-with-CTA pattern 3 times (sponsor ad, rep
  // cricket, umpires) at two sizes -- a size variant, not three separate sections. Absent =
  // 'compact' (today's centred band). 'feature' is the big photo-banner treatment.
  size: z.enum(["compact", "feature"]).optional(),
  media: z.object({ kind: z.enum(["none", "image"]), url: z.string().optional() }).optional(),
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
  // 'full-width' variant -- RDCA's real closing-contact section: a full-bleed dark banner,
  // not an inline card (decided a contact layout variant, docs/rdca-port-audit-v2.md sec 1a).
  // Absent/'inline' = unchanged behaviour.
  layout: z.enum(["inline", "full-width"]).optional(),
});

/** Confirmed gap (docs/rdca-port-audit-v2.md sec 1a-gap): an ASSOCIATION's member-club
 *  directory -- RDCA's 28 clubs, AFLVM's ~45. Content class, not Collection: there is no
 *  member-club table (a member club isn't a platform tenant with its own account), so the
 *  list is authored directly, the same way rich_text's body is -- and per aiAuthorable below,
 *  every entry is "grounded": real clubs only, never invented to fill out a grid. */
export const clubsDirectorySchema = z.object({
  heading: z.string().optional(),
  groupBy: z.enum(["division", "category", "none"]).optional(),
  display: z.enum(["grid", "list"]).optional(),
  clubs: z
    .array(
      z.object({
        name: z.string().min(1),
        group: z.string().optional(), // division/category label, e.g. "Premier Division"
        crest: z.string().optional(), // image URL
        href: z.string().optional(), // profile link, internal or external
      }),
    )
    .min(1),
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
  // 'carousel' added -- RDCA's real sponsor treatment, confirmed a display variant of the
  // existing type per Ruling 7 ("sponsors absorbing carousel/tiles/cards"), not new.
  display: z.enum(["strip", "wall", "tiered", "carousel"]),
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

/**
 * Video highlights (public.club_videos).
 *
 * Same shape as newsSchema on purpose: heading + layout + count. A club posts links, this
 * displays them, and 'feature' plays the first one large with the rest as a row -- which is the
 * "main video with 2 or 3 others" arrangement, expressed as a display choice rather than a
 * "featured" flag that could be set on two rows at once.
 *
 * No detail-page option: a highlight plays in place (decided with Carson 2026-08-18), so there
 * is nothing to link to and nothing to configure.
 */
export const videosSchema = z.object({
  heading: z.string().optional(),
  layout: z.enum(["feature", "grid", "list"]),
  count: z.number().int().positive().max(24),
});

export const socialFeedSchema = z.object({
  heading: z.string().optional(),
  source: z.literal("highlights"), // the only source today; a Meta adapter is a future source
  count: z.number().int().positive().max(24),
});

/** Confirmed gap (docs/rdca-port-audit-v2.md sec 1a, decided 2026-08-03): a named lineup for
 *  the next match. Didn't fit match_data's schema cleanly (per-player named data, not
 *  ladder/fixture/result rows) -- its own type, Content class since it's authored per match,
 *  not a live-synced table. */
export const teamLineupSchema = z.object({
  heading: z.string().optional(),
  teamName: z.string().optional(),
  opponent: z.string().optional(),
  players: z.array(z.object({ name: z.string().min(1), position: z.string().optional() })).min(1),
});

/** Confirmed gap: a horizontal strip of match-day photos, credited to a photographer.
 *  Genuinely distinct from every existing collection type (docs/rdca-port-audit-v2.md sec
 *  1a) -- none of documents/social_feed/news is "a strip of standalone photos". Content
 *  class: no photo-gallery table exists yet, same reasoning as clubs_directory. */
export const photoStripSchema = z.object({
  heading: z.string().optional(),
  credit: z.string().optional(),
  photos: z.array(z.object({ url: z.string().min(1), alt: z.string().optional() })).min(1),
});

// =============================================================================
// MODULE (3) -- data owned by a module; entitlement-gated (see ./entitlement).
// Props are config only.
// =============================================================================
export const matchDataSchema = z.object({
  // 'top_performers' added -- decided a match_data display mode, not a new type (same
  // competition/season context as ladder/fixtures/results, just a leaderboard shape).
  mode: z.enum(["fixtures", "results", "ladder", "combined", "top_performers"]),
  grade: z.string().optional(),
  count: z.number().int().positive().max(50).optional(),
});

export const scoreboardSchema = z.object({
  showLast: z.boolean().optional(),
  showNext: z.boolean().optional(),
  showLadderPos: z.boolean().optional(),
});

/** Confirmed new type (decided 2026-08-03): RDCA's always-visible live-score strip under the
 *  nav. Chrome-like (auto-scroll, site-wide), but the DATA is module-owned/entitlement-gated
 *  match info, same as match_data/scoreboard -- so it's Module class, not chrome. No
 *  fabricated ball-by-ball: built from the same real MatchCentreData fixtures/results every
 *  other match section reads (see HeroMatchCard in components/content.tsx for the same
 *  honesty constraint). */
export const tickerSchema = z.object({
  count: z.number().int().positive().max(20).optional(),
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
  clubs_directory: clubsDirectorySchema,
  // collection
  news: newsSchema,
  events: eventsSchema,
  sponsors: sponsorsSchema,
  committee: committeeSchema,
  teams: teamsSchema,
  documents: documentsSchema,
  videos: videosSchema,
  social_feed: socialFeedSchema,
  team_lineup: teamLineupSchema,
  photo_strip: photoStripSchema,
  // module
  match_data: matchDataSchema,
  scoreboard: scoreboardSchema,
  ticker: tickerSchema,
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
  /** Which column this section sits in when the page's layout_mode is 'main-side'.
   *  Ignored entirely when layout_mode is 'stack'. Absent = 'main'. Platform-side of the
   *  fence, like the layout variants -- see docs/codey-brief-10-the-design-layer.md sec 3a.
   *  'full' -- added after discovering RDCA's real page structure isn't just two columns:
   *  hero/ticker/app-buttons sit BEFORE the col-main/col-side split, and photo-strip/contact/
   *  sponsor-carousel sit AFTER it, all full page width. Rendering hero through the plain
   *  main/side split squeezed it into the main column's ~1fr share (found live, verified
   *  against real seeded RDCA content 2026-08-03) -- 'full' takes a section out of the
   *  column grid entirely, in its normal document position. */
  column?: "main" | "side" | "full";
}

/** The raw (unvalidated) instance shape as it arrives from the layout document.
 *  .strict() deliberately: a plain z.object silently strips unknown keys, which would make
 *  a saved `column` vanish with no error (Brief 10 sec 3a). An unknown key must now raise. */
export const sectionInstanceSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.unknown(),
    visible: z.boolean().optional(),
    column: z.enum(["main", "side", "full"]).optional(),
  })
  .strict();
