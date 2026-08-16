// F2 -- the public chrome shell (topbar/nav/footer). Doesn't exist in F2 at all before this
// session -- F2Page rendered bare sections (docs/rdca-port-audit-v2.md sec 1a, rows 1-3/26).
// Real, DB-driven nav (usePublicClubNav) -- not hardcoded links -- per the AFLVM brief's own
// stress test ("this site exercises the DB-driven dropdown nav hard").
//
// F2 has no path-based routing per page yet (today's mechanism is ?f2=<slug> in App.tsx) --
// nav hrefs use that same convention. Real routing is a separate, later concern; this chrome
// does not invent one.
import { useState } from "react";
import type { ReactNode } from "react";
import type { SectionContext } from "../entitlement";
import type { NavItem } from "../usePublicClubNav";
import { usePublicClubNav } from "../usePublicClubNav";
import { themeToStyle, type ThemeTokens } from "../PageRenderer";

function navHref(item: NavItem): string {
  return item.isHome ? "?f2" : `?f2=${item.slug}`;
}

function NavLink({ item }: { item: NavItem }) {
  if (item.children.length === 0) {
    return (
      <a className="sw-chrome-nav-link" href={navHref(item)}>
        {item.navLabel}
      </a>
    );
  }
  return (
    <div className="sw-chrome-nav-item">
      <a className="sw-chrome-nav-link sw-chrome-nav-drop-toggle" href={navHref(item)}>
        {item.navLabel} <span className="sw-chrome-nav-caret">&#9662;</span>
      </a>
      <div className="sw-chrome-nav-drop">
        {item.children.map((c) => (
          <a key={c.id} href={navHref(c)}>
            {c.navLabel}
          </a>
        ))}
      </div>
    </div>
  );
}

function MobileLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  return (
    <>
      <a className="sw-chrome-mob-link" style={depth ? { paddingLeft: `${depth * 1.25 + 1}rem` } : undefined} href={navHref(item)}>
        {item.navLabel}
      </a>
      {item.children.map((c) => (
        <MobileLink key={c.id} item={c} depth={depth + 1} />
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
  children: ReactNode;
}

/** Wraps a rendered F2 page with topbar + nav + footer. Every fact shown comes from the
 *  club's own real data (ctx.identity/ctx.contact, the nav RPC) -- never fabricated. */
export function F2Chrome({ clubId, ctx, theme, children }: ChromeProps) {
  const { items } = usePublicClubNav(clubId);
  const [mobileOpen, setMobileOpen] = useState(false);
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
          <a className="sw-chrome-nav-brand" href="?f2">
            {identity.logo && <img className="sw-chrome-nav-logo" src={identity.logo} alt="" />}
            {identity.secondaryLogo && (
              <img className="sw-chrome-nav-logo sw-chrome-nav-logo--secondary" src={identity.secondaryLogo} alt="" />
            )}
            <span className="sw-chrome-nav-brand-name">{identity.shortName || identity.name}</span>
          </a>
          <div className="sw-chrome-nav-links">
            {items.map((item) => (
              <NavLink key={item.id} item={item} />
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
            <MobileLink key={item.id} item={item} />
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
              <a key={item.id} href={navHref(item)}>
                {item.navLabel}
              </a>
            ))}
          </div>
        </div>
        <div className="sw-chrome-footer-bottom">
          &copy; {new Date().getFullYear()} {identity.name}
        </div>
      </footer>
    </div>
  );
}
