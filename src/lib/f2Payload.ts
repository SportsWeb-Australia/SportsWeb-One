/**
 * Everything an F2 page render needs from the database, as plain data.
 *
 * F2 gets its content through three effects -- the page layout, the nav, the theme -- and
 * effects do not run under renderToString. So publish-time baking an F2 page was impossible:
 * the server produced "Loading..." and nothing else. This module is the fix. It defines the
 * payload and the row mappers ONCE, so three callers agree on the shape by construction:
 *
 *   1. the bake (api/bake.js), which loads it server-side and renders from it;
 *   2. the browser hydrating a baked page, which reads the very same payload out of a script
 *      tag -- identical input, so the first client render reproduces the server's markup,
 *      which is what hydration requires; and
 *   3. the hooks, which fall back to fetching when there is no payload (a draft club, the
 *      ?f2= preview, the composer) -- unchanged behaviour for everything not baked.
 *
 * The mappers live here rather than in the hooks because the bake needs them without React.
 */
import { supabase } from "./supabase";
import { loadThemeForClub, type ThemeTokens } from "./loadTheme";

export type { ThemeTokens };

/** One page's published layout document, as public_club_page returns it. */
export interface PublicPage {
  layout: unknown; // jsonb array of section instances (walked by PageRenderer)
  seo: Record<string, unknown>;
  title: string | null;
  layoutMode: "stack" | "main-side";
}

/** One nav entry, nested one level deep via nav_parent_id. */
export interface NavItem {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  isHome: boolean;
  children: NavItem[];
}

/** One address in the club's site, from public_club_pages_index. */
export interface PageIndexEntry {
  slug: string;
  title: string;
  isHome: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
}

/**
 * The seed for one F2 page view.
 *
 * `slug` is part of the payload deliberately: a baked page is a payload for ONE address, and
 * the hooks must only use it for that address. Without the slug check, clicking through to a
 * second page would re-serve the first page's layout from the seed.
 */
export interface F2Payload {
  slug: string;
  page: PublicPage | null;
  nav: NavItem[];
  theme?: ThemeTokens;
}

interface PageRow {
  layout?: unknown;
  seo?: Record<string, unknown>;
  title?: string | null;
  layout_mode?: string | null;
}

/** public_club_page row -> PublicPage. Shared so a baked page and a fetched one cannot differ. */
export function mapPageRow(row: PageRow | null | undefined): PublicPage | null {
  if (!row) return null;
  return {
    layout: row.layout ?? [],
    seo: row.seo ?? {},
    title: row.title ?? null,
    // Defaults to 'stack' when the RPC predates supabase/f2-sidebar-layout.sql.
    layoutMode: row.layout_mode === "main-side" ? "main-side" : "stack",
  };
}

interface NavRow {
  id: string;
  slug: string;
  title: string;
  nav_label: string | null;
  nav_order: number | null;
  nav_parent_id: string | null;
  is_home: boolean;
}

/** Flat public_club_nav rows -> a one-level tree. */
export function buildNavTree(rows: NavRow[]): NavItem[] {
  const byId = new Map<string, NavItem>(
    rows.map((r) => [
      r.id,
      { id: r.id, slug: r.slug, title: r.title, navLabel: r.nav_label ?? r.title, isHome: r.is_home, children: [] },
    ]),
  );
  const roots: NavItem[] = [];
  for (const r of rows) {
    const item = byId.get(r.id)!;
    const parent = r.nav_parent_id ? byId.get(r.nav_parent_id) : undefined;
    // A dangling parent reference (parent not itself nav-visible/published) -> surface at top
    // level rather than silently dropping the page. Never lose a real, live page.
    (parent ? parent.children : roots).push(item);
  }
  return roots;
}

/**
 * The club's address list -- every published page, including pages kept out of the nav.
 *
 * Deliberately NOT public_club_nav: a page that isn't in the menu is still a real URL that has
 * to be baked and sitemapped (see supabase/f2-pages-index.sql).
 */
export async function loadF2PageIndex(
  clubId: string,
  previewToken?: string | null,
): Promise<PageIndexEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("public_club_pages_index", {
    p_club_id: clubId,
    p_preview_token: previewToken ?? null,
  });
  if (error) throw new Error(`public_club_pages_index failed -- ${error.message}`);
  return (Array.isArray(data) ? data : []).map((r: Record<string, unknown>) => ({
    slug: String(r.slug ?? ""),
    title: String(r.title ?? ""),
    isHome: Boolean(r.is_home),
    publishedAt: (r.published_at as string | null) ?? null,
    updatedAt: (r.updated_at as string | null) ?? null,
  }));
}

/**
 * Load one page's full render input. Three reads in parallel, because they are independent --
 * this runs once per baked page and the bake renders a whole site.
 */
export async function loadF2Payload(
  clubId: string,
  slug: string,
  previewToken?: string | null,
): Promise<F2Payload> {
  if (!supabase) return { slug, page: null, nav: [] };
  const [pageRes, navRes, theme] = await Promise.all([
    supabase.rpc("public_club_page", {
      p_club_id: clubId,
      p_slug: slug,
      p_preview_token: previewToken ?? null,
    }),
    supabase.rpc("public_club_nav", { p_club_id: clubId, p_preview_token: previewToken ?? null }),
    loadThemeForClub(clubId),
  ]);
  const pageRow = Array.isArray(pageRes.data) ? pageRes.data[0] : pageRes.data;
  return {
    slug,
    page: pageRes.error ? null : mapPageRow(pageRow as PageRow),
    nav: navRes.error ? [] : buildNavTree((Array.isArray(navRes.data) ? navRes.data : []) as NavRow[]),
    theme,
  };
}
