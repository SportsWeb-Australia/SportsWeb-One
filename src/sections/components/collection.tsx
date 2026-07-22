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

// RDCA news badge palette -- cycles red / navy / green across cards so a wall of posts reads with
// the source's visual variety. Category is free text (never a fixed enum), so the colour is chosen
// by position, not by inventing category semantics.
const NEWS_BADGES = ["badge-red", "badge-navy", "badge-green"] as const;

/** News, RDCA design (audit sec 4): a `.card` with a header, an optional feature hero (the first
 *  post, big), and a grid of the rest. `layout: "feature"` shows the hero; "grid"/"list" skip it.
 *  Emits the ported RDCA class hooks (styled by the scoped rdca.css); shares ctx.news with every
 *  design. Rule 9: no real posts -> the defined empty state, never placeholder rows. */
export function NewsSection({ props, ctx }: C<"news">) {
  const items = ctx.news.filter((n) => !n.placeholder).slice(0, props.count);
  const hrefOf = (n: (typeof items)[number]) => n.href ?? `/news/${n.slug ?? n.id}`;
  const meta = (n: (typeof items)[number]) => [n.category, n.date].filter(Boolean).join(" · ");

  const useHero = props.layout === "feature" && items.length > 0;
  const hero = useHero ? items[0] : undefined;
  const grid = useHero ? items.slice(1) : items;

  return (
    <section className="sw-sec sw-sec--news card sw-news">
      <div className="sec-hdr">
        <div className="s-hed">{props.heading ?? "News & Articles"}</div>
        <a className="view-all" href="/news">
          All News <i className="ti ti-arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      {items.length === 0 ? (
        <Empty>Club news will appear here once the first post is published.</Empty>
      ) : (
        <>
          {hero && (
            <a className="news-hero" href={hrefOf(hero)}>
              <div className="nh-img" style={hero.image ? { backgroundImage: `url('${hero.image}')` } : undefined} />
              <div className="nh-overlay" />
              <div className="nh-body">
                {hero.category && <span className="badge badge-red nh-badge">{hero.category}</span>}
                <div className="nh-title">{hero.title}</div>
                {meta(hero) && <div className="nh-meta">{meta(hero)}</div>}
              </div>
            </a>
          )}
          {grid.length > 0 && (
            <div className="news-grid">
              {grid.map((n, i) => (
                <a key={n.id} className="nc" href={hrefOf(n)}>
                  <div className="nct" style={n.image ? { backgroundImage: `url('${n.image}')` } : undefined} />
                  <div className="ncb">
                    {n.category && (
                      <span className={`badge ${NEWS_BADGES[i % NEWS_BADGES.length]} nc-badge`}>{n.category}</span>
                    )}
                    <div className="nc-title">{n.title}</div>
                    {n.date && <div className="nc-date">{n.date}</div>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </section>
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
