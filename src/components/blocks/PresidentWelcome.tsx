import { useClub } from "../ClubContext";
import { AccentBars } from "../layout/Chevron";

export function PresidentWelcome() {
  const { club } = useClub();
  const { president, identity } = club;

  return (
    <section className="sw-section sw-section--alt">
      <div className="sw-container">
        <AccentBars />
        <span className="sw-eyebrow">Welcome to {identity.shortName}</span>
        <div className="sw-welcome-grid" style={{ marginTop: "1.5rem" }}>
          <aside className="sw-welcome-aside">
            <div className="sw-welcome-portrait">
              {president.portrait ? (
                <img src={president.portrait} alt={president.name} />
              ) : (
                identity.initials
              )}
            </div>
            <div className="sw-welcome-name">{president.name}</div>
            <div className="sw-welcome-role">{president.role}</div>
          </aside>
          <div className="sw-welcome-body">
            {president.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {president.signoff && <p className="sw-signoff">{president.signoff}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
