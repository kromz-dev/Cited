import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth-validation";

describe("credentials validation", () => {
  it("normalizes email and enforces a strong minimum password length", () => {
    expect(registerSchema.parse({ name: "Ada", email: " ADA@EXAMPLE.COM ", password: "123456789012" })).toMatchObject({ email: "ada@example.com" });
    expect(registerSchema.safeParse({ name: "Ada", email: "ada@example.com", password: "short" }).success).toBe(false);
  });

  it("rejects malformed login credentials", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "123456789012" }).success).toBe(false);
  });
});
