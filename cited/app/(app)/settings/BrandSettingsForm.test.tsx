// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrandSettingsForm } from "./BrandSettingsForm";

/**
 * Régression T054 (audit AA) :
 * - le champ "Couleur d'accent (hexadécimal)" n'avait qu'un `aria-label`,
 *   sans `<label htmlFor>` réel associé (docs/07-design-system.md §6,
 *   "<label htmlFor> visible") ;
 * - quand `updateBrandSettings` renvoie une erreur, les champs doivent
 *   porter `aria-invalid` et `aria-describedby` vers le message (§6,
 *   "aria-invalid, aria-describedby vers le message").
 */
vi.mock("@/app/actions/settings", () => ({
  updateBrandSettings: vi.fn(),
}));

import { updateBrandSettings } from "@/app/actions/settings";

describe("BrandSettingsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("associates a real <label> with the hexadecimal accent-color field", () => {
    render(
      <BrandSettingsForm initialAgencyName="Atelier" initialLogoUrl="" initialAccentColor="#2b55d0" />,
    );

    // getByLabelText only succeeds if a <label htmlFor> (visible or sr-only)
    // is wired to the input via id — an aria-label alone would also pass,
    // so we additionally assert the label element exists in the DOM.
    const hexInput = screen.getByLabelText("Couleur d'accent (hexadécimal)");
    expect(hexInput).toHaveAttribute("id", "brand-accent-color-hex");
    const label = document.querySelector('label[for="brand-accent-color-hex"]');
    expect(label).not.toBeNull();
    expect(label).toHaveClass("sr-only");
  });

  it("wires aria-invalid and aria-describedby on the fields when the server rejects the form", async () => {
    vi.mocked(updateBrandSettings).mockResolvedValueOnce({
      error: "La couleur d'accent doit être au format hexadécimal #rrggbb.",
    });

    render(
      <BrandSettingsForm initialAgencyName="Atelier" initialLogoUrl="" initialAccentColor="#2b55d0" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La couleur d'accent doit être au format hexadécimal #rrggbb.");
    const errorId = alert.getAttribute("id");
    expect(errorId).toBeTruthy();

    await waitFor(() => {
      const agencyInput = screen.getByLabelText("Nom de l'agence");
      expect(agencyInput).toHaveAttribute("aria-invalid", "true");
      expect(agencyInput).toHaveAttribute("aria-describedby", errorId);
    });
  });

  it("renders the primary submit button at the 44px mobile touch-target size", () => {
    render(
      <BrandSettingsForm initialAgencyName="Atelier" initialLogoUrl="" initialAccentColor="#2b55d0" />,
    );
    const submit = screen.getByRole("button", { name: "Enregistrer" });
    expect(submit.className).toContain("h-11");
  });
});
