import { useState, type CSSProperties, type ElementType } from "react";
import { useEdit } from "../../lib/edit";
import { CropModal } from "./CropModal";
import { imageSlot } from "./imageSlots";

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

/**
 * Shared pick → crop → upload flow for the inline image controls.
 *
 * Every inline swap now goes through the same crop dialog the admin form uses, so
 * a photo changed on the page lands at the slot's intended aspect ratio instead of
 * whatever shape came off the club's phone.
 */
function useCropUpload(k: string) {
  const { uploadImage } = useEdit();
  const [src, setSrc] = useState<string | null>(null);
  const slot = imageSlot(k);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setSrc(URL.createObjectURL(file));
  };

  const apply = async (blob: Blob) => {
    const ext = slot.transparent ? "png" : "jpg";
    const file = new File([blob], `${k.replace(/[^a-z0-9]+/gi, "-")}.${ext}`, {
      type: slot.transparent ? "image/png" : "image/jpeg",
    });
    // Revoke before the await so a slow upload can't leak the object URL.
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    await uploadImage(k, file, slot.folder);
  };

  const cancel = () => {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
  };

  const modal = src ? (
    <CropModal
      src={src}
      aspect={slot.aspect}
      targetW={slot.targetW}
      transparent={!!slot.transparent}
      onCancel={cancel}
      onApply={apply}
    />
  ) : null;

  return { pick, modal };
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
  const { canEdit, editing, value: getVal, busyKey } = useEdit();
  const { pick, modal } = useCropUpload(k);
  const src = getVal(k, value);

  if (canEdit && editing) {
    return (
      <span className="sw-editable-img">
        {src ? <img src={src} alt={alt} className={className} /> : <span className="sw-editable-img-empty">No image</span>}
        <label className="sw-editable-img-btn">
          {busyKey === k ? "Uploading…" : "Swap image"}
          <input type="file" accept="image/*" hidden onChange={pick} />
        </label>
        {modal}
      </span>
    );
  }
  return src ? <img src={src} alt={alt} className={className} /> : null;
}

/** Edit-mode overlay button to swap a background/cover image (hero, slide, banner).
 *  Renders nothing unless a club admin is actively editing. Pair it with reading the
 *  same key via useEdit().value for the actual background src. */
export function EditableBgButton({ k, label = "Change photo" }: { k: string; label?: string }) {
  const { canEdit, editing, busyKey } = useEdit();
  const { pick, modal } = useCropUpload(k);
  if (!canEdit || !editing) return null;
  return (
    <>
      <label className="sw-edit-bgbtn" onClick={(e) => e.stopPropagation()}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        {busyKey === k ? "Uploading…" : label}
        <input type="file" accept="image/*" hidden onChange={pick} />
      </label>
      {modal}
    </>
  );
}

const VIDEO_OK = /^https?:\/\/.+/i;

/**
 * Edit-mode control for a video slot: paste a YouTube / Vimeo / MP4 link, or clear
 * it to fall back to the still image.
 *
 * Without this a club that set a hero video had no way to change or remove it from
 * the page — the background-photo button hides itself whenever a video is set, so
 * the slot was a one-way door.
 */
export function EditableVideo({ k, label = "video" }: { k: string; label?: string }) {
  const { canEdit, editing, value: getVal, save, busyKey } = useEdit();
  const [open, setOpen] = useState(false);
  const current = getVal(k, "");
  const [draft, setDraft] = useState(current);
  const [err, setErr] = useState<string | null>(null);

  if (!canEdit || !editing) return null;

  const commit = async (next: string) => {
    const trimmed = next.trim();
    if (trimmed && !VIDEO_OK.test(trimmed)) {
      setErr("Paste a full link starting with https://");
      return;
    }
    setErr(null);
    await save(k, trimmed);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="sw-edit-bgbtn sw-edit-bgbtn--video"
        onClick={(e) => { e.stopPropagation(); setDraft(current); setOpen((o) => !o); }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="6" width="14" height="12" rx="2" />
          <path d="m22 8-6 4 6 4V8Z" />
        </svg>
        {current ? `Change ${label}` : `Add ${label}`}
      </button>

      {open && (
        <div className="sw-edit-videopop" onClick={(e) => e.stopPropagation()}>
          <label className="sw-edit-videolabel" htmlFor={`vid-${k}`}>
            Video link — YouTube, Vimeo or a direct MP4
          </label>
          <input
            id={`vid-${k}`}
            className="sw-edit-videoinput"
            type="url"
            placeholder="https://…"
            value={draft}
            spellCheck={false}
            onChange={(e) => { setDraft(e.target.value); setErr(null); }}
          />
          <p className="sw-edit-videohint">Leave blank to go back to the photo.</p>
          {err && <p className="sw-edit-videoerr">{err}</p>}
          <div className="sw-edit-videoacts">
            <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
            {current && (
              <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={() => commit("")}>
                Remove video
              </button>
            )}
            <button type="button" className="sw-btn sw-btn--sm" disabled={busyKey === k} onClick={() => commit(draft)}>
              {busyKey === k ? "Saving…" : "Save link"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { EditToggle } from "./EditToggle";
