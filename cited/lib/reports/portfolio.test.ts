import { describe, it, expect } from "vitest";
import { computeDailyPortfolioAvailability } from "./portfolio";

describe("computeDailyPortfolioAvailability", () => {
  const period = {
    start: new Date("2026-09-01T00:00:00Z"),
    end: new Date("2026-09-30T23:59:59Z"),
  };

  it("returns empty array when logs are empty", () => {
    expect(computeDailyPortfolioAvailability([], period)).toEqual([]);
  });

  it("filters out logs outside the period", () => {
    const logs = [
      { siteId: "site-1", createdAt: new Date("2026-08-31T23:59:59Z"), simpleStatus: "OK" },
      { siteId: "site-1", createdAt: new Date("2026-10-01T00:00:01Z"), simpleStatus: "OK" },
    ];
    expect(computeDailyPortfolioAvailability(logs, period)).toEqual([]);
  });

  it("retains the last scan of the day for each site and calculates availability", () => {
    const logs = [
      // Day 1: site-1 was BLOQUÉ in the morning, became OK in the afternoon
      { siteId: "site-1", createdAt: new Date("2026-09-01T08:00:00Z"), simpleStatus: "BLOQUÉ" },
      { siteId: "site-1", createdAt: new Date("2026-09-01T14:00:00Z"), simpleStatus: "OK" },
      // Day 1: site-2 was OK
      { siteId: "site-2", createdAt: new Date("2026-09-01T10:00:00Z"), simpleStatus: "OK" },
      // Day 2: site-1 OK, site-2 ERREUR
      { siteId: "site-1", createdAt: new Date("2026-09-02T10:00:00Z"), simpleStatus: "OK" },
      { siteId: "site-2", createdAt: new Date("2026-09-02T10:00:00Z"), simpleStatus: "ERREUR" },
    ];

    const result = computeDailyPortfolioAvailability(logs, period);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      day: "1 sept.",
      value: 100, // 2/2 sites OK
      isAlert: false,
    });
    expect(result[1]).toEqual({
      day: "2 sept.",
      value: 50, // 1/2 sites OK
      isAlert: true,
    });
  });
});
