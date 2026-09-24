import { describe, expect, it, vi, beforeEach } from "vitest";
import { monthlyReportDispatcher, monthlyReportGenerator } from "./monthly-report";
import { db } from "@/lib/db";
import { generateMonthlyReportForUser } from "@/lib/reports/monthlyReport";

vi.mock("@/lib/db", () => ({
  db: {
    client: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/reports/monthlyReport", () => ({
  generateMonthlyReportForUser: vi.fn(),
  previousMonth: vi.fn(() => "2026-01"),
}));

vi.mock("../client", () => ({
  inngest: {
    createFunction: (config: unknown, fn: unknown) => ({ config, fn }),
  },
}));

/**
 * Handlers are invoked directly, bypassing Inngest's step-orchestration
 * runtime, the same approach used in discovery-email.test.ts.
 */
function invokeHandler<TContext>(inngestFunction: object, context: TContext): unknown {
  return (inngestFunction as unknown as { fn: (ctx: TContext) => unknown }).fn(context);
}

interface DispatcherStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
  sendEvent: (
    name: string,
    payloads: Array<{ id: string; name: string; data: { clientId: string; userId: string; period: string } }>,
  ) => unknown;
}

interface GeneratorStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
}

describe("monthlyReportDispatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends one deterministically-id'd event per client that has at least one site", async () => {
    vi.mocked(db.client.findMany).mockResolvedValue([
      { id: "client-1", userId: "user-1" },
      { id: "client-2", userId: "user-2" },
    ] as unknown as Awaited<ReturnType<typeof db.client.findMany>>);

    const step: DispatcherStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
      sendEvent: vi.fn(),
    };

    await invokeHandler<{ step: DispatcherStep }>(monthlyReportDispatcher, { step });

    expect(db.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sites: { some: {} } } }),
    );

    expect(step.sendEvent).toHaveBeenCalledWith("send-monthly-report-events", [
      {
        id: "monthly-report-client-1-2026-01",
        name: "app/monthly-report.generate",
        data: { clientId: "client-1", userId: "user-1", period: "2026-01" },
      },
      {
        id: "monthly-report-client-2-2026-01",
        name: "app/monthly-report.generate",
        data: { clientId: "client-2", userId: "user-2", period: "2026-01" },
      },
    ]);
  });

  it("sends nothing when no client has a site", async () => {
    vi.mocked(db.client.findMany).mockResolvedValue([] as unknown as Awaited<ReturnType<typeof db.client.findMany>>);

    const step: DispatcherStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
      sendEvent: vi.fn(),
    };

    await invokeHandler<{ step: DispatcherStep }>(monthlyReportDispatcher, { step });

    expect(step.sendEvent).not.toHaveBeenCalled();
  });
});

describe("monthlyReportGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates the report for the event's client with a single step.run (Inngest Hobby quota)", async () => {
    vi.mocked(generateMonthlyReportForUser).mockResolvedValueOnce({
      data: { id: "report-1", period: "2026-01" },
    });

    const runSpy = vi.fn().mockImplementation(async (_name, fn) => await fn());
    const step: GeneratorStep = { run: runSpy };

    const result = await invokeHandler<{
      event: { data: { clientId: string; userId: string; period: string } };
      step: GeneratorStep;
    }>(monthlyReportGenerator, {
      event: { data: { clientId: "client-1", userId: "user-1", period: "2026-01" } },
      step,
    });

    expect(generateMonthlyReportForUser).toHaveBeenCalledWith("user-1", "client-1", "2026-01");
    expect(generateMonthlyReportForUser).toHaveBeenCalledTimes(1);
    // Un seul step.run pour tout le client : jamais un step par site.
    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: { id: "report-1", period: "2026-01" } });
  });

  it("throws a non-retriable error when generation fails with a business error", async () => {
    vi.mocked(generateMonthlyReportForUser).mockResolvedValueOnce({ error: "Client introuvable" });

    const step: GeneratorStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
    };

    await expect(
      invokeHandler<{
        event: { data: { clientId: string; userId: string; period: string } };
        step: GeneratorStep;
      }>(monthlyReportGenerator, {
        event: { data: { clientId: "client-1", userId: "user-1", period: "2026-01" } },
        step,
      }),
    ).rejects.toThrow(/Client introuvable/);
  });
});
