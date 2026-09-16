import { describe, it, expect } from "vitest";
import { detectBrandMention } from "./mention-detector";

describe("detectBrandMention", () => {
  it("détecte une mention simple", () => {
    const text = "Le meilleur outil est Acme pour facturer.";
    const result = detectBrandMention(text, "Acme");
    expect(result.isMentioned).toBe(true);
    expect(result.snippet).toContain("Acme");
  });

  it("ignore la casse", () => {
    const text = "Vous pouvez utiliser ACME ou megaSoft.";
    const result = detectBrandMention(text, "acme");
    expect(result.isMentioned).toBe(true);
  });

  it("évite les faux positifs partiels", () => {
    // Si la marque est "Mac", "Machine" ne doit pas matcher
    const text = "Utilisez cette machine pour le travail.";
    const result = detectBrandMention(text, "Mac");
    expect(result.isMentioned).toBe(false);
  });

  it("retourne faux si non trouvé", () => {
    const text = "Il n'y a pas d'outil recommandé.";
    const result = detectBrandMention(text, "Acme");
    expect(result.isMentioned).toBe(false);
    expect(result.position).toBeNull();
  });

  it("estime correctement la position (basique)", () => {
    const text = `
Voici les recommandations :
1. GlobalCorp - excellent outil
2. MegaSoft - très complet
3. Acme - nouvelle solution
    `;
    const result = detectBrandMention(text, "Acme");
    expect(result.isMentioned).toBe(true);
    expect(result.position).toBe(3);
  });
});
