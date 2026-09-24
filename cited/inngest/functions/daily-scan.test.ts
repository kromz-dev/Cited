import { describe, expect, it, vi, beforeEach } from "vitest";
import { dailyScanJob } from "./daily-scan";
import { scanSiteJob } from "./scan-site";
import { db } from "@/lib/db";
import { runCoreScan } from "@/lib/scanner/core";
import { sendRegressionAlert } from "@/lib/alerting/sendAlert";

vi.mock("@/lib/db", () => ({
  db: {
    monitoredSite: {
      count: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    scanLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/scanner/core", () => ({
  runCoreScan: vi.fn(),
}));

type CoreScanOutput = Awaited<ReturnType<typeof runCoreScan>>;
type MonitoredSiteRows = Awaited<ReturnType<typeof db.monitoredSite.findMany>>;
type MonitoredSiteWithUser = Awaited<ReturnType<typeof db.monitoredSite.findUnique>>;

vi.mock("@/lib/alerting/sendAlert", () => ({
  sendRegressionAlert: vi.fn(),
}));

/**
 * `inngest.createFunction()` returns an `InngestFunction` whose handler is a
 * private class field (see node_modules/inngest/components/InngestFunction.d.ts),
 * so it isn't reachable from the public type surface. These tests call the
 * handler directly to unit test its logic without Inngest's step-orchestration
 * runtime. Rather than suppressing the compiler with @ts-ignore/@ts-expect-error
 * at each call site, we go through one narrow, explicitly typed accessor that
 * describes exactly the context shape each handler destructures.
 */
function invokeHandler<TContext>(
  inngestFunction: object,
  context: TContext,
): unknown {
  return (
    inngestFunction as unknown as { fn: (ctx: TContext) => unknown }
  ).fn(context);
}

interface DailyScanStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
  sendEvent: (
    name: string,
    payloads: Array<{ name: string; data: { siteId: string } }>,
  ) => unknown;
}

interface ScanSiteStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
}

describe("Fan-Out Inngest Scans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dailyScanJob (Dispatcher)", () => {
    it("should fetch sites in batches and send events", async () => {
      vi.mocked(db.monitoredSite.count).mockResolvedValue(2);
      vi.mocked(db.monitoredSite.findMany).mockResolvedValue([
        { id: "site-1" },
        { id: "site-2" },
      ] as unknown as MonitoredSiteRows);

      const step: DailyScanStep = {
        run: vi.fn().mockImplementation(async (name, fn) => await fn()),
        sendEvent: vi.fn(),
      };

      await invokeHandler<{ step: DailyScanStep }>(dailyScanJob, { step });

      expect(step.sendEvent).toHaveBeenCalledWith(
        "send-events-0",
        [
          { name: "app/scan.site", data: { siteId: "site-1" } },
          { name: "app/scan.site", data: { siteId: "site-2" } }
        ]
      );
    });
  });

  describe("scanSiteJob (Worker)", () => {
    const step: ScanSiteStep = {
      run: vi.fn().mockImplementation(async (_name: string, fn: () => unknown) => await fn()),
    };

    it("should process a site and trigger alert on regression", async () => {
      vi.mocked(db.monitoredSite.findUnique).mockResolvedValue({
        id: "site-4",
        url: "https://example4.com",
        status: "ACTIVE",
        user: { email: "user@example.com" },
      } as unknown as MonitoredSiteWithUser);

      vi.mocked(runCoreScan).mockResolvedValue({
        report: { robots: {}, access: {}, jsDependency: {} },
        results: [
          {
            agent: "GPTBot",
            simpleStatus: "COQUILLE VIDE",
            httpStatus: 200,
            durationMs: 100,
            wordCount: 10,
          },
        ],
      } as unknown as CoreScanOutput);

      await invokeHandler<{ event: { data: { siteId: string } }; step: ScanSiteStep }>(
        scanSiteJob,
        { event: { data: { siteId: "site-4" } }, step },
      );

      const logged = vi.mocked(db.scanLog.create).mock.calls[0][0];
      expect(JSON.parse(String(logged.data.payload))).toMatchObject({
        summary: { simpleStatus: "COQUILLE VIDE" },
        report: { robots: {}, access: {}, jsDependency: {} },
      });

      expect(db.monitoredSite.update).toHaveBeenCalledWith({
        where: { id: "site-4" },
        data: { status: "COQUILLE VIDE" },
      });
      expect(sendRegressionAlert).toHaveBeenCalledWith(
        "user@example.com",
        "https://example4.com",
        "ACTIVE",
        "COQUILLE VIDE"
      );
    });

    it("should propagate errors if email fails (Inngest will retry)", async () => {
      vi.mocked(db.monitoredSite.findUnique).mockResolvedValue({
        id: "site-error",
        url: "https://error.com",
        status: "OK",
        user: { email: "error@example.com" },
      } as unknown as MonitoredSiteWithUser);

      vi.mocked(runCoreScan).mockResolvedValue({
        report: {},
        results: [
          {
            agent: "GPTBot",
            simpleStatus: "BLOQUÉ",
            httpStatus: 403,
            durationMs: 100,
            wordCount: 0,
          },
        ],
      } as unknown as CoreScanOutput);

      vi.mocked(sendRegressionAlert).mockRejectedValue(new Error("Email crashed"));

      await expect(
        invokeHandler<{ event: { data: { siteId: string } }; step: ScanSiteStep }>(
          scanSiteJob,
          { event: { data: { siteId: "site-error" } }, step },
        ),
      ).rejects.toThrow("Email crashed");
      
      // The update still happened before the crash
      expect(db.monitoredSite.update).toHaveBeenCalled();
    });
  });
});
