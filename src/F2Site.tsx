import { Routes, Route, useLocation } from "react-router-dom";
import { ClubContext } from "./components/ClubContext";
import { AuthProvider } from "./lib/auth";
import { EditProvider } from "./lib/edit";
import { F2Page } from "./sections/F2Page";
import { F2Chrome } from "./sections/chrome/Chrome";
import { useF2Context, useF2RenderRoot } from "./sections/useF2Context";
import { NewsArticle } from "./pages/NewsArticle";
import { EventDetail } from "./pages/EventDetail";
import type { ClubConfig, DesignVariant } from "./content/types";

export interface F2SiteProps {
  club: ClubConfig;
  variant: DesignVariant;
  setVariant: (v: DesignVariant) => void;
}

/**
 * The public site for a club on the F2 renderer: its own `club_pages` are its URLs.
 *
 * The counterpart to PublicSite.tsx, which serves the legacy fixed route tree. A club lands
 * here only when clubs.render_mode is explicitly 'f2' (see loadClub); every other club is
 * completely unaffected by this file existing.
 *
 * HYBRID, deliberately (docs/f2-routing-and-bake-scope.md, decided 2026-08-17): F2 pages own
 * the page tree, but news and event ARTICLES stay system-rendered from their typed tables.
 * Collections are the CMS half of the product — "add a story" should stay a form, not the
 * authoring of a page document — so those two routes are declared here, ahead of the
 * catch-all, and their slugs are reserved at the database layer so a page cannot shadow them.
 *
 * Everything else falls to F2Page, which resolves the FULL pathname against club_pages. That
 * is what makes nested addresses like /welfare/concussion work: the slug is one text column
 * containing slashes, not a tree of rows, and nav nesting is a separate concern
 * (club_pages.nav_parent_id).
 *
 * The chrome is rendered HERE, once, around every route — not inside each page. Two reasons:
 * a news article is a page of the club's website and needs the club's header, nav and footer
 * like any other (rendering the system routes bare was the first thing that went wrong when
 * this was built per-page); and the section context + theme are then fetched once per view
 * rather than once per component, which matters because building the context is roughly a
 * dozen queries.
 */
export function F2Site({ club, variant, setVariant }: F2SiteProps) {
  const clubId = club.clubId;
  const { ctx, theme } = useF2Context(clubId);
  // Held HERE, for the life of the club's site -- including the system news/event routes, which
  // sit inside this chrome and need the F2 tokens like any other page.
  useF2RenderRoot(true);
  const previewToken =
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("preview");

  if (!clubId || !ctx) return <div className="sw-admin-loading">Loading&hellip;</div>;

  return (
    <AuthProvider>
      <ClubContext.Provider value={{ club, variant, setVariant }}>
        <EditProvider>
          <a href="#main" className="sw-skip">
            Skip to content
          </a>
          <F2Chrome clubId={clubId} ctx={ctx} theme={theme} previewToken={previewToken} linkMode="path">
            <main id="main">
              <Routes>
                <Route path="/news/:slug" element={<NewsArticle />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="*" element={<F2Route clubId={clubId} ctx={ctx} theme={theme} />} />
              </Routes>
            </main>
          </F2Chrome>
        </EditProvider>
      </ClubContext.Provider>
    </AuthProvider>
  );
}

/**
 * Turn the current pathname into a club_pages slug and render it.
 *
 * "/" means the club's home page — the row flagged is_home — which F2Page resolves by asking
 * for the slug "home"; every other path maps to its slug with the leading slash stripped and
 * any trailing slash ignored, so /welfare and /welfare/ are the same page rather than a
 * duplicate-content pair.
 */
function F2Route({
  clubId,
  ctx,
  theme,
}: {
  clubId: string;
  ctx: ReturnType<typeof useF2Context>["ctx"];
  theme: Record<string, string> | undefined;
}) {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  return (
    <F2Page
      clubId={clubId}
      slug={slug === "" ? "home" : slug}
      linkMode="path"
      ctx={ctx}
      theme={theme}
      withChrome={false}
    />
  );
}
