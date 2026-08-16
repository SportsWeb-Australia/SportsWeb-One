/**
 * The `clubs.sport_type` enum, in the order we offer it.
 *
 * One list, used by the new-club form, the super-admin grouping labels and the
 * public trial signup. Keep it in step with the Postgres enum — a value missing
 * from here isn't selectable, which is how a golf club ended up filed as
 * "other". To add a sport, ALTER TYPE public.sport_type first, then add it here.
 */
export interface SportType {
  /** The enum value stored in clubs.sport_type. */
  value: string;
  /** How we name it in the UI. */
  label: string;
  /** Display sports for ClubConfig.identity.sports; [] means "no styling hint". */
  sports: string[];
}

export const SPORT_TYPES: SportType[] = [
  { value: "afl", label: "Australian Rules (AFL)", sports: ["AFL"] },
  { value: "afl_netball", label: "AFL / Netball (FNC)", sports: ["AFL", "Netball"] },
  { value: "soccer", label: "Soccer / Football", sports: ["Soccer"] },
  { value: "cricket", label: "Cricket", sports: ["Cricket"] },
  { value: "netball", label: "Netball", sports: ["Netball"] },
  { value: "basketball", label: "Basketball", sports: ["Basketball"] },
  { value: "rugby_union", label: "Rugby Union", sports: ["Rugby Union"] },
  { value: "rugby_league", label: "Rugby League", sports: ["Rugby League"] },
  { value: "hockey", label: "Hockey", sports: ["Hockey"] },
  { value: "tennis", label: "Tennis", sports: ["Tennis"] },
  { value: "golf", label: "Golf", sports: ["Golf"] },
  { value: "swimming", label: "Swimming", sports: ["Swimming"] },
  { value: "baseball", label: "Baseball", sports: ["Baseball"] },
  { value: "softball", label: "Softball", sports: ["Softball"] },
  { value: "oztag", label: "Oztag", sports: ["Oztag"] },
  { value: "touch_football", label: "Touch Football", sports: ["Touch Football"] },
  { value: "surf_life_saving", label: "Surf Life Saving", sports: ["Surf Life Saving"] },
  { value: "triathlon", label: "Triathlon", sports: ["Triathlon"] },
  { value: "outrigger", label: "Outrigger", sports: ["Outrigger"] },
  { value: "other", label: "Other (lacrosse, etc.)", sports: [] },
];

/** value -> label, for grouping headers and tooltips. */
export const SPORT_LABELS: Record<string, string> = Object.fromEntries(
  SPORT_TYPES.map((s) => [s.value, s.label])
);

/** Display sports for a raw enum value. Unknown/'other' gives [], so only
 *  generic styles show rather than another club's sport leaking through. */
export function sportsFromType(t: string | null | undefined): string[] {
  const key = (t ?? "").toLowerCase();
  // Not an enum value, but clubs exist in the wild filed this way.
  if (key === "lacrosse") return ["Lacrosse"];
  return SPORT_TYPES.find((s) => s.value === key)?.sports ?? [];
}
