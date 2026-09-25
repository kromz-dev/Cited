import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureExceptionMock = vi.hoisted(() => vi.fn());
const flushMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const PostHogConstructorMock = vi.hoisted(() => vi.fn());

vi.mock("posthog-node", () => ({
  PostHog: vi.fn().mockImplementation(function MockPostHog(...args: unknown[]) {
    PostHogConstructorMock(...args);
    return { captureException: captureExceptionMock, flush: flushMock };
  }),
}));

const ORIGINAL_ENV = { ...process.env };

describe("captureServerException", () => {
  beforeEach(() => {
    vi.resetModules();
    captureExceptionMock.mockClear();
    flushMock.mockClear();
    PostHogConstructorMock.mockClear();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("n'envoie rien et ne lève jamais quand le token est absent", async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;

    const { captureServerException } = await import("./posthog-server");

    await expect(captureServerException(new Error("boom"))).resolves.toBeUndefined();

    expect(PostHogConstructorMock).not.toHaveBeenCalled();
    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(flushMock).not.toHaveBeenCalled();
  });

  it("n'envoie rien et ne lève jamais quand seul le host est configuré", async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://eu.i.posthog.com";

    const { captureServerException } = await import("./posthog-server");

    await expect(captureServerException(new Error("boom"))).resolves.toBeUndefined();

    expect(PostHogConstructorMock).not.toHaveBeenCalled();
  });

  it("transmet l'exception, l'identifiant et les propriétés au client PostHog quand la configuration est présente", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://eu.i.posthog.com";

    const { captureServerException } = await import("./posthog-server");
    const error = new Error("échec du scan");

    await captureServerException(error, "user-123", { path: "/api/scan" });

    expect(PostHogConstructorMock).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ host: "https://eu.i.posthog.com" }),
    );
    expect(captureExceptionMock).toHaveBeenCalledWith(error, "user-123", { path: "/api/scan" });
    expect(flushMock).toHaveBeenCalledTimes(1);
  });

  it("ne lève jamais si le client PostHog échoue à l'envoi", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://eu.i.posthog.com";
    captureExceptionMock.mockImplementationOnce(() => {
      throw new Error("panne réseau PostHog");
    });

    const { captureServerException } = await import("./posthog-server");

    await expect(captureServerException(new Error("boom"))).resolves.toBeUndefined();
  });

  it("réutilise le même client PostHog entre deux appels (un seul construit)", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://eu.i.posthog.com";

    const { captureServerException } = await import("./posthog-server");

    await captureServerException(new Error("premier"));
    await captureServerException(new Error("second"));

    expect(PostHogConstructorMock).toHaveBeenCalledTimes(1);
  });
});
