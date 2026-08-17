import { createClient } from "@supabase/supabase-js";
import {
  renderRouteToHtml,
  renderF2RouteToHtml,
  getClubConfigForClubId,
  loadF2Payload,
  loadF2PageIndex,
  slugForPath,
} from "./_ssr.mjs";
import { SHELL_HTML } from "./_shell.mjs";

/**
 * Publish-time bake: render a club's public pages to HTML.
 *
 * Triggered by the publish RPCs (supabase/publish-bake-notify.sql), not by
 * visitors, and authenticated with a shared secret the same way sitepulse-notify
 * is — never an open URL.
 *
 * Reads through the same publishable/anon key the browser uses, deliberately. RLS
 * then gives the bake exactly the visibility a member of the public has, so a
 * baked page cannot contain anything a visitor could not already see, and an
 * unpublished club simply fails to resolve rather than leaking. Only the cache
 * write (step 4) uses elevated credentials.
 */

/**
 * Write client. The ONLY elevated credential in this repo's serverless code, and it
 * is used for nothing but writing club_page_cache — reads deliberately stay on the
 * publishable key so the bake can never capture more than the public can see.
 * Created per request rather than at module scope so a missing key fails the one
 * request that needs it instead of the whole function's cold start.
 */
function cacheWriteClient() {
  const url = process.env.VITE_SUPABASE_URL || "https://uzibfawcwoapfbigpzum.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Replace this club's cached pages with the freshly baked set.
 *
 * Upsert first, then delete whatever is no longer in the set — never the other way
 * round, so there is no window where a published club has no cache at all. The prune
 * is what stops a deleted news article serving from cache forever.
 */
async function persist(db, clubId, pages, club, source) {
  // An empty set is never a legitimate bake, and it MUST NOT reach the prune below: the
  // `not in ()` filter that follows would be malformed with no routes to keep. The legacy path
  // could not hit this (it always renders at least the ten static routes), but an F2 club with
  // no published pages can.
  if (!pages.length) throw new Error("refusing to bake an empty page set");

  const rows = pages.map((p) => ({
    club_id: clubId,
    route: p.route,
    html: p.html,
    seo: p.seo ?? {},
    club_config: club,
    source,
    baked_at: new Date().toISOString(),
    club_status_at_bake: club.websiteStatus ?? "published",
  }));

  // One statement, so the whole set lands or none of it does.
  const { error: upsertError } = await db
    .from("club_page_cache")
    .upsert(rows, { onConflict: "club_id,route" });
  if (upsertError) throw new Error(`cache upsert failed — ${upsertError.message}`);

  const { data: pruned, error: pruneError } = await db
    .from("club_page_cache")
    .delete()
    .eq("club_id", clubId)
    .not("route", "in", `(${pages.map((p) => `"${p.route}"`).join(",")})`)
    .select("route");
  if (pruneError) throw new Error(`cache prune failed — ${pruneError.message}`);

  return { written: rows.length, pruned: (pruned ?? []).map((r) => r.route) };
}

/** Routes that exist for every club, in the order they appear in the nav. */
const STATIC_ROUTES = [
  "/",
  "/about",
  "/teams",
  "/fixtures",
  "/news",
  "/events",
  "/sponsors",
  "/documents",
  "/contact",
  "/register",
];

/** Per-sport landing pages, only for the sports this club actually plays. */
const SPORT_ROUTES = { Football: "/football", Netball: "/netball" };

function routesFor(club) {
  const routes = [...STATIC_ROUTES];
  for (const sport of club.identity?.sports ?? []) {
    const route = SPORT_ROUTES[sport];
    if (route) routes.push(route);
  }
  for (const post of club.news ?? []) if (post.slug) routes.push(`/news/${post.slug}`);
  for (const ev of club.events ?? []) if (ev.slug) routes.push(`/events/${ev.slug}`);
  // De-duplicate: a club could, in principle, produce the same slug twice.
  return [...new Set(routes)];
}

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
/** </script> inside JSON would close the tag early. */
const escapeJson = (s) => s.replace(/</g, "\\u003c");

/** Build the per-route <head> tags from the same computeSeoTags the client uses. */
function headTags(seo) {
  const tags = [];
  const meta = (attr, key, content) =>
    tags.push(`<meta ${attr}="${key}" content="${escapeAttr(content)}" />`);

  if (seo.page?.description) {
    meta("name", "description", seo.page.description);
    meta("property", "og:description", seo.page.description);
    meta("name", "twitter:description", seo.page.description);
  }
  if (seo.page?.title) {
    meta("property", "og:title", seo.page.title);
    meta("name", "twitter:title", seo.page.title);
  }
  meta("property", "og:type", "website");
  meta("property", "og:url", seo.ogUrl);
  if (seo.siteName) meta("property", "og:site_name", seo.siteName);
  const image = seo.page?.image || seo.ogImage;
  if (image) {
    meta("property", "og:image", image);
    meta("name", "twitter:image", image);
    meta("name", "twitter:card", "summary_large_image");
  }
  tags.push(`<link rel="canonical" href="${escapeAttr(seo.canonical)}" />`);
  if (seo.favicon) tags.push(`<link rel="icon" href="${escapeAttr(seo.favicon)}" />`);
  if (seo.jsonLd) {
    tags.push(
      `<script type="application/ld+json" id="club-jsonld">${escapeJson(JSON.stringify(seo.jsonLd))}</script>`
    );
  }
  return tags.join("\n    ");
}

/**
 * Assemble a full document: the built shell (so hashed asset URLs always match the
 * deployment that baked it), the rendered markup in #root, per-route head tags,
 * and the config the client hydrates from.
 */
function assemblePage(shell, rendered, club, f2Payload) {
  let html = shell;

  // An F2 page's colours come from club_themes tokens, which only apply while <html> carries
  // data-render="f2" (it switches the legacy data-variant blocks off). The client sets it in an
  // effect; a baked page has to ship it in the markup, or the served HTML paints with legacy
  // tokens until JavaScript boots -- a visible flash of the wrong brand.
  if (f2Payload) html = html.replace(/<html([^>]*)>/, '<html$1 data-render="f2">');

  const title = rendered.seo.page?.title;
  if (title) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`);

  // Drop the shell's neutral platform defaults; the club's own tags replace them.
  html = html.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, "");
  html = html.replace(/\s*<meta\s+property="og:site_name"[^>]*>/, "");
  html = html.replace(/\s*<meta\s+property="og:type"[^>]*>/, "");
  html = html.replace(/\s*<meta\s+property="og:image"[^>]*>/, "");
  html = html.replace(/\s*<meta\s+name="twitter:card"[^>]*>/, "");

  html = html.replace("</head>", `  ${headTags(rendered.seo)}\n  </head>`);

  let hydration = `<script id="sw1-hydration-data" type="application/json">${escapeJson(
    JSON.stringify(club)
  )}</script>`;
  // F2's page layout, nav and theme arrive through effects the server never ran, so the browser
  // needs the same three values to reproduce this markup on its first render. Without them it
  // would fetch, render something different, and throw the server markup away.
  if (f2Payload) {
    hydration += `\n    <script id="sw1-f2-data" type="application/json">${escapeJson(
      JSON.stringify(f2Payload)
    )}</script>`;
  }
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${rendered.html}</div>\n    ${hydration}`
  );

  return html;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const expected = process.env.BAKE_WEBHOOK_SECRET;
  if (!expected) return res.status(500).json({ error: "BAKE_WEBHOOK_SECRET not configured" });
  if (req.headers["x-webhook-secret"] !== expected) {
    return res.status(401).json({ error: "unauthorised" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
  const clubId = body.club_id;
  if (!clubId) return res.status(400).json({ error: "club_id is required" });

  // Pilot gate: mirrors api/render.js's allowlist so a stray trigger for another
  // club can't bake it. Empty/unset allowlist bakes nothing.
  const allowlist = (process.env.BAKE_PILOT_CLUB_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowlist.includes(clubId)) {
    return res.status(403).json({ error: "club not in BAKE_PILOT_CLUB_IDS", club_id: clubId });
  }

  const origin = body.origin || `https://${req.headers.host}`;

  let club;
  try {
    club = await getClubConfigForClubId(clubId);
  } catch (e) {
    // Unresolvable club (unpublished, deleted, or a read failure). Abort without
    // touching the cache so the previously baked pages keep serving.
    return res.status(404).json({ error: String(e.message ?? e), club_id: clubId });
  }

  // Which renderer this club's public site uses decides what "its pages" even means: a fixed
  // route list for a legacy club, the club's own club_pages addresses for an F2 one.
  const isF2 = club.renderMode === "f2";
  const pages = [];
  const failures = [];

  if (isF2) {
    let index;
    try {
      index = await loadF2PageIndex(clubId);
    } catch (e) {
      return res.status(500).json({ error: String(e.message ?? e), club_id: clubId, stage: "page-index" });
    }
    // Its own pages, plus the article routes -- which are real URLs on an F2 club too (the
    // news/events routes F2Site declares), and would otherwise be the only pages on the site
    // left client-rendered.
    const routes = [
      ...index.map((p) => (p.isHome ? "/" : `/${p.slug}`)),
      ...(club.news ?? []).filter((n) => n.slug).map((n) => `/news/${n.slug}`),
      ...(club.events ?? []).filter((e) => e.slug).map((e) => `/events/${e.slug}`),
    ];
    for (const route of [...new Set(routes)]) {
      try {
        const payload = await loadF2Payload(clubId, slugForPath(route));
        const rendered = renderF2RouteToHtml(club, route, payload, origin);
        // null = a page route whose row vanished between the index read and now. Skip it rather
        // than caching a 404 that would outlive the page's return.
        if (!rendered) continue;
        pages.push({
          route,
          html: assemblePage(SHELL_HTML, rendered, club, payload),
          seo: rendered.seo,
        });
      } catch (e) {
        failures.push({ route, error: String(e.message ?? e) });
      }
    }
  } else {
    for (const route of routesFor(club)) {
      try {
        const rendered = renderRouteToHtml(club, club.variant, route, origin);
        pages.push({ route, html: assemblePage(SHELL_HTML, rendered, club), seo: rendered.seo });
      } catch (e) {
        failures.push({ route, error: String(e.message ?? e) });
      }
    }
  }

  // A partial bake would leave the cache half-old and half-new, which is worse
  // than leaving it alone. All routes must render.
  if (failures.length) {
    return res.status(500).json({ error: "render failed; cache left unchanged", club_id: clubId, failures });
  }

  const summary = pages.map((p) => ({ route: p.route, bytes: p.html.length, title: p.seo.page?.title ?? null }));

  // Inspect-only escape hatches, for verifying a bake without touching the cache.
  if (body.include_html) {
    return res.status(200).json({ club_id: clubId, club: club.identity?.name, pages });
  }
  if (body.dry_run) {
    return res.status(200).json({
      club_id: clubId,
      club: club.identity?.name,
      dry_run: true,
      would_bake: summary.length,
      pages: summary,
    });
  }

  let result;
  try {
    result = await persist(cacheWriteClient(), clubId, pages, club, isF2 ? "f2" : "legacy");
  } catch (e) {
    // Rendering succeeded but the write didn't. The previous cache is untouched and
    // still serving, so this is a failed refresh rather than an outage.
    return res.status(500).json({ error: String(e.message ?? e), club_id: clubId, stage: "persist" });
  }

  return res.status(200).json({
    club_id: clubId,
    club: club.identity?.name,
    website_status: club.websiteStatus ?? null,
    baked: result.written,
    pruned: result.pruned,
    pages: summary,
  });
}
