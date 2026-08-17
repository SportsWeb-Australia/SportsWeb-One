import { describe, it, expect } from "vitest";
import { teamLineupsEmbedUrl } from "../modules";

describe("teamLineupsEmbedUrl", () => {
  it("builds the public embed URL keyed on sw1club, never club", () => {
    const src = teamLineupsEmbedUrl("11111111-1111-1111-1111-111111111111");
    expect(src).toBe("https://afl-team-line-ups.vercel.app/?embed=1&sw1club=11111111-1111-1111-1111-111111111111");
    expect(src).not.toMatch(/[?&]club=/);
    expect(src).not.toMatch(/[?&]admin/);
  });

  it("returns null with no clubId", () => {
    expect(teamLineupsEmbedUrl(undefined)).toBeNull();
    expect(teamLineupsEmbedUrl(null)).toBeNull();
  });
});
