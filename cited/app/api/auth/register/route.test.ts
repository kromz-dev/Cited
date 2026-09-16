import { describe, expect, it } from "vitest";
import { REGISTER_LIMIT_PER_HOUR, REGISTER_WINDOW_MS } from "../../../../lib/auth-registration-policy";

describe("registration abuse guard", () => {
  it("uses a shared-database fixed-window limit", () => {
    expect(REGISTER_LIMIT_PER_HOUR).toBe(5);
    expect(REGISTER_WINDOW_MS).toBe(60 * 60 * 1000);
  });
});
