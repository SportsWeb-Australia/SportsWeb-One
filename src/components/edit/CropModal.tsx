import { useEffect, useRef, useState } from "react";

/**
 * Dependency-free crop/frame dialog.
 *
 * Shared by the admin ImageField and the on-page inline editor so a photo swapped
 * inline gets framed to exactly the same aspect ratio as one uploaded through the
 * admin form — otherwise the same slot ends up with two different shapes depending
 * on which surface the club happened to use.
 *
 * Lives under components/edit (not admin/) so importing it from the public site
 * doesn't drag the admin bundle along with it.
 */

// Image-quality coaching links. NOTE: placeholder URLs — Carson to confirm the
// real "why image quality matters" explainer + the Click Sports Media booking page.
export const IMG_HELP_URL = "https://www.sportsweb.com.au/help/photo-quality";
export const IMG_BOOK_URL = "https://www.clicksportsmedia.com.au/book";

export function CropModal({
  src,
  aspect,
  targetW,
  transparent,
  onCancel,
  onApply,
}: {
  src: string;
  aspect: number;
  targetW: number;
  transparent: boolean;
  onCancel: () => void;
  onApply: (blob: Blob) => void;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lowRes, setLowRes] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // display crop box (CSS px); height derived from aspect. Capped to the viewport so
  // the dialog still fits on a phone, which is where most club edits happen.
  const BOX_W = Math.min(360, typeof window !== "undefined" ? window.innerWidth - 72 : 360);
  const BOX_H = Math.round(BOX_W / aspect);

  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      setImg(im);
      setLowRes(im.naturalWidth < targetW * 0.9);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    im.src = src;
  }, [src, targetW]);

  // cover-fit baseline: image fully covers the box at zoom = 1
  const cover = img ? Math.max(BOX_W / img.naturalWidth, BOX_H / img.naturalHeight) : 1;
  const dispW = img ? img.naturalWidth * cover * zoom : 0;
  const dispH = img ? img.naturalHeight * cover * zoom : 0;

  const clamp = (o: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(BOX_W - dispW, o.x)),
    y: Math.min(0, Math.max(BOX_H - dispH, o.y)),
  });

  useEffect(() => {
    setOffset((o) => clamp(o));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, img]);

  // Escape closes — a modal with no keyboard exit is a trap for keyboard users.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const nx = drag.current.ox + (e.clientX - drag.current.x);
    const ny = drag.current.oy + (e.clientY - drag.current.y);
    setOffset(clamp({ x: nx, y: ny }));
  };
  const onUp = () => {
    drag.current = null;
  };

  const apply = () => {
    if (!img) return;
    const outW = targetW;
    const outH = Math.round(targetW / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // map crop-box pixels back to source pixels
    const s = cover * zoom; // displayed px per source px
    const sx = -offset.x / s;
    const sy = -offset.y / s;
    const sW = BOX_W / s;
    const sH = BOX_H / s;
    if (!transparent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
    }
    ctx.drawImage(img, sx, sy, sW, sH, 0, 0, outW, outH);
    canvas.toBlob(
      (blob) => {
        if (blob) onApply(blob);
      },
      transparent ? "image/png" : "image/jpeg",
      0.9
    );
  };

  return (
    <div className="sw-crop-overlay" role="dialog" aria-modal="true" aria-label="Frame your image">
      <div className="sw-crop-card">
        <div className="sw-crop-head">
          <strong>Frame your image</strong>
          <span>Drag to move · slider to zoom</span>
        </div>
        <div
          ref={boxRef}
          className="sw-crop-box"
          style={{ width: BOX_W, height: BOX_H, touchAction: "none" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {img && (
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: offset.x,
                top: offset.y,
                width: dispW,
                height: dispH,
                maxWidth: "none",
                userSelect: "none",
              }}
            />
          )}
          <div className="sw-crop-grid" aria-hidden="true" />
        </div>
        <input
          className="sw-crop-zoom"
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          aria-label="Zoom"
        />
        {lowRes && (
          <div className="sw-crop-warn">
            <p>Heads up: this image is smaller than the recommended size, so it may look a little soft. A larger photo will look sharper.</p>
            <p className="sw-crop-warn-cta">
              Want crisp, professional shots? SportsWeb's photography team can run a club action or media day.{" "}
              <a href={IMG_BOOK_URL} target="_blank" rel="noreferrer">Book a Click Sports Media day →</a>
            </p>
          </div>
        )}
        <div className="sw-crop-actions">
          <button type="button" className="sw-btn sw-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="sw-btn" onClick={apply}>
            Use this image
          </button>
        </div>
      </div>
    </div>
  );
}
