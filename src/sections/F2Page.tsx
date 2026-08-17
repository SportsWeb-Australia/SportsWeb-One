// F2 P2 -- PR 5: the F2 render entry. Fetch the layout via public_club_page, build the
// section data context, apply the club's theme tokens at the page root, and walk it through
// PageRenderer. Sets data-render="f2" on <html> so the legacy data-variant token blocks go
// dark and club_themes.tokens is the sole token source (the door fix).
import { useEffect } from "react";
import { PageRenderer } from "./PageRenderer";
import type { SectionContext } from "./entitlement";
import { usePublicClubPage } from "./usePublicClubPage";
import { useF2Context, useF2RenderRoot } from "./useF2Context";
import { F2Chrome } from "./chrome/Chrome";
import { notFoundSeo } from "../lib/seo";

export function F2Page({
  clubId,
  slug = "home",
  // 'path' when the club is served by F2Site (its pages are real URLs); default 'query' keeps
  // the ?f2= preview -- used by the composer and by legacy clubs -- addressing pages the old
  // way. Defaulting to the old behaviour means adding real routing changed nothing for
  // anyone not explicitly moved to it.
  linkMode = "query",
  // When F2Site renders the chrome around the whole route tree it already has these, and
  // renders the chrome itself -- so it passes them in and turns this component's own chrome
  // off. Standalone (?f2=) use passes neither and gets both.
  ctx: ctxProp,
  theme: themeProp,
  withChrome = true,
}: {
  clubId: string;
  slug?: string;
  linkMode?: "path" | "query";
  ctx?: SectionContext | null;
  theme?: Record<string, string>;
  withChrome?: boolean;
}) {
  // Hooks can't be conditional, so skip the fetch by passing no clubId when ctx came in.
  const own = useF2Context(ctxProp ? undefined : clubId);
  const ctx = ctxProp ?? own.ctx;
  const theme = themeProp ?? own.theme;
  // The shareable draft-review link is /?preview=<token>&f2=... . Both the hook and
  // public_club_page have always supported a token; F2 simply never passed one, so draft
  // layouts were unreachable through F2 even with a valid link. Read it once, thread it to
  // the page RPC and to the chrome's nav RPC.
  const previewToken =
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("preview");
  const { page, loading, notFound } = usePublicClubPage(clubId, slug, previewToken);

  // Declare this an F2 render -- but only when nothing above us has: under F2Site the chrome
  // outlives this component and owns the flag (see useF2RenderRoot).
  useF2RenderRoot(withChrome);

  // Page <head>: the page row already carried title/seo and nothing used them, so every F2
  // page shipped the shell's platform title. Now that these are real URLs, that is the tab
  // name and the search result. DOM mutation stays in an effect so it never runs during
  // render (phase 2 bakes these pages, and effects don't run under renderToString -- the
  // baked <head> is assembled from the same row server-side).
  const clubName = ctx?.identity?.name;
  useEffect(() => {
    // A miss gets its own title too. Leaving the previous view's title on a 404 means the tab
    // (and any crawler) reads a real page name on a dead URL.
    if (notFound && clubName) {
      document.title = notFoundSeo(clubName).title;
      return;
    }
    if (!page) return;
    const seo = (page.seo ?? {}) as { title?: string; description?: string };
    const title = seo.title || page.title;
    if (title) document.title = title;
    const description = seo.description;
    if (description) {
      let m = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", description);
    }
  }, [page, notFound, clubName]);

  if (loading || !ctx) return <div className="sw-admin-loading">Loading&hellip;</div>;

  // A miss is a 404, and it renders INSIDE the chrome so the visitor keeps the club's header
  // and nav and can carry on. Previously every miss read "This page is not published yet",
  // which was a reasonable message for a ?f2= preview of an unbuilt page and quite wrong for
  // a real URL -- a mistyped address on a live club site should not imply the club is
  // mid-build. The RPC deliberately cannot tell us which case it is (zero rows either way,
  // so an unpublished club never leaks which pages exist), so the honest wording covers both.
  const body =
    notFound || !page ? (
      <F2NotFound />
    ) : (
      <PageRenderer layout={page.layout} ctx={ctx} theme={theme} layoutMode={page.layoutMode} />
    );

  if (!withChrome) return body;
  return (
    <F2Chrome clubId={clubId} ctx={ctx} theme={theme} previewToken={previewToken} linkMode={linkMode}>
      {body}
    </F2Chrome>
  );
}

/**
 * The branded 404 for an F2 club (S9/§D8: every site has one).
 *
 * Uses the F2 page/section classes rather than the legacy PageHero, because it renders inside
 * the F2 chrome where the legacy variant token blocks are switched off (data-render="f2").
 */
function F2NotFound() {
  return (
    <div className="sw-page">
      <section className="sw-sec sw-sec--rich">
        <div className="sw-sec-inner">
          <p className="sw-sec-eyebrow">Error 404</p>
          <h1 className="sw-sec-heading">We couldn&rsquo;t find that page</h1>
          <p className="sw-sec-body">
            The address may have changed, or it might not be published yet. Try the menu above.
          </p>
          <p>
            <a className="sw-btn" href="/">
              Back to home
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
