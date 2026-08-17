// The data an F2 render needs besides the page itself: the club's section context (its real
// content, for Collection/Module sections to read) and its theme tokens.
//
// Extracted from F2Page so it can be fetched ONCE per view and shared. F2Site renders the
// chrome around the whole route tree — including the system-rendered news/event article
// routes — and those need the same ctx and theme the page does. Fetching per component would
// mean running buildClubConfig (roughly a dozen queries) twice for a single page view.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getClubConfigById } from "../lib/loadClub";
import type { ClubConfig } from "../content/types";
import { sectionContextFromClub, type SectionContext } from "./entitlement";

export interface F2ContextState {
  ctx: SectionContext | null;
  theme: Record<string, string> | undefined;
}

/** Pass `undefined` to skip fetching (when a caller already has these and passes them down). */
export function useF2Context(clubId: string | undefined): F2ContextState {
  const [ctx, setCtx] = useState<SectionContext | null>(null);
  const [theme, setTheme] = useState<Record<string, string> | undefined>(undefined);

  useEffect(() => {
    if (!clubId) return;
    let active = true;
    getClubConfigById(clubId).then((cfg: ClubConfig) => active && setCtx(sectionContextFromClub(cfg)));
    if (supabase) {
      supabase
        .from("clubs")
        .select("theme_key")
        .eq("id", clubId)
        .maybeSingle()
        .then(async ({ data }) => {
          const key = (data as { theme_key?: string } | null)?.theme_key;
          if (key && supabase) {
            const { data: t } = await supabase.from("club_themes").select("tokens").eq("key", key).maybeSingle();
            if (active) setTheme(((t as { tokens?: Record<string, string> } | null)?.tokens) ?? undefined);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [clubId]);

  return { ctx, theme };
}

/**
 * Declare this document an F2 render: sets data-render="f2" on <html>, which switches OFF the
 * legacy data-variant token blocks so club_themes.tokens is the sole token source.
 *
 * Owned by whoever renders the chrome, and by exactly one component at a time -- under F2Site
 * that is F2Site (the flag has to outlive any single page, because the system-rendered
 * news/event routes sit inside the same chrome and need the same tokens; when F2Page owned it,
 * navigating to an article unmounted the page, the cleanup stripped the attribute, and the
 * chrome silently fell back to legacy variant tokens). Standalone ?f2= use has no F2Site, so
 * F2Page owns it there instead -- hence the flag rather than an unconditional effect.
 */
export function useF2RenderRoot(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.setAttribute("data-render", "f2");
    return () => document.documentElement.removeAttribute("data-render");
  }, [enabled]);
}
