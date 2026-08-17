import { getClubForRequest, supabase } from "./_club.js";

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const STATIC_PATHS = ["/", "/about", "/teams", "/fixtures", "/news", "/events", "/sponsors", "/contact", "/register"];

/**
 * The club's own page addresses, for a club on the F2 renderer.
 *
 * An F2 club's URLs are its club_pages rows, so the legacy static list is not just incomplete
 * for it -- it is wrong. /fixtures and /teams need not exist, while /carnival and
 * /welfare/concussion do, and a sitemap listing the former and omitting the latter actively
 * misdirects crawlers. Includes pages kept out of the nav, which are still public URLs.
 */
async function f2Paths(clubId) {
  const { data, error } = await supabase.rpc("public_club_pages_index", {
    p_club_id: clubId,
    p_preview_token: null,
  });
  if (error) return null;
  return (Array.isArray(data) ? data : []).map((p) => ({
    loc: p.is_home ? "/" : `/${p.slug}`,
    lastmod: p.published_at || p.updated_at,
  }));
}

export default async (req, res) => {
  const origin = `https://${req.headers.host}`;
  const result = await getClubForRequest(req);

  const urls = [];
  const f2 = result?.club?.render_mode === "f2" ? await f2Paths(result.club.id) : null;

  if (f2 && f2.length) {
    for (const p of f2) urls.push({ loc: origin + p.loc, lastmod: p.lastmod });
  } else {
    // Legacy club, or an F2 club whose index could not be read -- the fixed route tree it is
    // actually serving. Falling back rather than emitting an empty sitemap keeps a read failure
    // from de-listing a live club.
    for (const path of STATIC_PATHS) urls.push({ loc: origin + path });
  }

  if (result) {
    // Article routes exist on both renderers (F2Site declares /news/:slug and /events/:slug).
    for (const n of result.news) urls.push({ loc: `${origin}/news/${n.slug || slugify(n.title)}`, lastmod: n.published_at });
    for (const e of result.events) urls.push({ loc: `${origin}/events/${e.slug || slugify(e.title)}`, lastmod: e.event_date });
    // Team pages are a legacy route only; an F2 club addresses teams through its own pages.
    if (!f2) {
      for (const t of result.teams) urls.push({ loc: `${origin}/teams/${t.slug || slugify(t.name)}` });
    }
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}</url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).send(body);
};
