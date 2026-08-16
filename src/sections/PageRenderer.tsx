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

/** Exported so chrome (topbar/nav/footer, which sits OUTSIDE .sw-page as a sibling of the
 *  rendered sections, not a descendant) can apply the same theme tokens at its own root --
 *  otherwise nav/footer never inherit them, only the page content does. */
export function themeToStyle(theme: ThemeTokens | undefined): CSSProperties | undefined {
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

export interface PageRendererProps {
  /** Raw published_layout / draft_layout (jsonb array from public_club_page). */
  layout: unknown;
  /** Club data + entitlement seam the section components read. */
  ctx: SectionContext;
  /** Theme tokens for the page root. Optional until themes land (PR 4). */
  theme?: ThemeTokens;
  /** club_pages.layout_mode. 'main-side' buckets sections by their `column` field into two
   *  columns; the array in `layout` stays flat either way -- no nesting, no tree (Brief 10
   *  sec 3a). Absent/'stack' = today's single-column behaviour, unchanged. */
  layoutMode?: "stack" | "main-side";
}

function renderItems(items: unknown[], ctx: SectionContext) {
  return items.map((raw, i) => {
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
  });
}

export function PageRenderer({ layout, ctx, theme, layoutMode = "stack" }: PageRendererProps) {
  const items = Array.isArray(layout) ? layout : [];

  if (layoutMode === "main-side") {
    // Bucket by `column` (absent = 'main'). The document stays one flat array -- this is a
    // render-time split, not a document-shape change.
    //
    // 'full' takes a section OUT of the column grid entirely, full page width, in its normal
    // document position -- RDCA's real page isn't just two columns: hero/ticker/app-buttons
    // sit BEFORE the col-main/col-side split, photo-strip/contact/sponsor-carousel sit AFTER
    // it. Rendering everything through a plain main/side split squeezed the hero into the
    // main column's ~1fr share (found live against real seeded content, 2026-08-03). So this
    // groups the flat array into interleaved runs -- consecutive 'full' items render
    // standalone; consecutive 'main'/'side' items render together as one .sw-page-cols grid
    // -- preserving document order. An empty side column collapses via CSS
    // (sw-page-side:empty), which is how a not-yet-populated sidebar degrades (Rule 9).
    type Group = { kind: "full"; items: unknown[] } | { kind: "cols"; main: unknown[]; side: unknown[] };
    const groups: Group[] = [];
    for (const raw of items) {
      const column = raw && typeof raw === "object" ? (raw as { column?: unknown }).column : undefined;
      if (column === "full") {
        const last = groups[groups.length - 1];
        if (last?.kind === "full") last.items.push(raw);
        else groups.push({ kind: "full", items: [raw] });
      } else {
        const last = groups[groups.length - 1];
        const target: Group = last?.kind === "cols" ? last : (groups.push({ kind: "cols", main: [], side: [] }), groups[groups.length - 1] as Group);
        if (target.kind === "cols") (column === "side" ? target.side : target.main).push(raw);
      }
    }
    return (
      <div className="sw-page sw-page--main-side" style={themeToStyle(theme)}>
        {groups.map((g, i) =>
          g.kind === "full" ? (
            <div className="sw-page-full" key={i}>
              {renderItems(g.items, ctx)}
            </div>
          ) : (
            <div className="sw-page-cols" key={i}>
              <div className="sw-page-main">{renderItems(g.main, ctx)}</div>
              <div className="sw-page-side">{renderItems(g.side, ctx)}</div>
            </div>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="sw-page" style={themeToStyle(theme)}>
      {renderItems(items, ctx)}
    </div>
  );
}
