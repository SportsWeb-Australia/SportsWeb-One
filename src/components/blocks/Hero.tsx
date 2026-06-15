import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { AccentBars } from "../layout/Chevron";

export function Hero() {
  const { club } = useClub();
  const { hero } = club;

  return (
    <section className="sw-hero">
      {hero.backgroundImage && (
        <img className="sw-hero-bgimg" src={hero.backgroundImage} alt="" aria-hidden="true" />
      )}
      <div className="sw-hero-motif" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="sw-container">
        <div className="sw-hero-inner">
          <AccentBars />
          <span className="sw-eyebrow">{hero.eyebrow}</span>
          <h1>{hero.title}</h1>
          <p className="sw-hero-sub">{hero.subtitle}</p>
          <div className="sw-hero-ctas">
            <SmartLink href={hero.primaryCta.href} className="sw-btn">
              {hero.primaryCta.label}
            </SmartLink>
            {hero.secondaryCta && (
              <SmartLink href={hero.secondaryCta.href} className="sw-btn sw-btn--ghost">
                {hero.secondaryCta.label}
              </SmartLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
