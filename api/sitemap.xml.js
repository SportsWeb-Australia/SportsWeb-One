const { getClubForRequest } = require("./_club");

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const STATIC_PATHS = ["/", "/about", "/teams", "/fixtures", "/news", "/events", "/sponsors", "/contact", "/register"];

module.exports = async (req, res) => {
  const origin = `https://${req.headers.host}`;
  const result = await getClubForRequest(req);

  const urls = [];
  for (const path of STATIC_PATHS) urls.push({ loc: origin + path });
  if (result) {
    for (const n of result.news) urls.push({ loc: `${origin}/news/${n.slug || slugify(n.title)}`, lastmod: n.published_at });
    for (const t of result.teams) urls.push({ loc: `${origin}/teams/${t.slug || slugify(t.name)}` });
    for (const e of result.events) urls.push({ loc: `${origin}/events/${e.slug || slugify(e.title)}`, lastmod: e.event_date });
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
