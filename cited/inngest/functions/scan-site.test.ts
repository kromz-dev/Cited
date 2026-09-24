import { describe, expect, it, vi, beforeEach } from "vitest";
import { scanSiteJob } from "./scan-site";
import { db } from "@/lib/db";
import { runCoreScan } from "@/lib/scanner/core";
import { sendRegressionAlert } from "@/lib/alerting/sendAlert";

vi.mock("@/lib/db", () => ({
  db: {
    monitoredSite: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    scanLog: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/scanner/core", () => ({
  runCoreScan: vi.fn(),
}));

vi.mock("@/lib/alerting/sendAlert", () => ({
  sendRegressionAlert: vi.fn(),
}));

type CoreScanOutput = Awaited<ReturnType<typeof runCoreScan>>;
type MonitoredSiteWithUser = Awaited<ReturnType<typeof db.monitoredSite.findUnique>>;
type ScanLogRows = Awaited<ReturnType<typeof db.scanLog.findMany>>;

function invokeHandler<TContext>(inngestFunction: object, context: TContext): unknown {
  return (inngestFunction as unknown as { fn: (ctx: TContext) => unknown }).fn(context);
}

interface ScanSiteStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
}

function createdRows() {
  const data = vi.mocked(db.scanLog.createMany).mock.calls[0]?.[0]?.data;
  if (!Array.isArray(data)) {
    throw new Error("createMany devait recevoir une liste de journaux");
  }
  return data;
}

function stepThatRuns(): ScanSiteStep {
  return {
    run: vi.fn().mockImplementation(async (_name: string, fn: () => unknown) => await fn()),
  };
}

const reportBots = [
  { agent: "GPTBot", simpleStatus: "OK", reasons: [], httpStatus: 200, durationMs: 10, wordCount: 80 },
  { agent: "ClaudeBot", simpleStatus: "BLOQUÉ", reasons: ["robots.txt disallows ClaudeBot"], httpStatus: 200, durationMs: 10, wordCount: 80 },
  { agent: "PerplexityBot", simpleStatus: "COQUILLE VIDE", reasons: ["js_dependent: 12 words in raw HTML"], httpStatus: 200, durationMs: 10, wordCount: 12 },
] as const;

describe("scanSiteJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.scanLog.findMany).mockResolvedValue([] as unknown as ScanLogRows);
  });

  it("journalise simpleStatus et cause pour chaque bot du rapport", async () => {
    vi.mocked(db.monitoredSite.findUnique).mockResolvedValue({
      id: "site-1",
      url: "https://exemple.fr",
      status: "OK",
      user: { email: "agence@exemple.fr" },
    } as unknown as MonitoredSiteWithUser);
    vi.mocked(runCoreScan).mockResolvedValue({
      report: { robots: {}, access: {}, jsDependency: {} },
      results: reportBots,
    } as unknown as CoreScanOutput);

    await invokeHandler(scanSiteJob, {
      event: { data: { siteIds: ["site-1"] } },
      step: stepThatRuns(),
    });

    expect(runCoreScan).toHaveBeenCalledWith("https://exemple.fr", [
      "GPTBot",
      "ClaudeBot",
      "PerplexityBot",
    ]);
    const rows = createdRows();
    expect(rows).toEqual([
      expect.objectContaining({
        siteId: "site-1",
        simpleStatus: "OK",
        cause: "GPTBot : aucune restriction détectée",
      }),
      expect.objectContaining({
        siteId: "site-1",
        simpleStatus: "BLOQUÉ",
        cause: "ClaudeBot : robots.txt interdit ClaudeBot",
      }),
      expect.objectContaining({
        siteId: "site-1",
        simpleStatus: "COQUILLE VIDE",
        cause: "PerplexityBot : la page dépend de JavaScript",
      }),
    ]);
  });

  it("laisse payload vide quand le verdict du bot n'a pas changé", async () => {
    vi.mocked(db.monitoredSite.findUnique).mockResolvedValue({
      id: "site-1",
      url: "https://exemple.fr",
      status: "BLOQUÉ",
      user: { email: "agence@exemple.fr" },
    } as unknown as MonitoredSiteWithUser);
    vi.mocked(db.scanLog.findMany).mockResolvedValue([
      { simpleStatus: "BLOQUÉ", cause: "ClaudeBot : robots.txt interdit ClaudeBot" },
      { simpleStatus: "OK", cause: "GPTBot : aucune restriction détectée" },
      { simpleStatus: "COQUILLE VIDE", cause: "PerplexityBot : la page dépend de JavaScript" },
    ] as unknown as ScanLogRows);
    vi.mocked(runCoreScan).mockResolvedValue({
      report: {},
      results: reportBots,
    } as unknown as CoreScanOutput);

    await invokeHandler(scanSiteJob, {
      event: { data: { siteId: "site-1" } },
      step: stepThatRuns(),
    });

    const rows = createdRows();
    expect(rows.map((row) => row.payload)).toEqual([null, null, null]);
    expect(db.monitoredSite.update).not.toHaveBeenCalled();
  });

  it("écrit le payload seulement pour le bot dont le verdict change", async () => {
    vi.mocked(db.monitoredSite.findUnique).mockResolvedValue({
      id: "site-1",
      url: "https://exemple.fr",
      status: "OK",
      user: { email: "agence@exemple.fr" },
    } as unknown as MonitoredSiteWithUser);
    vi.mocked(db.scanLog.findMany).mockResolvedValue([
      { simpleStatus: "OK", cause: "GPTBot : aucune restriction détectée" },
    ] as unknown as ScanLogRows);
    vi.mocked(runCoreScan).mockResolvedValue({
      report: { marque: "complet" },
      results: [reportBots[0], reportBots[1]],
    } as unknown as CoreScanOutput);

    await invokeHandler(scanSiteJob, {
      event: { data: { siteIds: ["site-1"] } },
      step: stepThatRuns(),
    });

    const rows = createdRows();
    expect(rows[0]?.payload).toBeNull();
    expect(JSON.parse(String(rows[1]?.payload))).toMatchObject({
      agent: "ClaudeBot",
      simpleStatus: "BLOQUÉ",
      cause: "ClaudeBot : robots.txt interdit ClaudeBot",
    });
  });

  it("utilise un seul step.run par site du lot", async () => {
    vi.mocked(db.monitoredSite.findUnique).mockImplementation((async (args: { where: { id: string } }) => ({
      id: args.where.id,
      url: `https://${args.where.id}.exemple.fr`,
      status: "OK",
      user: { email: "agence@exemple.fr" },
    })) as unknown as typeof db.monitoredSite.findUnique);
    vi.mocked(runCoreScan).mockResolvedValue({
      report: {},
      results: [reportBots[0]],
    } as unknown as CoreScanOutput);
    const step = stepThatRuns();

    await invokeHandler(scanSiteJob, {
      event: { data: { siteIds: ["site-a", "site-b"] } },
      step,
    });

    expect(step.run).toHaveBeenCalledTimes(2);
    expect(vi.mocked(step.run).mock.calls.map((call) => call[0])).toEqual([
      "scan-site-a",
      "scan-site-b",
    ]);
  });

  it("prévient une fois si le pire verdict régresse", async () => {
    vi.mocked(db.monitoredSite.findUnique).mockResolvedValue({
      id: "site-1",
      url: "https://exemple.fr",
      status: "OK",
      user: { email: "agence@exemple.fr" },
    } as unknown as MonitoredSiteWithUser);
    vi.mocked(runCoreScan).mockResolvedValue({
      report: {},
      results: reportBots,
    } as unknown as CoreScanOutput);

    await invokeHandler(scanSiteJob, {
      event: { data: { siteIds: ["site-1"] } },
      step: stepThatRuns(),
    });

    expect(db.monitoredSite.update).toHaveBeenCalledWith({
      where: { id: "site-1" },
      data: { status: "BLOQUÉ" },
    });
    expect(sendRegressionAlert).toHaveBeenCalledTimes(1);
  });
});
