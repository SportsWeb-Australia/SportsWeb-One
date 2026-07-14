// F2 -- Brief 10 Phase A: the RDCA PAGE TEMPLATE. A named, versioned club_pages layout
// document (an ordered list of section instances), same shape as classic.ts. PR-A seeds the
// RDCA acceptance-test club's published_layout FROM this constant, so the TEMPLATE is what is
// proven -- not a bespoke layout. PR-A ships the hero only; the remaining sections
// (news / competition hub / performers / sponsors / ...) append here as they are ported.
//
// The hero's match card is NOT in these props: showMatchCard toggles it, but the data comes
// from ctx.matchCentre.current (the module source), gated by the match_centre entitlement.
import type { PageTemplate } from "./classic";

/** RDCA hero image (from the shipped static site). Real media, not a placeholder. */
const RDCA_HERO_IMG =
  "https://res.cloudinary.com/dozdbhjhs/image/upload/q_auto/f_auto/v1780756094/RDCA_Hero_bucegz.png";

export const RDCA_TEMPLATE: PageTemplate = {
  key: "rdca",
  version: 1,
  name: "RDCA",
  layout: [
    {
      id: "hero",
      type: "hero",
      props: {
        layout: "feature",
        showMatchCard: true,
        title: "Cricket's Home in Melbourne's East",
        titleRich: [
          { text: "Cricket's" },
          { text: "Home in", break: true },
          { text: "Melbourne's", style: "accent", break: true },
          { text: "East", style: "ghost", break: true },
        ],
        subtitle:
          "Ringwood & District Cricket Association — proudly serving 28 clubs and 4,200+ players across 12 competitions since 1920.",
        primaryCta: { label: "Register Now", href: "/register" },
        secondaryCta: { label: "Fixtures", href: "/fixtures" },
        badges: [{ text: "2024–25 Season", live: true }],
        note: "Round 14 of 18 underway",
        stats: [
          { value: "28", label: "Clubs", icon: "ti-shield-half-filled" },
          { value: "4,200+", label: "Players", icon: "ti-users-group" },
          { value: "12", label: "Competitions", icon: "ti-trophy" },
          { value: "130+", label: "Years", icon: "ti-calendar-star" },
        ],
        media: { kind: "image", url: RDCA_HERO_IMG },
      },
    },
  ],
};
