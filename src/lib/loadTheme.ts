// One implementation of "resolve this club's theme tokens", so the client hook (useF2Theme)
// and the bake's payload loader (loadF2Payload) cannot drift. Its own module so the hook does
// not have to import the whole payload loader.
import { supabase } from "./supabase";

export type ThemeTokens = Record<string, string>;

export async function loadThemeForClub(clubId: string): Promise<ThemeTokens | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.from("clubs").select("theme_key").eq("id", clubId).maybeSingle();
  const key = (data as { theme_key?: string } | null)?.theme_key;
  if (!key) return undefined;
  const { data: t } = await supabase.from("club_themes").select("tokens").eq("key", key).maybeSingle();
  return (t as { tokens?: ThemeTokens } | null)?.tokens ?? undefined;
}
