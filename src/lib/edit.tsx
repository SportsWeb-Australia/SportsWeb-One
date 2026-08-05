import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { uploadToStorage } from "./upload";
import { saveRestorePoint } from "./siteVersions";
import { useAuth } from "./auth";
import { useClub } from "../components/ClubContext";

const EDIT_CLUB_KEY = "sw1_edit_club";

interface EditState {
  /** True when the signed-in user may edit the club currently being viewed. */
  canEdit: boolean;
  /** Platform admin who COULD edit this club but must "act as" it first. */
  canActivate: boolean;
  /** True when a platform admin has activated editing for this (not-their-own) club. */
  actingAs: boolean;
  /** Start acting as the viewed club (platform admin opt-in, session-scoped). */
  activateEditing: () => void;
  /** Stop acting as the viewed club. */
  deactivateEditing: () => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  /** Current value for a content key: local edit → saved override → fallback. */
  value: (key: string, fallback: string) => string;
  /** Save a text value for a key. */
  save: (key: string, value: string) => Promise<void>;
  /** Upload + save an image for a key, returns the URL. */
  uploadImage: (key: string, file: File) => Promise<void>;
  busyKey: string | null;
  error: string | null;
  /** True once an edit has been staged this session (a draft is pending). */
  dirty: boolean;
  publishing: boolean;
  /** Promote this club's staged drafts to live. Resolves true on success. */
  publish: () => Promise<boolean>;
  /** The club currently being edited (its own id + display name). */
  clubId: string | null;
  clubName: string;
}

const Ctx = createContext<EditState | null>(null);

export function EditProvider({ children }: { children: ReactNode }) {
  const { membership, isPlatformAdmin } = useAuth();
  const { club } = useClub();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editClub, setEditClub] = useState<string | null>(() => {
    try { return sessionStorage.getItem(EDIT_CLUB_KEY); } catch { return null; }
  });
  // Guards the once-per-session "before edits" restore point.
  const snapDone = useRef(false);

  const base = club.content ?? {};
  // Who may edit the club being viewed:
  //  * a club admin viewing THEIR OWN club — always (membership match; also guards
  //    against editing another club via ?club=);
  //  * a platform admin (superadmin / sportsweb_manager) — only after they explicitly
  //    "act as" this club (session-scoped opt-in), so browsing to any club's public
  //    URL doesn't hand them a live editor by accident.
  // The DB enforces the same authority (club_content write policy + the publish/
  // restore RPCs all allow is_platform_admin() OR club member).
  const isOwnClubAdmin = !!membership && !!club.clubId && membership.clubId === club.clubId;
  const actingAs = isPlatformAdmin && !isOwnClubAdmin && !!club.clubId && editClub === club.clubId;
  const canEdit = !!club.clubId && (isOwnClubAdmin || actingAs);
  const canActivate = isPlatformAdmin && !isOwnClubAdmin && !!club.clubId && !actingAs;

  const activateEditing = () => {
    if (!club.clubId) return;
    try { sessionStorage.setItem(EDIT_CLUB_KEY, club.clubId); } catch { /* ignore */ }
    setEditClub(club.clubId);
  };
  const deactivateEditing = () => {
    try { sessionStorage.removeItem(EDIT_CLUB_KEY); } catch { /* ignore */ }
    setEditClub(null);
    setEditing(false);
  };

  // Entering edit mode opens a fresh session for the auto restore point.
  const beginEditing = (v: boolean) => {
    if (v) snapDone.current = false;
    setEditing(v);
  };

  const value = (key: string, fallback: string) =>
    key in overrides ? overrides[key] : key in base ? base[key] : fallback;

  const persist = async (key: string, val: string) => {
    if (!supabase || !club.clubId) return;
    // First staged change of a session: snapshot the current LIVE content so the
    // pre-edit state is recoverable even before (or without) a publish.
    if (!snapDone.current) {
      snapDone.current = true;
      saveRestorePoint(club.clubId, "Before edits").catch(() => { /* non-fatal */ });
    }
    setOverrides((o) => ({ ...o, [key]: val }));
    const { error: e } = await supabase
      .from("club_content")
      .upsert({ club_id: club.clubId, content_key: key, draft_value: val }, { onConflict: "club_id,content_key" });
    if (e) setError(e.message);
    else setDirty(true);
  };

  const publish = async (): Promise<boolean> => {
    if (!supabase || !club.clubId || publishing) return false;
    setPublishing(true);
    setError(null);
    const { error: e } = await supabase.rpc("publish_club_content", { p_club_id: club.clubId });
    setPublishing(false);
    if (e) {
      setError(e.message);
      return false;
    }
    setDirty(false);
    setEditing(false);
    return true;
  };

  const save = async (key: string, val: string) => {
    setBusyKey(key);
    setError(null);
    await persist(key, val);
    setBusyKey(null);
  };

  const uploadImage = async (key: string, file: File) => {
    if (!club.clubId) return;
    setBusyKey(key);
    setError(null);
    try {
      const url = await uploadToStorage(file, club.clubId, "page");
      await persist(key, url);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Upload failed.");
    }
    setBusyKey(null);
  };

  return (
    <Ctx.Provider
      value={{
        canEdit, canActivate, actingAs, activateEditing, deactivateEditing,
        editing, setEditing: beginEditing, value, save, uploadImage, busyKey, error, dirty, publishing, publish,
        clubId: club.clubId ?? null,
        clubName: club.identity?.name ?? "this club",
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useEdit(): EditState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEdit must be used within EditProvider");
  return c;
}
