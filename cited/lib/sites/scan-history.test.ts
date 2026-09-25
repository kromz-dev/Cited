import { describe, expect, it } from "vitest";
import { buildScanHistory } from "./scan-history";

describe("buildScanHistory", () => {
  it("produit une série datée propre à chaque site", () => {
    const siteA = buildScanHistory([
      { createdAt: new Date("2026-09-01T08:00:00Z"), simpleStatus: "OK", httpStatus: 200 },
      { createdAt: new Date("2026-09-02T08:00:00Z"), simpleStatus: "BLOQUÉ", httpStatus: 403 },
    ]);
    const siteB = buildScanHistory([
      { createdAt: new Date("2026-09-03T08:00:00Z"), simpleStatus: "OK", httpStatus: 200 },
    ]);

    expect(siteA.map((point) => point.date)).toEqual(["2026-09-01", "2026-09-02"]);
    expect(siteA.map((point) => point.degraded)).toEqual([false, true]);
    expect(siteB.map((point) => point.date)).toEqual(["2026-09-03"]);
    expect(siteA).not.toEqual(siteB);
  });

  it("ne garde que le dernier scan de chaque jour", () => {
    const series = buildScanHistory([
      { createdAt: new Date("2026-09-01T02:00:00Z"), simpleStatus: "BLOQUÉ", httpStatus: 403 },
      { createdAt: new Date("2026-09-01T20:00:00Z"), simpleStatus: "OK", httpStatus: 200 },
    ]);

    expect(series).toHaveLength(1);
    expect(series[0]?.degraded).toBe(false);
  });

  it("reste vide quand le site n'a aucun journal", () => {
    expect(buildScanHistory([])).toEqual([]);
  });

  it("marque un code HTTP 4xx comme dégradé quand simpleStatus est encore vide", () => {
    const series = buildScanHistory([
      { createdAt: new Date("2026-09-04T08:00:00Z"), simpleStatus: null, httpStatus: 403 },
    ]);
    expect(series[0]?.degraded).toBe(true);
  });
});
