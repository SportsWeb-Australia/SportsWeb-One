import { PageHero } from "../components/layout/PageHero";
import { UpcomingEvents } from "../components/blocks/UpcomingEvents";
import { EditableText } from "../components/edit/Editable";

export function Events() {
  return (
    <>
      <PageHero pageKey="events"
        eyebrow="What's On"
        title="Events Calendar"
        intro="Social nights, fundraisers and the dates that matter across the season."
      />

      <section className="sw-section">
        <div className="sw-container">
          <div className="sw-prose" style={{ marginBottom: "2rem" }}>
            <EditableText
              as="p"
              k="page.events.intro2"
              value="Club events are a big part of club life — they bring players, families and supporters together and help fund everything we do. Everyone's welcome, so come down and get involved."
            />
          </div>
          <UpcomingEvents bare />
        </div>
      </section>
    </>
  );
}
