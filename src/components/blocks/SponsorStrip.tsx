import { useClub } from "../ClubContext";
import { SmartLink } from "../SmartLink";
import { AccentBars } from "../layout/Chevron";
import type { Sponsor } from "../../content/types";

const TIERS: { id: Sponsor["tier"]; label: string }[] = [
  { id: "platinum", label: "Platinum partners" },
  { id: "gold", label: "Gold sponsors" },
  { id: "silver", label: "Silver supporters" },
];

interface Props {
  bare?: boolean;
}

function SponsorPlate({ s, size }: { s: Sponsor; size: string }) {
  const inner = s.logo ? <img src={s.logo} alt={s.name} /> : <span>{s.name}</span>;
  return s.href ? (
    <SmartLink href={s.href} className={`sw-sponsor ${size}`} ariaLabel={s.name}>
      {inner}
    </SmartLink>
  ) : (
    <div className={`sw-sponsor ${size}`}>{inner}</div>
  );
}

export function SponsorStrip({ bare }: Props) {
  const { club } = useClub();
  const mode = club.sponsorDisplay ?? "tiered";

  let body: JSX.Element;

  if (mode === "flat") {
    // One equal logo wall — for clubs that don't rank sponsors.
    body = (
      <div className="sw-sponsor-wall">
        {club.sponsors.map((s) => (
          <SponsorPlate key={s.name} s={s} size="silver" />
        ))}
      </div>
    );
  } else if (mode === "featured") {
    // Top tier large, everyone else in an equal wall.
    const featured = club.sponsors.filter((s) => s.tier === "platinum");
    const rest = club.sponsors.filter((s) => s.tier !== "platinum");
    body = (
      <>
        {featured.length > 0 && (
          <div className="sw-sponsor-row platinum" style={{ marginBottom: rest.length ? "1.5rem" : 0 }}>
            {featured.map((s) => (
              <SponsorPlate key={s.name} s={s} size="platinum" />
            ))}
          </div>
        )}
        {rest.length > 0 && (
          <div className="sw-sponsor-wall">
            {rest.map((s) => (
              <SponsorPlate key={s.name} s={s} size="silver" />
            ))}
          </div>
        )}
      </>
    );
  } else {
    // Tiered (default).
    body = (
      <>
        {TIERS.map((tier) => {
          const list = club.sponsors.filter((s) => s.tier === tier.id);
          if (list.length === 0) return null;
          return (
            <div className="sw-sponsor-tier" key={tier.id}>
              <div className="sw-tier-label">{tier.label}</div>
              <div className={`sw-sponsor-row ${tier.id}`}>
                {list.map((s) => (
                  <SponsorPlate key={s.name} s={s} size={tier.id} />
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
  }

  if (bare) return body;

  return (
    <section className="sw-section">
      <div className="sw-container">
        <div className="sw-section-head">
          <div>
            <AccentBars />
            <span className="sw-eyebrow">Proudly supported by</span>
            <h2>Our sponsors</h2>
          </div>
          <SmartLink href="/sponsors" className="sw-link-arrow">
            Become a sponsor →
          </SmartLink>
        </div>
        {body}
      </div>
    </section>
  );
}
