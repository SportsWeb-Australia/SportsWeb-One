// F2 fence tests. The design doc's promise is "impossible to break" -- these lock that in:
// zod validation, the .strict() sectionInstance fence (the sidebar `column` door), the
// validate-or-skip resolver, and cardinality. Pure logic, no DOM.
//
// Rescued from the abandoned rdca-design-port branch, which was the repo's only test
// suite. Retargeted to the four section types this implementation actually registers --
// the earlier branch added eleven, and rdca-port-audit-v2 re-routed seven of them to
// display variants instead.
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

  it("the singleton/many split for the ported types is what the page assumes", () => {
    expect(CARDINALITY.clubs_directory).toBe("single");
    expect(CARDINALITY.ticker).toBe("single");
    expect(CARDINALITY.team_lineup).toBe("many");
    expect(CARDINALITY.photo_strip).toBe("many");
  });
});
