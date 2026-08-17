/**
 * Parse a stored club date as LOCAL time, or null if it isn't a date at all.
 *
 * `new Date("2026-10-12")` is specified to parse as UTC midnight, so reading .getDate() in
 * the viewer's zone gives the PREVIOUS day for anyone west of UTC — a parent overseas sees
 * every club event a day early. Pinning bare yyyy-mm-dd values to T00:00:00 makes them the
 * viewer's own day. Full timestamps are already unambiguous and pass through untouched.
 *
 * Returns null (rather than an Invalid Date) for values that were never dates — "TBC",
 * "Every Friday" — so callers can choose to show them verbatim instead of showing nothing.
 */
export function parseClubDate(value: string): Date | null {
  if (!value) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format an ISO date (yyyy-mm-dd) as e.g. "12 Apr 2026". Non-dates pass through verbatim. */
export function formatDate(iso: string): string {
  const d = parseClubDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
