import { PageHero } from "../components/layout/PageHero";
import { Documents as DocumentsBlock } from "../components/blocks/Documents";

export function Documents() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Documents & Policies"
        intro="Club policies, welfare information and the forms you need, all in one place."
      />
      <section className="sw-section">
        <div className="sw-container">
          <DocumentsBlock bare />
        </div>
      </section>
    </>
  );
}
