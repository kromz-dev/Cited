import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMonthlyReportData } from "./reports";
import { aggregateMonthlyReport } from "@/lib/reports/monthlyReport";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    client: {
      findFirst: vi.fn(),
    },
    monitoredSite: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Session } from "next-auth";

type SessionGetter = () => Promise<Session | null>;
const mockedAuth = vi.mocked(auth as unknown as SessionGetter);

function fakeSession(userId: string): Session {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

const PERIOD = { start: new Date("2026-01-01T00:00:00Z"), end: new Date("2026-01-05T23:59:59Z") };

// ---------------------------------------------------------------------------
// aggregateMonthlyReport — logique pure
// ---------------------------------------------------------------------------

describe("aggregateMonthlyReport", () => {
  it("computes availability as the share of scanned days whose last scan of the day is OK", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [
            { createdAt: new Date("2026-01-01T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
            { createdAt: new Date("2026-01-02T09:00:00Z"), simpleStatus: "BLOQUÉ", cause: "robots.txt disallows GPTBot", payload: null },
            { createdAt: new Date("2026-01-03T09:00:00Z"), simpleStatus: "BLOQUÉ", cause: "robots.txt disallows GPTBot", payload: null },
            { createdAt: new Date("2026-01-04T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
            {
              createdAt: new Date("2026-01-05T09:00:00Z"),
              simpleStatus: "OK",
              cause: null,
              payload: JSON.stringify({
                summary: { agent: "GPTBot", simpleStatus: "OK", httpStatus: 200, reasons: [] },
                report: { robots: { policies: [{ bot: "GPTBot", verdict: "allowed", token: "GPTBot" }] } },
              }),
            },
          ],
          alertEvents: [],
        },
      ],
    });

    const site = data.sites.find((s) => s.name === "Site A")!;
    expect(site.availabilityPct).toBe(60);
    expect(site.currentStatus).toBe("OK");
    expect(site.degradedDays).toBe(0);
  });

  it("excludes days without any scan from both the denominator and the history", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [
            { createdAt: new Date("2026-01-01T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
            // Aucun scan le 2 et le 3 janvier.
            { createdAt: new Date("2026-01-04T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          ],
          alertEvents: [],
        },
      ],
    });

    const site = data.sites.find((s) => s.name === "Site A")!;
    expect(site.availabilityPct).toBe(100);
    expect(data.history.find((h) => h.site === "Site A")!.entries).toHaveLength(2);
  });

  it("keeps only the last scan of a day with several scans that day", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [
            { createdAt: new Date("2026-01-01T02:00:00Z"), simpleStatus: "BLOQUÉ", cause: null, payload: null },
            { createdAt: new Date("2026-01-01T20:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          ],
          alertEvents: [],
        },
      ],
    });

    const entries = data.history.find((h) => h.site === "Site A")!.entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].status).toBe("OK");
  });

  it("counts trailing consecutive degraded days ending at the most recently scanned day", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [
            { createdAt: new Date("2026-01-01T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
            { createdAt: new Date("2026-01-02T09:00:00Z"), simpleStatus: "COQUILLE VIDE", cause: null, payload: null },
            { createdAt: new Date("2026-01-03T09:00:00Z"), simpleStatus: "BLOQUÉ", cause: null, payload: null },
          ],
          alertEvents: [],
        },
      ],
    });

    const site = data.sites.find((s) => s.name === "Site A")!;
    expect(site.degradedDays).toBe(2);
    expect(site.currentStatus).toBe("BLOQUÉ");
  });

  it("maps a null or unrecognized simpleStatus to INCONNU instead of crashing", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [
            { createdAt: new Date("2026-01-01T09:00:00Z"), simpleStatus: null, cause: null, payload: null },
          ],
          alertEvents: [],
        },
      ],
    });

    const site = data.sites.find((s) => s.name === "Site A")!;
    expect(site.currentStatus).toBe("INCONNU");
    expect(data.history.find((h) => h.site === "Site A")!.entries[0].status).toBe("INCONNU");
  });

  it("turns AlertEvent rows into a regression/resolution incident pair, sorted by date", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [],
          alertEvents: [
            {
              type: "RESOLUTION",
              cause: "robots.txt corrigé",
              fix: "Ligne Disallow retirée du robots.txt",
              sentAt: new Date("2026-01-04T09:05:00Z"),
            },
            {
              type: "REGRESSION",
              cause: "robots.txt disallows GPTBot",
              fix: null,
              sentAt: new Date("2026-01-02T09:05:00Z"),
            },
          ],
        },
      ],
    });

    expect(data.incidents).toHaveLength(2);
    expect(data.incidents[0]).toMatchObject({ type: "REGRESSION", occurredAt: "2026-01-02T09:05:00.000Z" });
    expect(data.incidents[0].fix).toBeUndefined();
    expect(data.incidents[1]).toMatchObject({
      type: "RESOLUTION",
      cause: "robots.txt corrigé",
      fix: "Ligne Disallow retirée du robots.txt",
    });
  });

  it("does not crash when payload is null (post T056 purge) and produces no technical entries", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [
            { createdAt: new Date("2026-01-01T09:00:00Z"), simpleStatus: "OK", cause: "aucune", payload: null },
          ],
          alertEvents: [],
        },
      ],
    });

    const appendix = data.technicalAppendix.find((a) => a.site === "Site A")!;
    expect(appendix.entries).toEqual([]);
  });

  it("builds the technical appendix per assistant from the last scan's payload", () => {
    const data = aggregateMonthlyReport({
      clientName: "Agence Test",
      period: PERIOD,
      sites: [
        {
          id: "site-a",
          name: "Site A",
          url: "https://site-a.example",
          scanLogs: [
            {
              createdAt: new Date("2026-01-05T09:00:00Z"),
              simpleStatus: "BLOQUÉ",
              cause: "robots.txt disallows GPTBot",
              payload: JSON.stringify({
                summary: { agent: "GPTBot", simpleStatus: "BLOQUÉ", httpStatus: 403, reasons: ["robots.txt disallows GPTBot"] },
                report: { robots: { policies: [{ bot: "GPTBot", verdict: "disallowed", token: "GPTBot" }] } },
              }),
            },
          ],
          alertEvents: [],
        },
      ],
    });

    const appendix = data.technicalAppendix.find((a) => a.site === "Site A")!;
    expect(appendix.entries).toEqual([
      { bot: "GPTBot", lastHttpStatus: 403, robotsRule: "disallowed (GPTBot)", cause: "robots.txt disallows GPTBot" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// getMonthlyReportData — action serveur (session, propriété, requêtes bornées)
// ---------------------------------------------------------------------------

const AGENCY_CLIENT = { id: "client-1", name: "Agence Test" };

function siteRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "site-a",
    name: "Site A",
    url: "https://site-a.example",
    scanLogs: [],
    alertEvents: [],
    ...overrides,
  };
}

describe("getMonthlyReportData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses an unauthenticated request without touching the database", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const res = await getMonthlyReportData("client-1", PERIOD);

    expect(res).toEqual({ error: "Unauthorized" });
    expect(db.client.findFirst).not.toHaveBeenCalled();
  });

  it("refuses a client that belongs to another account", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.client.findFirst).mockResolvedValueOnce(null as never);

    const res = await getMonthlyReportData("someone-elses-client", PERIOD);

    expect(res).toEqual({ error: "Client introuvable" });
    expect(db.client.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "someone-elses-client", userId: "user-1" } }),
    );
    expect(db.monitoredSite.findMany).not.toHaveBeenCalled();
  });

  it("aggregates two sites with a resolved incident into a consistent availability and incident list", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.client.findFirst).mockResolvedValueOnce(AGENCY_CLIENT as never);
    vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([
      siteRow({
        id: "site-a",
        name: "Site A",
        url: "https://site-a.example",
        scanLogs: [
          { createdAt: new Date("2026-01-01T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          { createdAt: new Date("2026-01-02T09:00:00Z"), simpleStatus: "BLOQUÉ", cause: "robots.txt disallows GPTBot", payload: null },
          { createdAt: new Date("2026-01-03T09:00:00Z"), simpleStatus: "BLOQUÉ", cause: "robots.txt disallows GPTBot", payload: null },
          { createdAt: new Date("2026-01-04T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          { createdAt: new Date("2026-01-05T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
        ],
        alertEvents: [
          { type: "REGRESSION", cause: "robots.txt disallows GPTBot", fix: null, sentAt: new Date("2026-01-02T09:05:00Z") },
          {
            type: "RESOLUTION",
            cause: "robots.txt corrigé",
            fix: "Ligne Disallow retirée du robots.txt",
            sentAt: new Date("2026-01-04T09:05:00Z"),
          },
        ],
      }),
      siteRow({
        id: "site-b",
        name: "Site B",
        url: "https://site-b.example",
        scanLogs: [
          { createdAt: new Date("2026-01-01T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          { createdAt: new Date("2026-01-02T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          { createdAt: new Date("2026-01-03T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          { createdAt: new Date("2026-01-04T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
          { createdAt: new Date("2026-01-05T09:00:00Z"), simpleStatus: "OK", cause: null, payload: null },
        ],
        alertEvents: [],
      }),
    ] as never);

    const res = await getMonthlyReportData("client-1", PERIOD);

    if (!("data" in res)) throw new Error(`expected data, got error: ${res.error}`);
    expect(res.data.clientName).toBe("Agence Test");

    const siteA = res.data.sites.find((s) => s.name === "Site A")!;
    expect(siteA.availabilityPct).toBe(60);
    expect(siteA.currentStatus).toBe("OK");

    const siteB = res.data.sites.find((s) => s.name === "Site B")!;
    expect(siteB.availabilityPct).toBe(100);
    expect(siteB.currentStatus).toBe("OK");

    expect(res.data.incidents).toHaveLength(2);
    expect(res.data.incidents.map((i) => i.type)).toEqual(["REGRESSION", "RESOLUTION"]);
    expect(res.data.incidents[1]).toMatchObject({
      site: "Site A",
      type: "RESOLUTION",
      cause: "robots.txt corrigé",
      fix: "Ligne Disallow retirée du robots.txt",
    });

    expect(db.monitoredSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: "client-1" } }),
    );
  });

  it("returns a zero availability and an unknown status for a period with no scans at all", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.client.findFirst).mockResolvedValueOnce(AGENCY_CLIENT as never);
    vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([siteRow()] as never);

    const res = await getMonthlyReportData("client-1", PERIOD);

    if (!("data" in res)) throw new Error(`expected data, got error: ${res.error}`);
    const site = res.data.sites[0];
    expect(site.availabilityPct).toBe(0);
    expect(site.currentStatus).toBe("INCONNU");
    expect(res.data.history[0].entries).toEqual([]);
  });

  it("does not crash when a ScanLog payload is null and omits it from the technical appendix", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.client.findFirst).mockResolvedValueOnce(AGENCY_CLIENT as never);
    vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([
      siteRow({
        scanLogs: [
          { createdAt: new Date("2026-01-05T09:00:00Z"), simpleStatus: "OK", cause: "aucune", payload: null },
        ],
      }),
    ] as never);

    const res = await getMonthlyReportData("client-1", PERIOD);

    if (!("data" in res)) throw new Error(`expected data, got error: ${res.error}`);
    expect(res.data.technicalAppendix[0].entries).toEqual([]);
  });

  it("returns a generic error if a query throws", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.client.findFirst).mockRejectedValueOnce(new Error("db down"));

    const res = await getMonthlyReportData("client-1", PERIOD);

    expect(res).toEqual({ error: "Internal server error" });
  });
});
