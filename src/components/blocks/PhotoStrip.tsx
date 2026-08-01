import { useClub } from "../ClubContext";
import { AccentBars } from "../layout/Chevron";

/** Simple 3-up photo strip ("Life at the club"-style). Renders nothing if the
 *  club hasn't set photoStrip (optional block). */
export function PhotoStrip() {
  const { club } = useClub();
  const { photoStrip } = club;
  if (!photoStrip || photoStrip.images.length === 0) return null;

  return (
    <section className="sw-section sw-section--alt sw-photostrip">
      <div className="sw-container">
        <div className="sw-section-head sw-photostrip-head">
          <div>
            <AccentBars />
            <span className="sw-eyebrow">{photoStrip.eyebrow}</span>
            <h2>{photoStrip.title}</h2>
          </div>
        </div>
        <div className="sw-photostrip-grid">
          {photoStrip.images.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
