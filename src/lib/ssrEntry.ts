/**
 * Single entry point for the server-side bundle (see scripts/build-ssr-bundle.mjs).
 *
 * Everything the bake needs, and nothing else — kept to re-exports so the bundle's
 * surface is obvious and the app's own modules stay the only implementation.
 */
export { renderRouteToHtml, type RenderedRoute } from "./renderClubRoute";
export { computeSeoTags, type SeoHead } from "./seo";
export { getClubConfigForClubId } from "./loadClub";
