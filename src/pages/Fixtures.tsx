import { PageHero } from "../components/layout/PageHero";
import { MatchCentre } from "../components/blocks/MatchCentre";

export function Fixtures() {
  return (
    <>
      <PageHero
        eyebrow="Match Centre"
        title="Fixtures & Results"
        intro="Upcoming games, recent results and where the Dooks sit on the ladder."
      />
      <section className="sw-section">
        <div className="sw-container">
          <MatchCentre bare />
        </div>
      </section>
    </>
  );
}
