import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { AccentBars } from "../layout/Chevron";
import { EditableText } from "../edit/Editable";

/** "Why this sport / why us" icon-card section. Renders nothing if the club
 *  hasn't set whyUs (optional block — ported from gameday, generically useful). */
export function WhyUs() {
  const { club } = useClub();
  const { whyUs } = club;
  if (!whyUs || whyUs.items.length === 0) return null;

  return (
    <section className="sw-section sw-section--invert sw-whyus">
      <div className="sw-container">
        <div className="sw-section-head sw-whyus-head">
          <div>
            <AccentBars />
            <EditableText as="span" className="sw-eyebrow" k="home.whyus.eyebrow" value={whyUs.eyebrow} />
            <EditableText as="h2" k="home.whyus.title" value={whyUs.title} />
            {whyUs.body && <EditableText as="p" className="sw-whyus-lead" k="home.whyus.body" value={whyUs.body} />}
          </div>
        </div>
        <div className="sw-whyus-grid">
          {whyUs.items.map((item, i) => (
            <div className="sw-whyus-card" key={i}>
              <span className="sw-whyus-icon" aria-hidden="true">{item.icon}</span>
              <EditableText as="h4" k={`home.whyus.items.${i}.title`} value={item.title} />
              <EditableText as="p" k={`home.whyus.items.${i}.body`} value={item.body} />
            </div>
          ))}
        </div>
        {whyUs.cta && (
          <div className="sw-whyus-cta">
            <SmartLink href={whyUs.cta.href} className="sw-btn">
              {whyUs.cta.label}
            </SmartLink>
          </div>
        )}
      </div>
    </section>
  );
}
