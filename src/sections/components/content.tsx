// F2 P2 -- PR 2: Content-class section components.
// Props hold the authored content (this is Claude's authoring surface). Each component is
// position-independent (sec 5, rule 8): it wraps itself and assumes nothing about what sits
// above or below. No colours anywhere -- theme tokens arrive as CSS custom properties at the
// page root (PR 4). Structural class hooks (sw-sec*) are styled in the Classic port (PR 4).
import type { ReactNode } from "react";
import type { Block } from "../blocks";
import type { SectionContext } from "../entitlement";
import type { PropsOf } from "../schemas";
import type { CurrentMatch } from "../../content/types";

type C<T extends keyof PropsMap> = { props: PropsMap[T]; ctx: SectionContext };
// local alias so each component reads `C<'hero'>` etc.
interface PropsMap {
  hero: PropsOf<"hero">;
  announcement_bar: PropsOf<"announcement_bar">;
  rich_text: PropsOf<"rich_text">;
  quick_links: PropsOf<"quick_links">;
  cta_band: PropsOf<"cta_band">;
  president_welcome: PropsOf<"president_welcome">;
  contact: PropsOf<"contact">;
}

/** Styled headline: renders titleRich segments (accent/ghost, with line breaks) or the plain
 *  title. No raw HTML -- segments are plain text placed in spans with a closed set of classes. */
function HeroHeadline({ props }: { props: PropsOf<"hero"> }): ReactNode {
  if (props.titleRich?.length) {
    return (
      <>
        {props.titleRich.map((seg, i) => {
          const cls = seg.style === "accent" ? "accent" : seg.style === "ghost" ? "ghost" : undefined;
          return (
            <span key={i}>
              {i > 0 ? (seg.break ? <br /> : " ") : null}
              <span className={cls}>{seg.text}</span>
            </span>
          );
        })}
      </>
    );
  }
  return <>{props.title}</>;
}

/** The Home Match Centre card (.hmc) inside the hero's 440px right slot. Sport-neutral: it
 *  renders whatever teams/cells/deliveries the CurrentMatch carries (cricket, AFL, ...). */
function MatchCard({ m }: { m: CurrentMatch }): ReactNode {
  return (
    <div className="hmc">
      <div className="hmc-hdr">
        {m.status && (
          <span className="badge badge-red">
            {m.live && <span className="live-dot" />} {m.status}
          </span>
        )}
        {m.competition && <span className="hmc-comp">{m.competition}</span>}
      </div>
      {m.teams.map((t, i) => (
        <div className="hmc-team" key={i}>
          <div className="hmc-tid">
            {t.initials && (
              <div className="hmc-logo" style={t.colour ? { background: t.colour } : undefined}>
                {t.initials}
              </div>
            )}
            <div>
              <div className="hmc-name" style={t.dim ? { color: "rgba(255,255,255,.5)" } : undefined}>
                {t.name}
              </div>
              {t.note && <div className="hmc-sub">{t.note}</div>}
            </div>
          </div>
          {t.score && (
            <div>
              <div className={t.dim ? "hmc-score dim" : "hmc-score"}>{t.score}</div>
              {t.scoreNote && <div className="hmc-overs">{t.scoreNote}</div>}
            </div>
          )}
        </div>
      ))}
      {m.cells?.length ? (
        <div className="hmc-grid">
          {m.cells.map((c, i) => (
            <div className="hmc-cell" key={i}>
              <div className="hmc-lbl">{c.label}</div>
              <div className="hmc-val" style={c.emphasis ? { color: "#fca5a5" } : undefined}>
                {c.value}
              </div>
              {c.sub && <div className="hmc-val2">{c.sub}</div>}
            </div>
          ))}
        </div>
      ) : null}
      {m.deliveries?.length ? (
        <>
          <div className="hmc-balls-lbl">Last {m.deliveries.length} deliveries</div>
          <div className="hmc-balls">
            {m.deliveries.map((d, i) => (
              <div className={d.kind ? `hmc-ball ${d.kind}` : "hmc-ball"} key={i}>
                {d.value}
              </div>
            ))}
            {m.footNote && (
              <>
                <div style={{ flex: 1 }} />
                <span className="hmc-crr">{m.footNote}</span>
              </>
            )}
          </div>
        </>
      ) : null}
      {m.cta && (
        <a className="btn btn-outline-white hmc-cta" href={m.cta.href}>
          {m.cta.label}
        </a>
      )}
    </div>
  );
}

/** RDCA hero (Brief 10 Phase A). Emits the real design markup styled by rdca.css. The
 *  'feature' layout is the two-column hero; its 440px right slot holds the match card when
 *  showMatchCard is set, the club is entitled to Match Centre, and a current match exists --
 *  otherwise the hero is single-column with no empty box (Rule 9 / Ruling 3). */
export function HeroSection({ props, ctx }: C<"hero">) {
  const layout = props.layout ?? "centred";
  const feature = layout === "feature";
  const m = props.media;
  const bg = m?.kind === "image" && m.url ? { backgroundImage: `url("${m.url}")` } : undefined;
  const match =
    feature && props.showMatchCard && ctx.isEntitled("scoreboard") ? ctx.matchCentre?.current : undefined;

  return (
    <section className="hero" data-layout={layout} data-matchcard={match ? "on" : "off"}>
      <div className="hero-photo" style={bg} />
      <div className="hero-grid">
        <div className="hero-left">
          {props.eyebrow && <div className="hero-eyebrow">{props.eyebrow}</div>}
          <h1 className="hero-hed">
            <HeroHeadline props={props} />
          </h1>
          {props.subtitle && <p className="hero-sub">{props.subtitle}</p>}
          {(props.primaryCta || props.secondaryCta) && (
            <div className="hero-ctas">
              {props.primaryCta && (
                <a className="btn btn-red btn-lg" href={props.primaryCta.href}>
                  {props.primaryCta.label}
                </a>
              )}
              {props.secondaryCta && (
                <a className="btn btn-ghost" href={props.secondaryCta.href}>
                  {props.secondaryCta.label}
                </a>
              )}
            </div>
          )}
          {props.badges?.length || props.note ? (
            <div className="hero-badge-row">
              {props.badges?.map((b, i) => (
                <span className="badge badge-red" key={i}>
                  {b.live && <span className="live-dot" />} {b.text}
                </span>
              ))}
              {props.note && <span className="hero-note">{props.note}</span>}
            </div>
          ) : null}
          {props.stats?.length ? (
            <div className="hero-stats">
              {props.stats.map((s, i) => (
                <div className="hero-stat" key={i}>
                  <div className="hero-stat-top">
                    {s.icon && <i className={`ti ${s.icon} hero-stat-ic`} />}
                    <div className="hero-stat-val">{s.value}</div>
                  </div>
                  <div className="hero-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {match && (
          <div className="hero-right">
            <MatchCard m={match} />
          </div>
        )}
      </div>
    </section>
  );
}

export function AnnouncementBarSection({ props }: C<"announcement_bar">) {
  if (!props.enabled) return null; // disabled -> nothing, not an empty bar
  return (
    <aside className="sw-sec announce-bar" role="note">
      <div className="announce-inner">
        <i className="ti ti-speakerphone" aria-hidden="true"></i>
        <span className="announce-text">{props.text}</span>
        {props.link && (
          <a className="announce-link" href={props.link.href}>
            {props.link.label} <i className="ti ti-arrow-right" aria-hidden="true"></i>
          </a>
        )}
      </div>
    </aside>
  );
}

function BlockView({ block }: { block: Block }): ReactNode {
  switch (block.kind) {
    case "paragraph":
      return <p className="rt-p">{block.text}</p>;
    case "list": {
      const items = block.items.map((it, i) => <li key={i}>{it}</li>);
      return block.ordered ? <ol className="rt-list">{items}</ol> : <ul className="rt-list">{items}</ul>;
    }
    case "stat":
      return (
        <div className="rt-stat">
          <span className="rt-stat-value">{block.value}</span>
          <span className="rt-stat-label">{block.label}</span>
        </div>
      );
  }
}

/** Rich text, RDCA design: a `.card` prose block. */
export function RichTextSection({ props }: C<"rich_text">) {
  return (
    <section className="sw-sec sw-sec--richtext card sw-rt">
      {props.heading && (
        <div className="sec-hdr">
          <div className="s-hed">{props.heading}</div>
        </div>
      )}
      <div className="rt-body">
        {props.body.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>
    </section>
  );
}

/** Quick links, RDCA design: a `.card` list of icon rows (the sidebar nav card). */
export function QuickLinksSection({ props }: C<"quick_links">) {
  return (
    <section className="sw-sec sw-sec--quicklinks card sw-ql">
      {props.heading && (
        <div className="sec-hdr">
          <div className="s-hed">{props.heading}</div>
        </div>
      )}
      <ul className="ql-list">
        {props.links.map((l, i) => (
          <li key={i}>
            <a className="ql-row" href={l.href}>
              {l.icon && <i className={`ti ${l.icon} ql-icon`} aria-hidden="true"></i>}
              <span className="ql-label">{l.label}</span>
              <i className="ti ti-chevron-right ql-arrow" aria-hidden="true"></i>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** CTA band, RDCA design: a navy gradient band with a headline + buttons. */
export function CtaBandSection({ props }: C<"cta_band">) {
  return (
    <section className="sw-sec sw-sec--ctaband cta-band">
      <div className="cta-band-inner">
        <div className="cta-band-text">
          <div className="cta-band-hed">{props.heading}</div>
          {props.blurb && <div className="cta-band-blurb">{props.blurb}</div>}
        </div>
        <div className="cta-band-actions">
          {props.actions.map((a, i) => (
            <a key={i} className={`btn ${i === 0 ? "btn-red" : "btn-outline-white"}`} href={a.href}>
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** President welcome, RDCA design: a `.card` with an optional portrait + a signed message. */
export function PresidentWelcomeSection({ props }: C<"president_welcome">) {
  return (
    <section className="sw-sec sw-sec--president card sw-pres">
      {props.portrait && <img className="pres-portrait" src={props.portrait} alt={props.name} />}
      <div className="pres-body">
        {props.body.map((para, i) => (
          <p key={i} className="pres-p">
            {para}
          </p>
        ))}
        <div className="pres-sign">
          {props.signoff && <span className="pres-signoff">{props.signoff}</span>}
          <span className="pres-name">{props.name}</span>
          {props.role && <span className="pres-role">{props.role}</span>}
        </div>
      </div>
    </section>
  );
}

/** Contact binds GLOBAL club fields. A toggle that is on but has no underlying value shows
 *  nothing for that row (rule 9: no empty "Email: " label, no placeholder). */
/** Contact, RDCA design (audit sec 19): a full-width navy band with an intro, icon-tiled contact
 *  methods, and socials + a message CTA. Binds GLOBAL club fields (ctx.contact / identity); props
 *  only toggle which methods show. Renders nothing if there is nothing to show. */
export function ContactSection({ props, ctx }: C<"contact">) {
  const { contact, identity } = ctx;
  const address = contact.addressLine || identity.ground || identity.location;
  const showEmail = props.showEmail !== false && !!contact.email;
  const showPhone = props.showPhone && !!contact.phone;
  const showAddress = (props.showAddress || props.showMap) && !!address;
  const hasSocial = !!(contact.facebook || contact.instagram);

  if (!showEmail && !showPhone && !showAddress && !hasSocial) return null;

  return (
    <section className="sw-sec sw-sec--contact contact-section sw-contact">
      <div className="contact-inner">
        <div className="ct-intro">
          <div className="ct-eyebrow">Get in Touch</div>
          <div className="ct-title">{props.heading ?? `Contact ${identity.shortName || identity.name}`}</div>
          <div className="ct-sub">Questions about registrations, competitions or anything else — we&rsquo;re here to help.</div>
        </div>

        <div className="ct-methods">
          {showPhone && (
            <a className="ct-row" href={`tel:${contact.phone}`}>
              <span className="ct-ic"><i className="ti ti-phone" aria-hidden="true"></i></span>
              {contact.phone}
            </a>
          )}
          {showEmail && (
            <a className="ct-row" href={`mailto:${contact.email}`}>
              <span className="ct-ic"><i className="ti ti-mail" aria-hidden="true"></i></span>
              {contact.email}
            </a>
          )}
          {showAddress && (
            <a
              className="ct-row"
              href={`https://maps.google.com/?q=${encodeURIComponent(address!)}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="ct-ic"><i className="ti ti-map-pin" aria-hidden="true"></i></span>
              {address}
            </a>
          )}
        </div>

        {(hasSocial || showEmail) && (
          <div className="ct-follow">
            {hasSocial && (
              <>
                <div className="ct-eyebrow">Follow Us</div>
                <div className="ct-social-row">
                  {contact.facebook && (
                    <a className="ct-soc" href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                      <i className="ti ti-brand-facebook" aria-hidden="true"></i>
                    </a>
                  )}
                  {contact.instagram && (
                    <a className="ct-soc" href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                      <i className="ti ti-brand-instagram" aria-hidden="true"></i>
                    </a>
                  )}
                </div>
              </>
            )}
            {showEmail && (
              <a className="btn btn-red" href={`mailto:${contact.email}`}>
                <i className="ti ti-mail" aria-hidden="true"></i> Send a Message
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
