// Imported by its typed entry point, but bundled from react-dom/server.browser — see
// the alias in scripts/build-ssr-bundle.mjs. Only the .browser build avoids node:stream,
// which does not exist on Cloudflare Workers.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { PublicSite } from "../PublicSite";
import { F2Site, isF2SystemRoute } from "../F2Site";
import { computeSeoTags, type SeoHead } from "./seo";
import type { F2Payload } from "./f2Payload";
import type { ClubConfig, DesignVariant } from "../content/types";

export interface RenderedRoute {
  path: string;
  /** Inner HTML for #root — the shell's asset tags are added by the caller. */
  html: string;
  seo: SeoHead;
}

/** Variant is fixed for a baked page, so nothing can change it mid-render. */
const noopSetVariant = () => {};

/**
 * Render one public route to static HTML.
 *
 * Renders the same <PublicSite/> the browser mounts, so the markup a visitor is
 * served and the markup React hydrates are produced by one code path. Effects do
 * not run under renderToString, which is why every render-time browser-global
 * access in the public tree has to stay guarded.
 */
export function renderRouteToHtml(
  club: ClubConfig,
  variant: DesignVariant,
  path: string,
  origin = ""
): RenderedRoute {
  const html = renderToString(
    <StaticRouter location={path}>
      <PublicSite club={club} variant={variant} setVariant={noopSetVariant} />
    </StaticRouter>
  );
  return { path, html, seo: computeSeoTags(club, path, origin) };
}

/**
 * Render one F2 page to static HTML.
 *
 * The F2 counterpart of the above. The only structural difference is the payload: F2's content
 * arrives through effects, which renderToString never runs, so the caller loads it first
 * (loadF2Payload) and passes it in. F2Site provides it as a seed, the hooks read it instead of
 * fetching, and the whole page -- chrome, nav, sections -- renders on the first pass.
 *
 * Returns null for a page route with no matching row rather than baking a 404: a cache row for
 * a page that does not exist would keep serving after someone created it. An ARTICLE route is
 * not a miss -- it has no club_pages row by design and renders from the news/events tables --
 * so it bakes with payload.page null.
 */
export function renderF2RouteToHtml(
  club: ClubConfig,
  path: string,
  payload: F2Payload,
  origin = ""
): RenderedRoute | null {
  if (!payload.page && !isF2SystemRoute(path)) return null;

  const html = renderToString(
    <StaticRouter location={path}>
      <F2Site club={club} variant={club.variant} setVariant={noopSetVariant} f2Payload={payload} />
    </StaticRouter>
  );
  return { path, html, seo: f2SeoTags(club, path, payload, origin) };
}

/**
 * The <head> for an F2 page.
 *
 * Club-level tags (site name, og:image, favicon, JSON-LD, canonical) are exactly the legacy
 * ones -- they describe the club, not the page -- so they come from computeSeoTags. The page's
 * own title and description do NOT: they live on the club_pages row, which is the whole point
 * of a club authoring its own pages. Its seo jsonb wins, then the page title, then the club
 * name; never the legacy route MAP, which knows nothing about this club's addresses.
 */
function f2SeoTags(club: ClubConfig, path: string, payload: F2Payload, origin: string): SeoHead {
  const base = computeSeoTags(club, path, origin);
  // An article route has no club_pages row, and computeSeoTags already resolved its title from
  // the news/events table (dynamicRouteSeo). Overriding here would replace the article's own
  // title with the club name.
  if (!payload.page) return base;

  const seo = (payload.page.seo ?? {}) as { title?: string; description?: string; image?: string };
  const title = seo.title || payload.page.title || club.identity.name;
  return {
    ...base,
    page: {
      title,
      description: seo.description || base.page?.description,
      image: seo.image,
    },
  };
}
