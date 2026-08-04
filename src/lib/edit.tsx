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
  const { membership } = useAuth();
  const { club } = useClub();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const base = club.content ?? {};
  // On-page editing: allowed only when a signed-in admin is viewing THEIR OWN club's
  // site (guards against editing another club via ?club=). Edits stage to draft_value;
  // they only go public when the admin hits Publish (same flow as the admin panel).
  const canEdit = !!membership && !!club.clubId && membership.clubId === club.clubId;

  const value = (key: string, fallback: string) =>
    key in overrides ? overrides[key] : key in base ? base[key] : fallback;

  const persist = async (key: string, val: string) => {
    if (!membership || !supabase) return;
    setOverrides((o) => ({ ...o, [key]: val }));
    const { error: e } = await supabase
      .from("club_content")
      .upsert({ club_id: membership.clubId, content_key: key, draft_value: val }, { onConflict: "club_id,content_key" });
    if (e) setError(e.message);
    else setDirty(true);
  };

  const publish = async () => {
    if (!membership || !supabase || publishing) return;
    setPublishing(true);
    setError(null);
    const { error: e } = await supabase.rpc("publish_club_content", { p_club_id: membership.clubId });
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
    if (!membership) return;
    setBusyKey(key);
    setError(null);
    try {
      const url = await uploadToStorage(file, membership.clubId, "page");
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
