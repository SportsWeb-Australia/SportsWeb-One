/**
 * The pre-rendered-payload context: "this render already has its data, don't fetch."
 *
 * Provided by F2Site when a payload exists -- server-side during the publish-time bake, and in
 * the browser when hydrating a page that bake produced. Absent everywhere else, which is what
 * keeps the live-fetching path (draft clubs, the ?f2= preview, the composer) unchanged.
 */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { F2Payload } from "../lib/f2Payload";

interface F2Seed {
  payload: F2Payload;
  /**
   * True when this markup was produced by renderToString, or is the first client render
   * adopting markup that was. Anything whose output depends on the CURRENT time has to be
   * deferred in that case -- see useToday.
   */
  prerendered: boolean;
}

const F2SeedContext = createContext<F2Seed | null>(null);

export function F2SeedProvider({ payload, children }: { payload: F2Payload; children: ReactNode }) {
  return <F2SeedContext.Provider value={{ payload, prerendered: true }}>{children}</F2SeedContext.Provider>;
}

/**
 * The seeded payload for THIS slug, or null.
 *
 * The slug check is the important part: a baked page carries the payload for one address, so
 * after a client-side navigation to another page the seed no longer applies and the hooks must
 * go back to fetching. Without it, every page on the site would render the baked one's layout.
 */
export function useF2Seed(slug?: string): F2Payload | null {
  const seed = useContext(F2SeedContext);
  if (!seed) return null;
  if (slug !== undefined && seed.payload.slug !== slug) return null;
  return seed.payload;
}

/** The nav and theme are club-wide, so they apply to any slug -- no slug check. */
export function useF2SeedClubWide(): F2Payload | null {
  return useContext(F2SeedContext)?.payload ?? null;
}

const localToday = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  // Local parts, not toISOString(): UTC would roll over a day early for anyone west of UTC and
  // late for Australia, so "upcoming events" would drop today's game in the evening.
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Today as yyyy-mm-dd, or null on a pre-rendered render's first pass.
 *
 * Anything filtered by "is this in the future" cannot be decided at bake time: the answer
 * changes every midnight while the baked HTML does not. Two bugs fall out of getting this
 * wrong, and null solves both:
 *
 *   - the frozen filter -- a page baked in March would still be hiding events that have since
 *     passed, or showing them, until someone happened to publish again; and
 *   - a hydration mismatch -- the server decided "upcoming" on the bake date and the browser
 *     decides it again today, so the two renders disagree about which items exist and React
 *     throws out the server markup it was supposed to adopt.
 *
 * So a pre-rendered pass renders the UNFILTERED set (null = no date filter), the browser's
 * first render does the same (matching markup, clean hydration), and the effect immediately
 * narrows it to today's truth. Callers not hydrating a bake get the real date straight away
 * and behave exactly as before.
 */
export function useToday(): string | null {
  const prerendered = useContext(F2SeedContext)?.prerendered ?? false;
  const [today, setToday] = useState<string | null>(() => (prerendered ? null : localToday()));
  useEffect(() => {
    if (today === null) setToday(localToday());
  }, [today]);
  return today;
}
