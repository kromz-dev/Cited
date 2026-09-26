import { describe, expect, it } from "vitest";
import { PLAN_LIMITS, maxSitesFor } from "./plans";

describe("PLAN_LIMITS", () => {
  it("defines the quota and white-label access for each plan", () => {
    expect(PLAN_LIMITS.FREE).toEqual({ maxSites: 0, whiteLabel: false });
    expect(PLAN_LIMITS.SOLO).toEqual({ maxSites: 10, whiteLabel: false });
    expect(PLAN_LIMITS.PRO).toEqual({ maxSites: 30, whiteLabel: true });
    expect(PLAN_LIMITS.SCALE).toEqual({ maxSites: 100, whiteLabel: true });
  });
});

describe("maxSitesFor", () => {
  it("returns the site quota for each known plan", () => {
    expect(maxSitesFor("FREE")).toBe(0);
    expect(maxSitesFor("SOLO")).toBe(10);
    expect(maxSitesFor("PRO")).toBe(30);
    expect(maxSitesFor("SCALE")).toBe(100);
  });

  it("returns 0 for an unknown plan", () => {
    expect(maxSitesFor("NOT_A_PLAN")).toBe(0);
  });
});
