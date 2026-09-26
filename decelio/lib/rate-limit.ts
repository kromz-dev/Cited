import { db } from "@/lib/db";

/**
 * Limitation de débit à fenêtre fixe, adossée à PostgreSQL.
 *
 * Un compteur en mémoire ne tient pas ici : en exécution sans serveur, chaque
 * instance a sa propre mémoire, donc la limite est multipliée par le nombre
 * d'instances. La base est la seule ressource partagée dont on dispose.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  // Fenêtre fixe : toutes les requêtes d'un même intervalle partagent une ligne.
  const window = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const resetAt = new Date(window.getTime() + windowMs);

  // L'incrément est atomique côté base : deux requêtes simultanées ne peuvent
  // pas lire la même valeur et dépasser la limite toutes les deux.
  const row = await db.rateLimit.upsert({
    where: { key_window: { key, window } },
    create: { key, window, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  return {
    allowed: row.count <= limit,
    remaining: Math.max(0, limit - row.count),
    resetAt,
  };
}

/**
 * Adresse de l'appelant, pour servir de clé.
 *
 * `x-forwarded-for` est falsifiable par le client si aucun proxy de confiance
 * ne le réécrit. Vercel le réécrit ; en local il ne faut pas s'y fier.
 */
export function callerKey(req: Request, prefix: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "inconnu";
  return `${prefix}:${ip}`;
}
