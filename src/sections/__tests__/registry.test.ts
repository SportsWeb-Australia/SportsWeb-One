// F2 fence tests. The design doc's promise is "impossible to break" -- these lock that in:
// zod validation, the .strict() sectionInstance fence (the sidebar `column` door), the
// validate-or-skip resolver, and cardinality. Pure logic, no DOM.
import { describe, it, expect } from "vitest";
import { resolveSection, SECTION_TYPES, SECTION_REGISTRY, isSectionType } from "../registry";
import { sectionInstanceSchema, SECTION_SCHEMAS } from "../schemas";
import { canAddSection, CARDINALITY } from "../cardinality";
import { AI_AUTHORABLE } from "../aiAuthorable";

describe("registry integrity", () => {
  it("every registered type has schema + cardinality + aiAuthorable + component", () => {
    for (const type of SECTION_TYPES) {
      expect(SECTION_SCHEMAS[type], `schema for ${type}`).toBeDefined();
      expect(CARDINALITY[type], `cardinality for ${type}`).toBeDefined();
      expect(AI_AUTHORABLE[type], `aiAuthorable for ${type}`).toBeDefined();
      expect(SECTION_REGISTRY[type].Component, `component for ${type}`).toBeTypeOf("function");
    }
  });

  it("isSectionType guards unknown types", () => {
    expect(isSectionType("hero")).toBe(true);
    expect(isSectionType("not_a_type")).toBe(false);
  });
});

describe("sectionInstanceSchema (.strict fence)", () => {
  it("accepts a valid instance with an optional column", () => {
    const r = sectionInstanceSchema.safeParse({ id: "a", type: "news", props: {}, column: "side" });
    expect(r.success).toBe(true);
  });

  it("rejects an unknown top-level key rather than silently stripping it (the sidebar door)", () => {
    const r = sectionInstanceSchema.safeParse({ id: "a", type: "news", props: {}, colunm: "side" });
    expect(r.success).toBe(false);
  });

  it("rejects a bad column value", () => {
    const r = sectionInstanceSchema.safeParse({ id: "a", type: "news", props: {}, column: "centre" });
    expect(r.success).toBe(false);
  });
});

describe("resolveSection (validate-or-skip)", () => {
  it("resolves a valid section and passes column through", () => {
    const r = resolveSection({ id: "n", type: "news", column: "main", props: { layout: "feature", count: 3 } });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.instance.column).toBe("main");
  });

  it("skips an unknown section type", () => {
    const r = resolveSection({ id: "x", type: "nope", props: {} });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("unknown section type");
  });

  it("skips a section with invalid props (never renders bad data)", () => {
    const r = resolveSection({ id: "n", type: "news", props: { layout: "bogus", count: 3 } });
    expect(r.ok).toBe(false);
  });

  it("skips a hidden section", () => {
    const r = resolveSection({ id: "n", type: "news", visible: false, props: { layout: "grid", count: 3 } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("hidden");
  });

  it("treats an unknown key as a malformed instance (strict)", () => {
    const r = resolveSection({ id: "n", type: "news", props: {}, extra: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("malformed section instance");
  });
});

describe("cardinality fence", () => {
  it("blocks a second singleton but allows duplicable types", () => {
    expect(canAddSection("hero", ["hero"])).toBe(false); // singleton already present
    expect(canAddSection("hero", [])).toBe(true);
    expect(canAddSection("news", ["news"])).toBe(true); // many
  });

  it("the RDCA sidebar singletons are enforced", () => {
    for (const t of ["identity", "newsletter", "alerts", "ticker"] as const) {
      expect(CARDINALITY[t]).toBe("single");
    }
  });
});

describe("new RDCA schemas validate their shape", () => {
  it("app_grid requires at least one tile with a safe href", () => {
    expect(SECTION_SCHEMAS.app_grid.safeParse({ tiles: [{ label: "F", href: "/f" }] }).success).toBe(true);
    expect(SECTION_SCHEMAS.app_grid.safeParse({ tiles: [] }).success).toBe(false);
    expect(SECTION_SCHEMAS.app_grid.safeParse({ tiles: [{ label: "F", href: "javascript:alert(1)" }] }).success).toBe(false);
  });

  it("feature_banner requires a heading and takes a size variant", () => {
    expect(SECTION_SCHEMAS.feature_banner.safeParse({ heading: "R", variant: "tall" }).success).toBe(true);
    expect(SECTION_SCHEMAS.feature_banner.safeParse({ variant: "tall" }).success).toBe(false);
  });

  it("clubs_directory requires divisions each with at least one club", () => {
    expect(SECTION_SCHEMAS.clubs_directory.safeParse({ divisions: [{ name: "D", clubs: [{ name: "C" }] }] }).success).toBe(true);
    expect(SECTION_SCHEMAS.clubs_directory.safeParse({ divisions: [{ name: "D", clubs: [] }] }).success).toBe(false);
  });

  it("match_data comp-hub takes the tabs display option", () => {
    expect(SECTION_SCHEMAS.match_data.safeParse({ mode: "combined", display: "tabs" }).success).toBe(true);
    expect(SECTION_SCHEMAS.match_data.safeParse({ mode: "combined", display: "carousel" }).success).toBe(false);
  });
});
