import { db } from "../db";
import { rateLimit } from "../rate-limit";
import { sendMonthlyReportReadyEmail } from "../email/resend";

export interface SendReportReadyInput {
  /** Identifiant du MonthlyReport généré */
  reportId?: string;
  /** Identifiant du client rattaché (alternative si reportId non disponible) */
  clientId?: string;
  /** Identifiant de l'utilisateur (agence) propriétaire */
  userId?: string;
  /** Période au format AAAA-MM (ex. "2026-09") */
  period?: string;
  /** Forcer l'envoi en ignorant la limitation de débit (utile pour les tests et renvois manuels) */
  force?: boolean;
}

export interface SendReportReadyResult {
  success: boolean;
  id?: string;
  skipped?: boolean;
  reason?: string;
  error?: unknown;
}

/**
 * T048 : Alerte par e-mail "Votre rapport mensuel est disponible" à la génération
 * d'un MonthlyReport en marque blanche.
 *
 * RESPECT DU PALIER GRATUIT RESEND (100 E-MAILS / JOUR, §8.1 docs/10-plan-technique.md) :
 * ---------------------------------------------------------------------------------------
 * Dans le modèle de Decelio, une agence (User) gère plusieurs clients (Client), chacun
 * possédant un ou plusieurs sites surveillés (MonitoredSite).
 * Le plan Agence inclut jusqu'à 30 sites et autant de clients possibles.
 *
 * Risque identifié :
 * Si un e-mail était envoyé à chaque génération de rapport client individuel :
 * - Une agence avec 20 clients déclencherait 20 e-mails le 1er du mois lors du cron Inngest.
 * - Dès 5 agences actives, le plafond Resend Free (100 e-mails/jour) serait immédiatement dépassé,
 *   provoquant des erreurs 429 et des pertes d'alertes de régression critiques.
 * - L'utilisateur de l'agence recevrait 20 e-mails de notification identiques en quelques minutes.
 *
 * SOLUTION MISE EN ŒUVRE (Échelle 1 e-mail par agence) :
 * 1. Destinataire unique : l'e-mail est envoyé à l'adresse de l'AGENCE (`User.email`), pas au client final.
 * 2. Déduplication par période via PostgreSQL (`db.rateLimit` via `@/lib/rate-limit`) :
 *    - Clé de limitation : `report_ready:${agencyUserId}:${period}`
 *    - Fenêtre : 24 heures, quota max : 1 e-mail par agence et par période.
 *    - Dès que le premier rapport du mois est généré pour l'agence, la notification est envoyée.
 *    - Pour tous les rapports clients suivants de la même agence générés lors du même cycle mensuel,
 *      l'envoi est ignoré (`skipped: true, reason: "agency_already_notified_for_period"`).
 * 3. Synthèse consolidée : l'e-mail liste l'ensemble des clients dont les rapports sont prêts et pointe
 *    vers la page de reporting `/reports` où tous les PDF en marque blanche sont disponibles.
 * 4. Déclenchement groupé (`sendReportReadyForAgency`) : peut être déclenché en une seule fois
 *    après la génération complète des rapports du portefeuille de l'agence.
 * 5. Dérogation explicite (`force: true`) : permet de contourner le verrou pour les tests
 *    ou une action manuelle du support.
 */
export async function sendReportReady(
  input: string | SendReportReadyInput
): Promise<SendReportReadyResult> {
  const options: SendReportReadyInput =
    typeof input === "string" ? { reportId: input } : input;

  const { reportId, clientId, force = false } = options;
  let userId = options.userId;
  let period = options.period;
  let clientName: string | undefined;

  let user: {
    id: string;
    email: string;
    name: string | null;
    brandSettings?: { agencyName: string | null } | null;
  } | null = null;

  try {
    // 1. Résolution via le rapport mensuel si fourni
    if (reportId) {
      const report = await db.monthlyReport.findUnique({
        where: { id: reportId },
        select: {
          id: true,
          period: true,
          clientId: true,
          client: {
            select: {
              id: true,
              name: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  brandSettings: {
                    select: { agencyName: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!report) {
        return { success: false, error: `MonthlyReport introuvable : ${reportId}` };
      }

      period = report.period;
      userId = report.client.userId;
      clientName = report.client.name;
      user = report.client.user;
    } else if (clientId) {
      // 2. Résolution via le client
      const client = await db.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              brandSettings: {
                select: { agencyName: true },
              },
            },
          },
        },
      });

      if (!client) {
        return { success: false, error: `Client introuvable : ${clientId}` };
      }

      userId = client.userId;
      clientName = client.name;
      user = client.user;
    }

    if (!userId) {
      return {
        success: false,
        error: "userId ou reportId/clientId valide requis pour identifier l'agence.",
      };
    }

    if (!period) {
      return {
        success: false,
        error: "period (AAAA-MM) requise pour la notification de rapport mensuel.",
      };
    }

    // 3. Récupération des informations utilisateur si non résolues plus haut
    if (!user) {
      user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          brandSettings: {
            select: { agencyName: true },
          },
        },
      });
    }

    if (!user || !user.email) {
      return {
        success: false,
        error: `Adresse e-mail introuvable pour le compte utilisateur ${userId}.`,
      };
    }

    // 4. Limitation de débit / déduplication : 1 e-mail par agence et par période (fenêtre de 24h)
    // Garantit le respect du quota gratuit Resend (100 e-mails/jour).
    if (!force) {
      const rateLimitKey = `report_ready:${userId}:${period}`;
      const quota = await rateLimit(rateLimitKey, 1, 24 * 60 * 60 * 1000);

      if (!quota.allowed) {
        return {
          success: true,
          skipped: true,
          reason: "agency_already_notified_for_period",
        };
      }
    }

    // 5. Récupération de tous les rapports générés pour cette agence sur la période
    const agencyReports = await db.monthlyReport.findMany({
      where: {
        period,
        client: { userId },
      },
      select: {
        client: {
          select: { name: true },
        },
      },
    });

    const gatheredNames: string[] = agencyReports
      .map((r: { client: { name: string } }) => r.client.name)
      .filter((name): name is string => Boolean(name));
    if (clientName && !gatheredNames.includes(clientName)) {
      gatheredNames.push(clientName);
    }

    const clientNames: string[] = Array.from(new Set(gatheredNames));
    const clientCount = clientNames.length > 0 ? clientNames.length : 1;
    const agencyName = user.brandSettings?.agencyName || user.name;

    // 6. Envoi de l'e-mail transactionnel via Resend
    return await sendMonthlyReportReadyEmail({
      to: user.email,
      recipientName: user.name,
      agencyName,
      period,
      clientCount,
      clientNames,
    });
  } catch (error) {
    console.error("Failed to process sendReportReady:", error);
    return { success: false, error };
  }
}

/**
 * Envoie la notification de rapports mensuels prêts pour l'ensemble d'une agence.
 */
export async function sendReportReadyForAgency({
  userId,
  period,
  force = false,
}: {
  userId: string;
  period: string;
  force?: boolean;
}): Promise<SendReportReadyResult> {
  return await sendReportReady({ userId, period, force });
}
