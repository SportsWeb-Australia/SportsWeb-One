// F2 P2 -- PR 3: the renderer's data entry point.
// Calls the single public read RPC (public_club_page) and returns the raw layout document
// for PageRenderer to walk. The RPC returns published_layout for a published club, draft_layout
// for a valid preview token, else zero rows (never leaks existence). NO direct table access.
//
// Phase 2: when this render is a publish-time bake or the hydration of one, the layout is
// already in hand (src/lib/f2Payload.ts) and fetching it again would both waste a round trip
// and risk rendering something different from the served markup. The seed wins; the fetch is
// the fallback.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { mapPageRow, type PublicPage } from "../lib/f2Payload";
import { useF2Seed } from "./F2Seed";

export type { PublicPage };

export interface PublicPageState {
  page: PublicPage | null;
  loading: boolean;
  /** True when the RPC returned zero rows (unpublished/no such page) -- NOT an error. */
  notFound: boolean;
}

export function usePublicClubPage(
  clubId: string | undefined,
  slug: string,
  previewToken?: string | null,
): PublicPageState {
  const seed = useF2Seed(slug);
  const [state, setState] = useState<PublicPageState>({ page: null, loading: true, notFound: false });

  useEffect(() => {
    // Seeded: nothing to fetch, and nothing to wait for.
    if (seed) return;
    let active = true;
    if (!supabase || !clubId) {
      setState({ page: null, loading: false, notFound: true });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    supabase
      .rpc("public_club_page", { p_club_id: clubId, p_slug: slug, p_preview_token: previewToken ?? null })
      .then(({ data, error }) => {
        if (!active) return;
        const row = Array.isArray(data) ? data[0] : data;
        const page = error ? null : mapPageRow(row);
        setState({ page, loading: false, notFound: !page });
      });
    return () => {
      active = false;
    };
  }, [clubId, slug, previewToken, seed]);

  // Returned during render, not copied into state: a seeded render must produce its markup on
  // the FIRST pass (renderToString never gets a second one).
  if (seed) return { page: seed.page, loading: false, notFound: !seed.page };
  return state;
}
