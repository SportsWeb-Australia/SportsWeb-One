import { useClub } from "../components/ClubContext";
import { PageHero } from "../components/layout/PageHero";
import { SmartLink } from "../components/SmartLink";
import { MODULE_CATALOG } from "../lib/modules";
import { useSeo } from "../lib/seo";

export function Modules() {
  const { club } = useClub();
  const enabled = new Set(club.enabledModules ?? []);

  useSeo({
    title: `Club tools | ${club.identity.name}`,
    description: "Add-on modules for running the club — volunteers, learning, books, bookings and forms.",
  });

  return (
    <>
      <PageHero
        eyebrow="Club tools"
        title="Modules"
        intro="Powerful add-ons for running the club. Open the ones you have, or take the others for a free trial."
      />
      <section className="sw-section">
        <div className="sw-container">
          <div className="sw-module-grid">
            {MODULE_CATALOG.map((m) => {
              const on = enabled.has(m.key);
              return (
                <SmartLink key={m.key} href={`/modules/${m.key}`} className="sw-module-card">
                  <div className="sw-module-top">
                    <span className="sw-module-badge">{m.badge}</span>
                    <span className={`sw-module-state ${on ? "on" : "off"}`}>{on ? "Active" : "Locked"}</span>
                  </div>
                  <h3>{m.name}</h3>
                  <p>{m.tagline}</p>
                  <span className="sw-module-plan">{m.plan}</span>
                </SmartLink>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
