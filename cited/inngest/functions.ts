import { inngest } from "./client";
import { db } from "@/lib/db";
import { getEngine } from "@/lib/engines";
import { evaluateBrandMention } from "@/lib/analysis/llm-judge";
import { scoreWithConfidence, type RunData } from "@/lib/scoring/visibility";
import { calculateShareOfVoice } from "@/lib/scoring/share-of-voice";
import { generateCorrectionsForCampaign } from "@/lib/corrections/generator";
import type { EngineId } from "@prisma/client";

/** Répétitions par défaut d'un même couple requête/moteur. */
const DEFAULT_REPETITIONS = 3;
const DEFAULT_ENGINES: EngineId[] = ["GROQ"];

/**
 * Arrondit une date au début de son heure.
 *
 * Ce créneau est la clé d'idempotence de la campagne : deux déclenchements
 * dans la même heure pour la même marque visent la même ligne, et la
 * contrainte unique (brandId, scheduledFor) empêche le doublon.
 */
function toSlot(date: Date): Date {
  const slot = new Date(date);
  slot.setMinutes(0, 0, 0);
  return slot;
}

export const runCampaign = inngest.createFunction(
  {
    id: "run-campaign",
    triggers: { event: "campaign.run" },
    // Les offres gratuites des moteurs plafonnent le débit : une campagne à la fois.
    concurrency: { limit: 1 },
  },
  async ({ event, step }) => {
    const brandId: string = event.data.brandId;
    const engines: EngineId[] = event.data.engines ?? DEFAULT_ENGINES;
    const repetitions: number = event.data.repetitions ?? DEFAULT_REPETITIONS;
    const scheduledFor = toSlot(
      event.data.scheduledFor ? new Date(event.data.scheduledFor) : new Date(),
    );

    // 1. Contexte de la marque.
    const brand = await step.run("fetch-brand", async () =>
      db.brand.findUnique({
        where: { id: brandId },
        include: {
          competitors: true,
          prompts: { where: { isActive: true, deletedAt: null } },
        },
      }),
    );

    if (!brand) return { ok: false, reason: "brand-not-found" };
    if (brand.prompts.length === 0) return { ok: false, reason: "no-active-prompts" };

    // 2. Campagne idempotente sur le créneau.
    const campaign = await step.run("upsert-campaign", async () =>
      db.campaign.upsert({
        where: { brandId_scheduledFor: { brandId, scheduledFor } },
        create: {
          brandId,
          userId: brand.userId,
          scheduledFor,
          status: "RUNNING",
          enginesUsed: engines,
          repetitions,
          tasksTotal: brand.prompts.length * engines.length * repetitions,
        },
        update: { status: "RUNNING" },
      }),
    );

    if (campaign.status === "COMPLETED") {
      return { ok: true, campaignId: campaign.id, skipped: "already-completed" };
    }

    // 3. Exécution. Un pas par (requête x moteur x répétition).
    //    Les répétitions mesurent la dispersion du moteur, pas sa moyenne.
    const competitorsByName = new Map(
      brand.competitors.map((c) => [c.brandName.toLowerCase().trim(), c.id]),
    );

    for (const prompt of brand.prompts) {
      for (const engineId of engines) {
        for (let repetition = 0; repetition < repetitions; repetition++) {
          await step.run(`run-${prompt.id}-${engineId}-${repetition}`, async () => {
            // Reprise après incident : un run déjà abouti n'est pas rejoué.
            const existing = await db.run.findUnique({
              where: {
                campaignId_promptId_engine_repetition: {
                  campaignId: campaign.id,
                  promptId: prompt.id,
                  engine: engineId,
                  repetition,
                },
              },
              select: { id: true, status: true },
            });
            if (existing?.status === "DONE") return { skipped: true };

            const run =
              existing ??
              (await db.run.create({
                data: {
                  campaignId: campaign.id,
                  promptId: prompt.id,
                  brandId,
                  engine: engineId,
                  repetition,
                  // Texte et version figés : éditer la requête plus tard ne
                  // réécrira pas ce point de mesure.
                  promptText: prompt.text,
                  promptVersion: prompt.version,
                  status: "RUNNING",
                },
              }));

            try {
              const engine = getEngine(engineId);
              const response = await engine.query({
                prompt: prompt.text,
                country: brand.country,
                language: brand.language,
              });

              await db.apiCall.create({
                data: {
                  userId: brand.userId,
                  brandId,
                  runId: run.id,
                  engine: engineId,
                  purpose: "CAMPAIGN_QUERY",
                  costUsd: response.costUsd,
                  latencyMs: response.latencyMs,
                  success: true,
                },
              });

              const verdict = await evaluateBrandMention(
                response.rawText,
                brand.brandName,
                brand.groundTruth,
              );

              await db.apiCall.create({
                data: {
                  userId: brand.userId,
                  brandId,
                  runId: run.id,
                  engine: engineId,
                  purpose: "MENTION_ANALYSIS",
                  costUsd: 0,
                  success: true,
                },
              });

              await db.run.update({
                where: { id: run.id },
                data: {
                  status: "DONE",
                  rawResponse: response.rawText,
                  modelVersion: response.modelVersion,
                  brandMentioned: verdict.isMentioned,
                  brandPosition: verdict.position,
                  sentiment: verdict.sentiment,
                  snippet: verdict.snippet,
                  claimsGenerated: verdict.metrics?.claimsGenerated ?? null,
                  claimsCorrect: verdict.metrics?.claimsCorrect ?? null,
                  hallucinations: verdict.metrics?.hallucinations ?? null,
                  positionScore: verdict.metrics?.positionScore ?? null,
                  entitySalience: verdict.metrics?.entitySalience ?? null,
                  latencyMs: response.latencyMs,
                  costUsd: response.costUsd,
                },
              });

              // Citations : dédupliquées par (run, url) au niveau du schéma.
              if (response.citations.length > 0) {
                await db.citation.createMany({
                  data: response.citations.map((c) => ({
                    runId: run.id,
                    brandId,
                    url: c.url,
                    domain: c.domain,
                    title: c.title,
                    position: c.position,
                  })),
                  skipDuplicates: true,
                });
              }

              // Concurrents : seuls ceux que la marque suit réellement sont
              // enregistrés, les autres noms cités restent dans la réponse brute.
              const mentions = verdict.competitorsRecommended
                .map((name) => competitorsByName.get(name.toLowerCase().trim()))
                .filter((id): id is string => Boolean(id));

              if (mentions.length > 0) {
                await db.competitorMention.createMany({
                  data: mentions.map((competitorId) => ({
                    runId: run.id,
                    competitorId,
                    brandId,
                  })),
                  skipDuplicates: true,
                });
              }

              return { ok: true };
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);

              await db.apiCall.create({
                data: {
                  userId: brand.userId,
                  brandId,
                  runId: run.id,
                  engine: engineId,
                  purpose: "CAMPAIGN_QUERY",
                  success: false,
                },
              });

              // Un moteur en échec ne fait pas échouer la campagne.
              await db.run.update({
                where: { id: run.id },
                data: {
                  status: "FAILED",
                  errorMessage: message.slice(0, 1000),
                  attempts: { increment: 1 },
                },
              });

              return { ok: false, error: message };
            }
          });
        }
      }
    }

    // 4. Agrégation. Seuls les runs aboutis entrent dans le calcul : une panne
    //    moteur ne doit pas se lire comme une perte de visibilité.
    await step.run("finalize-campaign", async () => {
      const runs = await db.run.findMany({
        where: { campaignId: campaign.id },
        select: {
          id: true,
          status: true,
          engine: true,
          brandMentioned: true,
          brandPosition: true,
          promptId: true,
          prompt: { select: { family: true } },
        },
      });

      const done = runs.filter((r) => r.status === "DONE");
      const failed = runs.filter((r) => r.status === "FAILED");

      const scored: RunData[] = done.map((r) => ({
        engineId: r.engine,
        isMentioned: r.brandMentioned,
        position: r.brandPosition,
        family: r.prompt.family,
      }));

      const { score, marginOfError } = scoreWithConfidence(scored);

      const brandMentions = done.filter((r) => r.brandMentioned).length;
      const competitorMentions = await db.competitorMention.count({
        where: { run: { campaignId: campaign.id } },
      });
      const shareOfVoice = calculateShareOfVoice(brandMentions, [
        { brandName: "tous", mentionCount: competitorMentions },
      ]);

      const cost = await db.apiCall.aggregate({
        where: { runId: { in: runs.map((r) => r.id) } },
        _sum: { costUsd: true },
      });

      const complete = done.length === runs.length && runs.length > 0;

      await db.campaign.update({
        where: { id: campaign.id },
        data: {
          status: complete ? "COMPLETED" : failed.length === runs.length ? "FAILED" : "PARTIAL",
          finishedAt: new Date(),
          tasksDone: done.length,
          tasksFailed: failed.length,
          visibilityScore: score,
          scoreMarginOfError: marginOfError,
          shareOfVoice,
          totalCostUsd: cost._sum.costUsd ?? 0,
        },
      });

      // Compteurs d'usage : ce que le client consomme et ce que la plateforme paie.
      const periodStart = new Date();
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.usageCounter.upsert({
        where: { userId_periodStart: { userId: brand.userId, periodStart } },
        create: {
          userId: brand.userId,
          periodStart,
          periodEnd,
          runsUsed: done.length,
          billedCalls: done.length,
          costUsd: cost._sum.costUsd ?? 0,
        },
        update: {
          runsUsed: { increment: done.length },
          billedCalls: { increment: done.length },
          costUsd: { increment: cost._sum.costUsd ?? 0 },
        },
      });

      // Les correctifs se basent sur les requêtes où la marque est absente
      // de façon constante, pas sur un seul tirage défavorable.
      const missesByPrompt = new Map<string, { total: number; misses: number }>();
      for (const r of done) {
        const entry = missesByPrompt.get(r.promptId) ?? { total: 0, misses: 0 };
        entry.total += 1;
        if (!r.brandMentioned) entry.misses += 1;
        missesByPrompt.set(r.promptId, entry);
      }

      const consistentMisses = brand.prompts
        .filter((p) => {
          const entry = missesByPrompt.get(p.id);
          return entry && entry.total > 0 && entry.misses / entry.total >= 0.5;
        })
        .map((p) => ({ promptText: p.text, family: p.family, snippet: null }));

      if (consistentMisses.length > 0) {
        await generateCorrectionsForCampaign(
          campaign.id,
          consistentMisses,
          brand.brandName,
          brand.industry,
        );
      }
    });

    return { ok: true, campaignId: campaign.id };
  },
);
