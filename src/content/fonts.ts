// F2 P2 -- PR 4: the font whitelist. THE THEME FONT BOUNDARY.
// A theme's --font-* tokens live in club_themes.tokens (data). Nothing in that column loads
// a font -- loading is the platform's job. So a theme may name ONLY a font the platform
// actually serves; an unknown font is REJECTED at the schema boundary, never silently
// substituted (which renders wrong and nobody notices -- and at P7 an AI-generated theme
// would pick an unserved font and fail the same way). This whitelist is the single source of
// truth: the loader (index.html union) and the validator both derive from it.

/** The families the platform serves (must match the Google Fonts <link> in index.html). */
export const SERVED_FONTS = [
  "Anton",
  "Archivo",
  "Big Shoulders Display",
  "Fraunces",
  "Geist Mono",
  "Inter",
  "Newsreader",
  "Oswald",
  "Outfit",
  "Playfair Display",
  "Saira Condensed",
  "Space Grotesk",
] as const;

/** Generic CSS families + system keywords -- always valid as a primary (need no loading). */
const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "-apple-system",
]);

const served = new Set<string>(SERVED_FONTS as readonly string[]);

/** Strip quotes/whitespace from one font-family name. */
function clean(name: string): string {
  return name.trim().replace(/^["']|["']$/g, "").trim();
}

/** The primary (first) family in a font stack, e.g. `"Fraunces", Georgia, serif` -> Fraunces. */
export function primaryFont(stack: string): string {
  return clean((stack ?? "").split(",")[0] ?? "");
}

/** A font stack is valid iff its PRIMARY family is served by the platform or is a generic/
 *  system keyword. Fallbacks after the primary are not checked -- they are the safety net. */
export function isValidFontStack(stack: string): boolean {
  const p = primaryFont(stack);
  return served.has(p) || GENERIC_FAMILIES.has(p.toLowerCase());
}

/** The Google Fonts family+weights query (kept beside the whitelist so index.html's <link>
 *  has a single source to track). Loading strategy stays the union preload for P2; a
 *  per-theme dynamic loader can read SERVED_FONTS later without touching the validator. */
export const GOOGLE_FONTS_QUERY =
  "family=Anton&family=Archivo:wght@400;600;700;800;900&family=Big+Shoulders+Display:wght@600;700;800" +
  "&family=Fraunces:ital,wght@0,400;0,600;0,700;1,500&family=Geist+Mono:wght@400;500;600" +
  "&family=Inter:wght@400;500;600;700&family=Newsreader:wght@400;500;600&family=Oswald:wght@400;500;600;700" +
  "&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700;800" +
  "&family=Saira+Condensed:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap";
