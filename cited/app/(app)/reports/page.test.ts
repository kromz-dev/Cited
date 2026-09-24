import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ReportsPage from "./page";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    client: {
      findMany: vi.fn(),
    },
    scanLog: {
      findMany: vi.fn(),
    },
  },
}));

describe("ReportsPage (Server Component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to /login", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    await ReportsPage();

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(db.client.findMany).not.toHaveBeenCalled();
  });

  it("fetches clients with sites and reports for the logged in user", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-123", email: "agency@example.com" },
    } as never);

    vi.mocked(db.client.findMany).mockResolvedValueOnce([
      {
        id: "c1",
        userId: "user-123",
        name: "Client Alpha",
        sites: [{ id: "s1", name: "Site 1", url: "https://alpha.com" }],
        reports: [
          {
            id: "r1",
            period: "2026-08",
            availabilityPct: 99,
            incidentCount: 0,
            generatedAt: new Date("2026-09-01T00:00:00Z"),
          },
        ],
      },
    ] as never);

    vi.mocked(db.scanLog.findMany).mockResolvedValueOnce([
      {
        siteId: "s1",
        createdAt: new Date("2026-08-15T10:00:00Z"),
        simpleStatus: "OK",
      },
    ] as never);

    const jsx = await ReportsPage();

    expect(db.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123" },
      }),
    );
    expect(db.scanLog.findMany).toHaveBeenCalled();
    expect(jsx).toBeDefined();
    expect(jsx.type.name).toBe("ReportsClient");
    expect(jsx.props.initialClients).toEqual([
      {
        id: "c1",
        name: "Client Alpha",
        sitesCount: 1,
        reports: [
          {
            id: "r1",
            period: "2026-08",
            availabilityPct: 99,
            incidentCount: 0,
            generatedAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      },
    ]);
  });

  it("handles account with no clients gracefully without crashing", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-empty" },
    } as never);

    vi.mocked(db.client.findMany).mockResolvedValueOnce([] as never);

    const jsx = await ReportsPage();

    expect(db.client.findMany).toHaveBeenCalledWith({
      where: { userId: "user-empty" },
      include: expect.any(Object),
      orderBy: { name: "asc" },
    });
    expect(db.scanLog.findMany).not.toHaveBeenCalled();
    expect(jsx.props.initialClients).toEqual([]);
  });
});
