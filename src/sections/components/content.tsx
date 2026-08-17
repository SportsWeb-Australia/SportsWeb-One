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
  clubs_directory: PropsOf<"clubs_directory">;
  team_lineup: PropsOf<"team_lineup">;
  photo_strip: PropsOf<"photo_strip">;
}

function Cta({ label, href, primary }: { label: string; href: string; primary?: boolean }): ReactNode {
  return (
    <a className={primary ? "sw-sec-cta sw-sec-cta--primary" : "sw-sec-cta"} href={href}>
      {label}
    </a>
  );
}

function HeroTitle({ props }: { props: PropsOf<"hero"> }): ReactNode {
  if (!props.titleRich?.length) return props.title;
  return props.titleRich.map((part, i) => {
    const node = part.break ? (
      <>
        <br />
        {part.text}
      </>
    ) : (
      part.text
    );
    if (part.style === "accent") return <span key={i} className="sw-sec-hero-accent">{node}</span>;
    if (part.style === "ghost") return <span key={i} className="sw-sec-hero-ghost">{node}</span>;
    return <span key={i}>{node}</span>;
  });
}

/** RDCA's real .hmc -- built from whatever the club's actual MatchCentreData holds (a next
 *  fixture or latest result), never fabricated ball-by-ball detail the data model doesn't
 *  have (no partnership/RRR/last-6-balls source exists -- Rule 9 means this card is honest
 *  about what it can show, not a recreation of RDCA's static mockup content). */
function HeroMatchCard({ ctx }: { ctx: SectionContext }): ReactNode {
  const mc = ctx.matchCentre;
  if (!mc) return null;
  const fixture = mc.fixtures[0];
  const result = mc.results[0];
  const item = fixture ?? result;
  if (!item) return null;
  const isFixture = Boolean(fixture);
  return (
    <div className="sw-sec-hmc" aria-label="Match centre">
      <div className="sw-sec-hmc-hdr">
        <span className="sw-sec-hmc-badge">{isFixture ? "Next match" : "Latest result"}</span>
        <span className="sw-sec-hmc-comp">
          {mc.competitionLabel} &middot; {item.grade} &middot; {item.round}
        </span>
      </div>
      <div className="sw-sec-hmc-team">
        <div className="sw-sec-hmc-tid">
          {item.opponentLogo && <img className="sw-sec-hmc-logo" src={item.opponentLogo} alt="" />}
          <span className="sw-sec-hmc-name">{item.opponent}</span>
        </div>
        {!isFixture && (
          <span className="sw-sec-hmc-score">
            {result!.scoreFor} <span className="sw-sec-hmc-vs">v</span> {result!.scoreAgainst}
          </span>
        )}
      </div>
      {isFixture && (
        <div className="sw-sec-hmc-meta">
          {fixture!.date} &middot; {fixture!.venue}
        </div>
      )}
      {!isFixture && result!.outcome && (
        <div className="sw-sec-hmc-outcome" data-outcome={result!.outcome}>
          {result!.outcome === "W" ? "Won" : result!.outcome === "L" ? "Lost" : "Drew"}
        </div>
      )}
    </div>
  );
}

function FeatureHero({ props, ctx }: C<"hero">) {
  const m = props.media;
  // Requires actual data, not just an entitlement: HeroMatchCard renders null when there is
  // no next fixture AND no latest result, so gating on `matchCentre !== null` alone reserved
  // the 440px column for a card that never appeared — the hero text squeezed left against a
  // large empty space, which is exactly the empty box Rule 9 forbids.
  const mc = ctx.matchCentre;
  const hasMatchCard =
    props.showMatchCard === true &&
    ctx.isEntitled("match_data") &&
    !!(mc && (mc.fixtures[0] || mc.results[0]));
  return (
    <section className="sw-sec sw-sec--hero" data-layout="feature" data-has-match-card={hasMatchCard || undefined}>
      <div className="sw-sec-hero-photo">
        {m?.kind === "image" && m.url && <img className="sw-sec-hero-media" src={m.url} alt="" />}
        {m?.kind === "video" && m.url && (
          <video className="sw-sec-hero-media" src={m.url} poster={m.poster} muted playsInline autoPlay loop />
        )}
      </div>
      <div className="sw-sec-hero-grid">
        <div className="sw-sec-hero-left">
          {props.crest?.url && (
            <img className="sw-sec-hero-crest" src={props.crest.url} alt={props.crest.alt || ""} />
          )}
          {props.eyebrow && <p className="sw-sec-eyebrow">{props.eyebrow}</p>}
          <h1 className="sw-sec-hero-hed">
            <HeroTitle props={props} />
          </h1>
          {props.subtitle && <p className="sw-sec-hero-sub">{props.subtitle}</p>}
          {(props.primaryCta || props.secondaryCta) && (
            <div className="sw-sec-hero-ctas">
              {props.primaryCta && <Cta {...props.primaryCta} primary />}
              {props.secondaryCta && <Cta {...props.secondaryCta} />}
            </div>
          )}
          {(props.badges?.length || props.note) && (
            <div className="sw-sec-hero-badge-row">
              {props.badges?.map((b, i) => (
                <span key={i} className="sw-sec-hero-badge" data-live={b.live || undefined}>
                  {b.live && <span className="sw-sec-live-dot" />} {b.text}
                </span>
              ))}
              {props.note && <span className="sw-sec-hero-note">{props.note}</span>}
            </div>
          )}
          {props.stats?.length ? (
            <div className="sw-sec-hero-stats">
              {props.stats.map((s, i) => (
                <div key={i} className="sw-sec-hero-stat">
                  <span className="sw-sec-hero-stat-val">{s.value}</span>
                  <span className="sw-sec-hero-stat-lbl">{s.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {hasMatchCard && (
          <div className="sw-sec-hero-right">
            <HeroMatchCard ctx={ctx} />
          </div>
        )}
      </div>
    </section>
  );
}

export function HeroSection({ props, ctx }: C<"hero">) {
  const layout = props.layout ?? "centred";
  // 'feature' has real ported RDCA markup (.hero-grid/.hmc). Every other layout keeps the
  // generic renderer below until it gets its own real design (docs/rdca-port-audit-v2.md).
  if (layout === "feature") return <FeatureHero props={props} ctx={ctx} />;

  const m = props.media;
  return (
    <section className="sw-sec sw-sec--hero" data-layout={layout}>
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
  if (props.display === "list") {
    if (!props.items?.length) return null; // list mode with nothing to list -> nothing (Rule 9)
    return (
      <aside className="sw-sec sw-sec--announce sw-sec--announce-list" role="note">
        <ul className="sw-sec-announce-items">
          {props.items.map((it, i) => (
            <li key={i} className="sw-sec-announce-item">
              {it.date && <span className="sw-sec-announce-date">{it.date}</span>}
              {it.link ? (
                <a className="sw-sec-announce-link" href={it.link.href}>
                  {it.text}
                </a>
              ) : (
                <span className="sw-sec-announce-text">{it.text}</span>
              )}
            </li>
          ))}
        </ul>
      </aside>
    );
  }
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
  const spotlight = props.layout === "spotlight";
  return (
    <section className={`sw-sec sw-sec--richtext${spotlight ? " sw-sec--richtext-spotlight" : ""}`}>
      {spotlight && props.photo && <img className="sw-sec-rt-photo" src={props.photo} alt="" />}
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
  const display = props.display ?? "list";
  return (
    <section className={`sw-sec sw-sec--quicklinks sw-sec--quicklinks-${display}`}>
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
  const size = props.size ?? "compact";
  const m = props.media;
  return (
    <section className={`sw-sec sw-sec--ctaband sw-sec--ctaband-${size}`}>
      {size === "feature" && m?.kind === "image" && m.url && <img className="sw-sec-ctaband-media" src={m.url} alt="" />}
      <div className="sw-sec-ctaband-inner">
        <h2 className="sw-sec-heading">{props.heading}</h2>
        {props.blurb && <p className="sw-sec-ctaband-blurb">{props.blurb}</p>}
        <div className="sw-sec-ctaband-actions">
          {props.actions.map((a, i) => (
            <Cta key={i} {...a} primary={i === 0} />
          ))}
        </div>
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
  const fullWidth = props.layout === "full-width";
  return (
    <section className={`sw-sec sw-sec--contact${fullWidth ? " sw-sec--contact-full" : ""}`}>
      <div className="sw-sec-contact-inner">
        {props.heading && <h2 className="sw-sec-heading">{props.heading}</h2>}
        <div className="sw-sec-contact-rows">{rows}</div>
      </div>
    </section>
  );
}

function ClubCard({ club }: { club: PropsOf<"clubs_directory">["clubs"][number] }): ReactNode {
  const inner = (
    <>
      {club.crest && <img className="sw-sec-club-crest" src={club.crest} alt="" />}
      <span className="sw-sec-club-name">{club.name}</span>
    </>
  );
  return club.href ? (
    <a className="sw-sec-club-card" href={club.href}>
      {inner}
    </a>
  ) : (
    <div className="sw-sec-club-card">{inner}</div>
  );
}

export function ClubsDirectorySection({ props }: C<"clubs_directory">) {
  const groupBy = props.groupBy ?? "none";
  const display = props.display ?? "grid";
  const groups: { label: string | null; clubs: typeof props.clubs }[] =
    groupBy === "none"
      ? [{ label: null, clubs: props.clubs }]
      : Object.entries(
          props.clubs.reduce<Record<string, typeof props.clubs>>((acc, c) => {
            const key = c.group?.trim() || "Other";
            (acc[key] ??= []).push(c);
            return acc;
          }, {}),
        ).map(([label, clubs]) => ({ label, clubs }));

  return (
    <section className="sw-sec sw-sec--clubs-directory">
      {props.heading && <h2 className="sw-sec-heading">{props.heading}</h2>}
      {groups.map((g) => (
        <div key={g.label ?? "all"} className="sw-sec-club-group">
          {g.label && <div className="sw-sec-club-group-h">{g.label}</div>}
          <div className={`sw-sec-club-${display}`}>
            {g.clubs.map((c, i) => (
              <ClubCard key={`${c.name}-${i}`} club={c} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function TeamLineupSection({ props }: C<"team_lineup">) {
  return (
    <section className="sw-sec sw-sec--lineup">
      {props.heading && <h2 className="sw-sec-heading">{props.heading}</h2>}
      {(props.teamName || props.opponent) && (
        <p className="sw-sec-lineup-vs">
          {props.teamName} {props.teamName && props.opponent && <span>v</span>} {props.opponent}
        </p>
      )}
      <ol className="sw-sec-lineup-list">
        {props.players.map((p, i) => (
          <li key={i} className="sw-sec-lineup-player">
            <span className="sw-sec-lineup-num">{i + 1}</span>
            <span className="sw-sec-lineup-name">{p.name}</span>
            {p.position && <span className="sw-sec-lineup-pos">{p.position}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PhotoStripSection({ props }: C<"photo_strip">) {
  return (
    <section className="sw-sec sw-sec--photostrip">
      <div className="sw-sec-photostrip-hdr">
        {props.heading && <h2 className="sw-sec-heading">{props.heading}</h2>}
        {props.credit && <span className="sw-sec-photostrip-credit">{props.credit}</span>}
      </div>
      <div className="sw-sec-photostrip-track">
        {props.photos.map((p, i) => (
          <img key={i} className="sw-sec-photostrip-img" src={p.url} alt={p.alt ?? ""} />
        ))}
      </div>
    </section>
  );
}
