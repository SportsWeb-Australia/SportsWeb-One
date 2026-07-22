// The sidebar bucketing (Brief 10 sec 3a). segmentMainSide is the heart of slice A/B -- it decides
// what stays full-width and how columned runs bucket into the magazine grid. These pin the exact
// behaviour the RDCA homepage depends on.
import { describe, it, expect } from "vitest";
import { segmentMainSide } from "../PageRenderer";

const s = (id: string, column?: "main" | "side") => ({ id, type: "news", props: {}, ...(column ? { column } : {}) });

describe("segmentMainSide", () => {
  it("keeps full-width entries in flow (a page with no columns is all flow)", () => {
    const segs = segmentMainSide([s("a"), s("b"), s("c")]);
    expect(segs.every((x) => x.kind === "flow")).toBe(true);
    expect(segs).toHaveLength(3);
  });

  it("hero full-width, then a main/side run -> flow + one grid (the RDCA shape)", () => {
    const segs = segmentMainSide([s("hero"), s("m1", "main"), s("s1", "side"), s("m2", "main")]);
    expect(segs).toHaveLength(2);
    expect(segs[0]).toMatchObject({ kind: "flow", i: 0 });
    const grid = segs[1];
    expect(grid.kind).toBe("grid");
    if (grid.kind === "grid") {
      expect(grid.mains.map((e) => e.i)).toEqual([1, 3]); // main order preserved
      expect(grid.sides.map((e) => e.i)).toEqual([2]);
    }
  });

  it("a full-width band between two columned runs opens a fresh grid below it", () => {
    const segs = segmentMainSide([s("m1", "main"), s("band"), s("m2", "main")]);
    expect(segs.map((x) => x.kind)).toEqual(["grid", "flow", "grid"]);
  });

  it("keeps an empty column (only-main run) -- degradation is CSS, not dropping here", () => {
    const segs = segmentMainSide([s("m1", "main"), s("m2", "main")]);
    expect(segs).toHaveLength(1);
    const grid = segs[0];
    if (grid.kind === "grid") {
      expect(grid.mains).toHaveLength(2);
      expect(grid.sides).toHaveLength(0); // empty side column preserved for :has() collapse
    }
  });

  it("indices are the original positions (stable keys / labels)", () => {
    const segs = segmentMainSide([s("a"), s("b", "side"), s("c")]);
    expect(segs[0]).toMatchObject({ kind: "flow", i: 0 });
    expect(segs[1]).toMatchObject({ kind: "grid", key: 1 });
    expect(segs[2]).toMatchObject({ kind: "flow", i: 2 });
  });
});
