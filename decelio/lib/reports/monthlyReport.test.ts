import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    client: {
      findFirst: vi.fn(),
    },
    monitoredSite: {
      findMany: vi.fn(),
    },
    monthlyReport: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("./renderMonthlyReportPdf", () => ({
  renderMonthlyReportPdf: vi.fn(),
}));

vi.mock("@/lib/alerting/sendReportReady", () => ({
  sendReportReady: vi.fn(),
}));

import { db } from "@/lib/db";
import { renderMonthlyReportPdf } from "./renderMonthlyReportPdf";
import { sendReportReady } from "@/lib/alerting/sendReportReady";
import { generateMonthlyReportForUser } from "./monthlyReport";

const CLIENT = { id: "client-1", name: "Agence Test" };

function mockHappyPathQueries() {
  vi.mocked(db.client.findFirst).mockResolvedValueOnce(CLIENT as never);
  vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([] as never);
  vi.mocked(renderMonthlyReportPdf).mockResolvedValueOnce(Buffer.from("pdf-bytes") as never);
}

// ---------------------------------------------------------------------------
// generateMonthlyReportForUser — persistance du MonthlyReport et déclenchement
// de l'e-mail T048 (sendReportReady), commun aux deux déclencheurs
// (action serveur `generateMonthlyReport` et job Inngest
// `monthlyReportGenerator`, qui appellent tous deux cette fonction).
// ---------------------------------------------------------------------------

describe("generateMonthlyReportForUser: notification T048 à la persistance du rapport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends exactly one report-ready email once the MonthlyReport row is persisted", async () => {
    mockHappyPathQueries();
    vi.mocked(db.monthlyReport.upsert).mockResolvedValueOnce({
      id: "report-1",
      period: "2026-09",
    } as never);
    vi.mocked(sendReportReady).mockResolvedValueOnce({ success: true, id: "email-1" });

    const result = await generateMonthlyReportForUser("user-1", "client-1", "2026-09");

    expect(result).toEqual({ data: { id: "report-1", period: "2026-09" } });
    expect(sendReportReady).toHaveBeenCalledTimes(1);
    expect(sendReportReady).toHaveBeenCalledWith("report-1");
  });

  it("sends no email when the report write fails", async () => {
    mockHappyPathQueries();
    vi.mocked(db.monthlyReport.upsert).mockRejectedValueOnce(new Error("db down"));

    const result = await generateMonthlyReportForUser("user-1", "client-1", "2026-09");

    expect(result).toEqual({ error: "Internal server error" });
    expect(sendReportReady).not.toHaveBeenCalled();
  });

  it("keeps the report generated and does not throw when the email send fails", async () => {
    mockHappyPathQueries();
    vi.mocked(db.monthlyReport.upsert).mockResolvedValueOnce({
      id: "report-2",
      period: "2026-09",
    } as never);
    vi.mocked(sendReportReady).mockRejectedValueOnce(new Error("Resend is down"));

    const result = await generateMonthlyReportForUser("user-1", "client-1", "2026-09");

    expect(result).toEqual({ data: { id: "report-2", period: "2026-09" } });
  });

  it("keeps the report generated when sendReportReady resolves with success: false", async () => {
    mockHappyPathQueries();
    vi.mocked(db.monthlyReport.upsert).mockResolvedValueOnce({
      id: "report-3",
      period: "2026-09",
    } as never);
    vi.mocked(sendReportReady).mockResolvedValueOnce({ success: false, error: "No API Key" });

    const result = await generateMonthlyReportForUser("user-1", "client-1", "2026-09");

    expect(result).toEqual({ data: { id: "report-3", period: "2026-09" } });
  });
});
