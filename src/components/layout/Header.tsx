import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useClub } from "../ClubContext";

/** Flattened, searchable items built from whatever content this club has loaded:
 *  nav pages, news posts, teams and sponsors. Kept generic so every club gets
 *  working header search, not just gameday. */
function useSearchIndex() {
  const { club } = useClub();
  return useMemo(() => {
    const items: { label: string; href: string; kind: string }[] = [];
    for (const item of club.nav) items.push({ label: item.label, href: item.href, kind: "Page" });
    for (const p of club.news ?? []) items.push({ label: p.title, href: p.href ?? `/news/${p.slug ?? p.id}`, kind: "News" });
    for (const group of club.teams ?? [])
      for (const t of group.teams ?? [])
        items.push({ label: t.name, href: t.href ?? (t.slug ? `/teams/${t.slug}` : "/teams"), kind: "Team" });
    for (const s of club.sponsors ?? []) items.push({ label: s.name, href: s.href ?? "/sponsors", kind: "Sponsor" });
    return items;
  }, [club]);
}

function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const index = useSearchIndex();
  const navigate = useNavigate();

  const results = q.trim()
    ? index.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : [];

  const go = (href: string) => {
    navigate(href);
    setOpen(false);
    setQ("");
  };

  return (
    <div className="sw-search">
      <button
        type="button"
        className="sw-search-toggle"
        aria-label="Search"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
      {open && (
        <div className="sw-search-panel">
          <input
            autoFocus
            type="search"
            placeholder="Search the site…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].href);
              if (e.key === "Escape") setOpen(false);
            }}
          />
          {results.length > 0 && (
            <ul className="sw-search-results">
              {results.map((r) => (
                <li key={r.kind + r.label}>
                  <button type="button" onClick={() => go(r.href)}>
                    <span>{r.label}</span>
                    <span className="sw-search-kind">{r.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {q.trim() && results.length === 0 && <p className="sw-search-empty">No matches.</p>}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { club } = useClub();
  const { identity, contact, nav } = club;
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever navigation occurs.
  const close = () => setOpen(false);

  return (
    <>
      <div className="sw-topbar">
        <div className="sw-container">
          <span>{identity.location}</span>
          <div className="sw-topbar-meta">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
          </div>
        </div>
      </div>

      <header className="sw-header">
        <div className="sw-container">
          <Link to="/" className="sw-brand" onClick={close}>
            <img src={identity.logo} alt={`${identity.name} logo`} />
            <span className="sw-brand-text">
              <span className="sw-brand-name">{identity.shortName}</span>
              <br />
              <span className="sw-brand-sub">
                {[...identity.sports, identity.foundedNote].filter(Boolean).join(" · ")}
              </span>
            </span>
          </Link>

          <nav className="sw-nav" aria-label="Primary">
            <ul>
              {nav.map((item) => (
                <li key={item.label} className="sw-nav-item">
                  <NavLink
                    to={item.href}
                    className="sw-nav-link"
                    end={item.href === "/"}
                  >
                    {item.label}
                    {item.children && <span aria-hidden="true">▾</span>}
                  </NavLink>
                  {item.children && (
                    <div className="sw-submenu">
                      {item.children.map((c) => (
                        <Link key={c.label} to={c.href.startsWith("/") ? c.href : "/"}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <HeaderSearch />

          <Link to={club.hero.primaryCta?.href ?? "/register"} className="sw-btn sw-header-cta">
            {club.hero.primaryCta?.label ?? "Join the club"}
          </Link>

          <button
            className="sw-burger"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className="sw-drawer" data-open={open} key={location.pathname}>
        {nav.map((item) =>
          item.children ? (
            <details key={item.label}>
              <summary>{item.label}</summary>
              {item.children.map((c) => (
                <Link
                  key={c.label}
                  to={c.href.startsWith("/") ? c.href : "/"}
                  onClick={close}
                >
                  {c.label}
                </Link>
              ))}
            </details>
          ) : (
            <Link key={item.label} to={item.href} onClick={close}>
              {item.label}
            </Link>
          )
        )}
        <Link to={club.hero.primaryCta?.href ?? "/register"} className="sw-btn" onClick={close}>
          {club.hero.primaryCta?.label ?? "Join the club"}
        </Link>
      </div>
    </>
  );
}
