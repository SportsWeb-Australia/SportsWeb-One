// F2 P2 -- PR 5 (+ Brief 10 chrome): the F2 render entry. Fetch the layout via
// public_club_page, build the section data context, fetch the nav from club_pages, apply the
// club's theme tokens at the page root, and walk it through PageRenderer -- all inside the
// .sw-f2 scope so rdca.css (chrome + sections) applies and cannot leak elsewhere. Sets
// data-render="f2" so the legacy data-variant token blocks go dark.
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getClubConfigById } from "../lib/loadClub";
import type { ClubConfig } from "../content/types";
import { PageRenderer } from "./PageRenderer";
import { sectionContextFromClub, type SectionContext } from "./entitlement";
import { usePublicClubPage } from "./usePublicClubPage";
import { Header, Footer, buildNav, type NavNode, type NavPageRow } from "./chrome";

export function F2Page({ clubId, slug = "home" }: { clubId: string; slug?: string }) {
  const [ctx, setCtx] = useState<SectionContext | null>(null);
  const [theme, setTheme] = useState<Record<string, string> | undefined>(undefined);
  const [nav, setNav] = useState<NavNode[]>([]);
  const { page, loading, notFound } = usePublicClubPage(clubId, slug);

  // Declare this an F2 render: legacy data-variant token blocks stop applying.
  useEffect(() => {
    document.documentElement.setAttribute("data-render", "f2");
    return () => document.documentElement.removeAttribute("data-render");
  }, []);

  // Section data context (from the club's real content) + the club's theme tokens.
  useEffect(() => {
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

  // Nav from club_pages (nav_* columns) -- one dropdown level via nav_parent_id.
  useEffect(() => {
    let active = true;
    if (!supabase) return;
    supabase
      .from("club_pages")
      .select("id, slug, nav_label, nav_order, nav_visible, nav_parent_id")
      .eq("club_id", clubId)
      .then(({ data }) => {
        if (active) setNav(buildNav((data as NavPageRow[]) ?? [], slug));
      });
    return () => {
      active = false;
    };
  }, [clubId, slug]);

  if (loading || !ctx) return <div className="sw-admin-loading">Loading&hellip;</div>;
  if (notFound || !page) return <div className="sw-admin-loading">This page is not published yet.</div>;

  return (
    <div className="sw-f2">
      <Header ctx={ctx} nav={nav} register={{ label: "Register", href: "/register" }} />
      <PageRenderer layout={page.layout} ctx={ctx} theme={theme} />
      <Footer ctx={ctx} nav={nav} />
    </div>
  );
}
