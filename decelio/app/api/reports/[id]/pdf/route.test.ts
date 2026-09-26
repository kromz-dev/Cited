import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    monthlyReport: {
      findUnique: vi.fn(),
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

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/reports/[id]/pdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const res = await GET(new Request("http://localhost/api/reports/report-1/pdf"), ctx("report-1"));

    expect(res.status).toBe(401);
    expect(db.monthlyReport.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the report does not exist", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.monthlyReport.findUnique).mockResolvedValueOnce(null as never);

    const res = await GET(new Request("http://localhost/api/reports/missing/pdf"), ctx("missing"));

    expect(res.status).toBe(404);
  });

  it("returns 404 for a report belonging to another account (no existence leak)", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.monthlyReport.findUnique).mockResolvedValueOnce({
      pdf: Buffer.from("%PDF-fake"),
      period: "2026-01",
      client: { userId: "someone-else", name: "Agence Test" },
    } as never);

    const res = await GET(new Request("http://localhost/api/reports/report-1/pdf"), ctx("report-1"));

    expect(res.status).toBe(404);
  });

  it("returns 200 with the PDF bytes and download headers for the owner", async () => {
    mockedAuth.mockResolvedValueOnce(fakeSession("user-1"));
    vi.mocked(db.monthlyReport.findUnique).mockResolvedValueOnce({
      pdf: Buffer.from("%PDF-1.4 fake content"),
      period: "2026-01",
      client: { userId: "user-1", name: "Agence Test" },
    } as never);

    const res = await GET(new Request("http://localhost/api/reports/report-1/pdf"), ctx("report-1"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="rapport-agence-test-2026-01.pdf"',
    );

    const bytes = new Uint8Array(await res.arrayBuffer());
    const text = Buffer.from(bytes).toString("utf-8");
    expect(text.startsWith("%PDF")).toBe(true);
  });
});
