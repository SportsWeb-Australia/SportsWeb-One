import { createContext, useContext, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { uploadToStorage } from "./upload";
import { useAuth } from "./auth";
import { useClub } from "../components/ClubContext";

interface EditState {
  /** True when an admin for this club is signed in. */
  canEdit: boolean;
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
  /** Promote this club's staged drafts to live. */
  publish: () => Promise<void>;
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

  const base = club.content ?? {};
  // On-page editing targets the club currently being viewed (club.clubId). It is
  // allowed for a club admin viewing THEIR OWN club (guards against editing another
  // club via ?club=), and for any platform admin (superadmin / sportsweb_manager),
  // who acts across clubs and has no per-club membership row. The DB enforces the
  // same rule: club_content's write policy and publish_club_content both allow
  // is_platform_admin() OR club member. Edits stage to draft_value and only go
  // public on Publish (same flow as the admin panel).
  const canEdit =
    !!club.clubId && (isPlatformAdmin || (!!membership && membership.clubId === club.clubId));

  const value = (key: string, fallback: string) =>
    key in overrides ? overrides[key] : key in base ? base[key] : fallback;

  const persist = async (key: string, val: string) => {
    if (!supabase || !club.clubId) return;
    setOverrides((o) => ({ ...o, [key]: val }));
    const { error: e } = await supabase
      .from("club_content")
      .upsert({ club_id: club.clubId, content_key: key, draft_value: val }, { onConflict: "club_id,content_key" });
    if (e) setError(e.message);
    else setDirty(true);
  };

  const publish = async () => {
    if (!supabase || !club.clubId || publishing) return;
    setPublishing(true);
    setError(null);
    const { error: e } = await supabase.rpc("publish_club_content", { p_club_id: club.clubId });
    setPublishing(false);
    if (e) {
      setError(e.message);
      return;
    }
    setDirty(false);
    setEditing(false);
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
    <Ctx.Provider value={{ canEdit, editing, setEditing, value, save, uploadImage, busyKey, error, dirty, publishing, publish }}>
      {children}
    </Ctx.Provider>
  );
}

export function useEdit(): EditState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEdit must be used within EditProvider");
  return c;
}
