// F2 P2 -- PR 2: Module-class section components.
// Data is owned by a module and entitlement-gated. Every module section has the TWO states
// the doc mandates from day one (sec 4):
//   - NOT ENTITLED           -> render NOTHING (null). Not an empty box, not "coming soon".
//   - ENTITLED, NO DATA      -> a defined, honest empty state.
// Entitlement is resolved by ctx.isEntitled(type); see ../entitlement for the "match_centre"
// capability decision. Props are config only. No colours (sec 5, rule 7).
import { useState, type ReactNode } from "react";
import type { Fixture, LadderRow, Result } from "../../content/types";
import type { SectionContext } from "../entitlement";
import type { PropsOf } from "../schemas";

function Empty({ children }: { children: ReactNode }) {
  return <p className="sw-sec-empty">{children}</p>;
}

/** RDCA competition-hub tabs (.comp-tabs): one pane visible at a time. Client-side tab state. */
function CompHubTabs({ panes }: { panes: { key: string; label: string; node: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="comp-hub">
      <div className="comp-tabs" role="tablist">
        {panes.map((p, i) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`comp-tab${i === active ? " active" : ""}`}
            onClick={() => setActive(i)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {panes.map((p, i) => (
        <div key={p.key} role="tabpanel" className={`comp-pane${i === active ? " active" : ""}`} hidden={i !== active}>
          {p.node}
        </div>
      ))}
    </div>
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

  const heading = "Competition Hub";

  if (!showFixtures && !showResults && !showLadder) {
    return (
      <section className="sw-sec sw-sec--matchdata card sw-comp-hub">
        <div className="sec-hdr">
          <div className="s-hed">{heading}</div>
        </div>
        <Empty>Fixtures, results and the ladder will appear here once the season draw is published.</Empty>
      </section>
    );
  }

  // RDCA-styled panes (ported .lt ladder / .fxr fixtures / .rrow results).
  const ladderNode = (
    <div className="ladder-wrap">
      <table className="lt">
        <thead>
          <tr>
            <th className="tl">Team</th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>D</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {ladder.map((row, i) => (
            <tr key={i} className={row.isClub ? "promo" : undefined}>
              <td className="tl">{row.team}</td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.lost}</td>
              <td>{row.drawn}</td>
              <td className="pts">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const fixturesNode = (
    <div className="fx-list">
      {fixtures.slice(0, n).map((f, i) => (
        <div key={i} className="fxr">
          <div className="fxd">{f.round}</div>
          <div className="fxi">
            <div className="fxt">{f.opponent}</div>
            <div className="fxm">
              {f.venue} &middot; {f.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  const resultsNode = (
    <div className="rx-list">
      {results.slice(0, n).map((r, i) => (
        <div key={i} className={`rrow rrow--${r.outcome}`}>
          <div className="fxi">
            <div className="fxt">{r.opponent}</div>
            <div className="fxm">
              {r.round} &middot; {r.outcome}
            </div>
          </div>
          <div className="rx-score">
            {r.scoreFor}&ndash;{r.scoreAgainst}
          </div>
        </div>
      ))}
    </div>
  );

  const panes = [
    showLadder && { key: "ladder", label: "Ladder", node: ladderNode },
    showFixtures && { key: "fixtures", label: "Fixtures", node: fixturesNode },
    showResults && { key: "results", label: "Results", node: resultsNode },
  ].filter(Boolean) as { key: string; label: string; node: ReactNode }[];

  return (
    <section className="sw-sec sw-sec--matchdata card sw-comp-hub">
      <div className="sec-hdr">
        <div className="s-hed">{heading}</div>
      </div>
      {props.display === "tabs" ? (
        <CompHubTabs panes={panes} />
      ) : (
        panes.map((p) => (
          <div key={p.key} className="comp-block">
            <h3 className="comp-block-h">{p.label}</h3>
            {p.node}
          </div>
        ))
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

/** Ticker: a live-score strip (Module: match_centre). Rule 9: not entitled or no chips -> nothing
 *  (never an empty bar). Data from ctx.matchCentre.ticker (sport-neutral). */
export function TickerSection({ props, ctx }: { props: PropsOf<"ticker">; ctx: SectionContext }) {
  if (!ctx.isEntitled("ticker")) return null;
  const items = ctx.matchCentre?.ticker ?? [];
  if (items.length === 0) return null;
  return (
    <section className="sw-sec ticker-bar sw-ticker" aria-label={props.heading ?? "Live scores"}>
      <div className="tk-inner">
        <span className="tk-label">
          <span className="live-dot" aria-hidden="true"></span> Live
        </span>
        <div className="tk-track">
          {items.map((t, i) => (
            <a key={i} className="tk-chip" href={t.href ?? "#"}>
              {t.label && <span className="tk-grade">{t.label}</span>}
              <span className="tk-teams">{t.teams}</span>
              {t.score && <span className="tk-score">{t.score}</span>}
              {t.status && <span className={`tk-status${t.live ? " is-live" : ""}`}>{t.status}</span>}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Top performers: a leaderboard (Module: match_centre). Entitled + no rows -> honest empty state. */
export function TopPerformersSection({ props, ctx }: { props: PropsOf<"top_performers">; ctx: SectionContext }) {
  if (!ctx.isEntitled("top_performers")) return null;
  let items = ctx.matchCentre?.performers ?? [];
  if (props.category) items = items.filter((p) => p.category === props.category);
  items = items.slice(0, props.count ?? 6);
  return (
    <section className="sw-sec card sw-perf">
      <div className="sec-hdr">
        <div className="s-hed">{props.heading ?? "Top Performers"}</div>
      </div>
      {items.length === 0 ? (
        <Empty>Leaders will appear here once matches are played.</Empty>
      ) : (
        <div className="perf-grid">
          {items.map((p, i) => (
            <div key={i} className="perf-row">
              <div className="perf-rank">{i + 1}</div>
              <div className="perf-id">
                <div className="perf-name">{p.name}</div>
                {p.club && <div className="perf-club">{p.club}</div>}
              </div>
              <div className="perf-stat">
                <span className="perf-val">{p.stat}</span>
                {p.statLabel && <span className="perf-lbl">{p.statLabel}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Lineup: an announced team (Module: match_centre). Rule 9: not entitled or no players -> nothing. */
export function LineupSection({ props, ctx }: { props: PropsOf<"lineup">; ctx: SectionContext }) {
  if (!ctx.isEntitled("lineup")) return null;
  const lu = ctx.matchCentre?.lineup;
  if (!lu || lu.players.length === 0) return null;
  return (
    <section className="sw-sec card sw-lineup">
      <div className="sec-hdr">
        <div>
          {lu.grade && <div className="eyebrow">{lu.grade}</div>}
          <div className="s-hed">{props.heading ?? lu.teamName ?? "Team Lineup"}</div>
        </div>
      </div>
      {lu.note && <div className="lu-note">{lu.note}</div>}
      <ul className="lu-list">
        {lu.players.map((pl, i) => (
          <li key={i} className="lu-player">
            {pl.number && <span className="lu-num">{pl.number}</span>}
            <span className="lu-name">{pl.name}</span>
            {pl.role && <span className="lu-role">{pl.role}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
