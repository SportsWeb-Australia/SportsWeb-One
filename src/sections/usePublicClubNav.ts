// F2 -- the public nav data entry point. Mirrors usePublicClubPage.ts's shape: one RPC,
// public_club_nav(club_id), never direct table access (club_pages has no anon grant).
// Builds the one-level dropdown tree from nav_parent_id -- flat rows in, nested items out.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface NavItem {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  isHome: boolean;
  children: NavItem[];
}

export interface PublicNavState {
  items: NavItem[];
  loading: boolean;
}

interface NavRow {
  id: string;
  slug: string;
  title: string;
  nav_label: string | null;
  nav_order: number | null;
  nav_parent_id: string | null;
  is_home: boolean;
}

function buildTree(rows: NavRow[]): NavItem[] {
  const byId = new Map<string, NavItem>(
    rows.map((r) => [r.id, { id: r.id, slug: r.slug, title: r.title, navLabel: r.nav_label ?? r.title, isHome: r.is_home, children: [] }]),
  );
  const roots: NavItem[] = [];
  for (const r of rows) {
    const item = byId.get(r.id)!;
    const parent = r.nav_parent_id ? byId.get(r.nav_parent_id) : undefined;
    // A dangling parent reference (parent not itself nav-visible/published) -> surface at
    // top level rather than silently dropping the page. Never lose a real, live page.
    (parent ? parent.children : roots).push(item);
  }
  return roots;
}

export function usePublicClubNav(clubId: string | undefined, previewToken?: string | null): PublicNavState {
  const [state, setState] = useState<PublicNavState>({ items: [], loading: true });

  useEffect(() => {
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
        const rows = (Array.isArray(data) ? data : []) as NavRow[];
        setState({ items: error ? [] : buildTree(rows), loading: false });
      });
    return () => {
      active = false;
    };
  }, [clubId]);

  return state;
}
