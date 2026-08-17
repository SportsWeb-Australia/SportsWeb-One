// F2 P3 -- PR 1: the page composer shell. The first thing a real human (a club treasurer,
// 9pm Tuesday, never used a website builder) touches. Two rules drive every decision here:
//   1. It must be OBVIOUS -- plain words, big targets, the preview shows exactly what the
//      public sees. If she can't work out how to move a section without being told, we failed.
//   2. Nothing irreversible, nothing lost by accident -- remove is undoable, closing the tab
//      with unsaved work is warned, Publish is deliberate and visibly distinct from Save, and
//      one click reverts a mess to what is published.
// Structure only in PR 1 (reorder / toggle / add / remove / duplicate + save/publish/revert).
// Per-section content editors are PR 2; for now a section's content is shown, not edited.
//
// layout_mode (this PR): 'stack' (default, unchanged single list) or 'main-side' (two drop
// zones). The layout document stays ONE flat array either way -- 'column' on each section is
// the only new field (docs/codey-brief-10-the-design-layer.md sec 3a). All structural
// operations below are id-based so they work the same whether an item is in the single list
// or one of the two columns.
//
// layout_mode is PLATFORM-ONLY, same category as hero.layout/news.layout/sponsors.display --
// see supabase/captured/section-variant-fence.sql (found live on `develop`, undocumented
// until this session). Whether a page HAS a sidebar at all is a design/structure decision
// (the Builder's call, set directly by Codey when building the page), not a content decision
// a club makes themselves. The composer reads it and shows the right UI, but there is no
// club-facing control to change it -- only "Move to sidebar/main" per section, which
// reassigns WHICH zone a piece of content sits in, within a structure the platform already
// decided. Save/Publish go through save_club_page_draft(), which enforces the equivalent
// fence for hero.layout/news.layout/sponsors.display server-side; layout_mode itself isn't
// part of that RPC's payload at all, by design -- there is no path for a club save to touch it.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { getClubConfigById } from "../lib/loadClub";
import {
  PageRenderer,
  resolveSection,
  sectionContextFromClub,
  SECTION_REGISTRY,
  SECTION_TYPES,
  canAddSection,
  type SectionContext,
  type SectionInstance,
  type SectionType,
} from "../sections";

type LayoutMode = "stack" | "main-side";

/** A minimal, schema-valid instance for a freshly added section. */
function defaultInstance(type: SectionType): SectionInstance {
  const id = crypto.randomUUID();
  const props: Record<SectionType, unknown> = {
    hero: { title: "New heading", layout: "centred" },
    announcement_bar: { enabled: true, text: "New announcement" },
    rich_text: { body: [{ kind: "paragraph", text: "New paragraph." }] },
    quick_links: { links: [{ label: "New link", href: "/" }] },
    cta_band: { heading: "New call to action", actions: [{ label: "Go", href: "/" }] },
    president_welcome: { name: "Name", body: ["Welcome message."] },
    contact: { showEmail: true },
    clubs_directory: { clubs: [{ name: "New club" }] },
    news: { layout: "grid", count: 3 },
    events: { count: 3 },
    sponsors: { display: "strip" },
    committee: {},
    teams: {},
    documents: {},
    social_feed: { source: "highlights", count: 6 },
    team_lineup: { players: [{ name: "New player" }] },
    photo_strip: { photos: [{ url: "" }] },
    match_data: { mode: "combined" },
    scoreboard: {},
    ticker: {},
    team_lineups_embed: {},
  };
  return { id, type, props: props[type] as SectionInstance["props"], visible: true };
}

type Busy = false | "save" | "publish" | "revert";
type Toast = { text: string; undo?: () => void } | null;

export function PageComposer({ clubId }: { clubId: string }) {
  const [pageId, setPageId] = useState<string | null>(null);
  const [layout, setLayout] = useState<SectionInstance[]>([]);
  // Read-only from the club's perspective -- see the file-header note. Loaded once, never
  // written back by this component; no saved/published tracking needed because it can't
  // become dirty here.
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("stack");
  const [publishedJson, setPublishedJson] = useState<string>("null");
  const [savedJson, setSavedJson] = useState<string>("[]");
  const [ctx, setCtx] = useState<SectionContext | null>(null);
  const [theme, setTheme] = useState<Record<string, string> | undefined>(undefined);
  const [busy, setBusy] = useState<Busy>(false);
  const [toast, setToast] = useState<Toast>(null);
  const [addOpen, setAddOpen] = useState<null | "main" | "side">(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);

  const currentJson = JSON.stringify(layout);
  const dirty = currentJson !== savedJson;
  const hasPublished = publishedJson !== "null";
  // Differs from what is currently live -> "Publish" has something to do.
  const publishable = currentJson !== publishedJson;

  // --- load the home page + the club's render context + theme ---
  useEffect(() => {
    let active = true;
    if (!supabase) return;
    setLoading(true);
    (async () => {
      // The composer is an authenticated admin tool. No session -> a clear "sign in" prompt,
      // never a functional-looking read-only editor (that was a test workaround).
      const { data: auth } = await supabase.auth.getUser();
      if (!active) return;
      if (!auth?.user) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      // draft_layout_mode only exists where supabase/f2-sidebar-layout.sql has been applied.
      // Selecting it against a database without that migration fails the WHOLE select
      // (Postgres 42703), which previously read as "this club has no home page" and killed
      // all editing with a misleading message. Ask for it, and on failure fall back to the
      // columns that have always existed so the composer still opens in stack mode.
      let baseErr: unknown = null;
      let base: unknown = null;
      {
        const withMode = await supabase
          .from("club_pages")
          .select("id, draft_layout, published_layout, draft_layout_mode")
          .eq("club_id", clubId)
          .eq("slug", "home")
          .maybeSingle();
        if (withMode.error) {
          const legacy = await supabase
            .from("club_pages")
            .select("id, draft_layout, published_layout")
            .eq("club_id", clubId)
            .eq("slug", "home")
            .maybeSingle();
          base = legacy.data;
          baseErr = legacy.error;
        } else {
          base = withMode.data;
        }
      }
      const cfg = await getClubConfigById(clubId);
      let themeTokens: Record<string, string> | undefined;
      const { data: club } = await supabase.from("clubs").select("theme_key").eq("id", clubId).maybeSingle();
      const key = (club as { theme_key?: string } | null)?.theme_key;
      if (key) {
        const { data: t } = await supabase.from("club_themes").select("tokens").eq("key", key).maybeSingle();
        themeTokens = (t as { tokens?: Record<string, string> } | null)?.tokens ?? undefined;
      }
      if (!active) return;
      const row = base as
        | { id: string; draft_layout: SectionInstance[] | null; published_layout: SectionInstance[] | null; draft_layout_mode?: LayoutMode }
        | null;
      const draft = row?.draft_layout ?? [];
      // Always read the DRAFT layout_mode, even for the published-comparison JSON below --
      // it's the platform's structural setting for this page, not a draft/published pair the
      // club toggles between (see the file-header note).
      const draftMode: LayoutMode = row?.draft_layout_mode === "main-side" ? "main-side" : "stack";
      // Never fail silently: a read error is not the same as "no page yet", and the two used
      // to be indistinguishable on screen.
      if (baseErr) {
        setError(
          "Couldn't load this page from the database. Your content is safe — nothing has been changed. " +
            "This usually means the site editor's database migration hasn't been applied to this environment yet."
        );
      }
      setPageId(row?.id ?? null);
      setLayout(draft);
      setLayoutMode(draftMode);
      setSavedJson(JSON.stringify(draft));
      setPublishedJson(JSON.stringify(row?.published_layout ?? null));
      setCtx(sectionContextFromClub(cfg));
      setTheme(themeTokens);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [clubId]);

  // Preview tokens come ONLY from the club's theme (like the live render): declare an F2
  // render so the legacy data-variant token blocks go dark. Composer chrome uses its own
  // colours, so this never touches the admin UI.
  useEffect(() => {
    document.documentElement.setAttribute("data-render", "f2");
    return () => document.documentElement.removeAttribute("data-render");
  }, []);

  // --- nothing lost by accident: warn before leaving with unsaved changes ---
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback((text: string, undo?: () => void) => {
    setToast({ text, undo });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  // --- structural ops (all client-side, all reversible, all id-based) ---
  // Move a section relative to its NEAREST SAME-COLUMN NEIGHBOUR -- in 'stack' mode every
  // section is treated as one column, so this is a plain adjacent swap, same as before.
  const moveById = (id: string, dir: -1 | 1) =>
    setLayout((L) => {
      const col = (s: SectionInstance) => (layoutMode === "main-side" ? (s.column ?? "main") : "all");
      const target = L.find((s) => s.id === id);
      if (!target) return L;
      const siblingIdx = L.map((s, i) => ({ s, i })).filter(({ s }) => col(s) === col(target));
      const pos = siblingIdx.findIndex(({ s }) => s.id === id);
      const newPos = pos + dir;
      if (newPos < 0 || newPos >= siblingIdx.length) return L;
      const a = siblingIdx[pos].i;
      const b = siblingIdx[newPos].i;
      const next = L.slice();
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  const toggleById = (id: string) => setLayout((L) => L.map((s) => (s.id === id ? { ...s, visible: s.visible === false } : s)));
  const duplicateById = (id: string) =>
    setLayout((L) => {
      const i = L.findIndex((s) => s.id === id);
      if (i < 0) return L;
      const copy = { ...L[i], id: crypto.randomUUID() };
      const next = L.slice();
      next.splice(i + 1, 0, copy);
      return next;
    });
  const removeById = (id: string) => {
    const i = layout.findIndex((s) => s.id === id);
    if (i < 0) return;
    const removed = layout[i];
    setLayout((L) => L.filter((s) => s.id !== id));
    // Undo, not a silent delete. flash() runs OUTSIDE the state updater so it fires reliably.
    flash(`Removed "${SECTION_REGISTRY[removed.type].label}".`, () =>
      setLayout((cur) => {
        const back = cur.slice();
        back.splice(Math.min(i, back.length), 0, removed);
        return back;
      }),
    );
  };
  // Reassigns which zone a section sits in -- content placement WITHIN a structure the
  // platform already set (layout_mode itself), not a structural change. See file-header note.
  const setColumn = (id: string, column: "main" | "side") =>
    setLayout((L) => L.map((s) => (s.id === id ? { ...s, column } : s)));
  const add = (type: SectionType, column: "main" | "side" = "main") => {
    const instance = defaultInstance(type);
    setLayout((L) => [...L, layoutMode === "main-side" ? { ...instance, column } : instance]);
    setAddOpen(null);
    flash(`Added "${SECTION_REGISTRY[type].label}". Remember to save.`);
  };

  const usedTypes = useMemo(() => layout.map((s) => s.type), [layout]);

  // A club's variant-fence violation (hero.layout etc, see supabase/captured/
  // section-variant-fence.sql) raises a specific, actionable Postgres exception message
  // ("Section variants are set by the platform..."). Surface that verbatim instead of the
  // generic fallback -- it tells the club exactly what happened and that it isn't a bug.
  function saveErrorMessage(e: { message?: string } | null, fallback: string): string {
    if (e?.message?.includes("Section variants are set by the platform")) return e.message;
    return fallback;
  }

  // --- persistence: Save (draft), Publish (RPC), Revert (RPC) ---
  // Save/Publish write draft_layout through save_club_page_draft(), the RPC that enforces
  // the variant fence server-side (a direct `update club_pages` bypassed it entirely --
  // found and fixed this session, see supabase/captured/section-variant-fence.sql). It never
  // touches draft_layout_mode -- that field has no club-facing write path, by design.
  const save = async () => {
    if (!supabase || !pageId) return;
    setBusy("save");
    setError(null);
    const { error: e } = await supabase.rpc("save_club_page_draft", { p_page_id: pageId, p_layout: layout });
    setBusy(false);
    if (e) {
      return setError(saveErrorMessage(e, "Could not save — your changes are still here. Check your connection and try again."));
    }
    setSavedJson(currentJson);
    flash("Saved. Your changes are kept, but not live yet.");
  };

  const publish = async () => {
    if (!supabase || !pageId) return;
    // Publish is deliberate: it is a different act from Save and asks first.
    if (!window.confirm("Publish these changes? Your public website will update straight away.")) return;
    setBusy("publish");
    setError(null);
    // Save first, so we publish exactly what is on screen -- and verify it actually took.
    const { error: saveErr } = await supabase.rpc("save_club_page_draft", { p_page_id: pageId, p_layout: layout });
    if (saveErr) {
      setBusy(false);
      return setError(saveErrorMessage(saveErr, "Could not publish — your changes are still here. Check your connection and try again."));
    }
    const { error: e } = await supabase.rpc("publish_club_page", { p_page_id: pageId });
    setBusy(false);
    if (e) return setError("Could not publish — your changes are still here. Please try again.");
    setSavedJson(currentJson);
    setPublishedJson(currentJson);
    flash("Published. Your website is now live.");
  };

  const revert = async () => {
    if (!supabase || !pageId) return;
    if (!window.confirm("Discard your unpublished changes and go back to your live website?")) return;
    setBusy("revert");
    setError(null);
    const { error: e } = await supabase.rpc("revert_club_page", { p_page_id: pageId });
    if (!e) {
      const { data: page } = await supabase
        .from("club_pages")
        .select("draft_layout, draft_layout_mode")
        .eq("id", pageId)
        .maybeSingle();
      const row = page as { draft_layout: SectionInstance[] | null; draft_layout_mode?: LayoutMode } | null;
      const draft = row?.draft_layout ?? [];
      const draftMode: LayoutMode = row?.draft_layout_mode === "main-side" ? "main-side" : "stack";
      setLayout(draft);
      setLayoutMode(draftMode);
      setSavedJson(JSON.stringify(draft));
    }
    setBusy(false);
    if (e) return setError("Could not revert. Please try again.");
    flash("Reverted to your live website.");
  };

  if (loading) return <div className="sw-admin-loading">Loading your page&hellip;</div>;
  if (needsAuth)
    return (
      <div className="sw-comp-signin">
        <strong>Sign in to edit your home page.</strong>
        <p>You need to be signed in to your club admin.</p>
        <a className="sw-comp-btn sw-comp-btn-publish" href="/admin">
          Go to sign in
        </a>
      </div>
    );
  if (!ctx) return <div className="sw-admin-loading">Loading your page&hellip;</div>;
  if (!pageId)
    return (
      <div className="sw-comp-signin">
        <strong>We couldn&rsquo;t open your home page.</strong>
        <p>It may not exist yet, or your account can&rsquo;t edit this club.</p>
      </div>
    );

  const invalidCount = layout.filter((s) => !resolveSection(s).ok && s.visible !== false).length;

  // `group` is the exact array this item is being rendered within (the whole list in stack
  // mode, or one column's filtered list in main-side mode) -- used only to grey out ↑/↓ at
  // the boundary, matching the original single-list behaviour exactly.
  const renderItem = (s: SectionInstance, group: SectionInstance[], opts: { showMoveToOther?: "main" | "side" } = {}) => {
    // A layout row can name a type this build doesn't register -- a page saved by an older or
    // newer deploy, or a type since removed. The public renderer skips those; the composer used
    // to read .label straight off undefined and white-screen the whole editor, so the one row
    // the club needs to delete was the one row that made the screen unusable.
    const def = SECTION_REGISTRY[s.type] as { label: string } | undefined;
    const ok = !!def && resolveSection(s).ok;
    const hidden = s.visible === false;
    const isFirst = group[0]?.id === s.id;
    const isLast = group[group.length - 1]?.id === s.id;
    return (
      <div key={s.id} className={`sw-comp-item${hidden ? " is-hidden" : ""}${ok ? "" : " is-invalid"}`}>
        <div className="sw-comp-item-main">
          <span className="sw-comp-item-label">{def?.label ?? s.type}</span>
          {hidden && <span className="sw-comp-tag">Hidden</span>}
          {!ok && <span className="sw-comp-tag sw-comp-tag-warn">Needs attention</span>}
        </div>
        <div className="sw-comp-item-ctrls">
          <button className="sw-comp-ic" onClick={() => moveById(s.id, -1)} disabled={isFirst} aria-label="Move up">
            &uarr;
          </button>
          <button className="sw-comp-ic" onClick={() => moveById(s.id, 1)} disabled={isLast} aria-label="Move down">
            &darr;
          </button>
          {opts.showMoveToOther && (
            <button
              className="sw-comp-ic"
              onClick={() => setColumn(s.id, opts.showMoveToOther as "main" | "side")}
              aria-label={`Move to ${opts.showMoveToOther === "side" ? "sidebar" : "main column"}`}
            >
              {opts.showMoveToOther === "side" ? "Move to sidebar →" : "← Move to main"}
            </button>
          )}
          <button className="sw-comp-ic" onClick={() => toggleById(s.id)} aria-label={hidden ? "Show" : "Hide"}>
            {hidden ? "Show" : "Hide"}
          </button>
          <button className="sw-comp-ic" onClick={() => duplicateById(s.id)} aria-label="Duplicate">
            Duplicate
          </button>
          <button className="sw-comp-ic sw-comp-ic-remove" onClick={() => removeById(s.id)} aria-label="Remove">
            Remove
          </button>
        </div>
      </div>
    );
  };

  // Which column's palette is open, not merely whether one is. In main-side mode this is
  // rendered once per column, and a single shared boolean opened BOTH menus from one click --
  // two identical section lists on screen, so choosing from the wrong one silently added the
  // section to the other column.
  const addPalette = (column: "main" | "side") => (
    <>
      <button className="sw-comp-add" onClick={() => setAddOpen((o) => (o === column ? null : column))}>
        + Add a section
      </button>
      {addOpen === column && (
        <div className="sw-comp-palette" role="menu">
          {SECTION_TYPES.map((type) => {
            const allowed = canAddSection(type, usedTypes);
            return (
              <button
                key={type}
                className="sw-comp-palette-item"
                onClick={() => add(type, column)}
                disabled={!allowed}
                title={allowed ? "" : "Only one of these per page"}
              >
                {SECTION_REGISTRY[type].label}
                {!allowed && <span className="sw-comp-tag">Already added</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="sw-comp">
      <div className="sw-comp-bar">
        <div className="sw-comp-bar-status">
          <strong>Your home page</strong>
          <span className={dirty ? "sw-comp-dirty" : "sw-comp-clean"}>
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
        </div>
        <div className="sw-comp-bar-actions">
          <button className="sw-comp-btn" onClick={save} disabled={!dirty || busy !== false}>
            {busy === "save" ? "Saving…" : "Save"}
          </button>
          <button
            className="sw-comp-btn sw-comp-btn-ghost"
            onClick={revert}
            disabled={!hasPublished || busy !== false}
            title="Go back to your live website"
          >
            {busy === "revert" ? "Reverting…" : "Revert to live"}
          </button>
          <button
            className="sw-comp-btn sw-comp-btn-publish"
            onClick={publish}
            disabled={!publishable || busy !== false}
            title="Make your changes live"
          >
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {error && <div className="sw-comp-error">{error}</div>}
      {invalidCount > 0 && (
        <div className="sw-comp-warn">
          {invalidCount} section{invalidCount > 1 ? "s" : ""} need attention before you publish.
        </div>
      )}

      {layoutMode === "main-side" && (
        <div className="sw-comp-layout-note">
          This page has a sidebar (set up for you when your site was built). Use &ldquo;Move to
          sidebar&rdquo; / &ldquo;Move to main&rdquo; on a section to choose which column it sits in.
        </div>
      )}

      <div className="sw-comp-body">
        {layoutMode === "main-side" ? (
          (() => {
            const mainItems = layout.filter((s) => (s.column ?? "main") === "main");
            const sideItems = layout.filter((s) => s.column === "side");
            // 'full' (hero/ticker/photo-strip/etc, full page width, outside the column grid)
            // is set by the platform when the page is built, same fence as layout_mode itself
            // -- not exposed as a "move to full width" club control. But it must still show
            // up SOMEWHERE in the composer, or a club editor loses the ability to hide/
            // reorder/edit that section's content entirely (found while wiring this in).
            const fullItems = layout.filter((s) => s.column === "full");
            return (
              <div className="sw-comp-cols" aria-label="Your sections">
                {fullItems.length > 0 && (
                  <div className="sw-comp-col sw-comp-col-full">
                    <div className="sw-comp-col-h">Full width (set when your site was built)</div>
                    <div className="sw-comp-list">{fullItems.map((s) => renderItem(s, fullItems))}</div>
                  </div>
                )}
                <div className="sw-comp-col">
                  <div className="sw-comp-col-h">Main column</div>
                  <div className="sw-comp-list">
                    {mainItems.map((s) => renderItem(s, mainItems, { showMoveToOther: "side" }))}
                    {addPalette("main")}
                  </div>
                </div>
                <div className="sw-comp-col">
                  <div className="sw-comp-col-h">Sidebar</div>
                  <div className="sw-comp-list">
                    {sideItems.map((s) => renderItem(s, sideItems, { showMoveToOther: "main" }))}
                    {addPalette("side")}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="sw-comp-list" aria-label="Your sections">
            {layout.map((s) => renderItem(s, layout))}
            {addPalette("main")}
          </div>
        )}

        <div className="sw-comp-preview" data-render="f2" aria-label="Live preview">
          <div className="sw-comp-preview-cap">Preview &mdash; exactly what visitors see</div>
          {ctx && <PageRenderer layout={layout} ctx={ctx} theme={theme} layoutMode={layoutMode} />}
        </div>
      </div>

      {toast && (
        <div className="sw-comp-toast" role="status">
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              className="sw-comp-toast-undo"
              onClick={() => {
                toast.undo?.();
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
