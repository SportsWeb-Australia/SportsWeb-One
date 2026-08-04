import { useEffect, useMemo, useState } from "react";
import { addClubMember, addPersonRole } from "../lib/people";

// Bulk member import from a pasted CSV (Excel / Google Sheets export).
// Parses the CSV, lets the club map each column to a member field, and imports
// row-by-row via the same add_club_member RPC the single-add form uses. Optional
// Role column creates a person_role too. Teams are not imported in v1.

type FieldKey = "ignore" | "full_name" | "first_name" | "last_name" | "email" | "mobile" | "date_of_birth" | "role";

const FIELD_LABELS: Record<FieldKey, string> = {
  ignore: "— skip —",
  full_name: "Full name",
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  mobile: "Mobile",
  date_of_birth: "Date of birth",
  role: "Role",
};
const FIELD_ORDER: FieldKey[] = ["ignore", "full_name", "first_name", "last_name", "email", "mobile", "date_of_birth", "role"];

/** Minimal RFC-ish CSV parser (handles quoted fields and embedded commas/quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false;
      } else cell += c;
    } else if (c === '"') {
      inQ = true;
    } else if (c === ",") {
      row.push(cell); cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    if (row.some((x) => x.trim() !== "")) rows.push(row);
  }
  return rows;
}

function guessField(header: string): FieldKey {
  const s = header.toLowerCase().replace(/[^a-z]/g, "");
  if (s.includes("first")) return "first_name";
  if (s.includes("last") || s.includes("surname")) return "last_name";
  if (s.includes("email") || s.includes("mail")) return "email";
  if (s.includes("mobile") || s.includes("phone") || s.includes("cell")) return "mobile";
  if (s.includes("dob") || s.includes("birth")) return "date_of_birth";
  if (s.includes("role") || s.includes("membertype")) return "role";
  if (s.includes("name")) return "full_name";
  return "ignore";
}

/** Best-effort convert d/m/y or m/d/y-ish dates to ISO YYYY-MM-DD; pass through ISO. */
function normalizeDate(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = (Number(y) > 50 ? "19" : "20") + y;
    // Assume day-first (Australian). If day > 12, it's unambiguous anyway.
    const dd = d.padStart(2, "0");
    const mm = mo.padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }
  return null;
}

export function MemberImport({ clubId, onDone }: { clubId: string; onDone: () => void }) {
  const [raw, setRaw] = useState("");
  const rows = useMemo(() => parseCsv(raw), [raw]);
  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);
  const [map, setMap] = useState<FieldKey[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const [result, setResult] = useState<{ ok: number; fail: number; errors: string[] } | null>(null);

  // Re-guess the column mapping whenever the header row changes.
  useEffect(() => {
    setMap(headers.map((h) => guessField(h)));
    setResult(null);
  }, [raw]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasName = map.includes("full_name") || (map.includes("first_name") && map.includes("last_name")) || map.includes("first_name");

  const run = async () => {
    setImporting(true);
    setResult(null);
    setDone(0);
    let ok = 0;
    let fail = 0;
    const errors: string[] = [];
    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      const get = (f: FieldKey) => {
        const idx = map.indexOf(f);
        return idx >= 0 ? (r[idx] ?? "").trim() : "";
      };
      const full = get("full_name") || [get("first_name"), get("last_name")].filter(Boolean).join(" ").trim();
      if (!full) { fail++; continue; }
      const profile: Record<string, unknown> = { full_name: full, status: "active" };
      const email = get("email"); if (email) profile.email = email;
      const mobile = get("mobile"); if (mobile) profile.mobile = mobile;
      const dob = normalizeDate(get("date_of_birth")); if (dob) profile.date_of_birth = dob;
      const res = await addClubMember(clubId, profile);
      if (res.error) {
        fail++;
        if (errors.length < 6) errors.push(`${full}: ${res.error}`);
      } else {
        ok++;
        const role = get("role");
        if (role && res.id) await addPersonRole(clubId, res.id, { role: role.toLowerCase().replace(/\s+/g, "_") });
      }
      setDone(i + 1);
    }
    setImporting(false);
    setResult({ ok, fail, errors });
  };

  return (
    <div className="sw-mem-addform">
      <h3 className="sw-people-add-h">Import members from a spreadsheet</h3>
      <p className="sw-admin-note" style={{ marginTop: 0 }}>
        Export your members from Excel or Google Sheets as CSV (or copy the cells) and paste below. Include a header row.
        We&apos;ll match the columns automatically — check the mapping, then import. (Roles import by name; teams are added on each profile.)
      </p>
      <textarea
        className="sw-input"
        rows={7}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"Full name,Email,Mobile,Date of birth,Role\nJane Smith,jane@example.com,0400 000 000,12/03/1988,coach\n..."}
        style={{ width: "100%", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5 }}
      />

      {headers.length > 0 && (
        <>
          <div className="sw-sales-sub" style={{ marginTop: 14 }}>Match your columns</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginTop: 8 }}>
            {headers.map((h, i) => (
              <label key={i} style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>
                <span style={{ color: "#5b6573", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={h}>{h || `Column ${i + 1}`}</span>
                <select
                  value={map[i] ?? "ignore"}
                  onChange={(e) => setMap((m) => m.map((v, j) => (j === i ? (e.target.value as FieldKey) : v)))}
                >
                  {FIELD_ORDER.map((f) => (
                    <option key={f} value={f}>{FIELD_LABELS[f]}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <button
              className="sw-btn"
              disabled={importing || dataRows.length === 0 || !hasName}
              onClick={run}
            >
              {importing ? `Importing… ${done}/${dataRows.length}` : `Import ${dataRows.length} member${dataRows.length === 1 ? "" : "s"}`}
            </button>
            {!hasName && <span className="sw-md-msg" style={{ color: "#b45309" }}>Map a Full name (or First + Last) column to import.</span>}
          </div>
        </>
      )}

      {result && (
        <div className="sw-admin-note" style={{ marginTop: 14, background: "#f7f8fa", border: "1px solid #e6e8ee", borderRadius: 10, padding: "12px 14px" }}>
          <strong style={{ color: "#166534" }}>Imported {result.ok} member{result.ok === 1 ? "" : "s"}.</strong>
          {result.fail > 0 && <span style={{ color: "#b45309" }}> {result.fail} skipped.</span>}
          {result.errors.length > 0 && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5, color: "#7a2e2e" }}>
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <div style={{ marginTop: 10 }}>
            <button className="sw-btn sw-btn--ghost" onClick={onDone}>Done — refresh the list</button>
          </div>
        </div>
      )}
    </div>
  );
}
