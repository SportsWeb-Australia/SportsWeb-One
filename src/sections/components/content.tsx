// F2 P2 -- PR 2: Content-class section components.
// Props hold the authored content (this is Claude's authoring surface). Each component is
// position-independent (sec 5, rule 8): it wraps itself and assumes nothing about what sits
// above or below. No colours anywhere -- theme tokens arrive as CSS custom properties at the
// page root (PR 4). Structural class hooks (sw-sec*) are styled in the Classic port (PR 4).
import type { ReactNode } from "react";
import type { Block } from "../blocks";
import type { SectionContext } from "../entitlement";
import type { PropsOf } from "../schemas";

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

export function HeroSection({ props }: C<"hero">) {
  const m = props.media;
  return (
    <section className="sw-sec sw-sec--hero">
      {m?.kind === "image" && m.url && <img className="sw-sec-hero-media" src={m.url} alt="" />}
      {m?.kind === "video" && m.url && (
        <video className="sw-sec-hero-media" src={m.url} poster={m.poster} muted playsInline autoPlay loop />
      )}
      <div className="sw-sec-hero-body">
        {props.eyebrow && <p className="sw-sec-eyebrow">{props.eyebrow}</p>}
        <h1 className="sw-sec-hero-title">{props.title}</h1>
        {props.subtitle && <p className="sw-sec-hero-sub">{props.subtitle}</p>}
        {(props.primaryCta || props.secondaryCta) && (
          <div className="sw-sec-hero-ctas">
            {props.primaryCta && <Cta {...props.primaryCta} primary />}
            {props.secondaryCta && <Cta {...props.secondaryCta} />}
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
