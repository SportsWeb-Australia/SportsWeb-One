import { useState, type CSSProperties, type ElementType } from "react";
import { useEdit } from "../../lib/edit";
import { saveRestorePoint, restoreVersion, newestUndoPoint } from "../../lib/siteVersions";

/** Inline-editable text. In edit mode it becomes click-to-type; saves on blur. */
export function EditableText({
  k,
  value,
  as = "span",
  className,
  style,
}: {
  k: string;
  value: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const { canEdit, editing, value: getVal, save, busyKey } = useEdit();
  const current = getVal(k, value);
  const Tag = as;

  if (canEdit && editing) {
    return (
      <Tag
        className={`${className ?? ""} sw-editable`.trim()}
        style={style}
        contentEditable
        suppressContentEditableWarning
        data-busy={busyKey === k || undefined}
        // When the editable sits inside a link/button, a tap would normally follow
        // the link. Prevent the default so tapping just places the cursor to edit.
        onClick={(e: { preventDefault: () => void }) => e.preventDefault()}
        onBlur={(e: { currentTarget: HTMLElement }) => {
          const text = e.currentTarget.textContent ?? "";
          if (text !== current) save(k, text);
        }}
      >
        {current}
      </Tag>
    );
  }
  return <Tag className={className} style={style}>{current}</Tag>;
}

/** Inline-editable image with a Swap button in edit mode. */
export function EditableImage({
  k,
  value,
  alt = "",
  className,
}: {
  k: string;
  value: string;
  alt?: string;
  className?: string;
}) {
  const { canEdit, editing, value: getVal, uploadImage, busyKey } = useEdit();
  const src = getVal(k, value);

  if (canEdit && editing) {
    return (
      <span className="sw-editable-img">
        {src ? <img src={src} alt={alt} className={className} /> : <span className="sw-editable-img-empty">No image</span>}
        <label className="sw-editable-img-btn">
          {busyKey === k ? "Uploading…" : "Swap image"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(k, file);
              e.target.value = "";
            }}
          />
        </label>
      </span>
    );
  }
  return src ? <img src={src} alt={alt} className={className} /> : null;
}

/** Floating toggle — only rendered for signed-in club admins. */
export function EditToggle() {
  const {
    canEdit, canActivate, actingAs, activateEditing, deactivateEditing,
    editing, setEditing, error, dirty, publish, publishing, clubId, clubName,
  } = useEdit();
  const [confirming, setConfirming] = useState(false);
  const [activateConfirm, setActivateConfirm] = useState(false);
  const [undoId, setUndoId] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "saving" | "undoing">(null);
  const [saved, setSaved] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  // Platform admin who hasn't opted into editing this club yet: show a deliberate
  // "act as this club" step (confirming the club name) rather than a live editor.
  if (!canEdit && canActivate) {
    return (
      <div className="sw-edit-toggle-wrap">
        {activateConfirm ? (
          <button
            className="sw-edit-toggle sw-edit-toggle--publish"
            onClick={() => { setActivateConfirm(false); activateEditing(); setEditing(true); }}
          >
            Edit {clubName}? Tap to confirm
          </button>
        ) : (
          <button className="sw-edit-toggle" onClick={() => setActivateConfirm(true)} aria-label={`Act as ${clubName} to edit its site`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit this club’s site
          </button>
        )}
      </div>
    );
  }

  if (!canEdit) return null;

  async function doPublish() {
    setConfirming(false);
    const ok = await publish();
    if (ok && clubId) {
      const pt = await newestUndoPoint(clubId).catch(() => null);
      if (pt) setUndoId(pt.id);
    }
  }

  async function doSavePoint() {
    if (!clubId || busy) return;
    setBusy("saving");
    setLocalErr(null);
    try {
      await saveRestorePoint(clubId, "Manual restore point");
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } catch (e) {
      setLocalErr(e instanceof Error ? e.message : "Couldn't save restore point.");
    }
    setBusy(null);
  }

  async function doUndo() {
    if (!undoId || busy) return;
    setBusy("undoing");
    setLocalErr(null);
    try {
      await restoreVersion(undoId);
      window.location.reload(); // re-fetch live content so the page shows the rollback
    } catch (e) {
      setLocalErr(e instanceof Error ? e.message : "Couldn't undo.");
      setBusy(null);
    }
  }

  return (
    <div className="sw-edit-toggle-wrap">
      {(error || localErr) && <span className="sw-edit-toggle-err">{error || localErr}</span>}

      {/* Which club am I editing? Guards against editing the wrong club by accident. */}
      {editing && <span className="sw-edit-club" title="You are editing this club's live site">Editing: <strong>{clubName}</strong></span>}

      {/* Undo appears right after a publish so a mistake is one tap to reverse. */}
      {undoId && !editing && (
        <button className="sw-edit-toggle sw-edit-toggle--undo" onClick={doUndo} disabled={busy === "undoing"}>
          {busy === "undoing" ? "Undoing…" : "↩ Undo last publish"}
        </button>
      )}

      {editing && (
        <button className="sw-edit-toggle sw-edit-toggle--ghost" onClick={doSavePoint} disabled={busy === "saving"}>
          {busy === "saving" ? "Saving…" : saved ? "✓ Restore point saved" : "⧉ Save restore point"}
        </button>
      )}

      {editing && dirty && (
        confirming ? (
          <button className="sw-edit-toggle sw-edit-toggle--publish" onClick={doPublish} disabled={publishing}>
            {publishing ? "Publishing…" : `Publish to ${clubName}? Tap to confirm`}
          </button>
        ) : (
          <button className="sw-edit-toggle sw-edit-toggle--publish" onClick={() => setConfirming(true)}>
            ▲ Publish changes
          </button>
        )
      )}

      <button
        className={`sw-edit-toggle${editing ? " on" : ""}`}
        onClick={() => { setConfirming(false); setEditing(!editing); }}
        aria-label={editing ? "Finish editing this page" : "Edit this page"}
      >
        {editing ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Done editing
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit page
          </>
        )}
      </button>

      {/* Platform admin acting as this club: let them step back out cleanly. */}
      {actingAs && !editing && (
        <button className="sw-edit-exit" onClick={deactivateEditing} aria-label={`Stop editing ${clubName}`}>
          Exit {clubName}
        </button>
      )}
    </div>
  );
}
