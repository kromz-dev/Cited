// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DashboardSites } from "./DashboardSites";

/**
 * Régression T054 (audit AA), docs/07-design-system.md §6 :
 * - le bouton "Ajouter un domaine" et le champ de recherche doivent tenir
 *   la cible tactile de 44 px sur mobile (`size="lg"` / `fieldSize="lg"`) ;
 * - le bouton de fermeture du formulaire (icône seule) doit aussi tenir
 *   44 px (`size="icon-lg"`), pas les 26 px du `<button className="p-1">`
 *   d'origine ;
 * - le tableau garde son `<caption>` et ses en-têtes `scope="col"`
 *   (dont l'en-tête `sr-only` de la colonne d'actions).
 */
vi.mock("@/app/actions/clients", () => ({
  assignSiteClient: vi.fn(),
  createClient: vi.fn(),
}));
vi.mock("@/app/actions/sites", () => ({
  addMonitoredSite: vi.fn(),
  addMonitoredSitesBulk: vi.fn(),
  deleteMonitoredSite: vi.fn(),
}));

const initialSites = [
  {
    id: "site-1",
    name: "Atelier Boréal",
    url: "https://atelier-boreal.fr",
    status: "ACTIVE",
    clientId: null,
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
  },
];

describe("DashboardSites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the primary action and the search field at the 44px mobile touch-target size", () => {
    render(<DashboardSites initialSites={initialSites} initialClients={[]} siteLimit={10} />);

    const addButton = screen.getByRole("button", { name: /Ajouter un domaine/ });
    expect(addButton.className).toContain("h-11");

    const search = screen.getByLabelText("Filtrer les domaines par nom ou adresse");
    expect(search).toHaveAttribute("data-size", "lg");
  });

  it("sizes the form's close button for a 44px touch target, not a bare 26px icon button", () => {
    render(<DashboardSites initialSites={initialSites} initialClients={[]} siteLimit={10} />);

    fireEvent.click(screen.getByRole("button", { name: /Ajouter un domaine/ }));

    const closeButton = screen.getByRole("button", { name: "Fermer le formulaire" });
    expect(closeButton.className).toContain("size-11");
  });

  it("keeps the sites table's caption and column scopes for screen readers", () => {
    render(<DashboardSites initialSites={initialSites} initialClients={[]} siteLimit={10} />);

    const table = screen.getByRole("table");
    expect(table.querySelector("caption")).not.toBeNull();

    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
    for (const header of headers) {
      expect(header).toHaveAttribute("scope", "col");
    }

    // Action column keeps a screen-reader-only header instead of an empty one.
    const actionsHeader = headers[headers.length - 1];
    expect(actionsHeader.querySelector(".sr-only")).not.toBeNull();
  });
});
