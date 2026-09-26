import { describe, it, expect } from "vitest";
import { formatExportDateLabel, formatPurgeLabel } from "./personal-data-summary";

describe("formatExportDateLabel", () => {
  it("returns null when no export has ever happened", () => {
    expect(formatExportDateLabel(null)).toBeNull();
  });

  it("formats the last export date in French", () => {
    expect(formatExportDateLabel(new Date("2026-03-14T00:00:00.000Z"))).toBe(
      "Dernier export le 14 mars 2026"
    );
  });
});

describe("formatPurgeLabel", () => {
  it("gives the factual 60-day rule when the account is not cancelled", () => {
    expect(formatPurgeLabel({ cancelledAt: null, purgeAt: null })).toBe(
      "En cas de résiliation de l'abonnement, vos données sont conservées 60 jours puis supprimées définitivement."
    );
  });

  it("gives the exact scheduled purge date once the account is cancelled", () => {
    const label = formatPurgeLabel({
      cancelledAt: new Date("2026-01-01T00:00:00.000Z"),
      purgeAt: new Date("2026-03-02T00:00:00.000Z"),
    });
    expect(label).toBe("Vos données seront supprimées le 2 mars 2026.");
  });

  it("falls back to the factual rule if cancelled but purgeAt is somehow missing", () => {
    expect(
      formatPurgeLabel({ cancelledAt: new Date("2026-01-01T00:00:00.000Z"), purgeAt: null })
    ).toBe(
      "En cas de résiliation de l'abonnement, vos données sont conservées 60 jours puis supprimées définitivement."
    );
  });
});
