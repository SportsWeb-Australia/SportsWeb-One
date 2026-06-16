import { useEffect, useMemo, useState } from "react";
import { MODULE_CATALOG } from "../lib/modules";
import { listClubs, listModuleStatuses, setModuleStatus, type AdminClub, type AdminModuleRow } from "../lib/superAdmin";

/** Platform operator view: every club, with per-module enable/disable. */
export function SuperClubs() {
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [rows, setRows] = useState<AdminModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [c, m] = await Promise.all([listClubs(), listModuleStatuses()]);
    setClubs(c);
    setRows(m);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  // status lookup: clubId -> moduleKey -> status
  const statusMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    for (const r of rows) {
      (map[r.club_id] ??= {})[r.module_key] = r.status;
    }
    return map;
  }, [rows]);

  const statusFor = (clubId: string, key: string): string => statusMap[clubId]?.[key] ?? "default";

  const toggle = async (clubId: string, key: string, currentlyOn: boolean) => {
    const cell = `${clubId}:${key}`;
    setBusy(cell);
    setError(null);
    const err = await setModuleStatus(clubId, key, currentlyOn ? "locked" : "enabled");
    if (err) setError(err);
    else {
      // optimistic local update
      setRows((rs) => {
        const without = rs.filter((r) => !(r.club_id === clubId && r.module_key === key));
        return [...without, { club_id: clubId, module_key: key, status: currentlyOn ? "locked" : "enabled" }];
      });
    }
    setBusy(null);
  };

  return (
    <div className="sw-admin-page">
      <header className="sw-admin-head">
        <div>
          <h1>Clubs &amp; modules</h1>
          <p>Every club on the platform. Switch modules on or off per club.</p>
        </div>
        <button className="sw-btn sw-btn--ghost" onClick={refresh}>
          Refresh
        </button>
      </header>

      {error && <div className="sw-comms-result err">{error}</div>}

      {loading ? (
        <p>Loading clubs…</p>
      ) : clubs.length === 0 ? (
        <p className="sw-muted">No clubs found, or you're not a platform admin.</p>
      ) : (
        <div className="sw-super-table-wrap">
          <table className="sw-admin-table sw-super-table">
            <thead>
              <tr>
                <th>Club</th>
                {MODULE_CATALOG.map((m) => (
                  <th key={m.key}>{m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.id}>
                  <td className="sw-super-clubcell">
                    <strong>{club.name}</strong>
                    <small>{club.slug}</small>
                  </td>
                  {MODULE_CATALOG.map((m) => {
                    const st = statusFor(club.id, m.key);
                    const on = st === "enabled" || st === "trial";
                    const cell = `${club.id}:${m.key}`;
                    return (
                      <td key={m.key} className="sw-super-cell">
                        <button
                          type="button"
                          className={`sw-switch sw-switch--sm${on ? " on" : ""}`}
                          aria-pressed={on}
                          disabled={busy === cell}
                          title={st === "default" ? "Using site default" : st}
                          onClick={() => toggle(club.id, m.key, on)}
                        >
                          <i />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="sw-comms-note" style={{ marginTop: "1rem" }}>
        A switch left untouched uses the site's built-in default. Turning it on records an explicit
        “enabled”; turning it off records “locked”, which overrides any default.
      </p>
    </div>
  );
}
