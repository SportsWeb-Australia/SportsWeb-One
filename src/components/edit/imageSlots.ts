/**
 * Framing spec per image content key.
 *
 * Both editing surfaces read this: the admin ImageField and the inline on-page
 * swap. Before this existed only the admin form enforced an aspect ratio, so a
 * photo swapped inline went up raw and the same slot could end up a different
 * shape depending on which surface the club used.
 *
 * Keys with a numeric index (photostrip images, footer logos) are matched after
 * stripping the trailing `.N`, so one entry covers the whole set.
 */
export interface ImageSlot {
  /** width / height — the shape this slot is rendered at. */
  aspect: number;
  /** output width in px; height derived from aspect. */
  targetW: number;
  /** keep alpha (logos, flags) rather than flattening onto white. */
  transparent?: boolean;
  /** storage sub-folder, mirrors the admin form's folders. */
  folder: string;
}

const SLOTS: Record<string, ImageSlot> = {
  "hero.backgroundImage": { aspect: 16 / 9, targetW: 1600, folder: "hero" },
  "hero.image": { aspect: 16 / 9, targetW: 1600, folder: "hero" },
  "branding.logo": { aspect: 1, targetW: 512, transparent: true, folder: "brand" },
  "president.portrait": { aspect: 1, targetW: 600, folder: "people" },
  "about.photo": { aspect: 4 / 3, targetW: 1200, folder: "about" },
  "home.photostrip.images": { aspect: 4 / 3, targetW: 1200, folder: "page" },
  "footer.logo": { aspect: 1, targetW: 400, transparent: true, folder: "footer" },
};

/** Anything not listed falls back to a wide landscape crop. */
const DEFAULT_SLOT: ImageSlot = { aspect: 16 / 9, targetW: 1400, folder: "page" };

export function imageSlot(key: string): ImageSlot {
  if (SLOTS[key]) return SLOTS[key];
  // `home.photostrip.images.2` → `home.photostrip.images`
  const stripped = key.replace(/\.\d+$/, "");
  return SLOTS[stripped] ?? DEFAULT_SLOT;
}
