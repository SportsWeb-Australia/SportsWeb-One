import { Link } from "react-router-dom";
import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { EditableText } from "../edit/Editable";

export function Footer() {
  const { club } = useClub();
  const { identity, contact, nav, footer } = club;
  const year = new Date().getFullYear();

  return (
    <footer className="sw-footer">
      <div className="sw-container">
        <div className="sw-footer-top">
          <div>
            <div className="sw-footer-brand">
              <img src={identity.logo} alt={`${identity.name} logo`} />
              <div>
                <strong style={{ fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
                  {identity.shortName}
                </strong>
                <div className="sw-brand-sub">{identity.league}</div>
              </div>
            </div>
            <p style={{ marginTop: "1rem", color: "color-mix(in srgb, var(--text-invert) 70%, transparent)" }}>
              {identity.ground}
            </p>
          </div>

          <div className="sw-footer-col">
            <EditableText as="h4" k="footer.col.explore" value="Explore" />
            {nav.slice(0, 6).map((item) => (
              <Link key={item.label} to={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="sw-footer-col">
            <EditableText as="h4" k="footer.col.getInvolved" value="Get involved" />
            <Link to="/register"><EditableText as="span" k="footer.involved.0" value="Register to play" /></Link>
            <Link to="/register"><EditableText as="span" k="footer.involved.1" value="Volunteer" /></Link>
            <Link to="/sponsors"><EditableText as="span" k="footer.involved.2" value="Become a sponsor" /></Link>
            <Link to="/contact"><EditableText as="span" k="footer.involved.3" value="Contact us" /></Link>
          </div>

          <div className="sw-footer-col">
            <EditableText as="h4" k="footer.col.stayInTouch" value="Stay in touch" />
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}
            <div className="sw-footer-socials" style={{ marginTop: "1rem" }}>
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M17.2 6.8h.01" />
                  </svg>
                </a>
              )}
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7.7 0 1.6.1 2 .2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.7H16l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {(footer.acknowledgement || (footer.logos && footer.logos.length > 0)) && (
          <div className="sw-ack-row">
            {footer.logos && footer.logos.length > 0 && (
              <div className="sw-ack-flags" aria-hidden="true">
                {footer.logos.map((src, i) => (
                  <img key={i} src={src} alt="" />
                ))}
              </div>
            )}
            <EditableText as="p" className="sw-ack" k="footer.acknowledgement" value={footer.acknowledgement} />
          </div>
        )}

        <div className="sw-footer-bottom">
          <span>
            © {year} {identity.name}. All rights reserved.
          </span>
          <div className="sw-footer-legal">
            {footer.legal.map((l) => (
              <SmartLink key={l.label} href={l.href}>
                {l.label}
              </SmartLink>
            ))}
          </div>
          <span className="sw-builtby">
            Built on{" "}
            <a href="https://sportsweb.com.au" target="_blank" rel="noopener noreferrer">
              SportsWeb One
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
