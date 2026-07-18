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

  // main-side: full-width entries (no column) render in flow; a contiguous RUN of columned entries
  // collapses into one .main-layout with .col-main / .col-side buckets (order preserved within
  // each). A full-width entry between two columned runs opens a fresh region below it -- so the
  // hero stays full-bleed above the magazine grid, and any later full-width band splits cleanly.
  const out: ReactNode[] = [];
  let run: { raw: unknown; i: number }[] = [];

  const flushRun = () => {
    if (run.length === 0) return;
    const mains = run.filter((e) => columnOf(e.raw) === "main");
    const sides = run.filter((e) => columnOf(e.raw) === "side");
    // A run of only-main (or only-side) still renders through the grid; :has() in rdca.css
    // collapses an empty column so the page degrades to a single column (Rule 9 / Ruling 3).
    out.push(
      <div className="main-layout" key={`ml-${run[0].i}`}>
        <div className="col-main">{mains.map((e) => renderSection(e.raw, e.i, ctx))}</div>
        <div className="col-side">{sides.map((e) => renderSection(e.raw, e.i, ctx))}</div>
      </div>,
    );
    run = [];
  };

  items.forEach((raw, i) => {
    if (columnOf(raw) === undefined) {
      flushRun();
      out.push(renderSection(raw, i, ctx));
    } else {
      run.push({ raw, i });
    }
  });
  flushRun();

  return (
    <div className="sw-page" style={themeToStyle(theme)}>
      {out}
    </div>
  );
}
