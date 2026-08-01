import { createClient } from "@supabase/supabase-js";

// Same fallback project the client app ships with (src/lib/supabase.ts) —
// keeps these edge routes working even if the Vercel env vars aren't set.
const FALLBACK_URL = "https://uzibfawcwoapfbigpzum.supabase.co";
const FALLBACK_KEY = "sb_publishable_bxaxVOhm9-9wyRrsvJG7Sw_MxAZ-egN";
const DEFAULT_SLUG = process.env.VITE_CLUB_SLUG || "dookie-united";

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL || FALLBACK_URL,
  process.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY
);

/** Resolve which club a request is for, server-side: ?club= override (for
 *  testing on the shared platform host) -> club_domains -> {slug}.sportsweb.com.au
 *  -> DEFAULT_SLUG. Mirrors src/lib/supabase.ts's resolveClubSlug(). */
export async function resolveClub(req) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const qClub = url.searchParams.get("club");
  if (qClub) return qClub;

  const host = (req.headers.host || "").toLowerCase().split(":")[0];
  try {
    const { data } = await supabase.from("club_domains").select("slug").eq("host", host).maybeSingle();
    if (data && data.slug) return data.slug;
  } catch {
    /* table not present yet — fall through */
  }
  if (host.endsWith(".sportsweb.com.au")) {
    const label = host.split(".")[0];
    if (label && label !== "www" && label !== "app") return label;
  }
  return DEFAULT_SLUG;
}

export async function getClubForRequest(req) {
  const slug = await resolveClub(req);
  const { data: club } = await supabase.from("clubs").select("*").eq("slug", slug).maybeSingle();
  if (!club) return null;
  const [{ data: news }, { data: teams }, { data: events }] = await Promise.all([
    supabase.from("news").select("slug,title,published_at").eq("club_id", club.id).eq("status", "published"),
    supabase.from("teams").select("slug,name").eq("club_id", club.id).eq("status", "published"),
    supabase.from("events").select("slug,title,event_date").eq("club_id", club.id).eq("status", "published"),
  ]);
  return { club, news: news || [], teams: teams || [], events: events || [] };
}
