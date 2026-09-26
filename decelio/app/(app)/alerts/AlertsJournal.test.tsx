// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AlertsJournal, type AlertRow } from "./AlertsJournal";

/**
 * Régression T054 (audit AA) : les puces de filtre du journal des alertes
 * doivent utiliser `Button size="lg"` (44 px, `h-11`) puisqu'elles ne sont
 * pas dans un tableau de bureau — docs/07-design-system.md §6, "sm réservé
 * aux tableaux de bureau". Avant le correctif elles étaient en `size="sm"`
 * (`h-8`, 32 px), sous le plancher tactile de 44 px sur mobile.
 */
const alerts: AlertRow[] = [
  {
    id: "a1",
    siteId: "site-1",
    domain: "exemple.fr",
    type: "REGRESSION",
    cause: "robots.txt bloque GPTBot",
    sentAt: "2026-09-20T08:00:00.000Z",
  },
];

describe("AlertsJournal", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders filter buttons sized for a 44px mobile touch target", () => {
    render(<AlertsJournal alerts={alerts} />);

    for (const label of ["Tout", "Passages au rouge", "Retours au vert"]) {
      const button = screen.getByRole("button", { name: label });
      expect(button.className).toContain("h-11");
      expect(button.className).not.toMatch(/\bh-8\b/);
    }
  });

  it("keeps the verdict glyph's word accessible via sr-only text", () => {
    render(<AlertsJournal alerts={alerts} />);
    // variant="glyph" must keep the verdict word for screen readers.
    expect(screen.getByText("Refusé")).toHaveClass("sr-only");
  });
});
