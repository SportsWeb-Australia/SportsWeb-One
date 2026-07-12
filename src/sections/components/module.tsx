// F2 P2 -- PR 2: Module-class section components.
// Data is owned by a module and entitlement-gated. Every module section has the TWO states
// the doc mandates from day one (sec 4):
//   - NOT ENTITLED           -> render NOTHING (null). Not an empty box, not "coming soon".
//   - ENTITLED, NO DATA      -> a defined, honest empty state.
// Entitlement is resolved by ctx.isEntitled(type); see ../entitlement for the "match_centre"
// capability decision. Props are config only. No colours (sec 5, rule 7).
import type { ReactNode } from "react";
import type { Fixture, LadderRow, Result } from "../../content/types";
import type { SectionContext } from "../entitlement";
import type { PropsOf } from "../schemas";

function Empty({ children }: { children: ReactNode }) {
  return <p className="sw-sec-empty">{children}</p>;
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
        <Empty>Fixtures, results and the ladder will appear here once the season draw is published.</Empty>
      </section>
    );
  }

  return (
    <section className="sw-sec sw-sec--matchdata">
      {showFixtures && (
        <div className="sw-sec-md-block">
          <h3 className="sw-sec-md-h">Fixtures</h3>
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
        </div>
      )}
      {showResults && (
        <div className="sw-sec-md-block">
          <h3 className="sw-sec-md-h">Results</h3>
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
        </div>
      )}
      {showLadder && (
        <div className="sw-sec-md-block">
          <h3 className="sw-sec-md-h">Ladder</h3>
          <table className="sw-sec-md-ladder">
            <thead>
              <tr>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>L</th>
                <th>D</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((row, i) => (
                <tr key={i} className={row.isClub ? "sw-sec-md-ladder-club" : undefined}>
                  <td>{row.team}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.lost}</td>
                  <td>{row.drawn}</td>
                  <td>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
