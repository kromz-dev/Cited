import { describe, expect, it } from "vitest";
import { isProtectedPath } from "./auth-route-policy";

describe("auth route policy", () => {
  it("protects every application surface", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/brands/new")).toBe(true);
    expect(isProtectedPath("/sources")).toBe(true);
    expect(isProtectedPath("/settings/profile")).toBe(true);
  });

  it("leaves marketing and authentication routes public", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/pricing")).toBe(false);
    expect(isProtectedPath("/api/audit")).toBe(false);
  });
});
