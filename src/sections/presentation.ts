// Typed access to the presentation-variant source of truth (presentation-fields.json). The SQL
// variant fence is GENERATED from the same file (scripts/gen-variant-fence.mjs), so the composer
// and the server agree on which fields are presentation and what their defaults are -- one source,
// no drift.
import fields from "./presentation-fields.json";
import type { SectionType } from "./schemas";

// section -> field -> default value ("_comment" is metadata, filtered out by the string guard).
const RAW = fields as Record<string, Record<string, string> | string>;

/** Default value for a section's presentation field, or undefined if the section has none. */
export function variantDefault(type: SectionType, field: string): string | undefined {
  const sec = RAW[type];
  return sec && typeof sec !== "string" ? sec[field] : undefined;
}

/** The presentation-variant field names for a section type (platform-controlled). */
export function presentationFields(type: SectionType): string[] {
  const sec = RAW[type];
  return sec && typeof sec !== "string" ? Object.keys(sec) : [];
}
