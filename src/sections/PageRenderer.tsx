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

export interface PageRendererProps {
  /** Raw published_layout / draft_layout (jsonb array from public_club_page). */
  layout: unknown;
  /** Club data + entitlement seam the section components read. */
  ctx: SectionContext;
  /** Theme tokens for the page root. Optional until themes land (PR 4). */
  theme?: ThemeTokens;
}

export function PageRenderer({ layout, ctx, theme }: PageRendererProps) {
  const items = Array.isArray(layout) ? layout : [];
  return (
    <div className="sw-page" style={themeToStyle(theme)}>
      {items.map((raw, i) => {
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
      })}
    </div>
  );
}
