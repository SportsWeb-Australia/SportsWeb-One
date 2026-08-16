import { useRef, useState } from "react";
import { uploadToStorage } from "../lib/upload";
import { CropModal, IMG_HELP_URL } from "../components/edit/CropModal";

/**
 * Dependency-free image field with a crop/frame tool.
 * - Locks framing to a target aspect ratio per slot.
 * - Shows recommended dimensions and warns on low-resolution sources.
 * - Crops client-side to a canvas, then uploads the result to the club's
 *   Supabase Storage bucket and returns the public URL.
 *
 * The crop dialog itself lives in components/edit/CropModal so the inline
 * on-page editor can share it without importing admin code.
 */

export function ImageField({
  label,
  hint,
  aspect,
  targetW,
  value,
  folder,
  clubId,
  transparent = false,
  onUploaded,
}: {
  label: string;
  hint?: string;
  aspect: number; // width / height
  targetW: number; // output width in px (height derived from aspect)
  value: string;
  folder: string;
  clubId: string;
  transparent?: boolean;
  onUploaded: (url: string) => void | Promise<void>;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    setSrc(URL.createObjectURL(file));
  };

  const handleApply = async (blob: Blob) => {
    setBusy(true);
    setErr(null);
    try {
      const ext = transparent ? "png" : "jpg";
      const file = new File([blob], `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${ext}`, {
        type: transparent ? "image/png" : "image/jpeg",
      });
      const url = await uploadToStorage(file, clubId, folder);
      await onUploaded(url);
      setSrc(null);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed.");
    }
    setBusy(false);
  };

  return (
    <div className="sw-imgfield">
      <div className="sw-imgfield-label">{label}</div>
      <div className="sw-imgfield-row">
        <div className="sw-imgfield-thumb" style={{ aspectRatio: String(aspect) }}>
          {value ? <img src={value} alt="" /> : <span>No image yet</span>}
        </div>
        <div className="sw-imgfield-meta">
          {hint && <p className="sw-imgfield-hint">{hint}</p>}
          <p className="sw-imgfield-coach">
            Use the largest, sharpest photo you have — low-resolution images look blurry on big screens.{" "}
            <a href={IMG_HELP_URL} target="_blank" rel="noreferrer">Why it matters</a>
          </p>
          <button type="button" className="sw-btn sw-btn--ghost sw-btn--sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {err && <p className="sw-imgfield-err">{err}</p>}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
        </div>
      </div>
      {src && (
        <CropModal
          src={src}
          aspect={aspect}
          targetW={targetW}
          transparent={transparent}
          onCancel={() => setSrc(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
