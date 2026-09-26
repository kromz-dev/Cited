import { describe, expect, it } from "vitest";
import { maxSitesFor } from "../billing/plans";
import { quotaLabel } from "./quota-label";

describe("quotaLabel", () => {
  it("change avec le plan", () => {
    expect(quotaLabel(2, maxSitesFor("SOLO"))).toBe("2 / 10");
    expect(quotaLabel(2, maxSitesFor("PRO"))).toBe("2 / 30");
    expect(quotaLabel(2, maxSitesFor("SCALE"))).toBe("2 / 100");
  });
});
