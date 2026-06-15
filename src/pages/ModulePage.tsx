import { useParams } from "react-router-dom";
import { useClub } from "../components/ClubContext";
import { PageHero } from "../components/layout/PageHero";
import { SmartLink } from "../components/SmartLink";
import { MediaEmbed } from "../components/blocks/MediaEmbed";
import { NotFound } from "./NotFound";
import { getModule } from "../lib/modules";
import { useSeo } from "../lib/seo";

export function ModulePage() {
  const { key } = useParams();
  const { club } = useClub();
  const mod = getModule(key);

  useSeo(mod ? { title: `${mod.name} | ${club.identity.name}`, description: mod.tagline } : null);

  if (!mod) return <NotFound />;

  const enabled = (club.enabledModules ?? []).includes(mod.key);
  const salesEmail = club.platform?.salesEmail ?? club.contact.email;
  const trialDays = club.platform?.trialDays ?? 14;

  const mailto = (subject: string) =>
    `mailto:${salesEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Club: ${club.identity.name}\nModule: ${mod.name}\n\n`
    )}`;

  return (
    <>
      <PageHero eyebrow={mod.plan} title={mod.name} intro={mod.tagline} />

      <section className="sw-section">
        <div className="sw-container sw-module-page">
          {enabled ? (
            <div className="sw-module-banner on">
              <div>
                <strong>This module is active for {club.identity.shortName}.</strong>
                <p>Jump in below, or follow the quick start if you're new to it.</p>
              </div>
              {mod.appUrl ? (
                <a className="sw-btn" href={mod.appUrl} target="_blank" rel="noopener noreferrer">
                  Open {mod.name} ↗
                </a>
              ) : (
                <span className="sw-flag">Launching soon</span>
              )}
            </div>
          ) : (
            <div className="sw-module-banner off">
              <div>
                <strong>{mod.name} isn&apos;t on your plan yet.</strong>
                <p>Try it free for {trialDays} days, or add it to your plan — we&apos;ll get you set up.</p>
              </div>
              <div className="sw-module-cta">
                <a className="sw-btn" href={mailto(`Free trial — ${mod.name}`)}>
                  Start {trialDays}-day free trial
                </a>
                <a className="sw-btn sw-btn--ghost" href={mailto(`Upgrade — ${mod.name}`)}>
                  Upgrade plan
                </a>
              </div>
            </div>
          )}

          <p className="sw-lead" style={{ marginTop: "2rem" }}>{mod.summary}</p>

          <div className="sw-module-section">
            <h2>What you can do</h2>
            <ul className="sw-ticks">
              {mod.overview.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>

          <div className="sw-module-section">
            <h2>Quick start</h2>
            <ol className="sw-msteps">
              {mod.quickstart.map((s) => (
                <li key={s.title}>
                  <strong>{s.title}</strong>
                  <span>{s.body}</span>
                </li>
              ))}
            </ol>
          </div>

          {mod.videos && mod.videos.length > 0 && (
            <div className="sw-module-section">
              <h2>Walkthroughs</h2>
              {mod.videos.map((v) => (
                <div key={v.url}>
                  <h3 style={{ fontSize: "var(--fs-h3)", marginBottom: "0.5rem" }}>{v.title}</h3>
                  <MediaEmbed url={v.url} title={v.title} />
                </div>
              ))}
            </div>
          )}

          <SmartLink href="/modules" className="sw-link-arrow">
            ← All modules
          </SmartLink>
        </div>
      </section>
    </>
  );
}
