import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useClub } from "../components/ClubContext";
import { slugify } from "./slug";
import type { ClubConfig } from "../content/types";

export interface SeoInput {
  title: string;
  description?: string;
  image?: string;
}

/** Everything the head needs for one route, as data. */
export interface SeoHead {
  /** Per-page title/description/image, or null when the route sets its own. */
  page: SeoInput | null;
  canonical: string;
  ogUrl: string;
  /** Club-level tags. Absent until a real club has resolved (neutral base). */
  siteName?: string;
  ogImage?: string;
  /** Only set when the club has a real uploaded crest, never a placeholder data URI. */
  favicon?: string;
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertFavicon(href: string) {
  document.querySelectorAll('link[rel="icon"]').forEach((el) => el.setAttribute("href", href));
  let apple = document.head.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
  if (!apple) {
    apple = document.createElement("link");
    apple.setAttribute("rel", "apple-touch-icon");
    document.head.appendChild(apple);
  }
  apple.setAttribute("href", href);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * The head for a page that does not exist, on a named club.
 *
 * A 404 needs its OWN title. Passing null to useSeo leaves whatever the last view set, so a
 * visitor who mistypes a news slug gets a 404 body under the previous article's tab name --
 * and, worse, a crawler gets a real-looking title on a dead URL. Shared by the legacy article
 * routes and the F2 renderer so the wording is identical wherever a miss lands.
 */
export function notFoundSeo(clubName: string): SeoInput {
  return { title: `Page not found | ${clubName}` };
}

export function useSeo(seo: SeoInput | null) {
  useEffect(() => {
    if (!seo) return;
    document.title = seo.title;
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", window.location.href);
    if (seo.description) {
      upsertMeta("name", "description", seo.description);
      upsertMeta("property", "og:description", seo.description);
    }
    if (seo.description) upsertMeta("name", "twitter:description", seo.description);
    upsertMeta("name", "twitter:title", seo.title);
    if (seo.image) {
      upsertMeta("property", "og:image", seo.image);
      upsertMeta("name", "twitter:image", seo.image);
      upsertMeta("name", "twitter:card", "summary_large_image");
    }
    upsertCanonical(window.location.origin + window.location.pathname);
  }, [seo]);
}

/**
 * Titles/descriptions for the data-driven routes (news and event details, the
 * per-sport pages, program pages).
 *
 * Those pages set their own SEO through useSeo, which is an effect — so under
 * renderToString it never runs and a baked page would ship the shell's platform
 * default title. Resolving them here from the club config, which the caller
 * already holds, closes that gap. Each branch mirrors its page's own useSeo call
 * exactly, so the client's later, page-level call is a no-op rather than a fight.
 */
function dynamicRouteSeo(club: ClubConfig, pathname: string, name: string): SeoInput | null {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "news" && segments[1]) {
    const post = club.news?.find((p) => (p.slug ?? slugify(p.title)) === segments[1]);
    return post ? { title: `${post.title} | ${name}`, description: post.excerpt } : null;
  }

  if (segments[0] === "events" && segments[1]) {
    const ev = club.events?.find((e) => (e.slug ?? slugify(e.title)) === segments[1]);
    return ev ? { title: `${ev.title} | ${name}`, description: ev.description ?? "" } : null;
  }

  if (segments[0] === "program" && segments[1]) {
    for (const group of club.teams ?? []) {
      const team = group.teams.find((t) => t.slug === segments[1]);
      if (team) return { title: `${team.name} | ${name}`, description: team.blurb };
    }
    return null;
  }

  // The per-sport pages are fixed routes in App's tree, each passing its own
  // sport name; the route itself is the only thing identifying which.
  const SPORT_BY_ROUTE: Record<string, string> = { "/football": "Football", "/netball": "Netball" };
  const sport = SPORT_BY_ROUTE[pathname];
  if (sport) {
    const group = club.teams?.find((g) => g.sport.toLowerCase() === sport.toLowerCase());
    return {
      title: `${sport} | ${name}`,
      description: `${sport} programs at ${name} — ${group?.teams.map((t) => t.name).join(", ")}.`,
    };
  }

  return null;
}

/**
 * Pure head computation for one route — the single source of truth for what the
 * <head> should contain. Shared by SeoManager (which mutates the live DOM) and by
 * the publish-time bake (which serialises the same values into static HTML), so a
 * baked page's tags cannot drift from what the client would have rendered.
 *
 * Central titles/descriptions for the static routes. Dynamic pages (sport/program,
 * news/event detail) set their own SEO via useSeo and are intentionally absent
 * from MAP — for those, `page` comes back null unless the club set an override.
 */
export function computeSeoTags(club: ClubConfig, pathname: string, origin: string): SeoHead {
  const name = club.identity.name;
  const place = club.identity.location;
  const league = club.identity.league;
  const sports = club.identity.sports;
  const logo = club.identity.logo || "";
  const phone = club.contact.phone;
  const instagram = club.contact.instagram;
  const facebook = club.contact.facebook;

  // Derive the sport wording from the club's own sports, never hardcoded, so a
  // lacrosse club's search snippet reads "lacrosse", not "football & netball".
  const sportPhrase = sports && sports.length ? sports.join(" & ").toLowerCase() : "community sport";
  const sportTitle = sportPhrase.charAt(0).toUpperCase() + sportPhrase.slice(1);
  const inPlace = place ? ` in ${place}` : "";

  const MAP: Record<string, SeoInput> = {
    "/": {
      // Clubs without a league would otherwise title as "Name | " — survivable on
      // a client-rendered page, but a baked page keeps it forever.
      title: league ? `${name} | ${league}` : name,
      description: club.hero.subtitle,
    },
    "/about": {
      title: `About | ${name}`,
      description: `The story, people and values of ${name} — ${sportPhrase}${inPlace}.`,
    },
    "/teams": {
      title: `Teams & Programs | ${name}`,
      description: `${sportTitle} teams and programs at ${name}, from juniors to seniors.`,
    },
    "/fixtures": {
      title: `Fixtures & Results | ${name}`,
      description: `Match fixtures, results and ladders for ${name}.`,
    },
    "/news": {
      title: `News | ${name}`,
      description: `The latest news and match wraps from ${name}.`,
    },
    "/events": {
      title: `Events | ${name}`,
      description: `Upcoming events, functions and key dates at ${name}.`,
    },
    "/sponsors": {
      title: `Sponsors & Partners | ${name}`,
      description: `Meet the sponsors who back ${name}, and find out how to get involved.`,
    },
    "/documents": {
      title: `Documents & Policies | ${name}`,
      description: `Club documents, forms and policies for ${name}.`,
    },
    "/contact": {
      title: `Contact | ${name}`,
      description: `Get in touch with ${name} in ${place}.`,
    },
    "/register": {
      title: `Join the Club | ${name}`,
      description: `Register to play ${sportPhrase} with ${name} this season.`,
    },
  };

  // Per-club override: seo.title / seo.description (e.g. "/" -> seo.title,
  // "/about" -> seo.about.title). Falls back to the generic MAP above.
  const key = pathname === "/" ? "" : pathname.replace(/^\//, ".");
  const overrideTitle = club.content?.[`seo${key}.title`];
  const overrideDescription = club.content?.[`seo${key}.description`];
  const overrideImage = club.content?.[`seo${key}.image`] ?? club.content?.["seo.image"];
  const base = MAP[pathname] ?? dynamicRouteSeo(club, pathname, name);
  const page: SeoInput | null = base || overrideTitle
    ? {
        title: overrideTitle ?? base?.title ?? name,
        description: overrideDescription ?? base?.description,
        image: overrideImage,
      }
    : null;

  const head: SeoHead = { page, canonical: origin + pathname, ogUrl: origin + pathname };

  // Club-level head: og:site_name, default og:image, favicon and per-club JSON-LD,
  // replacing the neutral platform defaults in index.html. Skipped entirely until a
  // real club has resolved, so the neutral base keeps index.html's defaults.
  if (name) {
    const absLogo = /^https?:\/\//i.test(logo)
      ? logo
      : logo.startsWith("/")
        ? origin + logo
        : origin + "/icon-512.png"; // data:/placeholder crest -> platform icon, never a data URI
    head.siteName = name;
    head.ogImage = absLogo;
    // Tab icon: the club's own crest, not the platform default — only when it's
    // a real uploaded image (not the generic initials-placeholder data URI).
    if (/^https?:\/\//i.test(logo)) head.favicon = logo;

    const sameAs = [instagram, facebook].filter(Boolean) as string[];
    const org: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      name,
      url: origin,
      logo: absLogo,
    };
    if (sports && sports.length) org.sport = sports;
    if (league) org.memberOf = { "@type": "SportsOrganization", name: league };
    if (place) org.address = { "@type": "PostalAddress", addressLocality: place, addressCountry: "AU" };
    if (phone) org.telephone = phone;
    if (sameAs.length) org.sameAs = sameAs;
    head.jsonLd = org;
  }

  return head;
}

export function SeoManager() {
  const { club } = useClub();
  const { pathname } = useLocation();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { page, siteName, ogImage, favicon, jsonLd } = computeSeoTags(club, pathname, origin);
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : undefined;

  // (apple-mobile-web-app-title is owned per-club by App.tsx; don't fight it here.)
  useEffect(() => {
    if (!siteName) return; // neutral base (emptyClub) not yet resolved: keep platform defaults
    upsertMeta("property", "og:site_name", siteName);
    if (ogImage) upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    if (favicon) upsertFavicon(favicon);
    if (jsonLdKey) upsertJsonLd("club-jsonld", JSON.parse(jsonLdKey));
  }, [siteName, ogImage, favicon, jsonLdKey]);

  useSeo(page);
  return null;
}
