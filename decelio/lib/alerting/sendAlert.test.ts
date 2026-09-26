import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function MockResend() {
    return { emails: { send: sendMock } };
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    alertEvent: { createMany: vi.fn(), findMany: vi.fn() },
    monitoredSite: { findFirst: vi.fn() },
  },
}));

import { db } from "@/lib/db";
import { renderAlertEmail, sendRegressionAlert, suggestFix } from "./sendAlert";

const ORIGINAL_ENV = { ...process.env };

describe("renderAlertEmail", () => {
  it("utilise un objet et un ton de régression, et cite la cause et le correctif", () => {
    const cause = "robots.txt interdit GPTBot";
    const email = renderAlertEmail({
      kind: "REGRESSION",
      domains: [{ domain: "exemple.fr", cause, fix: suggestFix(cause) }],
    });

    expect(email.subject).toBe("Decelio — un domaine n'est plus lisible");
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

    expect(email.subject).toBe("Decelio — un domaine est de nouveau lisible");
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

    expect(email.subject).toBe("Decelio — 2 domaines ne sont plus lisibles");
    expect(email.text).toContain("a.fr");
    expect(email.text).toContain("b.fr");
  });
});

describe("T026: sendRegressionAlert journalise l'alerte réellement envoyée", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMock.mockResolvedValue({ data: { id: "resend_email_789" }, error: null });
    process.env.RESEND_API_KEY = "re_test_key";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("envoie un seul e-mail et écrit une ligne AlertEvent pour le site concerné", async () => {
    vi.mocked(db.monitoredSite.findFirst).mockResolvedValueOnce({ id: "site-1" } as never);

    const result = await sendRegressionAlert(
      "agence@example.com",
      "exemple.fr",
      "OK",
      "BLOQUÉ",
    );

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(db.monitoredSite.findFirst).toHaveBeenCalledWith({
      where: { url: "exemple.fr", user: { email: "agence@example.com" } },
      select: { id: true },
    });
    expect(db.alertEvent.createMany).toHaveBeenCalledTimes(1);
    expect(db.alertEvent.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          siteId: "site-1",
          type: "REGRESSION",
          channel: "EMAIL",
        }),
      ],
    });
  });

  it("n'écrit aucune ligne AlertEvent si le site n'a pas pu être retrouvé", async () => {
    vi.mocked(db.monitoredSite.findFirst).mockResolvedValueOnce(null);

    const result = await sendRegressionAlert(
      "agence@example.com",
      "exemple.fr",
      "OK",
      "BLOQUÉ",
    );

    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(db.alertEvent.createMany).not.toHaveBeenCalled();
  });
});
