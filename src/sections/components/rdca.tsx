// Brief 10 -- the new RDCA Content-class section components (audit sec 1a). Props hold the
// authored content (this is the AI authoring surface); each has a zod schema, a cardinality, an
// aiAuthorable class, and a Rule-9-safe empty behaviour (a Content section with no content renders
// nothing rather than an empty shell). All emit RDCA class hooks styled by the scoped rdca.css.
import type { SectionContext } from "../entitlement";
import type { PropsOf, SectionType } from "../schemas";

type C<T extends SectionType> = { props: PropsOf<T>; ctx: SectionContext };

/** App-launcher grid: icon tiles to Fixtures / Results / Ladders / ... */
export function AppGridSection({ props }: C<"app_grid">) {
  return (
    <section className="sw-sec app-section">
      <div className="app-inner">
        {props.heading && <div className="s-hed app-hed">{props.heading}</div>}
        <div className="app-grid">
          {props.tiles.map((t, i) => (
            <a key={i} className="ab" href={t.href}>
              <div className="ai">
                {t.image ? <img src={t.image} alt="" /> : <i className={`ti ${t.icon ?? "ti-square"}`} aria-hidden="true"></i>}
              </div>
              <span className="al">{t.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Feature banner: a photo band with a headline + CTA. Absorbs Rep Cricket (tall) + Umpires (compact). */
export function FeatureBannerSection({ props }: C<"feature_banner">) {
  return (
    <section className={`sw-sec feature-banner fb--${props.variant ?? "tall"}`}>
      <div className="fb-photo" style={props.image ? { backgroundImage: `url('${props.image}')` } : undefined} />
      <div className="fb-inner">
        <div className="fb-text">
          {props.eyebrow && <div className="fb-eyebrow">{props.eyebrow}</div>}
          <div className="fb-title">{props.heading}</div>
          {props.blurb && <div className="fb-blurb">{props.blurb}</div>}
        </div>
        {props.cta && (
          <a className="btn btn-outline-red" href={props.cta.href}>
            {props.cta.label}
          </a>
        )}
      </div>
    </section>
  );
}

/** Newsletter signup band. The email input is a visual affordance; the CTA links to the real
 *  signup page (no list backend yet -- honest, not a dead form). */
export function NewsletterSection({ props }: C<"newsletter">) {
  return (
    <section className="sw-sec newsletter">
      <div className="nl-bg" />
      <div className="nl-inner">
        <div className="nl-text">
          {props.eyebrow && <div className="nl-eyebrow">{props.eyebrow}</div>}
          <div className="nl-title">{props.heading}</div>
          {props.blurb && <div className="nl-blurb">{props.blurb}</div>}
        </div>
        <div className="nl-form">
          <input className="nl-input" type="email" placeholder={props.placeholder ?? "Your email"} aria-label="Email address" />
          <a className="btn btn-red" href={props.cta?.href ?? "/subscribe"}>
            {props.cta?.label ?? "Subscribe"}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Photo strip: a scrolling row of gallery images. */
export function PhotoStripSection({ props }: C<"photo_strip">) {
  return (
    <section className="sw-sec photo-strip ats-band">
      {(props.heading || props.eyebrow) && (
        <div className="sec-hdr ps-hdr">
          <div>
            {props.eyebrow && <div className="eyebrow">{props.eyebrow}</div>}
            {props.heading && <div className="s-hed">{props.heading}</div>}
          </div>
          {props.viewAllHref && (
            <a className="view-all" href={props.viewAllHref}>
              All photos <i className="ti ti-arrow-right" aria-hidden="true"></i>
            </a>
          )}
        </div>
      )}
      <div className="pstrip">
        <div className="pstrip-track">
          {props.images.map((im, i) => (
            <a
              key={i}
              className="pstrip-item"
              href={im.href ?? props.viewAllHref ?? "#"}
              style={{ backgroundImage: `url('${im.url}')` }}
              aria-label={im.caption ?? "Photo"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Clubs directory: member clubs grouped by division (association-level). */
export function ClubsDirectorySection({ props }: C<"clubs_directory">) {
  return (
    <section className="sw-sec card sw-clubs">
      <div className="sec-hdr">
        <div>
          {props.eyebrow && <div className="eyebrow">{props.eyebrow}</div>}
          <div className="s-hed">{props.heading ?? "Club Directory"}</div>
        </div>
        {props.viewAllHref && (
          <a className="view-all" href={props.viewAllHref}>
            All Clubs <i className="ti ti-arrow-right" aria-hidden="true"></i>
          </a>
        )}
      </div>
      {props.divisions.map((d, di) => (
        <div key={di} className="club-div">
          <div className="club-div-hdr">
            <i className="ti ti-trophy" aria-hidden="true"></i> {d.name}
            <span className="club-div-count">{d.clubs.length} clubs</span>
          </div>
          <div className="clubs-grid">
            {d.clubs.map((c, ci) => (
              <a key={ci} className="club-tile" href={c.href ?? "#"}>
                <div className="club-logo">
                  {c.logo ? <img src={c.logo} alt="" /> : <i className="ti ti-shield" aria-hidden="true"></i>}
                </div>
                <span className="club-name">{c.name}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/** Identity card (sidebar): the club's own identity over a cover image; binds ctx.identity. */
export function IdentitySection({ props, ctx }: C<"identity">) {
  const { identity } = ctx;
  return (
    <section className="sw-sec card sw-identity">
      <div className="id-cover" style={props.image ? { backgroundImage: `url('${props.image}')` } : undefined}>
        <div className="id-cover-ov" />
      </div>
      <div className="id-body">
        {identity.logo && (
          <div className="id-crest">
            <img src={identity.logo} alt={identity.name} />
          </div>
        )}
        <div className="id-name">{props.heading ?? identity.name}</div>
        {props.blurb && <div className="id-blurb">{props.blurb}</div>}
        <div className="id-facts">
          {props.showFounded !== false && identity.foundedNote && (
            <div className="id-fact">
              <i className="ti ti-calendar-star" aria-hidden="true"></i> {identity.foundedNote}
            </div>
          )}
          {props.showGround !== false && identity.ground && (
            <div className="id-fact">
              <i className="ti ti-map-pin" aria-hidden="true"></i> {identity.ground}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Player spotlight (sidebar): a featured player card. */
export function PlayerSpotlightSection({ props }: C<"player_spotlight">) {
  return (
    <section className="sw-sec card sw-spotlight">
      <div className="sp-cover" style={props.image ? { backgroundImage: `url('${props.image}')` } : undefined}>
        <div className="sp-cover-ov" />
        <div className="sp-cover-cap">
          <div className="eyebrow">Feature</div>
          <div className="sp-kicker">{props.heading ?? "Player Spotlight"}</div>
        </div>
      </div>
      <div className="sp-body">
        <div className="sp-name">{props.name}</div>
        {props.meta && <div className="sp-meta">{props.meta}</div>}
        {props.stat && (
          <div className="sp-stat">
            <span className="sp-stat-val">{props.stat.value}</span>
            <span className="sp-stat-lbl">{props.stat.label}</span>
          </div>
        )}
        {props.blurb && <div className="sp-blurb">{props.blurb}</div>}
        {props.href && (
          <a className="view-all" href={props.href}>
            Read more <i className="ti ti-arrow-right" aria-hidden="true"></i>
          </a>
        )}
      </div>
    </section>
  );
}

/** Alerts band (sidebar): a red-accented notices / match-day alert prompt. */
export function AlertsSection({ props }: C<"alerts">) {
  return (
    <section className="sw-sec card sw-alerts">
      <div className="al-hdr">
        <span className="al-title">
          <i className="ti ti-bell" aria-hidden="true"></i> {props.heading ?? "Community Notices"}
        </span>
      </div>
      {props.blurb && <div className="al-blurb">{props.blurb}</div>}
      {props.cta && (
        <a className="btn btn-red al-cta" href={props.cta.href}>
          {props.cta.label}
        </a>
      )}
    </section>
  );
}
