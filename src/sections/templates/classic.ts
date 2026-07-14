// F2 P2 -- PR 4: the Classic PAGE TEMPLATE. A named, versioned artifact (doc sec 0:
// "an ordered list of section instances with placeholder content").
//
// This is the thing P3 resets a page to and adds sections from, and the thing P6 migrates
// the 15 Classic clubs onto. It is code, not a one-off SQL insert -- seed any club's
// published_layout FROM this constant so the TEMPLATE is what is proven, never a bespoke
// layout. Content sections carry placeholder copy the club then edits; Collection/Module
// sections carry display config only and render the club's real data or honest empty states
// -- never fabricated data (rule 9).
import type { SectionInstance } from "../schemas";

export interface PageTemplate {
  key: string;
  version: number;
  name: string;
  layout: SectionInstance[];
}

/** Classic -- the structure carrying 15 of 17 clubs (audit sec 6). */
export const CLASSIC_TEMPLATE: PageTemplate = {
  key: "classic",
  version: 1,
  name: "Classic",
  layout: [
    {
      id: "hero",
      type: "hero",
      props: {
        eyebrow: "Welcome",
        title: "Your Club, Online",
        subtitle: "Everything your members and supporters need, in one place.",
        primaryCta: { label: "Join the Club", href: "/register" },
        secondaryCta: { label: "Fixtures", href: "/fixtures" },
        layout: "centred",
      },
    },
    {
      id: "quick_links",
      type: "quick_links",
      props: {
        heading: "Get involved",
        links: [
          { label: "Fixtures & Results", href: "/fixtures" },
          { label: "Register to Play", href: "/register" },
          { label: "Our Teams", href: "/teams" },
          { label: "Sponsors", href: "/sponsors" },
        ],
      },
    },
    { id: "news", type: "news", props: { heading: "Latest News", layout: "feature", count: 3 } },
    { id: "match_centre", type: "match_data", props: { mode: "combined", count: 5 } },
    {
      id: "join",
      type: "cta_band",
      props: {
        heading: "Ready to get involved?",
        blurb: "Registration takes two minutes.",
        actions: [{ label: "Register now", href: "/register" }],
      },
    },
    { id: "sponsors", type: "sponsors", props: { heading: "Our Sponsors", display: "strip" } },
  ],
};

/** All page templates by key. P3/P6 read from here; add new templates as new constants. */
import { RDCA_TEMPLATE } from "./rdca";
export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  classic: CLASSIC_TEMPLATE,
  rdca: RDCA_TEMPLATE,
};
