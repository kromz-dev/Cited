import { describe, it, expect, vi, beforeEach } from "vitest";
import { listClients, createClient, assignSiteClient } from "./clients";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    client: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    monitoredSite: {
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

type SessionGetter = () => Promise<Session | null>;
const mockedAuth = vi.mocked(auth as unknown as SessionGetter);

function fakeSession(userId: string): Session {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

describe("clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuse sans session", async () => {
    mockedAuth.mockResolvedValue(null);
    expect(await listClients()).toEqual({ error: "Unauthorized" });
    expect(await createClient("Atelier")).toEqual({ error: "Unauthorized" });
    expect(await assignSiteClient("site-1", "client-1")).toEqual({ error: "Unauthorized" });
    expect(db.client.create).not.toHaveBeenCalled();
  });

  it("crée un client rattaché au compte connecté", async () => {
    mockedAuth.mockResolvedValue(fakeSession("user-1"));
    vi.mocked(db.client.create).mockResolvedValue({ id: "client-1", name: "Atelier Boréal" } as never);

    const res = await createClient("  Atelier Boréal  ");

    expect(res).toEqual({ data: { id: "client-1", name: "Atelier Boréal" } });
    expect(db.client.create).toHaveBeenCalledWith({
      data: { name: "Atelier Boréal", userId: "user-1" },
      select: { id: true, name: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("refuse un nom vide", async () => {
    mockedAuth.mockResolvedValue(fakeSession("user-1"));
    expect(await createClient("   ")).toEqual({
      error: "Indiquez un nom de client (80 caractères maximum).",
    });
    expect(db.client.create).not.toHaveBeenCalled();
  });

  it("associe un site du compte à un client du compte", async () => {
    mockedAuth.mockResolvedValue(fakeSession("user-1"));
    vi.mocked(db.client.findFirst).mockResolvedValue({ id: "client-1" } as never);
    vi.mocked(db.monitoredSite.updateMany).mockResolvedValue({ count: 1 });

    const res = await assignSiteClient("site-1", "client-1");

    expect(res).toEqual({ data: { siteId: "site-1", clientId: "client-1" } });
    expect(db.client.findFirst).toHaveBeenCalledWith({
      where: { id: "client-1", userId: "user-1" },
      select: { id: true },
    });
    expect(db.monitoredSite.updateMany).toHaveBeenCalledWith({
      where: { id: "site-1", userId: "user-1" },
      data: { clientId: "client-1" },
    });
  });

  it("retire le client d'un site", async () => {
    mockedAuth.mockResolvedValue(fakeSession("user-1"));
    vi.mocked(db.monitoredSite.updateMany).mockResolvedValue({ count: 1 });

    const res = await assignSiteClient("site-1", null);

    expect(res).toEqual({ data: { siteId: "site-1", clientId: null } });
    expect(db.client.findFirst).not.toHaveBeenCalled();
    expect(db.monitoredSite.updateMany).toHaveBeenCalledWith({
      where: { id: "site-1", userId: "user-1" },
      data: { clientId: null },
    });
  });

  it("refuse un client qui n'appartient pas au compte", async () => {
    mockedAuth.mockResolvedValue(fakeSession("user-1"));
    vi.mocked(db.client.findFirst).mockResolvedValue(null);

    const res = await assignSiteClient("site-1", "client-autre");

    expect(res).toEqual({ error: "Ce client n'existe pas sur ce compte." });
    expect(db.monitoredSite.updateMany).not.toHaveBeenCalled();
  });
});
