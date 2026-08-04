import { getClubForRequest } from "./_club.js";

/** llms.txt (llmstxt.org) — a plain-text map of the site for AI crawlers/answer
 *  engines, parallel to sitemap.xml for search engines. */
export default async (req, res) => {
  const origin = `https://${req.headers.host}`;
  const result = await getClubForRequest(req);

  if (!result) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(`# SportsWeb One\n\nClub site not found for this host.\n`);
    return;
  }

  const { club, news, teams, events } = result;
  const lines = [];
  lines.push(`# ${club.name}`);
  lines.push("");
  if (club.address) lines.push(`> ${club.name}, ${club.address}.`);
  lines.push("");
  lines.push("## Pages");
  lines.push(`- [Home](${origin}/): ${club.name} — club home page.`);
  lines.push(`- [About](${origin}/about): About the club.`);
  lines.push(`- [Teams](${origin}/teams): Teams and programs.`);
  lines.push(`- [Fixtures](${origin}/fixtures): Fixtures, results and ladder.`);
  lines.push(`- [News](${origin}/news): Club news.`);
  lines.push(`- [Events](${origin}/events): Upcoming events.`);
  lines.push(`- [Sponsors](${origin}/sponsors): Club sponsors and partners.`);
  lines.push(`- [Contact](${origin}/contact): Contact details.`);
  lines.push(`- [Register](${origin}/register): How to join or register to play.`);

  if (teams.length) {
    lines.push("");
    lines.push("## Teams");
    for (const t of teams) lines.push(`- ${t.name}`);
  }
  if (news.length) {
    lines.push("");
    lines.push("## Recent news");
    for (const n of news.slice(0, 10)) lines.push(`- [${n.title}](${origin}/news/${n.slug})`);
  }
  if (events.length) {
    lines.push("");
    lines.push("## Upcoming events");
    for (const e of events.slice(0, 10)) lines.push(`- ${e.title}`);
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).send(lines.join("\n") + "\n");
};
