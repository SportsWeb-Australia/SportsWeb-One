import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { AccentBars } from "../layout/Chevron";

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
            <span className="sw-eyebrow">{whyUs.eyebrow}</span>
            <h2>{whyUs.title}</h2>
            {whyUs.body && <p className="sw-whyus-lead">{whyUs.body}</p>}
          </div>
        </div>
        <div className="sw-whyus-grid">
          {whyUs.items.map((item) => (
            <div className="sw-whyus-card" key={item.title}>
              <span className="sw-whyus-icon" aria-hidden="true">{item.icon}</span>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
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
