import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateBrandSettings } from "./settings";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    brandSettings: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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

const validInput = {
  agencyName: "Atelier Boréal Agence",
  accentColor: "#2b55d0",
  logoUrl: "https://cdn.example.com/logo.png",
};

describe("updateBrandSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses an unauthenticated request", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const res = await updateBrandSettings(validInput);

    expect(res).toEqual({ error: "Unauthorized" });
    expect(db.user.findUnique).not.toHaveBeenCalled();
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("refuses a SOLO account with an explicit message, before any write", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "SOLO" } as never);

    const res = await updateBrandSettings(validInput);

    expect(res).toEqual({ error: "La marque blanche est incluse à partir du palier Agence." });
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("refuses a FREE account with an explicit message", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "FREE" } as never);

    const res = await updateBrandSettings(validInput);

    expect(res).toEqual({ error: "La marque blanche est incluse à partir du palier Agence." });
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("accepts a PRO account and upserts BrandSettings filtered by the session userId", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);
    vi.mocked(db.brandSettings.upsert).mockResolvedValueOnce({
      id: "brand-1",
      userId: "user-1",
      ...validInput,
      updatedAt: new Date(),
    } as never);

    const res = await updateBrandSettings(validInput);

    expect(res).toHaveProperty("data");
    expect(db.brandSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: expect.objectContaining({
          agencyName: "Atelier Boréal Agence",
          accentColor: "#2b55d0",
          logoUrl: "https://cdn.example.com/logo.png",
        }),
        create: expect.objectContaining({ userId: "user-1" }),
      })
    );
  });

  it("accepts a SCALE account", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "SCALE" } as never);
    vi.mocked(db.brandSettings.upsert).mockResolvedValueOnce({} as never);

    const res = await updateBrandSettings(validInput);

    expect(res).toHaveProperty("data");
  });

  it("accepts an omitted logoUrl and stores null", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);
    vi.mocked(db.brandSettings.upsert).mockResolvedValueOnce({} as never);

    await updateBrandSettings({ agencyName: "Atelier Boréal Agence", accentColor: "#2b55d0" });

    expect(db.brandSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ logoUrl: null }),
      })
    );
  });

  it("rejects an invalid accent color", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);

    const res = await updateBrandSettings({ ...validInput, accentColor: "not-a-color" });

    expect(res).toHaveProperty("error");
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("rejects a logo URL that is not https", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);

    const res = await updateBrandSettings({ ...validInput, logoUrl: "http://cdn.example.com/logo.png" });

    expect(res).toHaveProperty("error");
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("rejects a logo URL over 2048 characters", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);

    const longUrl = "https://cdn.example.com/" + "a".repeat(2048);
    const res = await updateBrandSettings({ ...validInput, logoUrl: longUrl });

    expect(res).toHaveProperty("error");
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("rejects an empty agency name", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);

    const res = await updateBrandSettings({ ...validInput, agencyName: "  " });

    expect(res).toHaveProperty("error");
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("rejects an agency name over 80 characters", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);

    const res = await updateBrandSettings({ ...validInput, agencyName: "a".repeat(81) });

    expect(res).toHaveProperty("error");
    expect(db.brandSettings.upsert).not.toHaveBeenCalled();
  });

  it("returns a generic error if the database throws", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ plan: "PRO" } as never);
    vi.mocked(db.brandSettings.upsert).mockRejectedValueOnce(new Error("db down"));

    const res = await updateBrandSettings(validInput);

    expect(res).toEqual({ error: "Internal server error" });
  });
});
