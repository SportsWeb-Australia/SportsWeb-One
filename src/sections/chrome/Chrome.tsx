// F2 -- the public chrome shell (topbar/nav/footer). Doesn't exist in F2 at all before this
// session -- F2Page rendered bare sections (docs/rdca-port-audit-v2.md sec 1a, rows 1-3/26).
// Real, DB-driven nav (usePublicClubNav) -- not hardcoded links -- per the AFLVM brief's own
// stress test ("this site exercises the DB-driven dropdown nav hard").
//
// F2 has no path-based routing per page yet (today's mechanism is ?f2=<slug> in App.tsx) --
// nav hrefs use that same convention. Real routing is a separate, later concern; this chrome
// does not invent one.
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { SectionContext } from "../entitlement";
import type { NavItem } from "../usePublicClubNav";
import { usePublicClubNav } from "../usePublicClubNav";
import { themeToStyle, type ThemeTokens } from "../PageRenderer";

/**
 * How this chrome addresses other pages.
 *
 * 'path'  — the club is on the F2 renderer, so its pages ARE real URLs: /about, /welfare/x.
 * 'query' — the legacy `?f2=<slug>` opt-in, still how the composer previews a page and how a
 *           legacy club's F2 pages are viewed at all. Kept because it is not dead: only clubs
 *           explicitly moved to render_mode='f2' get real paths.
 *
 * One function knows the convention, which is what made adding path mode a small change.
 */
export type LinkMode = "path" | "query";

function navHref(item: NavItem, mode: LinkMode): string {
  if (mode === "path") return item.isHome ? "/" : `/${item.slug}`;
  // Query mode: preserve every OTHER param. A bare `?f2=<slug>` replaces the whole query
  // string, which silently dropped `?preview=<token>` — so the first nav click on a shared
  // draft-review link kicked the reviewer out of preview and onto "not published yet".
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  params.set("f2", item.isHome ? "" : item.slug);
  // URLSearchParams renders an empty value as "f2=", which App.tsx reads as home ("" -> home).
  return `?${params.toString()}`;
}

function homeHref(mode: LinkMode): string {
  return navHref({ id: "", slug: "", title: "", navLabel: "", isHome: true, children: [] }, mode);
}

/** Real paths navigate through the router (no full reload); query mode stays a plain anchor. */
function ChromeLink({
  item, mode, className, style, children,
}: {
  item: NavItem; mode: LinkMode; className?: string; style?: React.CSSProperties; children: ReactNode;
}) {
  const href = navHref(item, mode);
  if (mode === "path") {
    return (
      <Link className={className} style={style} to={href}>
        {children}
      </Link>
    );
  }
  return (
    <a className={className} style={style} href={href}>
      {children}
    </a>
  );
}

function NavLink({ item, mode }: { item: NavItem; mode: LinkMode }) {
  if (item.children.length === 0) {
    return (
      <ChromeLink item={item} mode={mode} className="sw-chrome-nav-link">
        {item.navLabel}
      </ChromeLink>
    );
  }
  return (
    <div className="sw-chrome-nav-item">
      <ChromeLink item={item} mode={mode} className="sw-chrome-nav-link sw-chrome-nav-drop-toggle">
        {item.navLabel} <span className="sw-chrome-nav-caret">&#9662;</span>
      </ChromeLink>
      <div className="sw-chrome-nav-drop">
        {item.children.map((c) => (
          <ChromeLink key={c.id} item={c} mode={mode}>
            {c.navLabel}
          </ChromeLink>
        ))}
      </div>
    </div>
  );
}

function MobileLink({ item, mode, depth = 0 }: { item: NavItem; mode: LinkMode; depth?: number }) {
  return (
    <>
      <ChromeLink
        item={item}
        mode={mode}
        className="sw-chrome-mob-link"
        style={depth ? { paddingLeft: `${depth * 1.25 + 1}rem` } : undefined}
      >
        {item.navLabel}
      </ChromeLink>
      {item.children.map((c) => (
        <MobileLink key={c.id} item={c} mode={mode} depth={depth + 1} />
      ))}
    </>
  );
}

export interface ChromeProps {
  clubId: string;
  ctx: SectionContext;
  /** Same theme tokens PageRenderer applies to .sw-page -- chrome sits OUTSIDE .sw-page as a
   *  sibling, so it needs its own copy of the same inline style to inherit the club's colours
   *  (see themeToStyle's export note in ../PageRenderer.tsx). */
  theme?: ThemeTokens;
  /** Draft-review token, threaded from F2Page so the nav shows the draft page set. */
  previewToken?: string | null;
  /** How to address other pages -- real paths for an F2-routed club, else ?f2=. */
  linkMode?: LinkMode;
  children: ReactNode;
}

/** Wraps a rendered F2 page with topbar + nav + footer. Every fact shown comes from the
 *  club's own real data (ctx.identity/ctx.contact, the nav RPC) -- never fabricated. */
export function F2Chrome({ clubId, ctx, theme, previewToken, linkMode = "query", children }: ChromeProps) {
  const { items } = usePublicClubNav(clubId, previewToken);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Resolved after mount, never during render: F2 pages are pre-rendered at publish time, so
  // a year computed while rendering would be baked in and still read 2026 next January.
  const [year, setYear] = useState<number | undefined>(undefined);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const { identity, contact } = ctx;

  const hasTopbarContent = Boolean(contact.email || contact.phone || contact.facebook || contact.instagram);

  return (
    <div className="sw-chrome" style={themeToStyle(theme)}>
      {hasTopbarContent && (
        <div className="sw-chrome-topbar">
          <div className="sw-chrome-topbar-info">
            {identity.location && <span className="sw-chrome-topbar-item">{identity.location}</span>}
            {contact.email && (
              <a className="sw-chrome-topbar-item" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a className="sw-chrome-topbar-item" href={`tel:${contact.phone}`}>
                {contact.phone}
              </a>
            )}
          </div>
          <div className="sw-chrome-topbar-social">
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                f
              </a>
            )}
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                ig
              </a>
            )}
          </div>
        </div>
      )}

      <nav className="sw-chrome-nav">
        <div className="sw-chrome-nav-inner">
          <a className="sw-chrome-nav-brand" href={homeHref(linkMode)}>
            {identity.logo && <img className="sw-chrome-nav-logo" src={identity.logo} alt="" />}
            {identity.secondaryLogo && (
              <img className="sw-chrome-nav-logo sw-chrome-nav-logo--secondary" src={identity.secondaryLogo} alt="" />
            )}
            <span className="sw-chrome-nav-brand-name">{identity.shortName || identity.name}</span>
          </a>
          <div className="sw-chrome-nav-links">
            {items.map((item) => (
              <NavLink key={item.id} item={item} mode={linkMode} />
            ))}
          </div>
          <button
            className="sw-chrome-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            &#9776;
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="sw-chrome-mob-menu" role="dialog" aria-label="Menu">
          <button className="sw-chrome-mob-close" onClick={() => setMobileOpen(false)} aria-label="Close menu" type="button">
            &times;
          </button>
          {items.map((item) => (
            <MobileLink key={item.id} item={item} mode={linkMode} />
          ))}
        </div>
      )}

      {children}

      <footer className="sw-chrome-footer">
        <div className="sw-chrome-footer-inner">
          <div className="sw-chrome-footer-identity">
            {identity.logo && <img className="sw-chrome-footer-logo" src={identity.logo} alt="" />}
            {identity.secondaryLogo && (
              <img className="sw-chrome-footer-logo" src={identity.secondaryLogo} alt="" />
            )}
            <span>{identity.name}</span>
          </div>
          <div className="sw-chrome-footer-links">
            {items.map((item) => (
              <ChromeLink key={item.id} item={item} mode={linkMode}>
                {item.navLabel}
              </ChromeLink>
            ))}
          </div>
        </div>
        <div className="sw-chrome-footer-bottom">
          &copy; {year ?? ""} {identity.name}
        </div>
      </footer>
    </div>
  );
}
