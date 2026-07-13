// F2 P2 -- PR 4: the theme token schema. The validation boundary for club_themes.tokens.
// Same idea as the section registry: a closed contract validated at the door, so a
// platform-authored or (P7) AI-generated theme cannot name a font the platform does not
// serve. Font tokens are checked against the whitelist; other tokens pass as CSS value
// strings (they are applied as custom properties, which cannot break out of their value).
import { z } from "zod";
import { isValidFontStack } from "../content/fonts";

const fontToken = z
  .string()
  .refine(isValidFontStack, { message: "primary font is not served by the platform (see SERVED_FONTS)" });

export const themeTokensSchema = z
  .object({
    "--font-display": fontToken.optional(),
    "--font-body": fontToken.optional(),
    "--font-mono": fontToken.optional(),
  })
  .catchall(z.string()); // colour / shape / rhythm tokens: any CSS value string

export type ValidatedThemeTokens = z.infer<typeof themeTokensSchema>;

/** Validate a theme's token map. Unknown font -> failure, never a silent substitution. */
export function validateThemeTokens(tokens: unknown) {
  return themeTokensSchema.safeParse(tokens);
}
