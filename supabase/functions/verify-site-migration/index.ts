// SportsWeb One — verify-site-migration Edge Function
// ---------------------------------------------------------------------------
// Phase 2 of the Site Migrations tracker. Given a club_id, it fetches the club's
// domain from site_migrations and checks the two things the SOP cares about:
//   (a) www.<domain> serves over HTTPS from Cloudflare (Pages), and
//   (b) the bare <domain> redirects to www.
// If BOTH pass, it ticks the 'live_verified' step via set_site_migration_step.
// It never un-ticks and never touches any other step — a failed check just
// returns diagnostics so the operator can see what's not ready yet.
//
// Auth: caller must be a signed-in platform admin (superadmin / sportsweb_manager),
// validated exactly like sitepulse-send-update. The step write goes through the
// caller's JWT so the RPC's is_platform_admin() guard still applies.
//
// Deploy:  supabase functions deploy verify-site-migration
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected.)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/** Strip protocol / leading www / trailing slash; lower-case. */
function bareDomain(input: string): string {
  let d = (input || "").trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
  return d;
}

/** Fetch with an 8s timeout so a dead domain can't stall the function. */
async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { "User-Agent": "SportsWeb-verify/1.0", ...(init.headers || {}) } });
  } finally {
    clearTimeout(t);
  }
}

/** (a) www serves over HTTPS from Cloudflare. Pages always sends a cf-ray header. */
async function checkWww(bare: string) {
  const target = `https://www.${bare}/`;
  try {
    const res = await fetchWithTimeout(target, { redirect: "follow" });
    const server = (res.headers.get("server") || "").toLowerCase();
    const cloudflare = !!res.headers.get("cf-ray") || server.includes("cloudflare");
    return { ok: res.ok && cloudflare, https: true, status: res.status, cloudflare, finalUrl: res.url };
  } catch (e) {
    return { ok: false, https: false, error: String(e) };
  }
}

/** (b) bare domain redirects to www. Deno hides headers on manual redirects, so
 *  we follow the chain and confirm it lands on a www host (res.redirected=true). */
async function checkRedirect(bare: string) {
  const target = `https://${bare}/`;
  try {
    const res = await fetchWithTimeout(target, { redirect: "follow" });
    let finalHost = "";
    try { finalHost = new URL(res.url).host.toLowerCase(); } catch { /* ignore */ }
    const toWww = finalHost === `www.${bare}` || finalHost.startsWith("www.");
    return { ok: res.redirected && toWww && res.ok, redirected: res.redirected, finalUrl: res.url, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // Caller must be a signed-in platform admin (same gate as sitepulse-send-update).
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  const svc = createClient(url, svcKey);
  const { data: role } = await svc
    .from("platform_user_roles").select("role")
    .eq("user_id", user.id).in("role", ["superadmin", "sportsweb_manager"]).maybeSingle();
  if (!role) return json({ error: "forbidden" }, 403);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const clubId = typeof body.club_id === "string" ? body.club_id : "";
  if (!clubId) return json({ error: "club_id required" }, 400);

  const { data: mig } = await svc
    .from("site_migrations").select("domain, flow").eq("club_id", clubId).maybeSingle();
  if (!mig?.domain) return json({ error: "no migration record / domain for this club" }, 400);

  const bare = bareDomain(mig.domain as string);
  const [www, redirect] = await Promise.all([checkWww(bare), checkRedirect(bare)]);
  const verified = www.ok && redirect.ok;

  // Only tick on success; never un-tick. Write through the caller's JWT so the
  // RPC's own is_platform_admin() guard applies.
  let stepUpdated = false;
  let stepError: string | null = null;
  if (verified) {
    const { error } = await userClient.rpc("set_site_migration_step", {
      p_club_id: clubId,
      p_step: "live_verified",
      p_done: true,
    });
    if (error) stepError = error.message;
    else stepUpdated = true;
  }

  return json({
    ok: true,
    club_id: clubId,
    domain: bare,
    verified,
    live_verified_set: stepUpdated,
    step_error: stepError,
    checks: {
      www: { ...www, hint: www.ok ? "www serves over HTTPS from Cloudflare" : "www is not yet on Cloudflare over HTTPS" },
      root_redirect: { ...redirect, hint: redirect.ok ? "bare domain redirects to www" : "bare domain does not redirect to www yet" },
    },
  });
});
