// Imported by its typed entry point, but bundled from react-dom/server.browser — see
// the alias in scripts/build-ssr-bundle.mjs. Only the .browser build avoids node:stream,
// which does not exist on Cloudflare Workers.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { PublicSite } from "../PublicSite";
import { computeSeoTags, type SeoHead } from "./seo";
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
