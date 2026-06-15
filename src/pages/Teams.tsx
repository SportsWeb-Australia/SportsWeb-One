import { PageHero } from "../components/layout/PageHero";
import { TeamsBlock } from "../components/blocks/TeamsBlock";
import { JoinCTA } from "../components/blocks/JoinCTA";

export function Teams() {
  return (
    <>
      <PageHero
        eyebrow="Football & Netball"
        title="Teams & Programs"
        intro="From Auskick and Net Set Go through to seniors — there's a place at the Dooks for every age and ability."
      />
      <section className="sw-section">
        <div className="sw-container">
          <TeamsBlock bare />
        </div>
      </section>
      <JoinCTA />
    </>
  );
}
