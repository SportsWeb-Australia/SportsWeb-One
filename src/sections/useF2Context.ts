// The data an F2 render needs besides the page itself: the club's section context (its real
// content, for Collection/Module sections to read) and its theme tokens.
//
// Extracted from F2Page so it can be fetched ONCE per view and shared. F2Site renders the
// chrome around the whole route tree -- including the system-rendered news/event article
// routes -- and those need the same ctx and theme the page does.
import { useEffect, useState } from "react";
import { getClubConfigById } from "../lib/loadClub";
import type { ClubConfig } from "../content/types";
import { loadThemeForClub, type ThemeTokens } from "../lib/loadTheme";
import { sectionContextFromClub, type SectionContext } from "./entitlement";
import { useF2SeedClubWide } from "./F2Seed";

export interface F2ContextState {
  ctx: SectionContext | null;
  theme: ThemeTokens | undefined;
}

/**
 * The club's theme tokens.
 *
 * Seeded on a pre-rendered page (the tokens are inline styles on the chrome and the page root,
 * so fetching them a second time would repaint on hydration).
 */
export function useF2Theme(clubId: string | undefined): ThemeTokens | undefined {
  const seed = useF2SeedClubWide();
  const [theme, setTheme] = useState<ThemeTokens | undefined>(seed?.theme);

  useEffect(() => {
    if (seed || !clubId) return;
    let active = true;
    loadThemeForClub(clubId).then((t) => active && setTheme(t));
    return () => {
      active = false;
    };
  }, [clubId, seed]);

  return seed ? seed.theme : theme;
}

/**
 * ctx + theme for a caller that has only a club id.
 *
 * F2Site does NOT use this: it already holds the resolved ClubConfig, so it builds ctx
 * synchronously with sectionContextFromClub and skips this fetch entirely -- building the
 * config is roughly a dozen queries, and doing it twice per page view was pure waste. This
 * remains for the ?f2= preview and the composer, which are handed a club id and nothing else.
 *
 * Pass `undefined` to skip fetching.
 */
export function useF2Context(clubId: string | undefined): F2ContextState {
  const [ctx, setCtx] = useState<SectionContext | null>(null);
  const theme = useF2Theme(clubId);

  useEffect(() => {
    if (!clubId) return;
    let active = true;
    getClubConfigById(clubId).then((cfg: ClubConfig) => active && setCtx(sectionContextFromClub(cfg)));
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
 *
 * A baked F2 page ships the attribute in its HTML (api/bake.js), so the served markup paints
 * with the club's tokens before any JavaScript runs; this effect is then a no-op re-set.
 */
export function useF2RenderRoot(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.setAttribute("data-render", "f2");
    return () => document.documentElement.removeAttribute("data-render");
  }, [enabled]);
}
