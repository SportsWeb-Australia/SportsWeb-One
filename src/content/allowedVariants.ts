import type { DesignVariant } from "./types";

/**
 * The Classic-backed variants a club is allowed to land on. The variant picker is FROZEN to
 * this set (see docs/F2-design-doc.md sec 6): the 20 bespoke variants carry no clubs and are
 * rebuilt as themes at P6, never selected anew. This is the single source of truth for the
 * freeze -- the admin picker, StartTrial, and loadClub's resolved-variant clamp all read it.
 */
export const ALLOWED_VARIANTS: DesignVariant[] = [
  "heritage",
  "broadcast",
  "arena",
  "classic",
  "stadium",
  "editorial",
  "momentum",
  "coastal",
];

/** The fallback when a resolved variant is not allowed (or missing). Classic itself. */
export const DEFAULT_VARIANT: DesignVariant = "heritage";

export function isAllowedVariant(v: string | null | undefined): v is DesignVariant {
  return !!v && (ALLOWED_VARIANTS as string[]).includes(v);
}

/**
 * Clamp any resolved variant to the allowed set, falling back to heritage. Makes the freeze
 * a property of the CODE, not a coincidence of the data: even if a legacy source (a stray
 * templates row -> a bespoke TEMPLATE_VARIANT key, an old club_content value) resolves to a
 * bespoke variant, the public renderer never lands on it. Same principle as the total renderer.
 */
export function clampVariant(v: string | null | undefined): DesignVariant {
  return isAllowedVariant(v) ? v : DEFAULT_VARIANT;
}
