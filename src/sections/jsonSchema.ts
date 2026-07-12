// F2 P2 -- PR 2: JSON Schema export. THE AI SEAM.
// docs/F2-design-doc.md sec 8 (the Fill path) + Codey Brief 08 item 3. Each section's props
// schema, emitted as JSON Schema straight from the SAME zod schema the renderer validates
// against -- so "generate a hero for this club" is a constrained, validated generation and
// there is never a second hand-maintained copy of the schema in a prompt to drift from.
import { zodToJsonSchema } from "zod-to-json-schema";
import { SECTION_SCHEMAS, type SectionType } from "./schemas";

// NOTE: zod `.refine()` predicates (e.g. the unsafe-href-scheme rejection in schemas.ts)
// cannot be expressed in JSON Schema and do not appear in this output. That is fine and by
// design: JSON Schema constrains the STRUCTURE Claude generates; the zod schema -- refines
// included -- is still the validation gate at the door (resolveSection). Generate against
// the JSON Schema, validate against zod.
/** JSON Schema for one section type's props. */
export function sectionJsonSchema(type: SectionType) {
  return zodToJsonSchema(SECTION_SCHEMAS[type], { name: type, target: "jsonSchema7" });
}

/** Every section's props as JSON Schema, keyed by type. Computed once on import; only the
 *  AI path pulls this module in, so the renderer never pays for it. */
export const SECTION_JSON_SCHEMAS: Record<SectionType, ReturnType<typeof zodToJsonSchema>> =
  Object.fromEntries(
    (Object.keys(SECTION_SCHEMAS) as SectionType[]).map((t) => [t, sectionJsonSchema(t)]),
  ) as Record<SectionType, ReturnType<typeof zodToJsonSchema>>;
