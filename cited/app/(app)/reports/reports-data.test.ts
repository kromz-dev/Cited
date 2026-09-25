import { describe, it, expect } from "vitest";
import {
  formatPeriodLabel,
  buildAvailablePeriods,
  calculateReportsKpi,
  type ClientReportItem,
} from "./reports-data";

describe("reports-data", () => {
  describe("formatPeriodLabel", () => {
    it("formats YYYY-MM to French long and short labels", () => {
      const result = formatPeriodLabel("2026-09");
      expect(result).toEqual({
        label: "Septembre 2026",
        shortLabel: "Septembre",
      });

      const jan = formatPeriodLabel("2026-01");
      expect(jan).toEqual({
        label: "Janvier 2026",
        shortLabel: "Janvier",
      });
    });
  });

  describe("buildAvailablePeriods", () => {
    it("includes current month, previous month, and existing report periods in reverse chronological order", () => {
      // 2026-09-15
      const refDate = new Date("2026-09-15T12:00:00Z");
      const existing = ["2026-07", "2026-06"];

      const periods = buildAvailablePeriods(existing, refDate);
      expect(periods.map((p) => p.period)).toEqual([
        "2026-09",
        "2026-08",
        "2026-07",
        "2026-06",
      ]);
      expect(periods[0].label).toBe("Septembre 2026");
      expect(periods[1].label).toBe("Août 2026");
    });

    it("deduplicates periods if existing report matches current or previous month", () => {
      const refDate = new Date("2026-09-15T12:00:00Z");
      const existing = ["2026-09", "2026-08"];

      const periods = buildAvailablePeriods(existing, refDate);
      expect(periods.map((p) => p.period)).toEqual(["2026-09", "2026-08"]);
    });
  });

  describe("calculateReportsKpi", () => {
    it("returns null availability and zeroes when no reports exist for period", () => {
      const clients: ClientReportItem[] = [
        { id: "c1", name: "Client 1", sitesCount: 2, reports: [] },
        { id: "c2", name: "Client 2", sitesCount: 3, reports: [] },
      ];

      const kpis = calculateReportsKpi(clients, "2026-08");
      expect(kpis).toEqual({
        avgAvailability: null,
        totalDomains: 5,
        totalIncidents: 0,
        readyReportsCount: 0,
      });
    });

    it("calculates average availability, total domains, total incidents, and ready reports count accurately", () => {
      const clients: ClientReportItem[] = [
        {
          id: "c1",
          name: "Client 1",
          sitesCount: 4,
          reports: [
            {
              id: "r1",
              period: "2026-08",
              availabilityPct: 96,
              incidentCount: 1,
              generatedAt: "2026-09-01T00:00:00Z",
            },
          ],
        },
        {
          id: "c2",
          name: "Client 2",
          sitesCount: 2,
          reports: [
            {
              id: "r2",
              period: "2026-08",
              availabilityPct: 100,
              incidentCount: 0,
              generatedAt: "2026-09-01T00:00:00Z",
            },
            {
              id: "r3",
              period: "2026-07",
              availabilityPct: 80,
              incidentCount: 3,
              generatedAt: "2026-08-01T00:00:00Z",
            },
          ],
        },
        {
          id: "c3",
          name: "Client 3",
          sitesCount: 1,
          reports: [],
        },
      ];

      const kpis = calculateReportsKpi(clients, "2026-08");
      // Average of 96 and 100 = 98%
      expect(kpis.avgAvailability).toBe(98);
      // Total domains: 4 + 2 + 1 = 7
      expect(kpis.totalDomains).toBe(7);
      // Total incidents for 2026-08: 1 + 0 = 1
      expect(kpis.totalIncidents).toBe(1);
      // Ready reports for 2026-08: 2 out of 3
      expect(kpis.readyReportsCount).toBe(2);
    });
  });
});
