import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureServerExceptionMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/lib/posthog-server", () => ({
  captureServerException: captureServerExceptionMock,
}));

const ORIGINAL_ENV = { ...process.env };

const baseRequest = { path: "/api/scan", method: "POST", headers: {} };
const baseContext = {
  routerKind: "App Router" as const,
  routePath: "/api/scan",
  routeType: "route" as const,
  revalidateReason: undefined,
};

describe("register", () => {
  it("ne lève jamais et ne requiert aucune configuration", async () => {
    const { register } = await import("./instrumentation");
    expect(() => register()).not.toThrow();
  });
});

describe("onRequestError", () => {
  beforeEach(() => {
    vi.resetModules();
    captureServerExceptionMock.mockClear();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("ignore les erreurs du runtime edge (posthog-node n'y est pas exécuté)", async () => {
    process.env.NEXT_RUNTIME = "edge";
    const { onRequestError } = await import("./instrumentation");

    await onRequestError(new Error("boom"), baseRequest, baseContext);

    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("délègue au client PostHog serveur pour le runtime nodejs", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    const { onRequestError } = await import("./instrumentation");
    const error = new Error("échec du scan quotidien");

    await onRequestError(error, baseRequest, baseContext);

    expect(captureServerExceptionMock).toHaveBeenCalledWith(error, undefined, {
      path: "/api/scan",
      method: "POST",
    });
  });

  it("ignore les erreurs quand NEXT_RUNTIME n'est pas défini (ni nodejs ni edge)", async () => {
    delete process.env.NEXT_RUNTIME;
    const { onRequestError } = await import("./instrumentation");

    await expect(onRequestError(new Error("boom"), baseRequest, baseContext)).resolves.toBeUndefined();
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });
});
