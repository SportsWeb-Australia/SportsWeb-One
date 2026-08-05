import { useClub } from "../ClubContext";
import { useEdit } from "../../lib/edit";
import { SmartLink } from "../SmartLink";
import { AccentBars } from "../layout/Chevron";
import { EditableText, EditableBgButton } from "../edit/Editable";
import type { ClubConfig, DesignVariant } from "../../content/types";

const MEDIA_VARIANTS: DesignVariant[] = ["stadium", "editorial", "momentum", "coastal"];
const WATERMARK_VARIANTS: DesignVariant[] = ["gameday"];

const DEFAULT_HERO_IMG: Partial<Record<DesignVariant, string>> = {
  stadium: "/hero-dark.jpg",
  momentum: "/hero-dark.jpg",
  editorial: "/hero-light.jpg",
  coastal: "/hero-light.jpg",
};

export function Hero() {
  const { club, variant } = useClub();
  if (MEDIA_VARIANTS.includes(variant)) return <HeroMedia club={club} variant={variant} />;
  if (WATERMARK_VARIANTS.includes(variant)) return <HeroWatermark club={club} />;
  return <HeroStandard club={club} />;
}

/** Colour-forward hero with a large translucent crest/logo watermark, no
 *  photo — for gameday-style variants (solid hero-bg pinned to club ink). */
function HeroWatermark({ club }: { club: ClubConfig }) {
  const { hero, identity } = club;
  const watermark = hero.watermark ?? identity.logo;
  return (
    <section className="sw-hero sw-hero--watermark">
      {watermark && (
        <img className="sw-hero-watermark" src={watermark} alt="" aria-hidden="true" />
      )}
      <div className="sw-container">
        <div className="sw-hero-inner">
          <HeroCopy hero={hero} showLede />
          <HeroCtas club={club} />
        </div>
      </div>
    </section>
  );
}

/** Original motif-led hero (heritage / broadcast / arena / classic). */
function HeroStandard({ club }: { club: ClubConfig }) {
  const { hero } = club;
  const { value } = useEdit();
  const bg = value("hero.backgroundImage", hero.backgroundImage ?? "");
  return (
    <section className="sw-hero">
      {bg && <img className="sw-hero-bgimg" src={bg} alt="" aria-hidden="true" />}
      <div className="sw-hero-motif" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <EditableBgButton k="hero.backgroundImage" label="Change background photo" />
      <div className="sw-container">
        <div className="sw-hero-inner">
          <AccentBars />
          <HeroCopy hero={hero} />
          <HeroCtas club={club} />
        </div>
      </div>
    </section>
  );
}

/** Image/video-led hero (stadium / editorial / momentum / coastal). */
function HeroMedia({ club, variant }: { club: ClubConfig; variant: DesignVariant }) {
  const { hero, identity } = club;
  const { value } = useEdit();
  const img = value("hero.backgroundImage", hero.backgroundImage ?? DEFAULT_HERO_IMG[variant] ?? "/hero-dark.jpg");

  return (
    <section className="sw-hero sw-hero--media">
      <div className="sw-hero-media" aria-hidden="true">
        {hero.video ? (
          <video className="sw-hero-video" autoPlay muted loop playsInline poster={hero.poster ?? img}>
            <source src={hero.video} />
          </video>
        ) : (
          <img src={img} alt="" />
        )}
        <div className="sw-hero-scrim" />
      </div>
      {!hero.video && <EditableBgButton k="hero.backgroundImage" label="Change background photo" />}

      <div className="sw-container">
        <div className="sw-hero-inner">
          <AccentBars />
          <HeroCopy hero={hero} />
          <HeroCtas club={club} />
        </div>
      </div>

      {variant === "stadium" && (
        <div className="sw-hero-stats">
          <div className="sw-container">
            <div>
              <span>Competition</span>
              <strong>{identity.league}</strong>
            </div>
            <div>
              <span>Home ground</span>
              <strong>{identity.ground}</strong>
            </div>
            <div>
              <span>Based in</span>
              <strong>{identity.location}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HeroCopy({ hero, showLede }: { hero: ClubConfig["hero"]; showLede?: boolean }) {
  return (
    <>
      <EditableText as="span" className="sw-eyebrow" k="hero.eyebrow" value={hero.eyebrow} />
      <h1>
        <EditableText as="span" k="hero.title" value={hero.title} />
        {(hero.titleAccent || "") !== "" && (
          <>
            {" "}
            <EditableText as="span" className="sw-hero-title-accent" k="hero.titleAccent" value={hero.titleAccent ?? ""} />
          </>
        )}
      </h1>
      <EditableText as="p" className="sw-hero-sub" k="hero.subtitle" value={hero.subtitle} />
      {showLede && (hero.lede || "") !== "" && (
        <EditableText as="p" className="sw-hero-lede" k="hero.lede" value={hero.lede ?? ""} />
      )}
    </>
  );
}

function HeroCtas({ club }: { club: ClubConfig }) {
  const { hero } = club;
  return (
    <div className="sw-hero-ctas">
      <SmartLink href={hero.primaryCta.href} className="sw-btn">
        <EditableText as="span" k="hero.primaryCta.label" value={hero.primaryCta.label} />
      </SmartLink>
      {hero.secondaryCta && (
        <SmartLink href={hero.secondaryCta.href} className="sw-btn sw-btn--ghost">
          <EditableText as="span" k="hero.secondaryCta.label" value={hero.secondaryCta.label} />
        </SmartLink>
      )}
    </div>
  );
}
