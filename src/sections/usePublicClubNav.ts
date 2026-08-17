// F2 -- the public nav data entry point. Mirrors usePublicClubPage.ts's shape: one RPC,
// public_club_nav(club_id), never direct table access (club_pages has no anon grant).
// Builds the one-level dropdown tree from nav_parent_id -- flat rows in, nested items out.
//
// Phase 2: a pre-rendered page carries its nav in the payload (src/lib/f2Payload.ts), so the
// chrome renders complete markup server-side instead of an empty menu. The tree builder itself
// moved to f2Payload so the bake can use it without React; re-exported here because that is
// where the rest of the app imports NavItem from.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { buildNavTree, type NavItem } from "../lib/f2Payload";
import { useF2SeedClubWide } from "./F2Seed";

export type { NavItem };

export interface PublicNavState {
  items: NavItem[];
  loading: boolean;
}

export function usePublicClubNav(clubId: string | undefined, previewToken?: string | null): PublicNavState {
  const seed = useF2SeedClubWide();
  const [state, setState] = useState<PublicNavState>({ items: [], loading: true });

  useEffect(() => {
    if (seed) return;
    let active = true;
    if (!supabase || !clubId) {
      setState({ items: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    supabase
      .rpc("public_club_nav", { p_club_id: clubId, p_preview_token: previewToken ?? null })
      .then(({ data, error }) => {
        if (!active) return;
        setState({ items: error ? [] : buildNavTree(Array.isArray(data) ? data : []), loading: false });
      });
    return () => {
      active = false;
    };
    // previewToken belongs in here: it is passed to the RPC, and omitting it meant a nav
    // fetched before a preview token resolved never re-ran, leaving a draft reviewer with the
    // published menu (or none).
  }, [clubId, previewToken, seed]);

  if (seed) return { items: seed.nav, loading: false };
  return state;
}
