// F2 P2 -- PR 2: Module-class section components.
// Data is owned by a module and entitlement-gated. Every module section has the TWO states
// the doc mandates from day one (sec 4):
//   - NOT ENTITLED           -> render NOTHING (null). Not an empty box, not "coming soon".
//   - ENTITLED, NO DATA      -> a defined, honest empty state.
// Entitlement is resolved by ctx.isEntitled(type); see ../entitlement for the "match_centre"
// capability decision. Props are config only. No colours (sec 5, rule 7).
import { useState } from "react";
import type { ReactNode } from "react";
import type { Fixture, LadderRow, Result } from "../../content/types";
import type { SectionContext } from "../entitlement";
import type { PropsOf } from "../schemas";

function Empty({ children }: { children: ReactNode }) {
  return <p className="sw-sec-empty">{children}</p>;
}

/** RDCA's real "Competition Hub": Ladder/Fixtures/Results as tabs, one visible at a time --
 *  not three stacked blocks. Only used for mode:'combined' with 2+ data types actually
 *  present; a single-mode section (mode:'fixtures' etc) stays a plain block below, since
 *  tabs over one thing aren't tabs. */
function CompetitionHubTabs({
  fixtures, results, ladder, n,
}: { fixtures: Fixture[]; results: Result[]; ladder: LadderRow[]; n: number }) {
  const tabs = [
    ladder.length > 0 && ("ladder" as const),
    fixtures.length > 0 && ("fixtures" as const),
    results.length > 0 && ("results" as const),
  ].filter(Boolean) as Array<"ladder" | "fixtures" | "results">;
  const [active, setActive] = useState(tabs[0]);
  return (
    <div className="sw-sec-md-hub">
      <div className="sw-sec-md-tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={active === t} className="sw-sec-md-tab" onClick={() => setActive(t)}>
            {t === "ladder" ? "Ladder" : t === "fixtures" ? "Fixtures" : "Results"}
          </button>
        ))}
      </div>
      {active === "ladder" && <LadderTable ladder={ladder} />}
      {active === "fixtures" && <FixturesList fixtures={fixtures} n={n} />}
      {active === "results" && <ResultsList results={results} n={n} />}
    </div>
  );
}

function LadderTable({ ladder }: { ladder: LadderRow[] }) {
  return (
    <table className="sw-sec-md-ladder">
      <thead>
        <tr>
          <th>#</th><th className="sw-sec-md-ladder-tl">Team</th><th>P</th><th>W</th><th>L</th><th>D</th><th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {ladder.map((row, i) => (
          <tr key={i} className={row.isClub ? "sw-sec-md-ladder-club" : undefined}>
            <td>{i + 1}</td>
            <td className="sw-sec-md-ladder-tl">{row.logo && <img className="sw-sec-md-ladder-logo" src={row.logo} alt="" />}{row.team}</td>
            <td>{row.played}</td><td>{row.won}</td><td>{row.lost}</td><td>{row.drawn}</td>
            <td className="sw-sec-md-ladder-pts">{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FixturesList({ fixtures, n }: { fixtures: Fixture[]; n: number }) {
  return (
    <ul className="sw-sec-md-list">
      {fixtures.slice(0, n).map((f, i) => (
        <li key={i} className="sw-sec-md-row">
          <span className="sw-sec-md-round">{f.round}</span>
          <span className="sw-sec-md-opp">{f.opponent}</span>
          <span className="sw-sec-md-venue">{f.venue}</span>
          <span className="sw-sec-md-date">{f.date}</span>
        </li>
      ))}
    </ul>
  );
}

function ResultsList({ results, n }: { results: Result[]; n: number }) {
  return (
    <ul className="sw-sec-md-list">
      {results.slice(0, n).map((r, i) => (
        <li key={i} className={`sw-sec-md-row sw-sec-md-row--${r.outcome}`}>
          <span className="sw-sec-md-round">{r.round}</span>
          <span className="sw-sec-md-opp">{r.opponent}</span>
          <span className="sw-sec-md-score">
            {r.scoreFor}&ndash;{r.scoreAgainst}
          </span>
          <span className="sw-sec-md-outcome">{r.outcome}</span>
        </li>
      ))}
    </ul>
  );
}

export function MatchDataSection({ props, ctx }: { props: PropsOf<"match_data">; ctx: SectionContext }) {
  if (!ctx.isEntitled("match_data")) return null; // not entitled -> nothing
  const mc = ctx.matchCentre;
  const byGrade = <T extends { grade: string }>(rows: T[] | undefined): T[] =>
    (rows ?? []).filter((r) => !props.grade || r.grade === props.grade);

  const fixtures = byGrade<Fixture>(mc?.fixtures);
  const results = byGrade<Result>(mc?.results);
  const ladder = (mc?.ladder ?? []) as LadderRow[];
  const wants = (m: string) => props.mode === "combined" || props.mode === m;

  const showFixtures = wants("fixtures") && fixtures.length > 0;
  const showResults = wants("results") && results.length > 0;
  const showLadder = wants("ladder") && ladder.length > 0;
  const n = props.count ?? 5;

  if (!showFixtures && !showResults && !showLadder) {
    return (
      <section className="sw-sec sw-sec--matchdata">
        <Empty>
          {props.mode === "top_performers"
            ? "Top performers will appear here once the season is underway." // no leaderboard data source exists yet (Rule 9): honest, not fabricated
            : "Fixtures, results and the ladder will appear here once the season draw is published."}
        </Empty>
      </section>
    );
  }

  // combined mode with 2+ data types -> real tabbed Competition Hub. Otherwise (a single
  // explicit mode, or combined with only one type actually present) -> the plain stacked
  // blocks below, since tabs over one thing aren't tabs.
  const dataTypeCount = [showFixtures, showResults, showLadder].filter(Boolean).length;
  if (props.mode === "combined" && dataTypeCount > 1) {
    return (
      <section className="sw-sec sw-sec--matchdata">
        <CompetitionHubTabs fixtures={fixtures} results={results} ladder={ladder} n={n} />
      </section>
    );
  }

  return (
    <section className="sw-sec sw-sec--matchdata">
      {showFixtures && (
        <div className="sw-sec-md-block">
          <h3 className="sw-sec-md-h">Fixtures</h3>
          <FixturesList fixtures={fixtures} n={n} />
        </div>
      )}
      {showResults && (
        <div className="sw-sec-md-block">
          <h3 className="sw-sec-md-h">Results</h3>
          <ResultsList results={results} n={n} />
        </div>
      )}
      {showLadder && (
        <div className="sw-sec-md-block">
          <h3 className="sw-sec-md-h">Ladder</h3>
          <LadderTable ladder={ladder} />
        </div>
      )}
    </section>
  );
}

export function ScoreboardSection({ props, ctx }: { props: PropsOf<"scoreboard">; ctx: SectionContext }) {
  if (!ctx.isEntitled("scoreboard")) return null; // not entitled -> nothing
  const mc = ctx.matchCentre;
  const last = props.showLast !== false ? mc?.results?.[0] : undefined;
  const next = props.showNext !== false ? mc?.fixtures?.[0] : undefined;
  const ladderPos =
    props.showLadderPos && mc?.ladder?.length
      ? mc.ladder.findIndex((r) => r.isClub) + 1 || null
      : null;

  if (!last && !next && !ladderPos) {
    return (
      <section className="sw-sec sw-sec--scoreboard">
        <Empty>The latest result and next fixture will show here once the season is underway.</Empty>
      </section>
    );
  }

  return (
    <section className="sw-sec sw-sec--scoreboard">
      {last && (
        <div className={`sw-sec-sb-cell sw-sec-sb-cell--${last.outcome}`}>
          <span className="sw-sec-sb-cap">Last</span>
          <span className="sw-sec-sb-main">
            {last.outcome} {last.scoreFor}&ndash;{last.scoreAgainst}
          </span>
          <span className="sw-sec-sb-sub">v {last.opponent}</span>
        </div>
      )}
      {next && (
        <div className="sw-sec-sb-cell">
          <span className="sw-sec-sb-cap">Next</span>
          <span className="sw-sec-sb-main">v {next.opponent}</span>
          <span className="sw-sec-sb-sub">
            {next.venue} &middot; {next.date}
          </span>
        </div>
      )}
      {ladderPos && (
        <div className="sw-sec-sb-cell">
          <span className="sw-sec-sb-cap">Ladder</span>
          <span className="sw-sec-sb-main">#{ladderPos}</span>
        </div>
      )}
    </section>
  );
}

/** RDCA's always-visible live-score strip, ported as real (if less flashy) content: recent
 *  results + upcoming fixtures from the club's own MatchCentreData, not fabricated
 *  ball-by-ball live scores (no such data source exists -- Rule 9). Not entitled or no data
 *  -> nothing, same contract as every other module section. */
export function TickerSection({ props, ctx }: { props: PropsOf<"ticker">; ctx: SectionContext }) {
  if (!ctx.isEntitled("ticker")) return null;
  const mc = ctx.matchCentre;
  const n = props.count ?? 10;
  const items = [
    ...(mc?.results ?? []).map((r) => ({ kind: "result" as const, r })),
    ...(mc?.fixtures ?? []).map((f) => ({ kind: "fixture" as const, f })),
  ].slice(0, n);
  if (items.length === 0) return null; // chrome-like strip: nothing to show -> not even an empty state banner
  return (
    <div className="sw-sec sw-sec--ticker" aria-label="Latest results and fixtures">
      <div className="sw-sec-ticker-track">
        {items.map((it, i) =>
          it.kind === "result" ? (
            <span key={i} className="sw-sec-ticker-item">
              <b className="sw-sec-ticker-grade">{it.r.grade}</b> {it.r.opponent} {it.r.scoreFor}&ndash;{it.r.scoreAgainst}{" "}
              <span className="sw-sec-ticker-outcome" data-outcome={it.r.outcome}>{it.r.outcome}</span>
            </span>
          ) : (
            <span key={i} className="sw-sec-ticker-item">
              <b className="sw-sec-ticker-grade">{it.f.grade}</b> v {it.f.opponent} &middot; {it.f.date}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
