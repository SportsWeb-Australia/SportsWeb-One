import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useClub } from "../components/ClubContext";

export interface SeoInput {
  title: string;
  description?: string;
  image?: string;
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
 * Central titles/descriptions for the static routes. Dynamic pages
 * (sport/program) set their own SEO and are intentionally absent here.
 */
export function SeoManager() {
  const { club } = useClub();
  const { pathname } = useLocation();
  const name = club.identity.name;
  const place = club.identity.location;
  const league = club.identity.league;
  const sports = club.identity.sports;
  const logo = club.identity.logo || "";
  const phone = club.contact.phone;
  const instagram = club.contact.instagram;
  const facebook = club.contact.facebook;

  // Club-level head: og:site_name, apple title, default og:image, favicon, and
  // per-club JSON-LD — replacing the neutral platform defaults in index.html
  // once a real club has resolved. (Client-side; non-JS scrapers see the
  // neutral shell until a per-host edge injection is added — tracked separately.)
  useEffect(() => {
    if (!name) return; // neutral base (emptyClub) not yet resolved: keep platform defaults
    const origin = window.location.origin;
    const absLogo = /^https?:\/\//i.test(logo)
      ? logo
      : logo.startsWith("/")
        ? origin + logo
        : origin + "/icon-512.png"; // data:/placeholder crest -> platform icon, never a data URI
    upsertMeta("property", "og:site_name", name);
    upsertMeta("property", "og:image", absLogo);
    upsertMeta("name", "twitter:card", "summary_large_image");
    // Tab icon: the club's own crest, not the platform default — only when it's
    // a real uploaded image (not the generic initials-placeholder data URI).
    if (/^https?:\/\//i.test(logo)) upsertFavicon(logo);
    // (apple-mobile-web-app-title is owned per-club by App.tsx; don't fight it here.)
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
    upsertJsonLd("club-jsonld", org);
  }, [name, place, league, sports, logo, phone, instagram, facebook]);

  const MAP: Record<string, SeoInput> = {
    "/": {
      title: `${name} | ${club.identity.league}`,
      description: club.hero.subtitle,
    },
    "/about": {
      title: `About | ${name}`,
      description: `The story, people and values of ${name} — football & netball in ${place}.`,
    },
    "/teams": {
      title: `Teams & Programs | ${name}`,
      description: `Football and netball teams and programs at ${name}, from juniors to seniors.`,
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
      description: `Register to play football or netball with ${name} this season.`,
    },
  };

  // Per-club override: seo.title / seo.description (e.g. "/" -> seo.title,
  // "/about" -> seo.about.title). Falls back to the generic MAP above.
  const key = pathname === "/" ? "" : pathname.replace(/^\//, ".");
  const overrideTitle = club.content?.[`seo${key}.title`];
  const overrideDescription = club.content?.[`seo${key}.description`];
  const overrideImage = club.content?.[`seo${key}.image`] ?? club.content?.["seo.image"];
  const base = MAP[pathname] ?? null;
  const resolved: SeoInput | null = base || overrideTitle
    ? {
        title: overrideTitle ?? base?.title ?? name,
        description: overrideDescription ?? base?.description,
        image: overrideImage,
      }
    : null;

  useSeo(resolved);
  return null;
}
