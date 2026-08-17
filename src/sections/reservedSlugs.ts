/**
 * Path segments a club page may never claim, because the platform owns them.
 *
 * With F2 routing a page's slug IS its URL path, so these would either be unreachable (the
 * system route wins) or would shadow platform functionality — and which one happens depends
 * on rewrite ordering, which nobody should have to reason about while naming a page.
 *
 * ⚠️ This list is enforced in TWO places and they must agree:
 *   - here, so the UI can refuse a bad slug with a helpful message before saving; and
 *   - `public.club_pages_reserve_slugs()` (supabase/f2-render-mode.sql), a trigger, because
 *     the composer is not the only writer — SQL seeding, the site importer and any future
 *     pages admin all insert rows directly.
 * The database is the real fence; this copy exists for the error message. Change both.
 */
export const RESERVED_SLUG_SEGMENTS: readonly string[] = [
  // The app's own routes (mirrors APP_PREFIXES in api/render.js).
  "admin",
  "start",
  "guide",
  // Collection detail routes the F2 renderer deliberately keeps system-rendered, so that
  // "add a news story" stays a simple form rather than authoring a page document.
  "news",
  "events",
  // Serverless functions and built asset output.
  "api",
  "assets",
  // SEO endpoints served by api/.
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
];

/**
 * Is this slug allowed? Only the FIRST path segment can collide — nested slugs are the whole
 * point of F2 routing ('welfare/concussion'), and a segment match rather than a string prefix
 * is what keeps a legitimate page like 'newsletter' from being rejected for starting with
 * 'news'.
 */
export function reservedSlugSegment(slug: string): string | null {
  const head = (slug ?? "").replace(/^\/+/, "").split("/")[0] ?? "";
  return RESERVED_SLUG_SEGMENTS.includes(head) ? head : null;
}
