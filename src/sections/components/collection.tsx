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
/** RDCA card frame used by the remaining collection sections (committee/teams/documents/social).
 *  A `.card` with a `.sec-hdr` header; the primitives come from the PR-A base layer. */
function Frame({ heading, cls, children }: { heading?: string; cls: string; children: ReactNode }) {
  return (
    <section className={`sw-sec ${cls} card sw-card-pad`}>
      {heading && (
        <div className="sec-hdr">
          <div className="s-hed">{heading}</div>
        </div>
      )}
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

/** Split an ISO date into a day number + short month for the RDCA date badge. */
function dayMonth(iso?: string): { day: string; mon: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return { day: String(d.getDate()), mon: d.toLocaleString("en-AU", { month: "short" }).toUpperCase() };
}

/** Events, RDCA design (audit sec 10): a `.card` with an `.events-grid` of image cards, each with a
 *  red day/month badge + type tag over the photo, then title + location. Reads ctx.events; Rule 9
 *  empty state kept. Shared across designs. */
export function EventsSection({ props, ctx }: C<"events">) {
  const today = new Date().toISOString().slice(0, 10);
  let items = ctx.events.filter((e) => !e.placeholder);
  if (props.window !== "all") items = items.filter((e) => (e.date ?? "") >= today);
  items = items.slice(0, props.count);
  return (
    <section className="sw-sec sw-sec--events card sw-events">
      <div className="sec-hdr">
        <div className="s-hed">{props.heading ?? "Upcoming Events"}</div>
        <a className="view-all" href="/events">
          All Events <i className="ti ti-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
      {items.length === 0 ? (
        <Empty>Upcoming events will be listed here as they are scheduled.</Empty>
      ) : (
        <div className="events-grid">
          {items.map((e) => {
            const dm = dayMonth(e.date);
            return (
              <a key={e.id} className="ev-card" href={e.ticketHref ?? `/events/${e.slug ?? e.id}`}>
                <div className="ev-img" style={e.image ? { backgroundImage: `url('${e.image}')` } : undefined}>
                  <div className="ev-img-ov" />
                  <div className="ev-meta">
                    {dm && (
                      <div className="ev-date">
                        <span className="ev-day">{dm.day}</span>
                        <span className="ev-mon">{dm.mon}</span>
                      </div>
                    )}
                    {e.tag && <span className="ev-type">{e.tag}</span>}
                  </div>
                </div>
                <div className="ev-body">
                  <div className="ev-title">{e.title}</div>
                  {e.location && (
                    <div className="ev-loc">
                      <i className="ti ti-map-pin" aria-hidden="true"></i>
                      {e.location}
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

type SponsorRow = C<"sponsors">["ctx"]["sponsors"][number];

/** One RDCA sponsor tile (logo, or the name when no logo), linked when a href exists. */
function SponsorTile({ s, showBlurb }: { s: SponsorRow; showBlurb?: boolean }) {
  const inner = s.logo ? <img src={s.logo} alt={s.name} /> : <span className="sponsor-name">{s.name}</span>;
  return (
    <div className="sponsor-tile">
      {s.href ? (
        <a href={s.href} target="_blank" rel="noreferrer" className="sponsor-link">
          {inner}
        </a>
      ) : (
        inner
      )}
      {showBlurb && s.blurb && <p className="sponsor-blurb">{s.blurb}</p>}
    </div>
  );
}

const SPONSOR_TIERS = ["platinum", "gold", "silver"] as const;

/** Sponsors, RDCA design (audit sec 20): a `.card` with a logo wall. `display: "tiered"` groups by
 *  tier; "wall"/"strip" show one wall. Reads ctx.sponsors; Rule 9 empty state kept. */
export function SponsorsSection({ props, ctx }: C<"sponsors">) {
  let items = ctx.sponsors.filter((s) => !s.placeholder);
  if (props.tiers?.length) items = items.filter((s) => props.tiers!.includes(s.tier));
  return (
    <section className="sw-sec sw-sec--sponsors card sw-sponsors">
      {props.heading && (
        <div className="sec-hdr">
          <div className="s-hed">{props.heading}</div>
        </div>
      )}
      {items.length === 0 ? (
        <Empty>Our sponsors will be showcased here.</Empty>
      ) : props.display === "tiered" ? (
        SPONSOR_TIERS.map((tier) => {
          const tierItems = items.filter((s) => s.tier === tier);
          if (tierItems.length === 0) return null;
          return (
            <div key={tier} className="sponsor-tier">
              <div className="sponsor-tier-label">{tier}</div>
              <div className={`sponsor-wall sponsor-wall--${tier}`}>
                {tierItems.map((s, i) => (
                  <SponsorTile key={i} s={s} showBlurb={props.showBlurb} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className={`sponsor-wall sponsor-wall--${props.display}`}>
          {items.map((s, i) => (
            <SponsorTile key={i} s={s} showBlurb={props.showBlurb} />
          ))}
        </div>
      )}
    </section>
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
        <div className="cm-grid">
          {items.map((p, i) => (
            <div key={i} className="cm-card">
              <div className="cm-name">{p.name}</div>
              <div className="cm-role">{p.role}</div>
              {p.email && (
                <a className="cm-email" href={`mailto:${p.email}`}>
                  <i className="ti ti-mail" aria-hidden="true"></i> {p.email}
                </a>
              )}
            </div>
          ))}
        </div>
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
        <ul className="tm-flat">
          {groups.flatMap((g) => g.teams).map((t, i) => (
            <li key={i} className="tm-item">
              {props.linkTo === "page" && t.href ? <a href={t.href}>{t.name}</a> : <span>{t.name}</span>}
              {t.ages && <span className="tm-ages">{t.ages}</span>}
            </li>
          ))}
        </ul>
      ) : (
        groups.map((g, gi) => (
          <div key={gi} className="tm-group">
            <h3 className="tm-sport">{g.sport}</h3>
            <ul className="tm-flat">
              {g.teams.map((t, i) => (
                <li key={i} className="tm-item">
                  {props.linkTo === "page" && t.href ? <a href={t.href}>{t.name}</a> : <span>{t.name}</span>}
                  {t.ages && <span className="tm-ages">{t.ages}</span>}
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
        <ul className="doc-list">
          {items.map((d, i) => (
            <li key={i} className={`doc-row doc-row--${d.kind}`}>
              <a href={d.href} target="_blank" rel="noreferrer">
                <i className="ti ti-file-text doc-ic" aria-hidden="true"></i>
                <span className="doc-label">{d.label}</span>
                <i className="ti ti-download doc-dl" aria-hidden="true"></i>
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
        <div className="social-grid">
          {items.map((h, i) => (
            <a key={i} className="social-item" href={h.postUrl} target="_blank" rel="noreferrer">
              {h.imageUrl ? <img src={h.imageUrl} alt={h.caption ?? ""} /> : <span className="social-cap">{h.caption ?? h.postUrl}</span>}
            </a>
          ))}
        </div>
      )}
    </Frame>
  );
}
