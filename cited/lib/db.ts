import { PrismaClient } from "@prisma/client";

// Next.js recharge les modules à chaud en développement : sans ce cache global,
// chaque rechargement ouvrirait un nouveau pool de connexions.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
