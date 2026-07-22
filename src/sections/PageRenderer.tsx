// F2 P2 -- PR 3: the total renderer.
// docs/F2-design-doc.md sec 5. Walk the layout document in order; for each entry, resolve it
// against the registry (validate props), render the section component with the club data
// context, and SKIP-and-log anything that fails -- unknown type, bad props, hidden, or a
// component that throws at render. The page NEVER white-screens because of one section.
// Theme tokens are applied as CSS custom properties at the page root; sections carry no colours.
import { Component, type CSSProperties, type ReactNode } from "react";
import type { SectionContext } from "./entitlement";
import { resolveSection } from "./registry";

/** Theme tokens -> CSS custom properties at the page root (real tokens seeded at PR 4). */
export type ThemeTokens = Record<string, string>;

function themeToStyle(theme: ThemeTokens | undefined): CSSProperties | undefined {
  if (!theme) return undefined;
  const style: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme)) style[k.startsWith("--") ? k : `--${k}`] = v;
  return style as CSSProperties;
}

/** Per-section error boundary: a section that throws at render is skipped, not fatal. This is
 *  what makes the renderer TOTAL even against a runtime error, not just invalid props. */
class SectionBoundary extends Component<{ id: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn(`[renderer] section ${this.props.id} threw at render; skipped`, err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** How the renderer arranges resolved sections. 'stack' is the flat, full-width flow every page
 *  has always used. 'main-side' is Brief 10 sec 3a: a two-column magazine region -- the one
 *  structural shape the token thesis cannot express. Absent = 'stack' (the safe default: an older
 *  page, or a design that never opts in, renders exactly as before). */
export type LayoutMode = "stack" | "main-side";

export interface PageRendererProps {
  /** Raw published_layout / draft_layout (jsonb array from public_club_page). */
  layout: unknown;
  /** Club data + entitlement seam the section components read. */
  ctx: SectionContext;
  /** Theme tokens for the page root. Optional until themes land (PR 4). */
  theme?: ThemeTokens;
  /** The page's layout_mode (club_pages.layout_mode). Absent = 'stack'. */
  layoutMode?: LayoutMode;
}

/** Render one resolved raw entry, or null (skip-and-log per doc sec 5). Shared by both layout
 *  modes so validate-or-skip behaves identically however the page is arranged. */
function renderSection(raw: unknown, i: number, ctx: SectionContext): ReactNode {
  const r = resolveSection(raw);
  if (!r.ok) {
    // Doc sec 5: LOG validation failures (rule 3), but skip unknown types (rule 4)
    // and hidden sections (rule 5) SILENTLY -- both are expected, not defects.
    const silent = r.reason === "hidden" || r.reason === "unknown section type";
    if (!silent) {
      console.warn(`[renderer] skipped section ${r.id ?? i} (${r.type ?? "?"}): ${r.reason}`);
    }
    return null;
  }
  const Comp = r.def.Component;
  return (
    <SectionBoundary key={r.instance.id} id={r.instance.id}>
      <Comp props={r.instance.props} ctx={ctx} />
    </SectionBoundary>
  );
}

/** The column an entry declares, or undefined (full-width flow) -- read WITHOUT validating props,
 *  because column placement is orthogonal to whether the section itself resolves. A section with
 *  bad props still declares its column; segmentation must agree with render order regardless. */
function columnOf(raw: unknown): "main" | "side" | undefined {
  if (raw && typeof raw === "object" && "column" in raw) {
    const c = (raw as { column?: unknown }).column;
    if (c === "main" || c === "side") return c;
  }
  return undefined;
}

/** One raw entry paired with its original index (indices label the render + preserve keys). */
export type IndexedEntry = { raw: unknown; i: number };
/** A main-side layout segment: a full-width `flow` entry, or a `grid` region bucketing a contiguous
 *  run of columned entries into main / side (order preserved within each column). */
export type LayoutSegment =
  | { kind: "flow"; raw: unknown; i: number }
  | { kind: "grid"; key: number; mains: IndexedEntry[]; sides: IndexedEntry[] };

/**
 * Segment a main-side layout (Brief 10 sec 3a). Full-width entries (no `column`) stay in flow; a
 * contiguous RUN of columned entries collapses into one grid region, so the hero stays full-bleed
 * above the magazine grid and any later full-width band splits the run cleanly. Pure + exported so
 * the bucketing is unit-tested independently of React. An empty column is kept (rdca.css :has()
 * collapses it to a single column -- Rule 9 / Ruling 3), never dropped here.
 */
export function segmentMainSide(items: unknown[]): LayoutSegment[] {
  const out: LayoutSegment[] = [];
  let run: IndexedEntry[] = [];
  const flush = () => {
    if (run.length === 0) return;
    out.push({
      kind: "grid",
      key: run[0].i,
      mains: run.filter((e) => columnOf(e.raw) === "main"),
      sides: run.filter((e) => columnOf(e.raw) === "side"),
    });
    run = [];
  };
  items.forEach((raw, i) => {
    if (columnOf(raw) === undefined) {
      flush();
      out.push({ kind: "flow", raw, i });
    } else {
      run.push({ raw, i });
    }
  });
  flush();
  return out;
}

export function PageRenderer({ layout, ctx, theme, layoutMode = "stack" }: PageRendererProps) {
  const items = Array.isArray(layout) ? layout : [];

  // stack: the original flat flow. main-side falls through to segmentation below.
  if (layoutMode !== "main-side") {
    return (
      <div className="sw-page" style={themeToStyle(theme)}>
        {items.map((raw, i) => renderSection(raw, i, ctx))}
      </div>
    );
  }

  return (
    <div className="sw-page" style={themeToStyle(theme)}>
      {segmentMainSide(items).map((seg) =>
        seg.kind === "flow" ? (
          renderSection(seg.raw, seg.i, ctx)
        ) : (
          <div className="main-layout" key={`ml-${seg.key}`}>
            <div className="col-main">{seg.mains.map((e) => renderSection(e.raw, e.i, ctx))}</div>
            <div className="col-side">{seg.sides.map((e) => renderSection(e.raw, e.i, ctx))}</div>
          </div>
        ),
      )}
    </div>
  );
}
