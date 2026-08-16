import { renderRouteToHtml, getClubConfigForClubId } from "./_ssr.mjs";
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
function assemblePage(shell, rendered, club) {
  let html = shell;

  const title = rendered.seo.page?.title;
  if (title) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(title)}</title>`);

  // Drop the shell's neutral platform defaults; the club's own tags replace them.
  html = html.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, "");
  html = html.replace(/\s*<meta\s+property="og:site_name"[^>]*>/, "");
  html = html.replace(/\s*<meta\s+property="og:type"[^>]*>/, "");
  html = html.replace(/\s*<meta\s+property="og:image"[^>]*>/, "");
  html = html.replace(/\s*<meta\s+name="twitter:card"[^>]*>/, "");

  html = html.replace("</head>", `  ${headTags(rendered.seo)}\n  </head>`);

  const hydration = `<script id="sw1-hydration-data" type="application/json">${escapeJson(
    JSON.stringify(club)
  )}</script>`;
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

  const routes = routesFor(club);
  const pages = [];
  const failures = [];
  for (const route of routes) {
    try {
      const rendered = renderRouteToHtml(club, club.variant, route, origin);
      pages.push({ route, html: assemblePage(SHELL_HTML, rendered, club), seo: rendered.seo });
    } catch (e) {
      failures.push({ route, error: String(e.message ?? e) });
    }
  }

  // A partial bake would leave the cache half-old and half-new, which is worse
  // than leaving it alone. All routes must render.
  if (failures.length) {
    return res.status(500).json({ error: "render failed; cache left unchanged", club_id: clubId, failures });
  }

  // Step 4 persists these to club_page_cache. Until then this is inspect-only.
  const summary = pages.map((p) => ({ route: p.route, bytes: p.html.length, title: p.seo.page?.title ?? null }));
  if (body.include_html) {
    return res.status(200).json({ club_id: clubId, club: club.identity?.name, pages });
  }
  return res.status(200).json({
    club_id: clubId,
    club: club.identity?.name,
    website_status: club.websiteStatus ?? null,
    baked: summary.length,
    pages: summary,
  });
}
