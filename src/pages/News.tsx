import { PageHero } from "../components/layout/PageHero";
import { FeaturedNews } from "../components/blocks/FeaturedNews";

export function News() {
  return (
    <>
      <PageHero eyebrow="Latest" title="Club News" intro="Match reports, announcements and what's happening around the club." />
      <section className="sw-section">
        <div className="sw-container">
          <FeaturedNews bare />
        </div>
      </section>
    </>
  );
}
