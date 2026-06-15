import { useClub } from "../components/ClubContext";
import { PageHero } from "../components/layout/PageHero";
import { Committee } from "../components/blocks/Committee";

export function About() {
  const { club } = useClub();
  const { about, identity } = club;

  return (
    <>
      <PageHero
        eyebrow="The Club"
        title={about.heading}
        intro={`${identity.nickname.replace(/^the /i, "The ")} — ${identity.sports.join(" & ")} in ${identity.location}.`}
      />
      <section className="sw-section">
        <div className="sw-container sw-prose">
          {about.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p>
            <strong>Home ground:</strong> {identity.ground}
            <br />
            <strong>League:</strong> {identity.league}
            <br />
            <strong>Founded:</strong> {identity.foundedNote}
          </p>
        </div>
      </section>
      <Committee />
    </>
  );
}
