// F2 P3 -- PR 1: the page composer shell. The first thing a real human (a club treasurer,
// 9pm Tuesday, never used a website builder) touches. Two rules drive every decision here:
//   1. It must be OBVIOUS -- plain words, big targets, the preview shows exactly what the
//      public sees. If she can't work out how to move a section without being told, we failed.
//   2. Nothing irreversible, nothing lost by accident -- remove is undoable, closing the tab
//      with unsaved work is warned, Publish is deliberate and visibly distinct from Save, and
//      one click reverts a mess to what is published.
// Structure only in PR 1 (reorder / toggle / add / remove / duplicate + save/publish/revert).
// Per-section content editors are PR 2; for now a section's content is shown, not edited.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { getClubConfigById } from "../lib/loadClub";
import { variantDefault } from "../sections/presentation";
import { RichTextEditor, pruneBlocks, type RichTextValue } from "../sections/RichTextEditor";
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

/** A minimal, schema-valid instance for a freshly added section. Presentation-variant defaults
 *  (hero.layout, news.layout, sponsors.display) come from the single source of truth
 *  (presentation.ts), so they can never drift from the server-side variant fence. */
function defaultInstance(type: SectionType): SectionInstance {
  const id = crypto.randomUUID();
  const props: Record<SectionType, unknown> = {
    hero: { title: "New heading", layout: variantDefault("hero", "layout") },
    announcement_bar: { enabled: true, text: "New announcement" },
    rich_text: { body: [{ kind: "paragraph", text: "New paragraph." }] },
    quick_links: { links: [{ label: "New link", href: "/" }] },
    cta_band: { heading: "New call to action", actions: [{ label: "Go", href: "/" }] },
    president_welcome: { name: "Name", body: ["Welcome message."] },
    contact: { showEmail: true },
    news: { layout: variantDefault("news", "layout"), count: 3 },
    events: { count: 3 },
    sponsors: { display: variantDefault("sponsors", "display") },
    committee: {},
    teams: {},
    documents: {},
    social_feed: { source: "highlights", count: 6 },
    match_data: { mode: "combined" },
    scoreboard: {},
  };
  return { id, type, props: props[type] as SectionInstance["props"], visible: true };
}

type Busy = false | "save" | "publish" | "revert";
type Toast = { text: string; undo?: () => void } | null;

export function PageComposer({ clubId }: { clubId: string }) {
  const [pageId, setPageId] = useState<string | null>(null);
  const [layout, setLayout] = useState<SectionInstance[]>([]);
  const [publishedJson, setPublishedJson] = useState<string>("null");
  const [savedJson, setSavedJson] = useState<string>("[]");
  const [ctx, setCtx] = useState<SectionContext | null>(null);
  const [theme, setTheme] = useState<Record<string, string> | undefined>(undefined);
  const [busy, setBusy] = useState<Busy>(false);
  const [toast, setToast] = useState<Toast>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  // The role split (design doc 7a/7b). Two audiences, two fences:
  //   - Club admin  -> HARD fence. Content only. This is the DEFAULT and needs no gate: the
  //     real fence is the closed zod schemas (no colour/size/font/markup field exists anywhere),
  //     enforced server-side by resolveSection, not by hiding buttons here.
  //   - Platform admin (is_platform_admin()) -> SOFT fence. Design authority. canDesign gates the
  //     platform-only affordances (variant pickers in PR 2's editors, the theme editor).
  // NOTE: canDesign is a CURTAIN, not a fence. Variant fields live in draft_layout JSON and theme
  // selection is column-writable by authenticated, so a determined club admin could still change
  // them via the API. Making those real fences (grant revoke on clubs + a save-path variant guard)
  // is a pending server-side follow-up tracked in the design doc.
  const [canDesign, setCanDesign] = useState(false);

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
    setLoadFailed(false);
    (async () => {
      try {
      // The composer is an authenticated admin tool. No session -> a clear "sign in" prompt,
      // never a functional-looking read-only editor (that was a test workaround).
      const { data: auth } = await supabase.auth.getUser();
      if (!active) return;
      if (!auth?.user) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      // Which fence is this user in? is_platform_admin() is a SECURITY DEFINER RPC (checks
      // platform_user_roles). Defaults to the hard fence on any error/null -- design authority
      // is opt-in, never assumed.
      const { data: pa } = await supabase.rpc("is_platform_admin");
      if (!active) return;
      setCanDesign(pa === true);
      const { data: base } = await supabase
        .from("club_pages")
        .select("id, draft_layout, published_layout")
        .eq("club_id", clubId)
        .eq("slug", "home")
        .maybeSingle();
      const cfg = await getClubConfigById(clubId);
      let themeTokens: Record<string, string> | undefined;
      const { data: club } = await supabase.from("clubs").select("theme_key").eq("id", clubId).maybeSingle();
      const key = (club as { theme_key?: string } | null)?.theme_key;
      if (key) {
        const { data: t } = await supabase.from("club_themes").select("tokens").eq("key", key).maybeSingle();
        themeTokens = (t as { tokens?: Record<string, string> } | null)?.tokens ?? undefined;
      }
      if (!active) return;
      const draft = (base?.draft_layout as SectionInstance[]) ?? [];
      setPageId(base?.id ?? null);
      setLayout(draft);
      setSavedJson(JSON.stringify(draft));
      setPublishedJson(JSON.stringify(base?.published_layout ?? null));
      setCtx(sectionContextFromClub(cfg));
      setTheme(themeTokens);
      setLoading(false);
      } catch {
        // Any load failure (network drop, RPC error) -> an actionable error, never an endless spinner.
        if (active) {
          setLoadFailed(true);
          setLoading(false);
        }
      }
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

  // --- structural ops (all client-side, all reversible) ---
  const move = (i: number, dir: -1 | 1) =>
    setLayout((L) => {
      const j = i + dir;
      if (j < 0 || j >= L.length) return L;
      const next = L.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const toggle = (i: number) =>
    setLayout((L) => L.map((s, k) => (k === i ? { ...s, visible: s.visible === false } : s)));
  const duplicate = (i: number) =>
    setLayout((L) => {
      const copy = { ...L[i], id: crypto.randomUUID() };
      const next = L.slice();
      next.splice(i + 1, 0, copy);
      return next;
    });
  const remove = (i: number) => {
    const removed = layout[i];
    setLayout((L) => L.filter((_, k) => k !== i));
    // Undo, not a silent delete. flash() runs OUTSIDE the state updater so it fires reliably.
    flash(`Removed "${SECTION_REGISTRY[removed.type].label}".`, () =>
      setLayout((cur) => {
        const back = cur.slice();
        back.splice(Math.min(i, back.length), 0, removed);
        return back;
      }),
    );
  };
  const add = (type: SectionType) => {
    setLayout((L) => [...L, defaultInstance(type)]);
    setAddOpen(false);
    flash(`Added "${SECTION_REGISTRY[type].label}". Remember to save.`);
  };
  // --- content editing (PR 2) ---
  const updateProps = (i: number, props: unknown) =>
    setLayout((L) => L.map((s, k) => (k === i ? ({ ...s, props } as SectionInstance) : s)));
  // She pasted a multi-heading document and chose "separate parts": replace this section with one
  // rich_text section per heading. Fully undoable -- the composer owns the layout array.
  const splitIntoSections = (i: number, sections: RichTextValue[]) => {
    const made: SectionInstance[] = sections.map((sec) => ({
      id: crypto.randomUUID(),
      type: "rich_text",
      props: { heading: sec.heading, body: sec.body } as SectionInstance["props"],
      visible: true,
    }));
    const prev = layout;
    setLayout((L) => [...L.slice(0, i), ...made, ...L.slice(i + 1)]);
    setEditing(null);
    flash(`Split into ${made.length} section${made.length > 1 ? "s" : ""}.`, () => setLayout(prev));
  };
  // Prune empty blocks from rich_text bodies at save time -- an empty paragraph is a deleted one.
  const pruneLayout = (L: SectionInstance[]): SectionInstance[] =>
    L.map((s) =>
      s.type === "rich_text"
        ? ({ ...s, props: { ...(s.props as RichTextValue), body: pruneBlocks((s.props as RichTextValue).body) } } as SectionInstance)
        : s,
    );

  const usedTypes = useMemo(() => layout.map((s) => s.type), [layout]);

  // --- persistence: Save (draft), Publish (RPC), Revert (RPC) ---
  const save = async () => {
    if (!supabase || !pageId) return;
    setBusy("save");
    setError(null);
    // Every write to club_pages is an RPC -- the table is not an API. save_club_page_draft REJECTS
    // any attempt by a non-admin to change a platform-controlled variant (unreachable in the
    // composer anyway) and returns the stored layout. A lost session / revoked access / not-found
    // RAISES (no more silent zero-rows success), so any failure keeps the dirty flag.
    const { data, error: e } = await supabase.rpc("save_club_page_draft", {
      p_page_id: pageId,
      p_layout: pruneLayout(layout),
    });
    setBusy(false);
    if (e || data == null) {
      return setError("Could not save — your changes are still here. Check your connection and try again.");
    }
    const stored = data as SectionInstance[];
    setLayout(stored);
    setSavedJson(JSON.stringify(stored));
    flash("Saved. Your changes are kept, but not live yet.");
  };

  const publish = async () => {
    if (!supabase || !pageId) return;
    // Publish is deliberate: it is a different act from Save and asks first.
    if (!window.confirm("Publish these changes? Your public website will update straight away.")) return;
    setBusy("publish");
    setError(null);
    // Save first via the RPC, so we publish exactly what is stored (post variant-fence) -- and
    // verify it took before publishing.
    const { data: stored, error: se } = await supabase.rpc("save_club_page_draft", {
      p_page_id: pageId,
      p_layout: pruneLayout(layout),
    });
    if (se || stored == null) {
      setBusy(false);
      return setError("Could not publish — your changes are still here. Check your connection and try again.");
    }
    const { error: e } = await supabase.rpc("publish_club_page", { p_page_id: pageId });
    setBusy(false);
    if (e) return setError("Could not publish — your changes are still here. Please try again.");
    const storedLayout = stored as SectionInstance[];
    const storedStr = JSON.stringify(storedLayout);
    setLayout(storedLayout);
    setSavedJson(storedStr);
    setPublishedJson(storedStr);
    flash("Published. Your website is now live.");
  };

  const revert = async () => {
    if (!supabase || !pageId) return;
    if (!window.confirm("Discard your unpublished changes and go back to your live website?")) return;
    setBusy("revert");
    setError(null);
    const { error: e } = await supabase.rpc("revert_club_page", { p_page_id: pageId });
    if (!e) {
      const { data: page } = await supabase.from("club_pages").select("draft_layout").eq("id", pageId).maybeSingle();
      const draft = (page?.draft_layout as SectionInstance[]) ?? [];
      setLayout(draft);
      setSavedJson(JSON.stringify(draft));
    }
    setBusy(false);
    if (e) return setError("Could not revert. Please try again.");
    flash("Reverted to your live website.");
  };

  if (loading) return <div className="sw-admin-loading">Loading your page&hellip;</div>;
  if (loadFailed)
    return (
      <div className="sw-comp-signin">
        <strong>We couldn&rsquo;t load your page.</strong>
        <p>Something went wrong reaching your club&rsquo;s data. Check your connection and try again.</p>
        <button className="sw-comp-btn sw-comp-btn-publish" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
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

  return (
    <div className="sw-comp">
      <div className="sw-comp-bar">
        <div className="sw-comp-bar-status">
          <strong>
            Your home page
            {/* Only the ELEVATED role is labelled: a club admin sees the normal composer (their
                content-only fence is the default); a platform admin is told they hold design
                authority so the power is never wielded unknowingly. */}
            {canDesign && <span className="sw-comp-role">Platform admin · design tools</span>}
          </strong>
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

      <div className="sw-comp-body">
        <div className="sw-comp-list" aria-label="Your sections">
          {layout.map((s, i) => {
            const def = SECTION_REGISTRY[s.type];
            const ok = resolveSection(s).ok;
            const hidden = s.visible === false;
            return (
              <div key={s.id} className={`sw-comp-item${hidden ? " is-hidden" : ""}${ok ? "" : " is-invalid"}`}>
                <div className="sw-comp-item-main">
                  <span className="sw-comp-item-label">{def.label}</span>
                  {hidden && <span className="sw-comp-tag">Hidden</span>}
                  {!ok && <span className="sw-comp-tag sw-comp-tag-warn">Needs attention</span>}
                </div>
                <div className="sw-comp-item-ctrls">
                  <button
                    className="sw-comp-ic"
                    onClick={() => setEditing(editing === i ? null : i)}
                    aria-label="Edit content"
                  >
                    {editing === i ? "Close" : "Edit"}
                  </button>
                  <button className="sw-comp-ic" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                    &uarr;
                  </button>
                  <button
                    className="sw-comp-ic"
                    onClick={() => move(i, 1)}
                    disabled={i === layout.length - 1}
                    aria-label="Move down"
                  >
                    &darr;
                  </button>
                  <button className="sw-comp-ic" onClick={() => toggle(i)} aria-label={hidden ? "Show" : "Hide"}>
                    {hidden ? "Show" : "Hide"}
                  </button>
                  <button className="sw-comp-ic" onClick={() => duplicate(i)} aria-label="Duplicate">
                    Duplicate
                  </button>
                  <button className="sw-comp-ic sw-comp-ic-remove" onClick={() => remove(i)} aria-label="Remove">
                    Remove
                  </button>
                </div>
                {editing === i && (
                  <div className="sw-comp-editor">
                    {s.type === "rich_text" ? (
                      <RichTextEditor
                        value={s.props as RichTextValue}
                        onChange={(v) => updateProps(i, v)}
                        onSplitIntoSections={(secs) => splitIntoSections(i, secs)}
                      />
                    ) : (
                      <p className="sw-comp-editor-soon">The editor for &ldquo;{def.label}&rdquo; is coming next.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button className="sw-comp-add" onClick={() => setAddOpen((o) => !o)}>
            + Add a section
          </button>
          {addOpen && (
            <div className="sw-comp-palette" role="menu">
              {SECTION_TYPES.map((type) => {
                const allowed = canAddSection(type, usedTypes);
                return (
                  <button
                    key={type}
                    className="sw-comp-palette-item"
                    onClick={() => add(type)}
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
        </div>

        <div className="sw-comp-preview" data-render="f2" aria-label="Live preview">
          <div className="sw-comp-preview-cap">Preview &mdash; exactly what visitors see</div>
          {ctx && <PageRenderer layout={layout} ctx={ctx} theme={theme} />}
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
