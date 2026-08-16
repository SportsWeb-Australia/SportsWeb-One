import { supabase, resolveClub } from "./_club.js";
import { SHELL_HTML } from "./_shell.mjs";

/**
 * Serving path for public club pages.
 *
 * Sits in front of the SPA: serves publish-time-baked HTML when there is any, and
 * otherwise hands back the exact shell Vercel would have served anyway. Every branch
 * that isn't "a published, allowlisted club with a cached page" ends at the shell, so
 * the worst case is today's behaviour rather than an error.
 *
 * Reads through the publishable key, so RLS decides what is visible: a draft or
 * suspended club simply returns no row and falls through. The cache read then goes via
 * public_club_page_cache, which independently re-checks live publish status. Two gates,
 * neither trusting the other, and neither trusting club_status_at_bake.
 */

/** SPA routes that must never be answered from the cache. */
const APP_PREFIXES = ["/admin", "/start", "/guide"];

/**
 * Query params that put the app in a mode a baked page cannot represent — a draft
 * preview, the composer, the F2 renderer, a club/variant override. Any of these falls
 * back to the client-rendered shell.
 *
 * `preview` matters most: a valid token means "show me the draft", and cached HTML is
 * by definition the published render. public_club_page_cache refuses a token too; this
 * is the outer of the two gates.
 */
const DYNAMIC_PARAMS = ["preview", "compose", "f2", "club", "variant"];

function sendShell(res, reason) {
  res.setHeader("content-type", "text/html; charset=utf-8");
  // The shell is the app's entry point and must never be held by a cache — the moment
  // a club publishes, the next request should be able to get baked HTML instead.
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-sw1-render", `shell:${reason}`);
  return res.status(200).send(SHELL_HTML);
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return sendShell(res, "non-get");

  const url = new URL(req.url, `https://${req.headers.host}`);

  // Pilot gate first, because it needs no I/O. With the allowlist unset this whole
  // path is inert and every request gets exactly what it gets today.
  const allowlist = (process.env.BAKE_PILOT_CLUB_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowlist.length) return sendShell(res, "pilot-off");

  if (APP_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) {
    return sendShell(res, "app-route");
  }
  if (DYNAMIC_PARAMS.some((p) => url.searchParams.has(p))) return sendShell(res, "dynamic-mode");

  // "/about/" and "/about" are the same page; the cache is keyed on the unslashed form.
  const route = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : "/";

  try {
    const slug = await resolveClub(req);
    // RLS gate: a club that isn't published isn't readable here at all.
    const { data: club } = await supabase
      .from("clubs")
      .select("id,website_status")
      .eq("slug", slug)
      .maybeSingle();
    if (!club) return sendShell(res, "club-not-public");
    if (!allowlist.includes(club.id)) return sendShell(res, "club-not-in-pilot");
    if (club.website_status !== "published") return sendShell(res, "not-published");

    // Access control lives in the RPC, not here.
    const { data, error } = await supabase.rpc("public_club_page_cache", {
      p_club_id: club.id,
      p_route: route,
      p_preview_token: null,
    });
    if (error) return sendShell(res, "rpc-error");

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.html) return sendShell(res, "no-cache-row");

    res.setHeader("content-type", "text/html; charset=utf-8");
    // Deliberately short. A publish re-bakes the row, and this is the window in which
    // an already-served page can still be the old one; 60s keeps that window small
    // while still absorbing a burst.
    res.setHeader("cache-control", "public, max-age=60, stale-while-revalidate=300");
    res.setHeader("x-sw1-render", "cache");
    res.setHeader("x-sw1-baked-at", String(row.baked_at ?? ""));
    return res.status(200).send(row.html);
  } catch {
    // A cache miss must never be worse than no cache at all.
    return sendShell(res, "error");
  }
}
