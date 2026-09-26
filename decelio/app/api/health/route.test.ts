import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// La route de santé ne doit jamais toucher la base (sinon Neon ne se met
// jamais en veille, cf. docs/10-plan-technique.md §8). On mocke @/lib/db
// pour prouver qu'aucune de ses méthodes n'est jamais appelée par la route.
vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
    pageView: { create: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn(), findMany: vi.fn() },
  },
}));

import { GET } from "./route";
import { db } from "@/lib/db";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. retourne 200 avec { status: 'ok' }", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it("2. n'appelle jamais @/lib/db", async () => {
    await GET();

    expect(db.$queryRaw).not.toHaveBeenCalled();
    expect(db.pageView.create).not.toHaveBeenCalled();
    expect(db.pageView.findMany).not.toHaveBeenCalled();
    expect(db.user.findUnique).not.toHaveBeenCalled();
    expect(db.user.findMany).not.toHaveBeenCalled();
  });

  it("3. n'importe pas @/lib/db dans le code source de la route", () => {
    const routePath = fileURLToPath(new URL("./route.ts", import.meta.url));
    const source = readFileSync(routePath, "utf-8");

    // On vérifie l'absence d'un import (statique ou dynamique) réel, pas la
    // simple mention littérale dans un commentaire (ex. la note ci-dessus
    // rappelant explicitement de ne pas importer @/lib/db).
    expect(source).not.toMatch(/(?:from\s+|import\()["']@\/lib\/db["']/);
  });

  it("4. exporte dynamic = 'force-dynamic'", async () => {
    const mod = await import("./route");

    expect(mod.dynamic).toBe("force-dynamic");
  });
});
