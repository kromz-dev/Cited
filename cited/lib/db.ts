// @ts-ignore
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  // @ts-ignore - Contournement temporaire le temps que la génération locale fonctionne
  var prisma: any | undefined;
}

export const db =
  global.prisma ||
  // @ts-ignore
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = db;
