import { PageHero } from "../components/layout/PageHero";
import { UpcomingEvents } from "../components/blocks/UpcomingEvents";

export function Events() {
  return (
    <>
      <PageHero eyebrow="What's On" title="Events Calendar" intro="Social nights, fundraisers and the dates that matter across the season." />
      <section className="sw-section">
        <div className="sw-container">
          <UpcomingEvents bare />
        </div>
      </section>
    </>
  );
}
