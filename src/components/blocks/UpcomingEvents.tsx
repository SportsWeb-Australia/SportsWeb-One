import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { AccentBars, Chevron } from "../layout/Chevron";
import { formatDate } from "../../lib/format";

interface Props {
  limit?: number;
  bare?: boolean;
}

export function UpcomingEvents({ limit, bare }: Props) {
  const { club } = useClub();
  const events = limit ? club.events.slice(0, limit) : club.events;

  const grid = (
    <div className="sw-grid">
      {events.map((ev) => (
        <article className="sw-card" key={ev.id}>
          <div className="sw-card-media">
            <Chevron />
            <span className="sw-card-tag">{formatDate(ev.date)}</span>
          </div>
          <div className="sw-card-body">
            <span className="sw-card-date">
              {ev.time ? `${ev.time} · ` : ""}
              {ev.location}
              {ev.placeholder && <span className="sw-flag" style={{ marginLeft: 8 }}>Placeholder</span>}
            </span>
            <h3>{ev.title}</h3>
            {ev.description && <p>{ev.description}</p>}
            {ev.ticketHref && (
              <SmartLink href={ev.ticketHref} className="sw-link-arrow">
                Get tickets →
              </SmartLink>
            )}
          </div>
        </article>
      ))}
    </div>
  );

  if (bare) return grid;

  return (
    <section className="sw-section">
      <div className="sw-container">
        <div className="sw-section-head">
          <div>
            <AccentBars />
            <span className="sw-eyebrow">What&apos;s on</span>
            <h2>Upcoming events</h2>
          </div>
          <SmartLink href="/events" className="sw-link-arrow">
            Full calendar →
          </SmartLink>
        </div>
        {grid}
      </div>
    </section>
  );
}
