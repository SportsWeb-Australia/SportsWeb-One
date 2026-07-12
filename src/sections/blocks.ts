// F2 P2 -- PR 2: the rich_text block union.
// docs/F2-design-doc.md sec 4, "the two schema fixes": rich_text.body must be a CLOSED
// Block[] union, never a blob and never raw HTML. Raw HTML in props is banned -- it is at
// once the "club breaks the site" vector, the XSS vector, and the thing an LLM cannot be
// trusted to author. Everything below is plain text/strings, rendered as text nodes.
import { z } from "zod";

/** A paragraph of plain text. Rendered as a <p> text node -- never dangerouslySetInnerHTML. */
export const paragraphBlock = z.object({
  kind: z.literal("paragraph"),
  text: z.string().min(1),
});

/** A bulleted or numbered list of plain-text items. */
export const listBlock = z.object({
  kind: z.literal("list"),
  ordered: z.boolean().optional(),
  items: z.array(z.string().min(1)).min(1),
});

/** A single headline figure (e.g. "1892" / "Founded"). */
export const statBlock = z.object({
  kind: z.literal("stat"),
  value: z.string().min(1),
  label: z.string().min(1),
});

/** The closed rich_text body union. A renderer can exhaustively switch on `kind`. */
export const blockSchema = z.discriminatedUnion("kind", [paragraphBlock, listBlock, statBlock]);

export type Block = z.infer<typeof blockSchema>;
export type ParagraphBlock = z.infer<typeof paragraphBlock>;
export type ListBlock = z.infer<typeof listBlock>;
export type StatBlock = z.infer<typeof statBlock>;
