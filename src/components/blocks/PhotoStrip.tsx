import { useClub } from "../ClubContext";
import { AccentBars } from "../layout/Chevron";
import { EditableText } from "../edit/Editable";

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
            <EditableText as="span" className="sw-eyebrow" k="home.photostrip.eyebrow" value={photoStrip.eyebrow} />
            <EditableText as="h2" k="home.photostrip.title" value={photoStrip.title} />
          </div>
        </div>
        <div className="sw-photostrip-grid">
          {photoStrip.images.map((src, i) => (
            <img key={src} src={src} alt={`${photoStrip.title} — photo ${i + 1}`} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
