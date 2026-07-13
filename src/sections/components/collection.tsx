// F2 P2 -- PR 2: Collection-class section components.
// Records live in typed tables and arrive via SectionContext; props are display config
// only. RULE 9 (sec 5): when a collection has no rows, render the section's DEFINED empty
// state -- never sample rows, never another club's data. Placeholder rows (the demo
// scaffold that carries `placeholder: true`) are treated as no data and filtered out.
import type { ReactNode } from "react";
import type { SectionContext } from "../entitlement";
import type { PropsOf, SectionType } from "../schemas";

type C<T extends SectionType> = { props: PropsOf<T>; ctx: SectionContext };

function Empty({ children }: { children: ReactNode }) {
  return <p className="sw-sec-empty">{children}</p>;
}
function Frame({ heading, cls, children }: { heading?: string; cls: string; children: ReactNode }) {
  return (
    <section className={`sw-sec ${cls}`}>
      {heading && <h2 className="sw-sec-heading">{heading}</h2>}
      {children}
    </section>
  );
}

export function NewsSection({ props, ctx }: C<"news">) {
  const items = ctx.news.filter((n) => !n.placeholder).slice(0, props.count);
  return (
    <Frame heading={props.heading} cls={`sw-sec--news sw-sec--news-${props.layout}`}>
      {items.length === 0 ? (
        <Empty>Club news will appear here once the first post is published.</Empty>
      ) : (
        <ul className="sw-sec-news-list">
          {items.map((n) => (
            <li key={n.id} className="sw-sec-news-item">
              {n.image && <img className="sw-sec-news-img" src={n.image} alt="" />}
              <span className="sw-sec-news-cat">{n.category}</span>
              <a className="sw-sec-news-title" href={n.href ?? `/news/${n.slug ?? n.id}`}>
                {n.title}
              </a>
              <time className="sw-sec-news-date">{n.date}</time>
              {n.excerpt && <p className="sw-sec-news-excerpt">{n.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </Frame>
  );
}

export function EventsSection({ props, ctx }: C<"events">) {
  const today = new Date().toISOString().slice(0, 10);
  let items = ctx.events.filter((e) => !e.placeholder);
  if (props.window !== "all") items = items.filter((e) => (e.date ?? "") >= today);
  items = items.slice(0, props.count);
  return (
    <Frame heading={props.heading} cls="sw-sec--events">
      {items.length === 0 ? (
        <Empty>Upcoming events will be listed here as they are scheduled.</Empty>
      ) : (
        <ul className="sw-sec-events-list">
          {items.map((e) => (
            <li key={e.id} className="sw-sec-events-item">
              <time className="sw-sec-events-date">{e.date}</time>
              <span className="sw-sec-events-title">{e.title}</span>
              {e.location && <span className="sw-sec-events-loc">{e.location}</span>}
              {e.ticketHref && (
                <a className="sw-sec-events-cta" href={e.ticketHref}>
                  Details
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Frame>
  );
}

export function SponsorsSection({ props, ctx }: C<"sponsors">) {
  let items = ctx.sponsors.filter((s) => !s.placeholder);
  if (props.tiers?.length) items = items.filter((s) => props.tiers!.includes(s.tier));
  return (
    <Frame heading={props.heading} cls={`sw-sec--sponsors sw-sec--sponsors-${props.display}`}>
      {items.length === 0 ? (
        <Empty>Our sponsors will be showcased here.</Empty>
      ) : (
        <ul className="sw-sec-sponsors-list">
          {items.map((s, i) => (
            <li key={i} className={`sw-sec-sponsor sw-sec-sponsor--${s.tier}`}>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noreferrer" className="sw-sec-sponsor-link">
                  {s.logo ? <img src={s.logo} alt={s.name} /> : <span>{s.name}</span>}
                </a>
              ) : s.logo ? (
                <img src={s.logo} alt={s.name} />
              ) : (
                <span>{s.name}</span>
              )}
              {props.showBlurb && s.blurb && <p className="sw-sec-sponsor-blurb">{s.blurb}</p>}
            </li>
          ))}
        </ul>
      )}
    </Frame>
  );
}

export function CommitteeSection({ props, ctx }: C<"committee">) {
  // PII gate (doc sec 9b): only opt-in people ever render. Belt-and-braces with loadClub's
  // is_public filter -- the section refuses to show a non-public person even if one reaches it.
  let items = ctx.committee.filter((p) => !p.placeholder && p.isPublic === true);
  if (props.roles?.length) items = items.filter((p) => props.roles!.includes(p.role));
  return (
    <Frame heading={props.heading} cls="sw-sec--committee">
      {items.length === 0 ? (
        <Empty>Committee members will be listed here.</Empty>
      ) : (
        <ul className="sw-sec-committee-list">
          {items.map((p, i) => (
            <li key={i} className="sw-sec-committee-item">
              <span className="sw-sec-committee-name">{p.name}</span>
              <span className="sw-sec-committee-role">{p.role}</span>
              {p.email && (
                <a className="sw-sec-committee-email" href={`mailto:${p.email}`}>
                  {p.email}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Frame>
  );
}

export function TeamsSection({ props, ctx }: C<"teams">) {
  // Reads the real teams table (via ctx) -- NOT a hardcoded grade array (sec 4/9).
  const groups = ctx.teams.filter((g) => g.teams.some((t) => t.name));
  const flat = props.groupBy === "none";
  return (
    <Frame heading={props.heading} cls="sw-sec--teams">
      {groups.length === 0 ? (
        <Empty>Teams and grades will appear here once they are added.</Empty>
      ) : flat ? (
        <ul className="sw-sec-teams-flat">
          {groups.flatMap((g) => g.teams).map((t, i) => (
            <li key={i} className="sw-sec-team">
              {props.linkTo === "page" && t.href ? <a href={t.href}>{t.name}</a> : <span>{t.name}</span>}
              {t.ages && <span className="sw-sec-team-ages">{t.ages}</span>}
            </li>
          ))}
        </ul>
      ) : (
        groups.map((g, gi) => (
          <div key={gi} className="sw-sec-teams-group">
            <h3 className="sw-sec-teams-sport">{g.sport}</h3>
            <ul className="sw-sec-teams-flat">
              {g.teams.map((t, i) => (
                <li key={i} className="sw-sec-team">
                  {props.linkTo === "page" && t.href ? <a href={t.href}>{t.name}</a> : <span>{t.name}</span>}
                  {t.ages && <span className="sw-sec-team-ages">{t.ages}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </Frame>
  );
}

export function DocumentsSection({ props, ctx }: C<"documents">) {
  let items = ctx.documents.filter((d) => !d.placeholder);
  if (props.kinds?.length) items = items.filter((d) => props.kinds!.includes(d.kind));
  return (
    <Frame heading={props.heading} cls="sw-sec--documents">
      {items.length === 0 ? (
        <Empty>Club documents and forms will be available here.</Empty>
      ) : (
        <ul className="sw-sec-docs-list">
          {items.map((d, i) => (
            <li key={i} className={`sw-sec-doc sw-sec-doc--${d.kind}`}>
              <a href={d.href} target="_blank" rel="noreferrer">
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Frame>
  );
}

export function SocialFeedSection({ props, ctx }: C<"social_feed">) {
  // Owned collection (sec 4): source is social_highlights. That table lands at P6, so this
  // is empty today and shows the empty state -- never scraped, never a placeholder embed.
  const items = ctx.socialHighlights.slice(0, props.count);
  return (
    <Frame heading={props.heading} cls="sw-sec--social">
      {items.length === 0 ? (
        <Empty>Match-day photos and highlights will appear here.</Empty>
      ) : (
        <ul className="sw-sec-social-list">
          {items.map((h, i) => (
            <li key={i} className="sw-sec-social-item">
              <a href={h.postUrl} target="_blank" rel="noreferrer">
                {h.imageUrl ? <img src={h.imageUrl} alt={h.caption ?? ""} /> : <span>{h.caption ?? h.postUrl}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Frame>
  );
}
