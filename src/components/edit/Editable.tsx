import type { CSSProperties, ElementType } from "react";
import { useEdit } from "../../lib/edit";

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
  const { canEdit, editing, setEditing, error, dirty, publish, publishing } = useEdit();
  if (!canEdit) return null;
  return (
    <div className="sw-edit-toggle-wrap">
      {error && <span className="sw-edit-toggle-err">{error}</span>}
      {editing && dirty && (
        <button className="sw-edit-toggle sw-edit-toggle--publish" onClick={publish} disabled={publishing}>
          {publishing ? "Publishing…" : "▲ Publish changes"}
        </button>
      )}
      <button
        className={`sw-edit-toggle${editing ? " on" : ""}`}
        onClick={() => setEditing(!editing)}
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
    </div>
  );
}
