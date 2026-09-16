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

vi.mock("@/lib/alerting/sendAlert", () => ({
  sendRegressionAlert: vi.fn(),
}));

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
      ] as any);

      const step = {
        run: vi.fn().mockImplementation(async (name, fn) => await fn()),
        sendEvent: vi.fn(),
      };

      // @ts-ignore
      await dailyScanJob.fn({ step });

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
    it("should process a site and trigger alert on regression", async () => {
      vi.mocked(db.monitoredSite.findUnique).mockResolvedValue({
        id: "site-4",
        url: "https://example4.com",
        status: "ACTIVE",
        user: { email: "user@example.com" },
      } as any);

      vi.mocked(runCoreScan).mockResolvedValue([
        {
          agent: "GPTBot",
          simpleStatus: "COQUILLE VIDE",
          httpStatus: 200,
          durationMs: 100,
          wordCount: 10,
        } as any,
      ]);

      // @ts-ignore
      await scanSiteJob.fn({ event: { data: { siteId: "site-4" } } });

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
      } as any);

      vi.mocked(runCoreScan).mockResolvedValue([
        {
          agent: "GPTBot",
          simpleStatus: "BLOQUÉ",
          httpStatus: 403,
          durationMs: 100,
          wordCount: 0,
        } as any,
      ]);

      vi.mocked(sendRegressionAlert).mockRejectedValue(new Error("Email crashed"));

      // @ts-ignore
      await expect(scanSiteJob.fn({ event: { data: { siteId: "site-error" } } })).rejects.toThrow("Email crashed");
      
      // The update still happened before the crash
      expect(db.monitoredSite.update).toHaveBeenCalled();
    });
  });
});
