import { describe, expect, it } from "vitest";
import { worstHoursForSites } from "./scan-throughput";

describe("worstHoursForSites", () => {
  it("passe 1000 sites en moins d'une heure", () => {
    expect(worstHoursForSites(1000)).toBeLessThan(1);
  });
});
