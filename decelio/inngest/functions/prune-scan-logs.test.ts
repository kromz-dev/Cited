import { describe, expect, it, vi, beforeEach } from "vitest";
import { pruneScanLogsJob, pruneCutoff } from "./prune-scan-logs";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    scanLog: {
      updateMany: vi.fn(),
    },
  },
}));

// `inngest.createFunction()` renvoie un `InngestFunction` dont le handler est
// un champ de classe privé (cf. node_modules/inngest/components/InngestFunction.d.ts),
// inaccessible depuis la surface de type publique. On appelle donc directement
// le handler via cet accesseur étroit, à l'identique de daily-scan.test.ts.
function invokeHandler<TContext>(
  inngestFunction: object,
  context: TContext,
): unknown {
  return (
    inngestFunction as unknown as { fn: (ctx: TContext) => unknown }
  ).fn(context);
}

interface PruneScanLogsStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
}

describe("pruneCutoff", () => {
  it("returns the date 90 days before now", () => {
    const now = new Date("2026-09-24T04:00:00.000Z");

    const cutoff = pruneCutoff(now);

    expect(cutoff.toISOString()).toBe("2026-06-26T04:00:00.000Z");
  });

  it("does not mutate the date passed in", () => {
    const now = new Date("2026-09-24T04:00:00.000Z");
    const originalTime = now.getTime();

    pruneCutoff(now);

    expect(now.getTime()).toBe(originalTime);
  });
});

describe("pruneScanLogsJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters on createdAt older than the cutoff and a non-null payload", async () => {
    vi.mocked(db.scanLog.updateMany).mockResolvedValue({ count: 3 });

    const step: PruneScanLogsStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
    };

    await invokeHandler<{ step: PruneScanLogsStep }>(pruneScanLogsJob, { step });

    const call = vi.mocked(db.scanLog.updateMany).mock.calls[0][0]!;
    const where = call.where!;
    expect(where.payload).toEqual({ not: null });
    expect(where.createdAt).toHaveProperty("lt");
    expect((where.createdAt as { lt: Date }).lt).toBeInstanceOf(Date);
  });

  it("only sets payload to null in data, leaving simpleStatus and cause untouched", async () => {
    vi.mocked(db.scanLog.updateMany).mockResolvedValue({ count: 3 });

    const step: PruneScanLogsStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
    };

    await invokeHandler<{ step: PruneScanLogsStep }>(pruneScanLogsJob, { step });

    const call = vi.mocked(db.scanLog.updateMany).mock.calls[0][0];
    expect(call.data).toEqual({ payload: null });
    expect(Object.keys(call.data)).toEqual(["payload"]);
  });

  it("calls updateMany exactly once, never looping row by row", async () => {
    vi.mocked(db.scanLog.updateMany).mockResolvedValue({ count: 42 });

    const step: PruneScanLogsStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
    };

    await invokeHandler<{ step: PruneScanLogsStep }>(pruneScanLogsJob, { step });

    expect(db.scanLog.updateMany).toHaveBeenCalledTimes(1);
  });

  it("returns the number of pruned rows for Inngest logs", async () => {
    vi.mocked(db.scanLog.updateMany).mockResolvedValue({ count: 7 });

    const step: PruneScanLogsStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
    };

    const result = await invokeHandler<{ step: PruneScanLogsStep }>(pruneScanLogsJob, { step });

    expect(result).toEqual({ prunedCount: 7 });
  });
});
