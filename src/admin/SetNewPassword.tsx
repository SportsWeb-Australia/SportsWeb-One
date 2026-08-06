import { useState } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

/**
 * Shown when the user follows a password-reset link (auth fires PASSWORD_RECOVERY,
 * which sets `recovering` in AuthProvider). They choose a new password here; on
 * success we clear recovery and the app continues to the admin as normal.
 */
export function SetNewPassword() {
  const { email, finishRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    if (!supabase) {
      setError("Supabase isn't configured.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    finishRecovery();
  };

  return (
    <div className="sw-entry sw-brandwrap">
      <div className="sw-entry-card">
        <div className="sw-login-brand">
          <span className="sw-login-mark">S1</span>
          <span className="sw-login-word">
            SportsWeb <span className="sw-login-one">One</span>
          </span>
        </div>

        <h1>Choose a new password</h1>
        <p>{email ? `Setting a new password for ${email}.` : "Set a new password for your account."}</p>

        {error && <p className="sw-admin-error">{error}</p>}

        <label className="sw-admin-field">
          <span>New password</span>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoComplete="new-password"
              style={{ width: "100%", paddingRight: 60 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              aria-pressed={showPw}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#2563eb", fontSize: 13,
                fontWeight: 600, cursor: "pointer", padding: 4,
              }}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <label className="sw-admin-field">
          <span>Confirm new password</span>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoComplete="new-password"
          />
        </label>
        <button className="sw-btn" onClick={submit} disabled={busy}>
          {busy ? "Saving…" : "Save new password"}
        </button>

        <p className="sw-login-sub">SportsWeb One · the operating system for community sport</p>
      </div>
    </div>
  );
}
