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

function Cta({ label, href, primary }: { label: string; href: string; primary?: boolean }): ReactNode {
  return (
    <a className={primary ? "sw-sec-cta sw-sec-cta--primary" : "sw-sec-cta"} href={href}>
      {label}
    </a>
  );
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
    <aside className="sw-sec sw-sec--announce" role="note">
      <span className="sw-sec-announce-text">{props.text}</span>
      {props.link && (
        <a className="sw-sec-announce-link" href={props.link.href}>
          {props.link.label}
        </a>
      )}
    </aside>
  );
}

function BlockView({ block }: { block: Block }): ReactNode {
  switch (block.kind) {
    case "paragraph":
      return <p className="sw-sec-rt-p">{block.text}</p>;
    case "list": {
      const items = block.items.map((it, i) => <li key={i}>{it}</li>);
      return block.ordered ? <ol className="sw-sec-rt-list">{items}</ol> : <ul className="sw-sec-rt-list">{items}</ul>;
    }
    case "stat":
      return (
        <div className="sw-sec-rt-stat">
          <span className="sw-sec-rt-stat-value">{block.value}</span>
          <span className="sw-sec-rt-stat-label">{block.label}</span>
        </div>
      );
  }
}

export function RichTextSection({ props }: C<"rich_text">) {
  return (
    <section className="sw-sec sw-sec--richtext">
      {props.heading && <h2 className="sw-sec-heading">{props.heading}</h2>}
      <div className="sw-sec-rt-body">
        {props.body.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>
    </section>
  );
}

export function QuickLinksSection({ props }: C<"quick_links">) {
  return (
    <section className="sw-sec sw-sec--quicklinks">
      {props.heading && <h2 className="sw-sec-heading">{props.heading}</h2>}
      <ul className="sw-sec-ql-list">
        {props.links.map((l, i) => (
          <li key={i}>
            <a className="sw-sec-ql-link" href={l.href}>
              {l.icon && <span className="sw-sec-ql-icon" aria-hidden="true" data-icon={l.icon} />}
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CtaBandSection({ props }: C<"cta_band">) {
  return (
    <section className="sw-sec sw-sec--ctaband">
      <h2 className="sw-sec-heading">{props.heading}</h2>
      {props.blurb && <p className="sw-sec-ctaband-blurb">{props.blurb}</p>}
      <div className="sw-sec-ctaband-actions">
        {props.actions.map((a, i) => (
          <Cta key={i} {...a} primary={i === 0} />
        ))}
      </div>
    </section>
  );
}

export function PresidentWelcomeSection({ props }: C<"president_welcome">) {
  return (
    <section className="sw-sec sw-sec--president">
      {props.portrait && <img className="sw-sec-pres-portrait" src={props.portrait} alt={props.name} />}
      <div className="sw-sec-pres-body">
        {props.body.map((para, i) => (
          <p key={i} className="sw-sec-rt-p">
            {para}
          </p>
        ))}
        <p className="sw-sec-pres-sign">
          {props.signoff && <span className="sw-sec-pres-signoff">{props.signoff}</span>}
          <span className="sw-sec-pres-name">{props.name}</span>
          {props.role && <span className="sw-sec-pres-role">{props.role}</span>}
        </p>
      </div>
    </section>
  );
}

/** Contact binds GLOBAL club fields. A toggle that is on but has no underlying value shows
 *  nothing for that row (rule 9: no empty "Email: " label, no placeholder). */
export function ContactSection({ props, ctx }: C<"contact">) {
  const { contact, identity } = ctx;
  const rows: ReactNode[] = [];
  if (props.showEmail !== false && contact.email)
    rows.push(
      <a key="e" className="sw-sec-contact-row" href={`mailto:${contact.email}`}>
        {contact.email}
      </a>,
    );
  if (props.showPhone && contact.phone)
    rows.push(
      <a key="p" className="sw-sec-contact-row" href={`tel:${contact.phone}`}>
        {contact.phone}
      </a>,
    );
  const address = contact.addressLine || identity.ground;
  if (props.showAddress && address)
    rows.push(
      <span key="a" className="sw-sec-contact-row">
        {address}
      </span>,
    );
  if (props.showMap && address)
    rows.push(
      <a
        key="m"
        className="sw-sec-contact-map"
        href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noreferrer"
      >
        View on map
      </a>,
    );

  if (rows.length === 0) return null; // nothing to show -> render nothing
  return (
    <section className="sw-sec sw-sec--contact">
      {props.heading && <h2 className="sw-sec-heading">{props.heading}</h2>}
      <div className="sw-sec-contact-rows">{rows}</div>
    </section>
  );
}
