import { afterEach, describe, expect, it, vi } from "vitest";
import { logFailure } from "./log";

describe("logFailure", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("écrit une ligne JSON avec l'événement", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logFailure("alert.send_failed", { to: "a@b.fr" });
    const line = String(spy.mock.calls[0]?.[0]);
    expect(JSON.parse(line)).toMatchObject({ level: "error", event: "alert.send_failed", to: "a@b.fr" });
  });
});
