import { describe, expect, it, vi, beforeEach } from "vitest";
import { authorizeCredentials, credentialsProvider } from "./auth";
import authConfig from "./auth.config";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/password", () => ({
  verifyPassword: vi.fn(),
}));

describe("NextAuth Credentials Provider & Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Google provider configuration resilience", () => {
    it("Google provider remains intact in authConfig and does not crash without keys", () => {
      expect(authConfig.providers).toBeDefined();
      expect(authConfig.providers.length).toBeGreaterThanOrEqual(1);
      const googleProvider = authConfig.providers[0];
      // Google provider should be a provider factory function or configured provider object
      expect(googleProvider).toBeDefined();
    });

    it("Credentials provider is configured with credentials id", () => {
      expect(credentialsProvider.id).toBe("credentials");
      expect(credentialsProvider.type).toBe("credentials");
    });
  });

  describe("Credentials authorize logic", () => {
    const validEmail = "user@example.com";
    const validPassword = "securePassword123!";
    const storedHash = "scrypt:abcd:1234";

    it("logs in successfully with valid email and password", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_123",
        email: validEmail,
        name: "Test User",
        image: "https://example.com/avatar.png",
        passwordHash: storedHash,
      } as never);

      vi.mocked(verifyPassword).mockResolvedValueOnce(true);

      const result = await authorizeCredentials({
        email: validEmail,
        password: validPassword,
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: validEmail },
        select: { id: true, email: true, name: true, image: true, passwordHash: true },
      });
      expect(verifyPassword).toHaveBeenCalledWith(validPassword, storedHash);
      expect(result).toEqual({
        id: "user_123",
        email: validEmail,
        name: "Test User",
        image: "https://example.com/avatar.png",
      });
    });

    it("normalizes email (whitespace and lowercase) before lookup", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_123",
        email: validEmail,
        name: "Test User",
        image: null,
        passwordHash: storedHash,
      } as never);

      vi.mocked(verifyPassword).mockResolvedValueOnce(true);

      const result = await authorizeCredentials({
        email: "   USER@EXAMPLE.COM   ",
        password: validPassword,
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: validEmail },
        select: { id: true, email: true, name: true, image: true, passwordHash: true },
      });
      expect(result).toEqual({
        id: "user_123",
        email: validEmail,
        name: "Test User",
        image: null,
      });
    });

    it("rejects login when password does not match (wrong password)", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_123",
        email: validEmail,
        name: "Test User",
        image: null,
        passwordHash: storedHash,
      } as never);

      vi.mocked(verifyPassword).mockResolvedValueOnce(false);

      const result = await authorizeCredentials({
        email: validEmail,
        password: "wrongPassword123!",
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: validEmail },
        select: { id: true, email: true, name: true, image: true, passwordHash: true },
      });
      expect(verifyPassword).toHaveBeenCalledWith("wrongPassword123!", storedHash);
      expect(result).toBeNull();
    });

    it("rejects Google user without passwordHash cleanly without throwing unhandled exceptions", async () => {
      // User registered via Google OAuth has passwordHash: null
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "google_user_456",
        email: "googleuser@example.com",
        name: "Google User",
        image: "https://lh3.googleusercontent.com/photo",
        passwordHash: null,
      } as never);

      const result = await authorizeCredentials({
        email: "googleuser@example.com",
        password: validPassword,
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: "googleuser@example.com" },
        select: { id: true, email: true, name: true, image: true, passwordHash: true },
      });
      // verifyPassword must NOT be called to avoid unhandled TypeError
      expect(verifyPassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("rejects when user is not found in database", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);

      const result = await authorizeCredentials({
        email: "unknown@example.com",
        password: validPassword,
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: "unknown@example.com" },
        select: { id: true, email: true, name: true, image: true, passwordHash: true },
      });
      expect(verifyPassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("rejects invalid or malformed credentials without querying the database", async () => {
      // Missing credentials
      expect(await authorizeCredentials(undefined)).toBeNull();
      expect(await authorizeCredentials(null)).toBeNull();
      expect(await authorizeCredentials({})).toBeNull();

      // Malformed email
      expect(await authorizeCredentials({ email: "invalid-email", password: validPassword })).toBeNull();

      // Password too short (< 12 characters per loginSchema)
      expect(await authorizeCredentials({ email: validEmail, password: "short" })).toBeNull();

      // Missing password
      expect(await authorizeCredentials({ email: validEmail })).toBeNull();

      expect(db.user.findUnique).not.toHaveBeenCalled();
      expect(verifyPassword).not.toHaveBeenCalled();
    });
  });
});
