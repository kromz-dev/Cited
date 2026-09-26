import { describe, expect, it } from "vitest";
import { consecutiveDaysDown } from "./consecutive-days";

describe("consecutiveDaysDown", () => {
  it("compte les jours dégradés qui se suivent jusqu'au dernier scan", () => {
    expect(consecutiveDaysDown([
      { date: "2026-09-01", degraded: false },
      { date: "2026-09-02", degraded: true },
      { date: "2026-09-03", degraded: true },
      { date: "2026-09-04", degraded: true },
    ])).toBe(3);
  });

  it("s'arrête à un jour sans scan", () => {
    expect(consecutiveDaysDown([
      { date: "2026-09-01", degraded: true },
      { date: "2026-09-03", degraded: true },
    ])).toBe(1);
  });

  it("vaut zéro si le dernier jour est lisible", () => {
    expect(consecutiveDaysDown([
      { date: "2026-09-01", degraded: true },
      { date: "2026-09-02", degraded: false },
    ])).toBe(0);
  });
});
