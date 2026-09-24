import { inngest } from "../client";
import { db } from "@/lib/db";
import { runCoreScan, type SimpleStatus } from "@/lib/scanner/core";
import { DEFAULT_PROBE_BOTS } from "../../lib/scanner/agents";
import { sendRegressionAlert } from "@/lib/alerting/sendAlert";
import { NonRetriableError } from "inngest";

/**
 * Contrat stable pour le passage quotidien et pour T043 (premier scan).
 *
 * Événement `app/scan.site` :
 * - `siteIds` : au plus 10 identifiants, un lot du passage quotidien ;
 * - `siteId` : un seul site. Équivalent à `siteIds: [siteId]`.
 *   Un déclenchement unitaire (onboarding) doit continuer à envoyer `siteId`.
 *
 * Budget Inngest Hobby : 50 000 exécutions par mois, une par lancement
 * et une par step. Un lot de 10 sites = 1 lancement + 10 `step.run`
 * = 11 exécutions, soit 1,1 par site et par jour (≤ 1,2). Sur 30 jours :
 * 33 exécutions par site, donc 50 000 / 33 ≈ 1 515 sites. Le dispatcher
 * ajoute 1 cron, 1 step de lecture et 1 `step.sendEvent` pour tous les
 * lots. Aucun ping récurrent.
 */
const SCAN_BATCH_SIZE = 10;

const STATUS_RANK: Record<SimpleStatus, number> = {
  OK: 0,
  "COQUILLE VIDE": 1,
  "BLOQUÉ": 2,
  ERREUR: 3,
};

interface ScanEventData {
  siteId?: string;
  siteIds?: string[];
}

export function causeForBot(agent: string, reasons: string[]): string {
  const reason = reasons[0];
  if (!reason) return `${agent} : aucune restriction détectée`;
  const french = reason
    .replace(/^robots\.txt disallows /, "robots.txt interdit ")
    .replace(/^unreachable: .*/, "site injoignable")
    .replace(/^http (\d+)$/, "réponse HTTP $1")
    .replace(/^access challenged.*/, "page de challenge")
    .replace(/^access blocked.*/, "accès bloqué")
    .replace(/^js_dependent: .*/, "la page dépend de JavaScript")
    .replace(/^likely_js_dependent: .*/, "la page dépend probablement de JavaScript")
    .replace(/^noindex$/, "balise noindex");
  return `${agent} : ${french}`;
}

function siteIdsFrom(data: ScanEventData): string[] {
  const ids = data.siteIds?.length ? data.siteIds : data.siteId ? [data.siteId] : [];
  return ids.slice(0, SCAN_BATCH_SIZE);
}

function worstStatus(statuses: SimpleStatus[]): SimpleStatus {
  return statuses.reduce(
    (worst, status) => (STATUS_RANK[status] > STATUS_RANK[worst] ? status : worst),
    "OK",
  );
}

export const scanSiteJob = inngest.createFunction(
  {
    id: "scan-single-site",
    concurrency: {
      limit: 10,
    },
    triggers: [{ event: "app/scan.site" }],
  },
  async ({ event, step }) => {
    const siteIds = siteIdsFrom(event.data as ScanEventData);
    if (siteIds.length === 0) {
      throw new NonRetriableError("Aucun site à scanner");
    }

    const scanned: { siteId: string; oldStatus: string; newStatus: string }[] = [];

    for (const siteId of siteIds) {
      const outcome = await step.run(`scan-${siteId}`, async () => {
        const site = await db.monitoredSite.findUnique({
          where: { id: siteId },
          include: { user: true },
        });

        if (!site) {
          throw new NonRetriableError(`Site not found: ${siteId}`);
        }

        const { report, results } = await runCoreScan(site.url, DEFAULT_PROBE_BOTS);
        const history = await db.scanLog.findMany({
          where: { siteId: site.id },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: { simpleStatus: true, cause: true },
        });

        const rows = results.map((result) => {
          const cause = causeForBot(result.agent, result.reasons ?? []);
          const previous = history.find((row) => row.cause?.startsWith(`${result.agent} :`));
          const changed =
            !previous ||
            previous.simpleStatus !== result.simpleStatus ||
            previous.cause !== cause;
          return {
            siteId: site.id,
            httpStatus: result.httpStatus,
            simpleStatus: result.simpleStatus,
            cause,
            // Neon Free : 0,5 Go. Le JSON complet n'est réécrit que si le
            // verdict de ce bot change. Sinon la colonne reste nulle.
            payload: changed
              ? JSON.stringify({
                  agent: result.agent,
                  simpleStatus: result.simpleStatus,
                  cause,
                  reasons: result.reasons,
                  report,
                })
              : null,
          };
        });

        if (rows.length > 0) {
          await db.scanLog.createMany({ data: rows });
        }

        const newStatus = results.length > 0 ? worstStatus(results.map((result) => result.simpleStatus)) : site.status;
        const oldStatus = site.status;

        if (oldStatus !== newStatus) {
          await db.monitoredSite.update({
            where: { id: site.id },
            data: { status: newStatus },
          });

          const isRegression =
            (oldStatus === "ACTIVE" || oldStatus === "OK") &&
            (newStatus === "BLOQUÉ" || newStatus === "COQUILLE VIDE");

          if (isRegression) {
            await sendRegressionAlert(site.user.email, site.url, oldStatus, newStatus);
          }
        }

        return { siteId: site.id, oldStatus, newStatus };
      });

      scanned.push(outcome);
    }

    return { scanned };
  },
);
