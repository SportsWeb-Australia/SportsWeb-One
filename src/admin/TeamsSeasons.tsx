import { useEffect, useMemo, useState } from "react";
import { useActiveClub } from "./ActiveClub";
import { usePermissions } from "../lib/permissions";
import {
  adminListSeasons,
  upsertSeason,
  deleteSeason,
  type AdminSeason,
  adminListTeams,
  upsertTeam,
  deleteTeam,
  type AdminTeam,
} from "../lib/people";

const DEFAULT_SPORTS = [
  "AFL",
  "Netball",
  "Cricket",
  "Football",
  "Basketball",
  "Hockey",
  "Tennis",
  "Lacrosse",
  "Oztag",
];

type SeasonForm = {
  id: string | null;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};
type TeamForm = {
  id: string | null;
  name: string;
  sport: string;
  ageGroup: string;
  gender: string;
  grade: string;
  coachName: string;
  status: string;
};

const EMPTY_SEASON: SeasonForm = { id: null, name: "", sport: "", startDate: "", endDate: "", isCurrent: false };
const EMPTY_TEAM: TeamForm = {
  id: null,
  name: "",
  sport: "",
  ageGroup: "",
  gender: "",
  grade: "",
  coachName: "",
  status: "published",
};

function fmtDate(d: string | null): string {
  if (!d) return "";
  const parsed = new Date(d + "T00:00:00");
  if (Number.isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export function TeamsSeasons() {
  const { clubId } = useActiveClub();
  const { can } = usePermissions();
  const canEdit = can("club.users");

  const [seasons, setSeasons] = useState<AdminSeason[]>([]);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [seasonForm, setSeasonForm] = useState<SeasonForm | null>(null);
  const [teamForm, setTeamForm] = useState<TeamForm | null>(null);

  function load() {
    if (!clubId) return;
    setLoading(true);
    Promise.all([adminListSeasons(clubId), adminListTeams(clubId)]).then(([s, t]) => {
      setSeasons(s);
      setTeams(t);
      setLoading(false);
    });
  }
  useEffect(load, [clubId]);

  const sportOptions = useMemo(() => {
    const set = new Set<string>(DEFAULT_SPORTS);
    seasons.forEach((s) => s.sport && set.add(s.sport));
    teams.forEach((t) => t.sport && set.add(t.sport));
    return Array.from(set);
  }, [seasons, teams]);

  async function saveSeason() {
    if (!clubId || !seasonForm) return;
    if (!seasonForm.name.trim()) {
      setErr("Season name is required.");
      return;
    }
    setBusy(true);
    setErr(null);
    const msg = await upsertSeason(clubId, seasonForm);
    setBusy(false);
    if (msg) {
      setErr(msg);
      return;
    }
    setSeasonForm(null);
    load();
  }

  async function removeSeason(s: AdminSeason) {
    if (!clubId) return;
    if (!window.confirm(`Delete season "${s.name}"? This can't be undone.`)) return;
    setErr(null);
    const msg = await deleteSeason(clubId, s.id);
    if (msg) {
      setErr(msg);
      return;
    }
    load();
  }

  async function saveTeam() {
    if (!clubId || !teamForm) return;
    if (!teamForm.name.trim()) {
      setErr("Team name is required.");
      return;
    }
    setBusy(true);
    setErr(null);
    const msg = await upsertTeam(clubId, teamForm);
    setBusy(false);
    if (msg) {
      setErr(msg);
      return;
    }
    setTeamForm(null);
    load();
  }

  async function removeTeam(t: AdminTeam) {
    if (!clubId) return;
    if (!window.confirm(`Delete team "${t.name}"? This can't be undone.`)) return;
    setErr(null);
    const msg = await deleteTeam(clubId, t.id);
    if (msg) {
      setErr(msg);
      return;
    }
    load();
  }

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>Teams &amp; seasons</h2>
      </div>
      <p className="sw-admin-note">
        Seasons and teams set up here are shared everywhere — member roles, registrations and your public
        website all read from them. Published teams appear on your site; drafts stay hidden.
      </p>

      {err && <p className="sw-admin-note sw-md-msg">{err}</p>}

      <datalist id="sw-ts-sports">
        {sportOptions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {/* ---------------- SEASONS ---------------- */}
      <div className="sw-folder sw-ts-folder">
        <div className="sw-folder-tab">Seasons</div>
        <div className="sw-folder-body">
          <div className="sw-ts-head">
            <span className="sw-ts-count">
              {seasons.length} season{seasons.length === 1 ? "" : "s"}
            </span>
            {canEdit && !seasonForm && (
              <button className="sw-btn sw-btn--sm" onClick={() => setSeasonForm({ ...EMPTY_SEASON })}>
                + Add season
              </button>
            )}
          </div>

          {seasonForm && (
            <div className="sw-ts-form">
              <div className="sw-ts-grid">
                <label className="sw-admin-field">
                  <span>Season name <i>*</i></span>
                  <input
                    value={seasonForm.name}
                    placeholder="e.g. 2026 Season"
                    onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>Sport</span>
                  <input
                    list="sw-ts-sports"
                    value={seasonForm.sport}
                    placeholder="e.g. AFL or Netball"
                    onChange={(e) => setSeasonForm({ ...seasonForm, sport: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>Start date</span>
                  <input
                    type="date"
                    value={seasonForm.startDate}
                    onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>End date</span>
                  <input
                    type="date"
                    value={seasonForm.endDate}
                    onChange={(e) => setSeasonForm({ ...seasonForm, endDate: e.target.value })}
                  />
                </label>
              </div>
              <label className="sw-ts-check">
                <input
                  type="checkbox"
                  checked={seasonForm.isCurrent}
                  onChange={(e) => setSeasonForm({ ...seasonForm, isCurrent: e.target.checked })}
                />
                <span>Current season{seasonForm.sport ? ` for ${seasonForm.sport}` : ""} (the one new roles default to)</span>
              </label>
              <div className="sw-ts-actions">
                <button className="sw-btn" disabled={busy} onClick={saveSeason}>
                  {busy ? "Saving…" : seasonForm.id ? "Save season" : "Create season"}
                </button>
                <button className="sw-btn sw-btn--ghost" disabled={busy} onClick={() => setSeasonForm(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="sw-mem-muted">Loading…</p>
          ) : seasons.length === 0 ? (
            <p className="sw-mem-empty">No seasons yet. Add one so members can be assigned to it.</p>
          ) : (
            <ul className="sw-ts-list">
              {seasons.map((s) => (
                <li key={s.id} className="sw-ts-row">
                  <div className="sw-ts-main">
                    <span className="sw-ts-name">
                      {s.name}
                      {s.isCurrent && <span className="sw-ts-badge sw-ts-badge--current">Current</span>}
                    </span>
                    <span className="sw-ts-meta">
                      {[s.sport, s.startDate || s.endDate ? `${fmtDate(s.startDate)}${s.endDate ? " – " + fmtDate(s.endDate) : ""}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  {canEdit && (
                    <div className="sw-ts-rowbtns">
                      <button
                        className="sw-btn sw-btn--ghost sw-btn--sm"
                        onClick={() =>
                          setSeasonForm({
                            id: s.id,
                            name: s.name,
                            sport: s.sport ?? "",
                            startDate: s.startDate ?? "",
                            endDate: s.endDate ?? "",
                            isCurrent: s.isCurrent,
                          })
                        }
                      >
                        Edit
                      </button>
                      <button className="sw-btn sw-btn--ghost sw-btn--sm sw-ts-del" onClick={() => removeSeason(s)}>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ---------------- TEAMS ---------------- */}
      <div className="sw-folder sw-ts-folder">
        <div className="sw-folder-tab">Teams</div>
        <div className="sw-folder-body">
          <div className="sw-ts-head">
            <span className="sw-ts-count">
              {teams.length} team{teams.length === 1 ? "" : "s"}
            </span>
            {canEdit && !teamForm && (
              <button className="sw-btn sw-btn--sm" onClick={() => setTeamForm({ ...EMPTY_TEAM })}>
                + Add team
              </button>
            )}
          </div>

          {teamForm && (
            <div className="sw-ts-form">
              <div className="sw-ts-grid">
                <label className="sw-admin-field">
                  <span>Team name <i>*</i></span>
                  <input
                    value={teamForm.name}
                    placeholder="e.g. Senior Men, U13 Girls"
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>Sport</span>
                  <input
                    list="sw-ts-sports"
                    value={teamForm.sport}
                    placeholder="e.g. AFL or Netball"
                    onChange={(e) => setTeamForm({ ...teamForm, sport: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>Grade / division</span>
                  <input
                    value={teamForm.grade}
                    placeholder="e.g. A Grade, Division 2"
                    onChange={(e) => setTeamForm({ ...teamForm, grade: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>Age group</span>
                  <input
                    value={teamForm.ageGroup}
                    placeholder="e.g. Seniors, U13"
                    onChange={(e) => setTeamForm({ ...teamForm, ageGroup: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>Gender</span>
                  <select value={teamForm.gender} onChange={(e) => setTeamForm({ ...teamForm, gender: e.target.value })}>
                    <option value="">—</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </label>
                <label className="sw-admin-field">
                  <span>Coach name</span>
                  <input
                    value={teamForm.coachName}
                    placeholder="Optional"
                    onChange={(e) => setTeamForm({ ...teamForm, coachName: e.target.value })}
                  />
                </label>
                <label className="sw-admin-field">
                  <span>Visibility</span>
                  <select value={teamForm.status} onChange={(e) => setTeamForm({ ...teamForm, status: e.target.value })}>
                    <option value="published">Published (shown on website)</option>
                    <option value="draft">Draft (hidden)</option>
                  </select>
                </label>
              </div>
              <div className="sw-ts-actions">
                <button className="sw-btn" disabled={busy} onClick={saveTeam}>
                  {busy ? "Saving…" : teamForm.id ? "Save team" : "Create team"}
                </button>
                <button className="sw-btn sw-btn--ghost" disabled={busy} onClick={() => setTeamForm(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="sw-mem-muted">Loading…</p>
          ) : teams.length === 0 ? (
            <p className="sw-mem-empty">No teams yet. Add your teams so players and coaches can be assigned to them.</p>
          ) : (
            <ul className="sw-ts-list">
              {teams.map((t) => (
                <li key={t.id} className="sw-ts-row">
                  <div className="sw-ts-main">
                    <span className="sw-ts-name">
                      {t.name}
                      {t.status !== "published" && <span className="sw-ts-badge sw-ts-badge--draft">Draft</span>}
                    </span>
                    <span className="sw-ts-meta">
                      {[t.sport, t.grade, t.ageGroup, t.gender, t.coachName ? `Coach: ${t.coachName}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  {canEdit && (
                    <div className="sw-ts-rowbtns">
                      <button
                        className="sw-btn sw-btn--ghost sw-btn--sm"
                        onClick={() =>
                          setTeamForm({
                            id: t.id,
                            name: t.name,
                            sport: t.sport ?? "",
                            ageGroup: t.ageGroup ?? "",
                            gender: t.gender ?? "",
                            grade: t.grade ?? "",
                            coachName: t.coachName ?? "",
                            status: t.status ?? "published",
                          })
                        }
                      >
                        Edit
                      </button>
                      <button className="sw-btn sw-btn--ghost sw-btn--sm sw-ts-del" onClick={() => removeTeam(t)}>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
