import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

export interface ClubMembership {
  clubId: string;
  role: string | null;
  clubName?: string;
}

interface AuthState {
  ready: boolean;
  resolving: boolean;
  email: string | null;
  userId: string | null;
  membership: ClubMembership | null;
  isPlatformAdmin: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

async function resolveMembership(userId: string): Promise<ClubMembership | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("club_users")
    .select("club_id, role, clubs(name)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const clubs = data.clubs as { name?: string } | { name?: string }[] | null;
  const clubName = Array.isArray(clubs) ? clubs[0]?.name : clubs?.name;
  return { clubId: data.club_id, role: data.role ?? null, clubName };
}

async function resolvePlatformAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("is_platform_admin");
  return !error && data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [membership, setMembership] = useState<ClubMembership | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user) {
        setResolving(true);
        const [m, pa] = await Promise.all([resolveMembership(user.id), resolvePlatformAdmin()]);
        setMembership(m);
        setIsPlatformAdmin(pa);
        setResolving(false);
      }
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      if (user) {
        setResolving(true);
        const [m, pa] = await Promise.all([resolveMembership(user.id), resolvePlatformAdmin()]);
        setMembership(m);
        setIsPlatformAdmin(pa);
        setResolving(false);
      } else {
        setMembership(null);
        setIsPlatformAdmin(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (em: string, pw: string): Promise<string | null> => {
    if (!supabase) return "Supabase isn't configured.";
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    return error ? error.message : null;
  };

  const signOut = async (): Promise<void> => {
    await supabase?.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ ready, resolving, email, userId, membership, isPlatformAdmin, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
