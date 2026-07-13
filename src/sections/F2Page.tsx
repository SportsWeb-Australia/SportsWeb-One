// F2 P2 -- PR 5: the F2 render entry. Fetch the layout via public_club_page, build the
// section data context, apply the club's theme tokens at the page root, and walk it through
// PageRenderer. Sets data-render="f2" on <html> so the legacy data-variant token blocks go
// dark and club_themes.tokens is the sole token source (the door fix).
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getClubConfigById } from "../lib/loadClub";
import type { ClubConfig } from "../content/types";
import { PageRenderer } from "./PageRenderer";
import { sectionContextFromClub, type SectionContext } from "./entitlement";
import { usePublicClubPage } from "./usePublicClubPage";

export function F2Page({ clubId, slug = "home" }: { clubId: string; slug?: string }) {
  const [ctx, setCtx] = useState<SectionContext | null>(null);
  const [theme, setTheme] = useState<Record<string, string> | undefined>(undefined);
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

  if (loading || !ctx) return <div className="sw-admin-loading">Loading&hellip;</div>;
  if (notFound || !page) return <div className="sw-admin-loading">This page is not published yet.</div>;
  return <PageRenderer layout={page.layout} ctx={ctx} theme={theme} />;
}
