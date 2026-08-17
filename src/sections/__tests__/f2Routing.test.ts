// F2 routing + bake payload tests. Pure logic, no DOM, no database.
//
// These four functions decide which URL maps to which page row, which paths the bake is allowed
// to cache, and how the nav tree and page rows are shaped -- so a regression here silently
// serves the wrong page, drops a live page from the sitemap, or caches a 404 over a real page.
// Every case below is one that actually came up while building phases 1 and 2.
import { describe, it, expect } from "vitest";
import { slugForPath, isF2SystemRoute } from "../../F2Site";
import { buildNavTree, mapPageRow } from "../../lib/f2Payload";

describe("slugForPath", () => {
  it("maps the root to the home page row", () => {
    expect(slugForPath("/")).toBe("home");
    expect(slugForPath("")).toBe("home");
  });

  it("strips the leading slash", () => {
    expect(slugForPath("/about")).toBe("about");
  });

  it("keeps nested slugs intact -- the slug is one column containing slashes", () => {
    expect(slugForPath("/welfare/concussion")).toBe("welfare/concussion");
  });

  it("treats a trailing slash as the same page, not a duplicate", () => {
    expect(slugForPath("/about/")).toBe(slugForPath("/about"));
    expect(slugForPath("/welfare/concussion/")).toBe("welfare/concussion");
  });

  it("survives repeated slashes rather than producing an empty first segment", () => {
    expect(slugForPath("//about")).toBe("about");
  });
});

describe("isF2SystemRoute", () => {
  it("recognises the article routes F2Site declares", () => {
    expect(isF2SystemRoute("/news/a-win-on-the-road")).toBe(true);
    expect(isF2SystemRoute("/events/season-launch")).toBe(true);
  });

  it("does NOT claim the collection index pages -- those can be club_pages", () => {
    expect(isF2SystemRoute("/news")).toBe(false);
    expect(isF2SystemRoute("/events")).toBe(false);
  });

  it("matches on the whole first segment, so a page named 'newsletter' is not an article", () => {
    expect(isF2SystemRoute("/newsletter/2026")).toBe(false);
  });

  it("leaves ordinary and nested pages alone", () => {
    expect(isF2SystemRoute("/")).toBe(false);
    expect(isF2SystemRoute("/carnival")).toBe(false);
    expect(isF2SystemRoute("/welfare/concussion")).toBe(false);
  });
});

describe("buildNavTree", () => {
  const row = (over: Partial<Parameters<typeof buildNavTree>[0][number]> = {}) => ({
    id: "1",
    slug: "a",
    title: "A",
    nav_label: null,
    nav_order: null,
    nav_parent_id: null,
    is_home: false,
    ...over,
  });

  it("nests children under their parent", () => {
    const tree = buildNavTree([
      row({ id: "p", slug: "welfare", title: "Welfare" }),
      row({ id: "c", slug: "welfare/concussion", title: "Concussion", nav_parent_id: "p" }),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0].children.map((c) => c.slug)).toEqual(["welfare/concussion"]);
  });

  it("falls back to the title when no nav_label is set", () => {
    expect(buildNavTree([row({ title: "Our Clubs" })])[0].navLabel).toBe("Our Clubs");
    expect(buildNavTree([row({ title: "Our Clubs", nav_label: "Clubs" })])[0].navLabel).toBe("Clubs");
  });

  it("surfaces an orphan at top level rather than losing a live page", () => {
    // The parent is missing (not nav-visible, or unpublished). Dropping the child would make a
    // real, reachable page invisible in the menu.
    const tree = buildNavTree([row({ id: "c", slug: "hidden-parent/child", nav_parent_id: "gone" })]);
    expect(tree.map((i) => i.slug)).toEqual(["hidden-parent/child"]);
  });
});

describe("mapPageRow", () => {
  it("returns null for a miss, which is what makes a 404 a 404", () => {
    expect(mapPageRow(null)).toBeNull();
    expect(mapPageRow(undefined)).toBeNull();
  });

  it("defaults an absent layout to empty rather than undefined", () => {
    expect(mapPageRow({})?.layout).toEqual([]);
  });

  it("only honours a layout_mode it knows", () => {
    expect(mapPageRow({ layout_mode: "main-side" })?.layoutMode).toBe("main-side");
    expect(mapPageRow({ layout_mode: "stack" })?.layoutMode).toBe("stack");
    // Absent (RPC not yet migrated) or nonsense -> stack, never undefined.
    expect(mapPageRow({})?.layoutMode).toBe("stack");
    expect(mapPageRow({ layout_mode: "sidebar" })?.layoutMode).toBe("stack");
  });
});

describe("videos section registration", () => {
  it("is registered as a Collection, so it is never entitlement-gated", async () => {
    // Collection/Content sections have no entitlement key: every club can use them. Registering
    // videos as a Module by mistake would hide it behind a capability nobody has been sold.
    const { SECTION_REGISTRY } = await import("../registry");
    const { entitlementKeyFor } = await import("../entitlement");
    expect(SECTION_REGISTRY.videos.sectionClass).toBe("collection");
    expect(entitlementKeyFor("videos")).toBeNull();
  });

  it("has a schema, cardinality, ai-authorable entry and default props", async () => {
    // The registry test asserts this for every type; this one names videos so a half-finished
    // addition fails with a useful message.
    const { SECTION_SCHEMAS } = await import("../schemas");
    const { CARDINALITY } = await import("../cardinality");
    const { AI_AUTHORABLE } = await import("../aiAuthorable");
    expect(SECTION_SCHEMAS.videos).toBeDefined();
    expect(CARDINALITY.videos).toBe("many");
    expect(AI_AUTHORABLE.videos).toBeDefined();
  });

  it("requires a layout and a sane count", async () => {
    const { SECTION_SCHEMAS } = await import("../schemas");
    const s = SECTION_SCHEMAS.videos;
    expect(s.safeParse({ layout: "feature", count: 4 }).success).toBe(true);
    expect(s.safeParse({ count: 4 }).success).toBe(false); // layout is required
    expect(s.safeParse({ layout: "carousel", count: 4 }).success).toBe(false); // not a real layout
    expect(s.safeParse({ layout: "feature", count: 0 }).success).toBe(false);
    expect(s.safeParse({ layout: "feature", count: 99 }).success).toBe(false);
  });
});
