import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

type Kind = "sportsweb_manager" | "sportsweb_admin" | "club_senior_admin" | "club_admin";
type ClubRow = { id: string; name: string; slug: string };
type Result = {
  ok?: boolean;
  email?: string;
  role_label?: string;
  created?: boolean;
  emailed?: boolean;
  temp_password?: string | null;
  error?: string;
};

const KIND_LABEL: Record<Kind, string> = {
  sportsweb_manager: "SportsWeb Manager",
  sportsweb_admin: "SportsWeb Admin (builder)",
  club_senior_admin: "Exec Admin (a club)",
  club_admin: "Club Admin (a club)",
};
const KIND_HINT: Record<Kind, string> = {
  sportsweb_manager: "Oversees, creates clubs, adds staff, authorises. Super Admin only.",
  sportsweb_admin: "Builds the clubs handed to them. Scoped to assigned clubs.",
  club_senior_admin: "A club's own senior person - full control of that club.",
  club_admin: "A club's day-to-day helper - content, news, messages.",
};

const RED = "#C8102E";
const INK = "#1A1A1A";
const PAPER = "#FBF7F0";
const LINE = "#E7DFD2";

const card: CSSProperties = { background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: 22, maxWidth: 560 };
const label: CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: INK, margin: "14px 0 5px" };
const input: CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 15, border: `1px solid ${LINE}`, borderRadius: 8, background: "#fff", boxSizing: "border-box" };

export function AddPerson() {
  const { isSuperadmin, isPlatformAdmin } = useAuth();

  const kinds = useMemo<Kind[]>(() => {
    const list: Kind[] = [];
    if (isSuperadmin) list.push("sportsweb_manager");
    if (isPlatformAdmin) list.push("sportsweb_admin", "club_senior_admin", "club_admin");
    return list;
  }, [isSuperadmin, isPlatformAdmin]);

  const [kind, setKind] = useState<Kind>(kinds[0] ?? "club_admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clubId, setClubId] = useState("");
  const [title, setTitle] = useState("");
  const [accountManager, setAccountManager] = useState("");
  const [founderName, setFounderName] = useState("");
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const isClubRole = kind === "club_admin" || kind === "club_senior_admin";

  useEffect(() => {
    if (!kinds.includes(kind)) setKind(kinds[0] ?? "club_admin");
  }, [kinds, kind]);

  useEffect(() => {
    if (!isClubRole || clubs.length || !supabase) return;
    supabase
      .from("clubs")
      .select("id,name,slug")
      .order("name")
      .then(({ data }) => {
        if (data) setClubs(data as ClubRow[]);
      });
  }, [isClubRole, clubs.length]);

  async function submit() {
    setResult(null);
    setCopied(false);
    if (!supabase) return setResult({ error: "Not connected." });
    const em = email.trim().toLowerCase();
    if (!em.includes("@")) return setResult({ error: "Enter a valid email address." });
    if (isClubRole && !clubId) return setResult({ error: "Choose which club this is for." });

    setBusy(true);
    const club = clubs.find((c) => c.id === clubId);
    const body: Record<string, unknown> = { kind, email: em, name: name.trim() };
    if (isClubRole) {
      body.club_id = clubId;
      body.club_name = club?.name ?? "your club";
      if (title.trim()) body.committee_title = title.trim();
      if (accountManager.trim()) body.account_manager = accountManager.trim();
    }
    if (kind === "sportsweb_manager" && founderName.trim()) body.founder_name = founderName.trim();

    const { data, error } = await supabase.functions.invoke("invite-user", { body });
    setBusy(false);
    if (error) return setResult({ error: error.message ?? "Request failed." });
    const r = data as Result;
    setResult(r);
    if (r.ok && !r.error) {
      setName(""); setEmail(""); setTitle("");
    }
  }

  if (kinds.length === 0) {
    return (
      <div style={card}>
        <p style={{ color: "#6b6b6b" }}>You do not have permission to add people.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: "0 0 4px" }}>Add a person</h1>
      <p style={{ color: "#6b6b6b", margin: "0 0 18px", fontSize: 14, maxWidth: 560 }}>
        Creates the account, grants the role and sends the right branded welcome email - in one step.
        A new person gets a temporary password (shown below after you add them).
      </p>

      <div style={card}>
        <label style={label}>Role</label>
        <select style={input} value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
          {kinds.map((k) => (
            <option key={k} value={k}>{KIND_LABEL[k]}</option>
          ))}
        </select>
        <p style={{ fontSize: 12.5, color: "#8a7f6c", margin: "6px 0 0" }}>{KIND_HINT[kind]}</p>

        <label style={label}>Full name</label>
        <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Smith" />

        <label style={label}>Email</label>
        <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />

        {isClubRole && (
          <>
            <label style={label}>Club</label>
            <select style={input} value={clubId} onChange={(e) => setClubId(e.target.value)}>
              <option value="">Choose a club...</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label style={label}>Committee title <span style={{ color: "#8a7f6c", fontWeight: 400 }}>(optional)</span></label>
            <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="President, Secretary..." />

            <label style={label}>Account manager name <span style={{ color: "#8a7f6c", fontWeight: 400 }}>(shown in their email)</span></label>
            <input style={input} value={accountManager} onChange={(e) => setAccountManager(e.target.value)} placeholder="Your name" />
          </>
        )}

        {kind === "sportsweb_manager" && (
          <>
            <label style={label}>Sign the founder email as <span style={{ color: "#8a7f6c", fontWeight: 400 }}>(optional)</span></label>
            <input style={input} value={founderName} onChange={(e) => setFounderName(e.target.value)} placeholder="Your name" />
          </>
        )}

        <button
          onClick={submit}
          disabled={busy}
          style={{
            marginTop: 20, background: busy ? "#b9737e" : RED, color: "#fff", border: "none",
            borderRadius: 8, padding: "12px 26px", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer",
          }}
        >
          {busy ? "Adding..." : "Add person & send welcome"}
        </button>
      </div>

      {result && (
        <div
          style={{
            ...card, marginTop: 16, maxWidth: 560,
            borderColor: result.error ? "#e3b3b9" : "#bcdcbc",
            background: result.error ? "#FBEDEE" : "#EEF6EE",
          }}
        >
          {result.error ? (
            <p style={{ margin: 0, color: "#9a2530", fontSize: 14 }}><strong>Could not add.</strong> {result.error}</p>
          ) : (
            <>
              <p style={{ margin: "0 0 8px", color: "#2e6b34", fontSize: 15 }}>
                <strong>{result.role_label}</strong> {result.created ? "account created" : "role granted (account already existed)"} for{" "}
                <span style={{ fontFamily: "monospace" }}>{result.email}</span>.
              </p>
              <p style={{ margin: "0 0 10px", color: "#3f3f3f", fontSize: 13.5 }}>
                {result.emailed ? "Welcome email sent." : "Email not sent (no mail provider configured) - share the details below manually."}
              </p>
              {result.temp_password && (
                <div style={{ background: INK, borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ color: "#fff", fontFamily: "monospace", fontSize: 15, letterSpacing: 1 }}>{result.temp_password}</span>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(result.temp_password ?? ""); setCopied(true); }}
                    style={{ background: "#fff", color: INK, border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
              {result.temp_password && (
                <p style={{ margin: "8px 0 0", color: "#8a7f6c", fontSize: 12 }}>Temporary password - they should change it after first sign-in.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
