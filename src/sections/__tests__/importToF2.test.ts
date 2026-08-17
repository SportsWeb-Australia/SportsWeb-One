// Importer tests. Pure logic against a hand-built club config -- no database.
//
// The two rules being locked in are the ones that produce silent damage when broken: Rule 9
// (never author content a club does not have) and link integrity (never ship a button that
// 404s). Both cases below came out of running the importer against real clubs.
import { describe, it, expect } from "vitest";
import { planF2Import } from "../../lib/importToF2";
import { SECTION_SCHEMAS } from "../schemas";
import type { ClubConfig } from "../../content/types";

/** The smallest config the planner reads. Cast because ClubConfig is far wider than this. */
function club(over: Record<string, unknown> = {}): ClubConfig {
  return {
    identity: { name: "Test Club FC", shortName: "Test", sports: ["Football"] },
    contact: { email: "hi@test.club", phone: "0400 000 000" },
    hero: { eyebrow: "Est. 1900", title: "Up the Club", subtitle: "One club, one town." },
    about: { heading: "About us", body: ["We started in 1900."] },
    president: { name: "", role: "", body: [] },
    join: { heading: "Join us", blurb: "", options: [] },
    news: [], events: [], teams: [], sponsors: [], committee: [], documents: [],
    ...over,
  } as unknown as ClubConfig;
}

const slugs = (c: ClubConfig) => planF2Import(c).pages.map((p) => (p.isHome ? "/" : `/${p.slug}`));
const homeTypes = (c: ClubConfig) => planF2Import(c).pages[0].layout.map((s) => s.type);

describe("planF2Import -- Rule 9: no page or section without real content", () => {
  it("omits collection sections whose table is empty", () => {
    expect(homeTypes(club())).toEqual(["hero"]);
  });

  it("includes them once the club actually has records", () => {
    const types = homeTypes(club({ news: [{ title: "A win" }], sponsors: [{ name: "Bakery" }] }));
    expect(types).toContain("news");
    expect(types).toContain("sponsors");
  });

  it("creates no page at all for content the club does not have", () => {
    const out = slugs(club());
    expect(out).not.toContain("/teams");
    expect(out).not.toContain("/sponsors");
    expect(out).not.toContain("/documents");
    expect(out).not.toContain("/whats-on");
  });

  it("always produces home and contact -- every club has a name and contact details", () => {
    expect(slugs(club())).toEqual(expect.arrayContaining(["/", "/contact"]));
  });
});

describe("planF2Import -- hero title", () => {
  it("appends the legacy titleAccent rather than dropping the club's words", () => {
    const p = planF2Import(club({ hero: { title: "The fastest game", titleAccent: "on two feet.", subtitle: "" } }));
    expect((p.pages[0].layout[0].props as { title: string }).title).toBe("The fastest game on two feet.");
  });

  it("falls back to the club name when the club never wrote a headline", () => {
    // hero.title is required (min 1). Planning an empty one made PageRenderer skip the whole
    // hero -- a homepage with no hero. Caught on the real theme-classic club.
    const p = planF2Import(club({ hero: { title: "   ", subtitle: "" } }));
    const props = p.pages[0].layout[0].props;
    expect((props as { title: string }).title).toBe("Test Club FC");
    expect(SECTION_SCHEMAS.hero.safeParse(props).success).toBe(true);
  });
});

describe("planF2Import -- internal links", () => {
  it("drops a CTA pointing at a page the import did not create, and says so", () => {
    const c = club({ hero: { title: "Up the Club", subtitle: "", primaryCta: { label: "Fixtures", href: "/fixtures" } } });
    const { pages, warnings } = planF2Import(c);
    expect(pages[0].layout[0].props).not.toHaveProperty("primaryCta");
    expect(warnings.join(" ")).toMatch(/dropped primaryCta "Fixtures".*\/fixtures/);
  });

  it("keeps a CTA that resolves to a page the import DID create", () => {
    // /register exists whenever the club has registration steps or join options.
    const c = club({
      hero: { title: "Up the Club", subtitle: "", primaryCta: { label: "Join", href: "/register" } },
      register: { steps: ["Pick a team"] },
    });
    const { pages, warnings } = planF2Import(c);
    expect((pages[0].layout[0].props as { primaryCta?: { href: string } }).primaryCta?.href).toBe("/register");
    expect(warnings.join(" ")).not.toMatch(/dropped/);
  });

  it("rewrites the legacy /news index link, because that slug is reserved on F2", () => {
    const c = club({
      news: [{ title: "A win" }],
      hero: { title: "Up the Club", subtitle: "", secondaryCta: { label: "All news", href: "/news" } },
    });
    const { pages, warnings } = planF2Import(c);
    expect((pages[0].layout[0].props as { secondaryCta?: { href: string } }).secondaryCta?.href).toBe("/news-and-updates");
    expect(warnings.join(" ")).toMatch(/rewrote secondaryCta.*\/news -> \/news-and-updates/);
  });

  it("leaves external and mailto links alone", () => {
    const c = club({
      hero: { title: "Up", subtitle: "", primaryCta: { label: "PlayHQ", href: "https://playhq.com/x" }, secondaryCta: { label: "Email", href: "mailto:hi@test.club" } },
    });
    const props = planF2Import(c).pages[0].layout[0].props as { primaryCta?: { href: string }; secondaryCta?: { href: string } };
    expect(props.primaryCta?.href).toBe("https://playhq.com/x");
    expect(props.secondaryCta?.href).toBe("mailto:hi@test.club");
  });
});

describe("planF2Import -- authored content is carried, not dropped", () => {
  it("keeps every whyUs item's words", () => {
    const c = club({
      whyUs: { eyebrow: "", title: "Why us", items: [{ icon: "a", title: "Family club", body: "Three generations." }] },
    });
    const rich = planF2Import(c).pages[0].layout.find((s) => s.type === "rich_text");
    expect(JSON.stringify(rich?.props)).toContain("Family club: Three generations.");
  });

  it("maps the legacy photo strip onto the photo_strip section", () => {
    const c = club({ photoStrip: { eyebrow: "", title: "Life at the club", images: ["/a.jpg", "/b.jpg"] } });
    const strip = planF2Import(c).pages[0].layout.find((s) => s.type === "photo_strip");
    expect(strip).toBeDefined();
    expect(SECTION_SCHEMAS.photo_strip.safeParse(strip!.props).success).toBe(true);
  });
});

describe("planF2Import -- every planned section is valid", () => {
  it("passes its own schema for a content-rich club", () => {
    const { pages } = planF2Import(
      club({
        news: [{ title: "A win" }],
        events: [{ title: "Launch" }],
        teams: [{ sport: "Football", teams: [] }],
        sponsors: [{ name: "Bakery" }],
        committee: [{ name: "Ann" }],
        documents: [{ title: "Policy" }],
        president: { name: "Ann", role: "President", body: ["Welcome."] },
        register: { steps: ["Pick a team"], feesNote: "Fees are due in March." },
        join: { heading: "Join", blurb: "", options: [{ label: "Register", href: "https://playhq.com/x" }] },
      }),
    );
    for (const p of pages) {
      for (const s of p.layout) {
        const res = SECTION_SCHEMAS[s.type].safeParse(s.props);
        expect(res.success, `${p.slug}/${s.type}: ${JSON.stringify(res.error?.issues)}`).toBe(true);
      }
    }
  });
});
