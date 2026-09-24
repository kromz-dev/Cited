import { inngest } from "../client";
import { db } from "@/lib/db";

const RETENTION_DAYS = 90;

/**
 * Date de coupure : tout ScanLog créé avant cette date est éligible à la purge
 * de son payload. Fonction pure (pas d'accès à `new Date()` en dehors d'un
 * appelant contrôlé) pour rester testable sans horloge système.
 */
export function pruneCutoff(now: Date): Date {
  const cutoff = new Date(now.getTime());
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  return cutoff;
}

// Purge mensuelle des payloads de ScanLog de plus de 90 jours, pour protéger
// le quota de stockage gratuit de Neon (§14 docs/10-plan-technique.md) sans
// gonfler la facture Inngest : cron à heure creuse, un seul step, une seule
// requête `updateMany` indexée (jamais de boucle ni de step par ligne, même
// si le volume de logs devient important).
// simpleStatus et cause sont conservés pour l'historique : seul payload,
// potentiellement volumineux, est vidé.
export const pruneScanLogsJob = inngest.createFunction(
  {
    id: "prune-scan-logs",
    triggers: [{ cron: "TZ=Europe/Paris 0 4 1 * *" }],
  },
  async ({ step }) => {
    const result = await step.run("prune-old-payloads", async () => {
      const cutoff = pruneCutoff(new Date());
      return await db.scanLog.updateMany({
        where: {
          createdAt: { lt: cutoff },
          payload: { not: null },
        },
        data: { payload: null },
      });
    });

    return { prunedCount: result.count };
  }
);
