/**
 * Single entry point for the server-side bundle (see scripts/build-ssr-bundle.mjs).
 *
 * Everything the bake needs, and nothing else — kept to re-exports so the bundle's
 * surface is obvious and the app's own modules stay the only implementation.
 */
export { renderRouteToHtml, renderF2RouteToHtml, type RenderedRoute } from "./renderClubRoute";
export { computeSeoTags, type SeoHead } from "./seo";
export { getClubConfigForClubId } from "./loadClub";
// F2 phase 2: the bake resolves a club's own addresses and each page's render input itself,
// because F2 content arrives through effects that renderToString never runs.
export { loadF2Payload, loadF2PageIndex, type F2Payload, type PageIndexEntry } from "./f2Payload";
export { slugForPath } from "../F2Site";
