// Team Line-Ups embed -- F2 section + legacy block share one gate. Pure logic,
// no DOM: section components are plain functions returning React elements, so
// they're called directly and their return value inspected, same spirit as
// registry.test.ts.
import { describe, it, expect } from "vitest";
import { sectionContextFromClub } from "../entitlement";
import { SECTION_REGISTRY } from "../registry";
import { TeamLineupsEmbedSection } from "../components/module";
import { TeamLineupsEmbed } from "../../components/blocks/TeamLineupsEmbed";
import type { ClubConfig } from "../../content/types";

function fixture(overrides: Partial<ClubConfig>): ClubConfig {
  return { enabledModules: [], ...overrides } as ClubConfig;
}

describe("team_lineups_embed registration", () => {
  it("is gated on the existing team_lineups capability, not a bespoke flag", () => {
    expect(SECTION_REGISTRY.team_lineups_embed.entitlementKey).toBe("team_lineups");
  });
});

describe("F2 TeamLineupsEmbedSection (rule 6: not entitled -> nothing)", () => {
  it("renders nothing when the club lacks the module", () => {
    const ctx = sectionContextFromClub(fixture({ enabledModules: [], clubId: "abc-123" }));
    expect(TeamLineupsEmbedSection({ props: {}, ctx })).toBeNull();
  });

  it("renders nothing when entitled but unlinked (no clubId)", () => {
    const ctx = sectionContextFromClub(fixture({ enabledModules: ["team_lineups"], clubId: undefined }));
    expect(TeamLineupsEmbedSection({ props: {}, ctx })).toBeNull();
  });

  it("renders the iframe, keyed on sw1club, when entitled and linked", () => {
    const ctx = sectionContextFromClub(fixture({ enabledModules: ["team_lineups"], clubId: "abc-123" }));
    const el = TeamLineupsEmbedSection({ props: {}, ctx });
    expect(el).not.toBeNull();
    const iframe = el!.props.children;
    expect(iframe.props.src).toBe("https://afl-team-line-ups.vercel.app/?embed=1&sw1club=abc-123");
  });
});

describe("legacy TeamLineupsEmbed block", () => {
  it("renders nothing when the club lacks the module", () => {
    const club = fixture({ enabledModules: [], clubId: "abc-123" });
    expect(TeamLineupsEmbed({ club })).toBeNull();
  });

  it("renders the iframe, keyed on sw1club, when entitled and linked", () => {
    const club = fixture({ enabledModules: ["team_lineups"], clubId: "abc-123" });
    const el = TeamLineupsEmbed({ club });
    expect(el).not.toBeNull();
    expect(el!.props.src).toBe("https://afl-team-line-ups.vercel.app/?embed=1&sw1club=abc-123");
  });
});
