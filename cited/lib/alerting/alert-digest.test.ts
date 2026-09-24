import { describe, expect, it } from "vitest";
import { transitionForSite } from "./alert-digest";

const ok = (iso: string) => ({
  createdAt: new Date(iso),
  simpleStatus: "OK",
  httpStatus: 200,
  cause: "GPTBot : aucune restriction détectée",
});
const blocked = (iso: string) => ({
  createdAt: new Date(iso),
  simpleStatus: "BLOQUÉ",
  httpStatus: 403,
  cause: "robots.txt interdit GPTBot",
});

describe("transitionForSite", () => {
  it("signale une régression une seule fois", () => {
    const first = transitionForSite([blocked("2026-09-02T03:00:00Z"), ok("2026-09-01T03:00:00Z")]);
    expect(first).toEqual({
      kind: "REGRESSION",
      cause: "robots.txt interdit GPTBot",
    });

    const second = transitionForSite(
      [blocked("2026-09-03T03:00:00Z"), blocked("2026-09-02T03:00:00Z")],
      { type: "REGRESSION", sentAt: new Date("2026-09-02T04:00:00Z") },
    );
    expect(second).toBeNull();
  });

  it("signale un retour au vert", () => {
    const change = transitionForSite([ok("2026-09-04T03:00:00Z"), blocked("2026-09-03T03:00:00Z")]);
    expect(change?.kind).toBe("RESOLUTION");
  });

  it("ignore un premier scan isolé", () => {
    expect(transitionForSite([blocked("2026-09-01T03:00:00Z")])).toBeNull();
  });
});
