import { useClub } from "../components/ClubContext";
import { PageHero } from "../components/layout/PageHero";
import { SmartLink } from "../components/SmartLink";
import { Chevron } from "../components/layout/Chevron";

export function Register() {
  const { club } = useClub();
  const { join, quickLinks, identity } = club;

  const merch = quickLinks.find((l) => /merch|store/i.test(l.label));

  return (
    <>
      <PageHero
        eyebrow="Join the Dooks"
        title="Register & Get Involved"
        intro={join.blurb}
      />
      <section className="sw-section">
        <div className="sw-container">
          <div className="sw-tiles">
            {join.options.map((o) => (
              <SmartLink key={o.label} href={o.href} className="sw-tile">
                <span className="sw-tile-ages">Sign up</span>
                <h4>{o.label}</h4>
                <p>Register online and you'll be ready for the season ahead.</p>
              </SmartLink>
            ))}
          </div>

          <div
            style={{
              marginTop: "2.5rem",
              padding: "2rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              background: "var(--surface)",
              display: "flex",
              gap: "1.25rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Chevron />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ fontSize: "var(--fs-h3)" }}>Club merchandise</h3>
              <p style={{ color: "var(--text-soft)" }}>
                Kit yourself out in {identity.shortName} gear from our online store.
              </p>
            </div>
            {merch && (
              <SmartLink href={merch.href} className="sw-btn">
                Visit the store
              </SmartLink>
            )}
          </div>

          <p className="sw-social-embed-note" style={{ marginTop: "2rem" }}>
            Registration links currently point to the club's sign-up pages. Confirm the live
            PlayHQ / registration URLs for football and netball before launch.
          </p>
        </div>
      </section>
    </>
  );
}
