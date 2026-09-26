import { describe, expect, it } from "vitest";
import { whiteLabelMessage } from "./white-label-summary";

describe("whiteLabelMessage", () => {
  it("announces the monthly reports for plans with white-label access", () => {
    expect(whiteLabelMessage(true)).toBe("Arrive avec les rapports mensuels.");
  });

  it("points to the Agence tier for plans without white-label access", () => {
    expect(whiteLabelMessage(false)).toBe("Incluse à partir du palier Agence.");
  });
});
