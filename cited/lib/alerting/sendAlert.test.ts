import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: { alertEvent: { createMany: vi.fn(), findMany: vi.fn() } },
}));

import { renderAlertEmail, suggestFix } from "./sendAlert";

describe("renderAlertEmail", () => {
  it("utilise un objet et un ton de régression, et cite la cause et le correctif", () => {
    const cause = "robots.txt interdit GPTBot";
    const email = renderAlertEmail({
      kind: "REGRESSION",
      domains: [{ domain: "exemple.fr", cause, fix: suggestFix(cause) }],
    });

    expect(email.subject).toBe("Cited — un domaine n'est plus lisible");
    expect(email.text).toContain("n'est plus lisible");
    expect(email.text).toContain("exemple.fr");
    expect(email.text).toContain(cause);
    expect(email.text).toContain("Retirez la règle qui interdit cet assistant dans robots.txt");
    expect(email.text).not.toContain("est de nouveau lisible");
  });

  it("utilise un objet et un ton de retour au vert", () => {
    const email = renderAlertEmail({
      kind: "RESOLUTION",
      domains: [{ domain: "exemple.fr", cause: "le site répond de nouveau", fix: "Rien à changer." }],
    });

    expect(email.subject).toBe("Cited — un domaine est de nouveau lisible");
    expect(email.text).toContain("est de nouveau lisible");
    expect(email.text).toContain("exemple.fr");
    expect(email.text).toContain("le site répond de nouveau");
    expect(email.text).not.toContain("n'est plus lisible");
  });

  it("regroupe plusieurs domaines dans un seul message", () => {
    const email = renderAlertEmail({
      kind: "REGRESSION",
      domains: [
        { domain: "a.fr", cause: "robots.txt interdit GPTBot", fix: suggestFix("robots.txt interdit GPTBot") },
        { domain: "b.fr", cause: "site injoignable", fix: suggestFix("site injoignable") },
      ],
    });

    expect(email.subject).toBe("Cited — 2 domaines ne sont plus lisibles");
    expect(email.text).toContain("a.fr");
    expect(email.text).toContain("b.fr");
  });
});
