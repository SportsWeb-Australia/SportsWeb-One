import { useEffect, useState } from "react";
import { useClub } from "../components/ClubContext";
import { useActiveClub } from "./ActiveClub";
import { useAuth } from "../lib/auth";
import { usePermissions, toModelRole } from "../lib/permissions";
import { roleLabel } from "../lib/roles";
import { supabase } from "../lib/supabase";
import {
  COMMITTEE_TITLES,
  loadCommitteeProfile,
  saveCommitteeProfile,
  firstNameFrom,
  type CommitteeProfile,
} from "../lib/committee";

/**
 * Admin landing dashboard. Shows a friendly snapshot of the club plus quick
 * shortcuts to the jobs people do most. `go` switches the admin view (same
 * setActive used by the sidebar), so a card behaves like a nav shortcut.
 */
export function AdminDashboard({ go }: { go: (key: string) => void }) {
  const { club } = useClub();
  const { can } = usePermissions();
  const { clubId, role: activeRole, isActingAs } = useActiveClub();
  const { userId, email, platformRole } = useAuth();

  const [profile, setProfile] = useState<CommitteeProfile>({ displayName: "", committeeTitle: "" });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", title: "" });
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!clubId || !userId) return;
    let alive = true;
    loadCommitteeProfile(clubId, userId).then((p) => {
      if (!alive) return;
      setProfile(p);
      setForm({ name: p.displayName, title: p.committeeTitle });
    });
    return () => {
      alive = false;
    };
  }, [clubId, userId]);

  const firstName = firstNameFrom(profile.displayName, email);
  const roleFallback = roleLabel(platformRole ?? toModelRole(activeRole));
  const greetingRole = profile.committeeTitle || (roleFallback !== "—" ? roleFallback : "");

  const saveProfile = async () => {
    setSaveMsg("Saving…");
    const err = await saveCommitteeProfile(clubId, form.name, form.title);
    if (err) {
      setSaveMsg("Couldn't save — has the committee-roles migration been run?");
      return;
    }
    setProfile({ displayName: form.name.trim(), committeeTitle: form.title.trim() });
    setSaveMsg("Saved.");
    setEditing(false);
  };

  const [counts, setCounts] = useState<Record<string, number | null>>({
    news: null,
    events: null,
    teams: null,
    sponsors: null,
    ladder: null,
  });

  useEffect(() => {
    if (!clubId || !supabase) return;
    let alive = true;
    const tables: Record<string, string> = {
      news: "news",
      events: "events",
      teams: "teams",
      sponsors: "sponsors",
      ladder: "ladder",
    };
    (async () => {
      const entries = await Promise.all(
        Object.entries(tables).map(async ([key, table]) => {
          try {
            const { count } = await supabase!
              .from(table)
              .select("id", { count: "exact", head: true })
              .eq("club_id", clubId);
            return [key, count ?? 0] as const;
          } catch {
            return [key, null] as const;
          }
        })
      );
      if (alive) setCounts(Object.fromEntries(entries));
    })();
    return () => {
      alive = false;
    };
  }, [clubId]);

  const clubName = club.identity.shortName || "your club";

  const stats: { key: string; label: string }[] = [
    { key: "news", label: "News posts" },
    { key: "events", label: "Events" },
    { key: "teams", label: "Teams" },
    { key: "sponsors", label: "Sponsors" },
    { key: "ladder", label: "Ladder rows" },
  ];

  const quick: { title: string; sub: string; key: string; show: boolean }[] = [
    { title: "Write a news post", sub: "Share an update with your members", key: "news", show: can("club.content") },
    { title: "Add an event", sub: "Put a date on the calendar", key: "events", show: can("club.content") },
    { title: "Update the ladder", sub: "Add or edit a ladder row", key: "ladder", show: can("club.content") },
    { title: "Edit your website", sub: "Hero, logo, text, images and video", key: "__site", show: can("club.website") },
    { title: "Send a message", sub: "Email or SMS your members", key: "__comms", show: can("club.comms") },
  ];

  return (
    <div className="sw-admin-panel sw-dash">
      <div className="sw-dash-head">
        <h2>
          Welcome {firstName}
          {greetingRole && (
            <>
              {" — "}
              <span className="sw-dash-role">{greetingRole}</span>
            </>
          )}
        </h2>
        <p className="sw-admin-note">Here's {clubName} at a glance. Jump straight into whatever you need.</p>
        {!isActingAs && (
          <div className="sw-dash-rolebar">
            <button
              className="sw-dash-roleedit"
              onClick={() => {
                setEditing((v) => !v);
                setSaveMsg("");
              }}
            >
              {editing ? "Close" : profile.committeeTitle ? "Edit your name & role" : "Set your name & committee role"}
            </button>
            {editing && (
              <div className="sw-dash-roleform">
                <label className="sw-ed-l">
                  Your name
                  <input
                    className="sw-input"
                    value={form.name}
                    placeholder="e.g. Carson"
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </label>
                <label className="sw-ed-l">
                  Committee role
                  <select
                    className="sw-input"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  >
                    <option value="">— none —</option>
                    {COMMITTEE_TITLES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sw-ed-foot">
                  <button className="sw-btn" onClick={saveProfile}>
                    Save
                  </button>
                  <span className="sw-ed-status" aria-live="polite">
                    {saveMsg}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sw-dash-stats">
        {stats.map((s) => (
          <button key={s.key} className="sw-dash-stat" onClick={() => go(s.key)}>
            <span className="sw-dash-stat-num">{counts[s.key] === null ? "—" : counts[s.key]}</span>
            <span className="sw-dash-stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      <h3 className="sw-dash-subhead">Quick actions</h3>
      <div className="sw-dash-grid">
        {quick.filter((q) => q.show).map((q) => (
          <button key={q.key} className="sw-dash-card" onClick={() => go(q.key)}>
            <span className="sw-dash-card-title">{q.title}</span>
            <span className="sw-dash-card-sub">{q.sub}</span>
            <span className="sw-dash-card-go" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
