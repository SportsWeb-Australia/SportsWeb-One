// F2 P2 -- PR 3: the renderer's data entry point.
// Calls the single public read RPC (public_club_page) and returns the raw layout document
// for PageRenderer to walk. The RPC returns published_layout for a published club, draft_layout
// for a valid preview token, else zero rows (never leaks existence). NO direct table access.
// Wired into the app + proven end-to-end at PR 5.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface PublicPage {
  layout: unknown; // jsonb array of section instances (walked by PageRenderer)
  seo: Record<string, unknown>;
  title: string | null;
  /** club_pages.layout_mode, passed through by public_club_page. Defaults to 'stack' if the
   *  RPC hasn't been migrated yet (supabase/f2-sidebar-layout.sql, hand-over only). */
  layoutMode: "stack" | "main-side";
}

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
  const [state, setState] = useState<PublicPageState>({ page: null, loading: true, notFound: false });

  useEffect(() => {
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
        if (error || !row) {
          setState({ page: null, loading: false, notFound: true });
          return;
        }
        const mode = (row as any).layout_mode;
        setState({
          page: {
            layout: (row as any).layout ?? [],
            seo: (row as any).seo ?? {},
            title: (row as any).title ?? null,
            layoutMode: mode === "main-side" ? "main-side" : "stack",
          },
          loading: false,
          notFound: false,
        });
      });
    return () => {
      active = false;
    };
  }, [clubId, slug, previewToken]);

  return state;
}
