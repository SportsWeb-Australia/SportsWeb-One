// F2 -- PR-A (Brief 10): the public CHROME shell. Not a page-document section: the masthead,
// nav and footer WRAP the section list. Rendered by F2Page inside the .sw-f2 scope so rdca.css
// styles it. Nav is DATA-DRIVEN from club_pages (nav_label / nav_order / nav_visible /
// nav_parent_id -- one dropdown level, which the schema already supports); identity comes from
// the club record. No colours here -- rdca.css owns the look.
import type { ReactNode } from "react";
import type { SectionContext } from "./entitlement";

/** A club_pages row, reduced to what the nav needs. */
export interface NavPageRow {
  id: string;
  slug: string;
  nav_label: string | null;
  nav_order: number | null;
  nav_visible: boolean | null;
  nav_parent_id: string | null;
  /** Brief 10 sec 3a: the page's PUBLISHED arrangement ('stack' | 'main-side'). Carried on the nav
   *  rows so F2Page can read the current page's live mode from the same query. Absent = 'stack'.
   *  Ignored by buildNav (nav is orthogonal to layout). The draft mode lives in the composer. */
  published_layout_mode?: string | null;
}

export interface NavNode {
  label: string;
  href: string;
  icon?: string; // Tabler class, e.g. "ti-shopping-cart"
  active?: boolean;
  children?: { label: string; href: string }[];
}

const hrefFor = (slug: string) => (slug === "home" ? "/" : `/${slug}`);
// A tiny, known icon map so a couple of nav items carry their mark without a schema column.
const NAV_ICON: Record<string, string> = { store: "ti-shopping-cart", shop: "ti-shopping-cart" };

/** Build the one-level nav tree from club_pages rows. Top-level = visible, no parent, ordered
 *  by nav_order; children are grouped under their parent by nav_parent_id. */
export function buildNav(pages: NavPageRow[], currentSlug: string): NavNode[] {
  const visible = pages.filter((p) => p.nav_visible !== false && p.nav_label);
  const byOrder = (a: NavPageRow, b: NavPageRow) => (a.nav_order ?? 0) - (b.nav_order ?? 0);
  const childrenOf = (id: string) =>
    visible
      .filter((p) => p.nav_parent_id === id)
      .sort(byOrder)
      .map((c) => ({ label: c.nav_label as string, href: hrefFor(c.slug) }));
  return visible
    .filter((p) => !p.nav_parent_id)
    .sort(byOrder)
    .map((p) => {
      const kids = childrenOf(p.id);
      return {
        label: p.nav_label as string,
        href: hrefFor(p.slug),
        icon: NAV_ICON[p.slug],
        active: p.slug === currentSlug,
        children: kids.length ? kids : undefined,
      };
    });
}

function Icon({ name }: { name: string }): ReactNode {
  return <i className={`ti ${name}`} aria-hidden="true" />;
}

export interface ChromeProps {
  ctx: SectionContext;
  nav: NavNode[];
  /** Register CTA (nav action). Absent -> not shown. */
  register?: { label: string; href: string };
}

export function Header({ ctx, nav, register }: ChromeProps) {
  const { identity, contact } = ctx;
  const tagline = identity.league || identity.foundedNote || "";
  return (
    <header>
      <div className="topbar">
        <div className="tb-item">
          <Icon name="ti-map-pin" /> {identity.location}
          {identity.foundedNote ? ` · ${identity.foundedNote}` : ""}
        </div>
        <div className="t-soc">
          {contact.facebook && (
            <a href={contact.facebook} aria-label="Facebook"><Icon name="ti-brand-facebook" /></a>
          )}
          {contact.instagram && (
            <a href={contact.instagram} aria-label="Instagram"><Icon name="ti-brand-instagram" /></a>
          )}
        </div>
      </div>

      <nav className="nav-wrap">
        <div className="nav-inner">
          <a className="nav-brand" href="/">
            {identity.logo && <img className="nav-logo-img" src={identity.logo} alt={identity.name} />}
            <div>
              <div className="brand-name">{identity.shortName || identity.name}</div>
              {tagline && <div className="brand-sub">{tagline}</div>}
            </div>
          </a>

          <div className="nav-links">
            {nav.map((item, i) =>
              item.children?.length ? (
                <div className="nav-item" key={i}>
                  <a className="nav-link nav-drop-toggle" href={item.href}>
                    {item.icon && <Icon name={item.icon} />}
                    {item.label} <i className="ti ti-chevron-down" style={{ fontSize: 12 }} aria-hidden="true" />
                  </a>
                  <div className="nav-drop">
                    {item.children.map((c, j) => (
                      <a href={c.href} key={j}>{c.label}</a>
                    ))}
                  </div>
                </div>
              ) : (
                <a className={item.active ? "nav-link active" : "nav-link"} href={item.href} key={i}>
                  {item.icon && <Icon name={item.icon} />}
                  {item.label}
                </a>
              ),
            )}
          </div>

          <div className="nav-actions">
            <button className="nav-icon-btn" type="button" aria-label="Match-day alerts">
              <Icon name="ti-bell" />
            </button>
            <button className="nav-icon-btn" type="button" aria-label="Search">
              <Icon name="ti-search" />
            </button>
            {register && (
              <a className="btn btn-red btn-sm" href={register.href}>{register.label}</a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export function Footer({ ctx, nav }: ChromeProps) {
  const { identity, contact } = ctx;
  // Footer columns = the top-level dropdown groups (label + its children), capped at 3.
  const columns = nav.filter((n) => n.children?.length).slice(0, 3);
  const year = "2026"; // stamped by the app when it builds; kept static here (no Date in render).
  return (
    <div className="footer">
      <div className="footer-accent" />
      <div className="footer-top">
        <div>
          <div className="brand-name" style={{ color: "#fff", fontSize: 26 }}>
            {identity.shortName || identity.name}
          </div>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginTop: 8, maxWidth: 300 }}>
            {identity.name}
            {identity.foundedNote ? ` — ${identity.foundedNote}` : ""}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {contact.facebook && (
              <a className="f-soc" href={contact.facebook} aria-label="Facebook"><Icon name="ti-brand-facebook" /></a>
            )}
            {contact.instagram && (
              <a className="f-soc" href={contact.instagram} aria-label="Instagram"><Icon name="ti-brand-instagram" /></a>
            )}
          </div>
        </div>
        {columns.map((col, i) => (
          <div key={i}>
            <h4>{col.label}</h4>
            {col.children!.map((c, j) => (
              <a className="f-link" href={c.href} key={j}>{c.label}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-legal">
        © {year} {identity.name} · Built with SportsWeb One
      </div>
    </div>
  );
}
