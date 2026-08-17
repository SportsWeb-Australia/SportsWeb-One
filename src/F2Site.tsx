import { useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ClubContext } from "./components/ClubContext";
import { AuthProvider } from "./lib/auth";
import { EditProvider } from "./lib/edit";
import { F2Page } from "./sections/F2Page";
import { F2Chrome } from "./sections/chrome/Chrome";
import { useF2Theme, useF2RenderRoot } from "./sections/useF2Context";
import { F2SeedProvider } from "./sections/F2Seed";
import { sectionContextFromClub } from "./sections/entitlement";
import { NewsArticle } from "./pages/NewsArticle";
import { EventDetail } from "./pages/EventDetail";
import type { F2Payload } from "./lib/f2Payload";
import type { ClubConfig, DesignVariant } from "./content/types";

export interface F2SiteProps {
  club: ClubConfig;
  variant: DesignVariant;
  setVariant: (v: DesignVariant) => void;
  /**
   * Pre-loaded render input, present in exactly two situations: the publish-time bake (which
   * loads it server-side) and the browser hydrating a page that bake produced (which reads it
   * back out of a script tag). Absent otherwise, and the hooks fetch as they always have.
   */
  f2Payload?: F2Payload;
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
 * Collections are the CMS half of the product -- "add a story" should stay a form, not the
 * authoring of a page document -- so those two routes are declared here, ahead of the
 * catch-all, and their slugs are reserved at the database layer so a page cannot shadow them.
 *
 * Everything else falls to F2Page, which resolves the FULL pathname against club_pages. That
 * is what makes nested addresses like /welfare/concussion work: the slug is one text column
 * containing slashes, not a tree of rows, and nav nesting is a separate concern
 * (club_pages.nav_parent_id).
 *
 * The chrome is rendered HERE, once, around every route -- not inside each page. Two reasons:
 * a news article is a page of the club's website and needs the club's header, nav and footer
 * like any other (rendering the system routes bare was the first thing that went wrong when
 * this was built per-page); and the section context is then built once per view.
 */
export function F2Site({ club, variant, setVariant, f2Payload }: F2SiteProps) {
  const clubId = club.clubId;
  // Built from the config this component already holds, synchronously. It used to be fetched
  // by club id -- which re-ran buildClubConfig, roughly a dozen queries, for data that was
  // already in props. Being synchronous is also what makes an F2 page renderable server-side:
  // there is no effect to wait for.
  const ctx = useMemo(() => sectionContextFromClub(club), [club]);
  const theme = useF2Theme(clubId);
  // Held HERE, for the life of the club's site -- including the system news/event routes, which
  // sit inside this chrome and need the F2 tokens like any other page.
  useF2RenderRoot(true);
  const previewToken =
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("preview");

  if (!clubId) return <div className="sw-admin-loading">Loading&hellip;</div>;

  const site = (
    <AuthProvider>
      <ClubContext.Provider value={{ club, variant, setVariant }}>
        <EditProvider>
          <a href="#main" className="sw-skip">
            Skip to content
          </a>
          <F2Chrome
            clubId={clubId}
            ctx={ctx}
            theme={f2Payload?.theme ?? theme}
            previewToken={previewToken}
            linkMode="path"
          >
            <main id="main">
              <Routes>
                <Route path="/news/:slug" element={<NewsArticle />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route
                  path="*"
                  element={<F2Route clubId={clubId} ctx={ctx} theme={f2Payload?.theme ?? theme} />}
                />
              </Routes>
            </main>
          </F2Chrome>
        </EditProvider>
      </ClubContext.Provider>
    </AuthProvider>
  );

  // The seed has to sit OUTSIDE everything that reads it, and is only provided when it exists:
  // its mere presence is what tells the hooks not to fetch and tells time-dependent sections
  // that this render is a pre-render (see useToday).
  return f2Payload ? <F2SeedProvider payload={f2Payload}>{site}</F2SeedProvider> : site;
}

/**
 * Turn the current pathname into a club_pages slug and render it.
 *
 * "/" means the club's home page -- the row flagged is_home -- which F2Page resolves by asking
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
  ctx: ReturnType<typeof sectionContextFromClub>;
  theme: Record<string, string> | undefined;
}) {
  const { pathname } = useLocation();
  return (
    <F2Page
      clubId={clubId}
      slug={slugForPath(pathname)}
      linkMode="path"
      ctx={ctx}
      theme={theme}
      withChrome={false}
    />
  );
}

/** Exported so the bake asks for the same slug the browser would for a given URL. */
export function slugForPath(pathname: string): string {
  const slug = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  return slug === "" ? "home" : slug;
}

/**
 * Is this path one of the routes declared above rather than a club_pages address?
 *
 * The bake needs to tell the two apart. Both render inside this component, but a page route
 * with no matching row is a miss that must NOT be cached, while an article route legitimately
 * has no club_pages row at all -- it renders from the news/events tables. Kept beside the
 * <Route> declarations it describes, so the two cannot drift.
 */
export function isF2SystemRoute(pathname: string): boolean {
  const head = pathname.replace(/^\/+/, "").split("/");
  return (head[0] === "news" || head[0] === "events") && Boolean(head[1]);
}
