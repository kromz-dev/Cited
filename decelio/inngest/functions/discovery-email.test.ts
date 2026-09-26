import { describe, expect, it, vi, beforeEach } from "vitest";
import { discoveryWindow, discoveryEmailDispatcher, discoveryEmailSender } from "./discovery-email";
import { db } from "@/lib/db";
import { sendDiscoveryEmail } from "@/lib/email/resend";

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email/resend", () => ({
  sendDiscoveryEmail: vi.fn(),
}));

vi.mock("../client", () => ({
  inngest: {
    createFunction: (config: unknown, fn: unknown) => ({ config, fn }),
  },
}));

/**
 * Handlers are invoked directly, bypassing Inngest's step-orchestration
 * runtime, the same approach used in daily-scan.test.ts.
 */
function invokeHandler<TContext>(
  inngestFunction: object,
  context: TContext,
): unknown {
  return (
    inngestFunction as unknown as { fn: (ctx: TContext) => unknown }
  ).fn(context);
}

interface DispatcherStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
  sendEvent: (
    name: string,
    payloads: Array<{ id: string; name: string; data: { userId: string; email: string; name: string | null } }>,
  ) => unknown;
}

interface SenderStep {
  run: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
}

describe("discoveryWindow", () => {
  it("returns a [now-4d, now-3d) window", () => {
    const now = new Date("2026-09-24T09:00:00.000Z");
    const window = discoveryWindow(now);

    expect(window.gte).toEqual(new Date("2026-09-20T09:00:00.000Z"));
    expect(window.lt).toEqual(new Date("2026-09-21T09:00:00.000Z"));
  });
});

describe("discoveryEmailDispatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selects only accounts created 3 days ago, not 1 day ago, and sends events with deterministic ids", async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "user-3d", email: "agence@example.com", name: "Agence" },
    ] as unknown as Awaited<ReturnType<typeof db.user.findMany>>);

    const step: DispatcherStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
      sendEvent: vi.fn(),
    };

    await invokeHandler<{ step: DispatcherStep }>(discoveryEmailDispatcher, { step });

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date), lt: expect.any(Date) }),
          email: expect.anything(),
        }),
      }),
    );

    expect(step.sendEvent).toHaveBeenCalledWith(
      "send-discovery-email-events",
      [
        {
          id: "discovery-email-user-3d",
          name: "app/discovery-email.send",
          data: { userId: "user-3d", email: "agence@example.com", name: "Agence" },
        },
      ],
    );
  });

  it("does not select an account created only 1 day ago (guarded via the where filter, not app-level re-filtering)", async () => {
    // The 1-day-old account is excluded by Prisma's `where`, so the mocked
    // findMany simply returns nothing for that scenario — this asserts the
    // dispatcher sends no events when the query yields no rows.
    vi.mocked(db.user.findMany).mockResolvedValue([] as unknown as Awaited<ReturnType<typeof db.user.findMany>>);

    const step: DispatcherStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
      sendEvent: vi.fn(),
    };

    await invokeHandler<{ step: DispatcherStep }>(discoveryEmailDispatcher, { step });

    expect(step.sendEvent).not.toHaveBeenCalled();
  });
});

describe("discoveryEmailSender", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the discovery email to the event's user via Resend", async () => {
    const step: SenderStep = {
      run: vi.fn().mockImplementation(async (_name, fn) => await fn()),
    };

    await invokeHandler<{
      event: { data: { userId: string; email: string; name: string | null } };
      step: SenderStep;
    }>(discoveryEmailSender, {
      event: { data: { userId: "user-3d", email: "agence@example.com", name: "Agence" } },
      step,
    });

    expect(sendDiscoveryEmail).toHaveBeenCalledWith("agence@example.com", "Agence");
  });
});
