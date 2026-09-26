import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportUserData } from "./gdpr";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    monitoredSite: {
      findMany: vi.fn(),
    },
    client: {
      findMany: vi.fn(),
    },
    brandSettings: {
      findUnique: vi.fn(),
    },
    site: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Session } from "next-auth";

type SessionGetter = () => Promise<Session | null>;
const mockedAuth = vi.mocked(auth as unknown as SessionGetter);

function fakeSession(userId: string): Session {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

const fakeUser = {
  id: "user-1",
  name: "Laura Bréa",
  email: "laura@atelier-boreal.fr",
  plan: "PRO",
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: "sub_123",
  stripePriceId: "price_123",
  stripeCurrentPeriodEnd: new Date("2026-01-01"),
  cancelledAt: null,
  purgeAt: null,
  dataExportedAt: null,
  isFounderMember: false,
  founderOfferAt: null,
  createdAt: new Date("2025-01-01"),
};

function mockDefaultQueries() {
  vi.mocked(db.user.findUnique).mockResolvedValue(fakeUser as never);
  vi.mocked(db.monitoredSite.findMany).mockResolvedValue([] as never);
  vi.mocked(db.client.findMany).mockResolvedValue([] as never);
  vi.mocked(db.brandSettings.findUnique).mockResolvedValue(null as never);
  vi.mocked(db.site.findMany).mockResolvedValue([] as never);
  vi.mocked(db.user.update).mockResolvedValue(fakeUser as never);
}

describe("exportUserData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses an unauthenticated request", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const res = await exportUserData();

    expect(res).toEqual({ error: "Unauthorized" });
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("filters every query by the session's userId, never a client-supplied id", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    mockDefaultQueries();

    await exportUserData();

    expect(db.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" } })
    );
    expect(db.monitoredSite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
    expect(db.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
    expect(db.brandSettings.findUnique).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(db.site.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } })
    );
  });

  it("never includes the password hash or any Account/Session token field", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    mockDefaultQueries();

    await exportUserData();

    const selectArg = vi.mocked(db.user.findUnique).mock.calls[0][0] as {
      select: Record<string, unknown>;
    };

    expect(selectArg.select).not.toHaveProperty("passwordHash");
    expect(selectArg.select).not.toHaveProperty("accounts");
    expect(selectArg.select).not.toHaveProperty("sessions");
  });

  it("returns the export data with plan, dates and a stripeCustomerId, but no sensitive fields", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    mockDefaultQueries();

    const res = await exportUserData();

    expect(res).toHaveProperty("data");
    if ("data" in res && res.data) {
      const json = JSON.stringify(res.data);
      expect(json).not.toMatch(/passwordHash/i);
      expect(res.data.profile.plan).toBe("PRO");
      expect(res.data.profile.stripeCustomerId).toBe("cus_123");
    }
  });

  it("updates dataExportedAt for the current user", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    mockDefaultQueries();

    await exportUserData();

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { dataExportedAt: expect.any(Date) },
    });
  });

  it("returns an error and skips the update when the user no longer exists", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("ghost-user"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null as never);
    vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(db.client.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(db.brandSettings.findUnique).mockResolvedValueOnce(null as never);
    vi.mocked(db.site.findMany).mockResolvedValueOnce([] as never);

    const res = await exportUserData();

    expect(res).toEqual({ error: "Unauthorized" });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("returns a generic error if a query throws", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockRejectedValueOnce(new Error("db down"));
    vi.mocked(db.monitoredSite.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(db.client.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(db.brandSettings.findUnique).mockResolvedValueOnce(null as never);
    vi.mocked(db.site.findMany).mockResolvedValueOnce([] as never);

    const res = await exportUserData();

    expect(res).toEqual({ error: "Internal server error" });
  });
});
