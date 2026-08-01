import { useClub } from "../ClubContext";

/** Auto-scrolling logo carousel for the homepage (bigger plates than the
 *  tiered /sponsors grid). Renders nothing with no carousel-flagged sponsors. */
export function SponsorMarquee() {
  const { club } = useClub();
  const sponsors = club.sponsors.filter((s) => s.inCarousel !== false && s.logo);
  if (sponsors.length === 0) return null;

  const track = [...sponsors, ...sponsors];

  return (
    <section className="sw-section sw-section--alt sw-sponsor-marquee">
      <div className="sw-container">
        <span className="sw-eyebrow">Proudly supported by</span>
      </div>
      <div className="sw-sponsor-marquee-track" aria-hidden="true">
        <div className="sw-sponsor-marquee-row">
          {track.map((s, i) => (
            <img key={s.name + i} src={s.logo} alt={s.name} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
