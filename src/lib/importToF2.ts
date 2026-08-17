/**
 * Turn a legacy club into an F2 page set.
 *
 * This is the import path for the clubs sitting outside SW1: a club whose content is already in
 * the typed tables, served by the fixed legacy route tree, becomes a club whose pages are rows
 * it can edit. Written as a plan-then-apply pair on purpose -- planF2Import is pure and
 * testable, and the SQL it produces can be read before anything is written.
 *
 * Two properties matter more than completeness:
 *
 * RULE 9, NO FAKE DATA. Nothing here invents content. Collection sections carry no records --
 * they name a collection and the renderer reads the club's real table through SectionContext --
 * and every Content section is built from a field the club has actually filled in. A section
 * whose source is empty is OMITTED rather than authored with placeholder copy, and a page left
 * with no sections is not created at all. So a sparse club imports as a small site, not as a
 * scaffold full of "coming soon".
 *
 * REVERSIBILITY. The plan writes club_pages rows and nothing else. It does not touch
 * clubs.render_mode, does not publish, and does not delete. Flipping the renderer is a separate,
 * deliberate step, and undoing an import is deleting the rows.
 */
import type { ClubConfig } from "../content/types";
import type { SectionType } from "../sections/schemas";
import { reservedSlugSegment } from "../sections/reservedSlugs";

/** One section instance in a layout document. Mirrors sectionInstanceSchema (which is .strict). */
export interface PlannedSection {
  id: string;
  type: SectionType;
  props: Record<string, unknown>;
}

export interface PlannedPage {
  slug: string;
  title: string;
  navLabel: string;
  navOrder: number;
  navVisible: boolean;
  isHome: boolean;
  seo: { title?: string; description?: string };
  layout: PlannedSection[];
}

/** Stable, readable instance ids: a re-import produces the same document, not a diff. */
const sec = (page: string, type: SectionType, props: Record<string, unknown>): PlannedSection => ({
  id: `${page}-${type}`,
  type,
  props,
});

const has = (a: unknown[] | undefined | null): boolean => Array.isArray(a) && a.length > 0;

/** Does this club own the Match Centre capability? Mirrors sections/entitlement.ts. */
function entitledToMatchCentre(club: ClubConfig): boolean {
  const mods = (club as { enabledModules?: string[] }).enabledModules;
  return Array.isArray(mods) && mods.includes("match_centre");
}

/** The club's real hero, as a hero section. The one section every club gets. */
function heroSection(club: ClubConfig): PlannedSection {
  const h = club.hero;
  const media =
    h.video ? { kind: "video" as const, url: h.video, poster: h.poster }
    : h.backgroundImage ? { kind: "image" as const, url: h.backgroundImage }
    : { kind: "none" as const };
  return sec("home", "hero", {
    ...(h.eyebrow ? { eyebrow: h.eyebrow } : {}),
    // titleAccent was a separate trailing phrase in the legacy config; F2's hero has no such
    // field, so it is appended to the title rather than dropped -- losing words a club wrote
    // would be a silent content regression.
    //
    // The club NAME is the fallback, and it matters: hero.title is required (min(1)), so a club
    // that never filled in a headline would plan an invalid hero, and PageRenderer's
    // validate-or-skip would drop the whole section -- a homepage with no hero at all. Found on
    // a real club (theme-classic) by the importer's own validation gate.
    title: [h.title, h.titleAccent].filter((s) => s && s.trim()).join(" ").trim() || club.identity.name,
    ...(h.subtitle ? { subtitle: h.subtitle } : {}),
    ...(h.primaryCta ? { primaryCta: h.primaryCta } : {}),
    ...(h.secondaryCta ? { secondaryCta: h.secondaryCta } : {}),
    media,
    layout: "centred",
  });
}

/** about.body/values/history/facts -> a closed block list. No raw HTML: blocks are text nodes. */
function aboutBlocks(club: ClubConfig): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  for (const p of club.about?.body ?? []) if (p.trim()) blocks.push({ kind: "paragraph", text: p });
  const values = club.about?.values ?? [];
  if (values.length) {
    blocks.push({ kind: "list", items: values.map((v) => `${v.title}: ${v.text}`) });
  }
  for (const f of club.about?.facts ?? []) blocks.push({ kind: "stat", value: f.value, label: f.label });
  return blocks;
}

/**
 * Legacy index routes that CANNOT survive as page slugs.
 *
 * On the F2 renderer /news/<x> and /events/<x> are the system article routes, and the bare
 * /news and /events segments are reserved at the database layer -- a page claiming them would be
 * rejected on insert, and if it somehow existed it would be unreachable. So the imported index
 * pages move, and every internal link pointing at the old address has to move with them.
 */
const MOVED_SLUGS: Record<string, string> = {
  news: "news-and-updates",
  events: "whats-on",
};

/** /news/a-big-win is a system route; bare /news is not. Mirrors isF2SystemRoute in F2Site. */
const isArticlePath = (path: string): boolean => {
  const parts = path.split("/");
  return (parts[0] === "news" || parts[0] === "events") && Boolean(parts[1]);
};

/**
 * Point a legacy link at whatever the import actually created, or report it as unresolvable.
 *
 * Returns the href to use, or null to drop the link. Dropping is deliberate: the legacy hero's
 * CTAs point at legacy routes like /register, and if the import creates no such page then
 * keeping the button ships a 404 on the club's homepage. A missing button is recoverable; a
 * dead one on the front page is the first thing a visitor clicks.
 */
function resolveHref(href: string, slugs: Set<string>): string | null {
  if (!href.startsWith("/")) return href; // external, mailto:, tel:, #anchor -- not ours to judge
  const path = href.split(/[?#]/)[0].replace(/^\/+/, "").replace(/\/+$/, "");
  if (path === "") return "/";
  if (isArticlePath(path)) return href; // a real article route on F2 too
  const mapped = MOVED_SLUGS[path] ?? path;
  return slugs.has(mapped) ? `/${mapped}` : null;
}

/**
 * Rewrite every internal link in the planned layouts, in place, and collect what got dropped.
 *
 * Runs after the page set is known, because "does this link resolve?" can only be answered
 * against the finished plan.
 */
function fixInternalLinks(pages: PlannedPage[]): string[] {
  const slugs = new Set(pages.map((p) => (p.isHome ? "" : p.slug)));
  slugs.add(""); // home
  const warnings: string[] = [];

  const fixOne = (page: string, what: string, link: { label: string; href: string }): boolean => {
    const next = resolveHref(link.href, slugs);
    if (next === null) {
      warnings.push(`dropped ${what} "${link.label}" on /${page} -- ${link.href} has no imported page`);
      return false;
    }
    if (next !== link.href) warnings.push(`rewrote ${what} on /${page}: ${link.href} -> ${next}`);
    link.href = next;
    return true;
  };

  for (const p of pages) {
    for (const s of p.layout) {
      if (s.type === "hero") {
        for (const key of ["primaryCta", "secondaryCta"] as const) {
          const cta = s.props[key] as { label: string; href: string } | undefined;
          if (cta && !fixOne(p.slug, key, cta)) delete s.props[key];
        }
      }
      if (s.type === "cta_band" || s.type === "quick_links") {
        const key = s.type === "cta_band" ? "actions" : "links";
        const list = s.props[key] as { label: string; href: string }[] | undefined;
        if (list) s.props[key] = list.filter((l) => fixOne(p.slug, key, l));
      }
    }
  }
  return warnings;
}

export interface ImportPlan {
  pages: PlannedPage[];
  /** Everything a human should see before applying: links rewritten, links dropped, collisions. */
  warnings: string[];
}

/**
 * The page set for this club.
 *
 * Ordering is the legacy nav's, because that is the order the club's members already know. Slugs
 * match the legacy routes wherever they can, so inbound links and bookmarks keep working -- an
 * import should not silently change a live club's URLs. Where they cannot (see MOVED_SLUGS), the
 * plan says so in its warnings.
 */
export function planF2Import(club: ClubConfig): ImportPlan {
  const name = club.identity.name;
  const pages: PlannedPage[] = [];
  let order = 0;

  const page = (
    slug: string,
    title: string,
    navLabel: string,
    layout: PlannedSection[],
    opts: { isHome?: boolean; navVisible?: boolean; description?: string } = {},
  ) => {
    if (!layout.length) return; // nothing real to show -> no page (Rule 9)
    pages.push({
      slug,
      title,
      navLabel,
      navOrder: order++,
      navVisible: opts.navVisible ?? true,
      isHome: opts.isHome ?? false,
      seo: { title: opts.isHome ? title : `${title} | ${name}`, ...(opts.description ? { description: opts.description } : {}) },
      layout,
    });
  };

  // ---- home ----------------------------------------------------------------
  const home: PlannedSection[] = [heroSection(club)];
  // The club's own "why join us" copy, if it wrote any. quick_links cannot hold it (its items
  // require an href and these are prose), so it becomes rich_text -- which keeps every word the
  // club actually wrote. Losing authored copy in an import is a content regression, not a
  // styling choice.
  if (club.whyUs && has(club.whyUs.items)) {
    const body: Record<string, unknown>[] = [];
    if (club.whyUs.body?.trim()) body.push({ kind: "paragraph", text: club.whyUs.body });
    body.push({ kind: "list", items: club.whyUs.items.map((i) => `${i.title}: ${i.body}`) });
    home.push(sec("home", "rich_text", { heading: club.whyUs.title || "Why us", body }));
  }
  if (has(club.news)) home.push(sec("home", "news", { heading: "Latest news", layout: "feature", count: 3 }));
  if (entitledToMatchCentre(club)) {
    home.push(sec("home", "match_data", { mode: "combined", count: 5 }));
  }
  if (has(club.events)) home.push(sec("home", "events", { heading: "What's on", count: 3, window: "upcoming" }));
  // A real 1:1 mapping: the legacy photo strip is exactly the photo_strip section.
  if (club.photoStrip && has(club.photoStrip.images)) {
    home.push(
      sec("home", "photo_strip", {
        heading: club.photoStrip.title || club.photoStrip.eyebrow,
        photos: club.photoStrip.images.map((url) => ({ url })),
      }),
    );
  }
  if (has(club.sponsors)) home.push(sec("home", "sponsors", { heading: "Our sponsors", display: "strip" }));
  page("home", name, "Home", home, { isHome: true, description: club.hero.subtitle });

  // ---- about ---------------------------------------------------------------
  const about: PlannedSection[] = [];
  const blocks = aboutBlocks(club);
  if (blocks.length) {
    about.push(sec("about", "rich_text", { heading: club.about?.heading || "About us", body: blocks }));
  }
  const pres = club.president;
  if (pres?.name && has(pres.body)) {
    about.push(
      sec("about", "president_welcome", {
        name: pres.name,
        ...(pres.role ? { role: pres.role } : {}),
        ...(pres.portrait ? { portrait: pres.portrait } : {}),
        body: pres.body.filter((p) => p.trim()),
        ...(pres.signoff ? { signoff: pres.signoff } : {}),
      }),
    );
  }
  if (has(club.committee)) about.push(sec("about", "committee", { heading: "Our committee" }));
  page("about", "About", "About", about);

  // ---- the collection pages ------------------------------------------------
  if (has(club.teams)) {
    page("teams", "Teams", "Teams", [
      sec("teams", "teams", { heading: "Teams & programs", groupBy: "sport", linkTo: "none" }),
    ]);
  }
  if (entitledToMatchCentre(club)) {
    page("fixtures", "Fixtures & Results", "Fixtures", [
      sec("fixtures", "match_data", { mode: "combined", count: 20 }),
    ]);
  }
  if (has(club.news)) {
    page("news-and-updates", "News", "News", [sec("news", "news", { layout: "list", count: 24 })], {
      description: `The latest news from ${name}.`,
    });
  }
  if (has(club.events)) {
    page("whats-on", "Events", "Events", [sec("events", "events", { count: 24, window: "all" })]);
  }
  if (has(club.sponsors)) {
    page("sponsors", "Sponsors", "Sponsors", [sec("sponsors", "sponsors", { display: "wall", showBlurb: true })]);
  }
  if (has(club.documents)) {
    page("documents", "Documents", "Documents", [sec("documents", "documents", { heading: "Club documents" })]);
  }

  // ---- register / join -----------------------------------------------------
  //
  // The legacy site has a /register route, and the hero's primary CTA usually points at it --
  // for a community club it is the most important button on the site. There is no registration
  // FORM section in the F2 library, so this page carries the club's own join copy and its real
  // registration links (which are typically the external PlayHQ/Dribl signup anyway) rather than
  // pretending to be a form. Without this page the CTA gets dropped as unresolvable.
  const joinActions = (club.join?.options ?? []).filter((o) => o?.href && o?.label);
  const registerSections: PlannedSection[] = [];
  if (joinActions.length) {
    registerSections.push(
      sec("register", "cta_band", {
        heading: club.join.heading || "Join the club",
        ...(club.join.blurb ? { blurb: club.join.blurb } : {}),
        actions: joinActions,
      }),
    );
  }
  const regBlocks: Record<string, unknown>[] = [];
  for (const s of club.register?.steps ?? []) if (s.trim()) regBlocks.push({ kind: "paragraph", text: s });
  if (club.register?.feesNote?.trim()) regBlocks.push({ kind: "paragraph", text: club.register.feesNote });
  for (const f of club.register?.faqs ?? []) {
    if (f.q?.trim() && f.a?.trim()) regBlocks.push({ kind: "paragraph", text: `${f.q} ${f.a}` });
  }
  if (regBlocks.length) {
    registerSections.push(sec("register", "rich_text", { heading: "How to register", body: regBlocks }));
  }
  page("register", "Register", "Register", registerSections);

  // ---- contact -------------------------------------------------------------
  page("contact", "Contact", "Contact", [
    sec("contact", "contact", {
      heading: "Get in touch",
      showEmail: Boolean(club.contact?.email),
      showPhone: Boolean(club.contact?.phone),
      showAddress: true,
      showMap: true,
    }),
  ]);

  const warnings = fixInternalLinks(pages);
  for (const p of pages) {
    const clash = reservedSlugSegment(p.slug);
    if (clash) warnings.push(`page "${p.slug}" collides with the reserved segment "${clash}" and WILL be rejected`);
  }
  return { pages, warnings };
}

