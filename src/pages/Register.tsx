import { useClub } from "../components/ClubContext";
import { PageHero } from "../components/layout/PageHero";
import { SmartLink } from "../components/SmartLink";
import { Chevron } from "../components/layout/Chevron";
import { EditableText } from "../components/edit/Editable";

export function Register() {
  const { club } = useClub();
  const { join, quickLinks, identity, register } = club;

  const merch = quickLinks.find((l) => /merch|store/i.test(l.label));

  return (
    <>
      <PageHero pageKey="register" eyebrow="Join the Club" title="Register & Get Involved" intro={join.blurb} />

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
        </div>
      </section>

      {register?.steps && (
        <section className="sw-section sw-section--alt">
          <div className="sw-container">
            <EditableText as="span" className="sw-eyebrow" k="page.register.howEyebrow" value="How it works" />
            <EditableText as="h2" style={{ fontSize: "var(--fs-h2)", margin: "0.6rem 0 0.5rem" }} k="page.register.howHeading" value="Registering in four steps" />
            <div className="sw-steps">
              {register.steps.map((s, i) => (
                <div className="sw-step" key={i}>
                  <EditableText as="p" k={`page.register.steps.${i}`} value={s} />
                </div>
              ))}
            </div>
            {register.feesNote && (
              <EditableText
                as="p"
                className="sw-social-embed-note"
                style={{ marginTop: "1.5rem" }}
                k="page.register.feesNote"
                value={register.feesNote}
              />
            )}
          </div>
        </section>
      )}

      <section className="sw-section">
        <div className="sw-container">
          <div
            style={{
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
              <EditableText as="h3" style={{ fontSize: "var(--fs-h3)" }} k="page.register.merchHeading" value="Club merchandise" />
              <EditableText as="p" style={{ color: "var(--text-soft)" }} k="page.register.merchBlurb" value={`Kit yourself out in ${identity.shortName} gear from our online store.`} />
            </div>
            {merch && (
              <SmartLink href={merch.href} className="sw-btn">
                Visit the store
              </SmartLink>
            )}
          </div>

          {register?.faqs && (
            <div style={{ marginTop: "2.5rem" }}>
              <EditableText as="span" className="sw-eyebrow" k="page.register.faqEyebrow" value="Good to know" />
              <EditableText as="h2" style={{ fontSize: "var(--fs-h2)", margin: "0.6rem 0 0.5rem" }} k="page.register.faqHeading" value="Questions" />
              <div className="sw-faq">
                {register.faqs.map((f, i) => (
                  <details key={i}>
                    <summary><EditableText as="span" k={`page.register.faqs.${i}.q`} value={f.q} /></summary>
                    <EditableText as="p" k={`page.register.faqs.${i}.a`} value={f.a} />
                  </details>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
