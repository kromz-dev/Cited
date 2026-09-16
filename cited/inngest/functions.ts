import { inngest } from "./client";
import { db } from "@/lib/db";
import { getEngine } from "@/lib/engines";
import { evaluateBrandMention } from "@/lib/analysis/llm-judge";
import { calculateVisibilityScore } from "@/lib/scoring/visibility";
import { generateCorrectionsForCampaign } from "@/lib/corrections/generator";

export const runCampaign = inngest.createFunction(
  { 
    id: "run-campaign", 
    triggers: { event: "campaign.run" },
    concurrency: {
      limit: 1, // On limite à 1 pour économiser les API quotas gratuits
    }
  },
  async ({ event, step }) => {
    const brandId = event.data.brandId;
    
    // 1. Fetch Brand & Prompts
    const brand = await step.run("fetch-brand", async () => {
      return db.brand.findUnique({
        where: { id: brandId },
        include: { prompts: { where: { isActive: true } } }
      });
    });

    if (!brand || brand.prompts.length === 0) {
      return { success: false, error: "Brand not found or no prompts" };
    }

    // 2. Create Campaign
    const campaign = await step.run("create-campaign", async () => {
      return db.campaign.create({
        data: {
          brandId,
          status: "RUNNING",
          tasksTotal: brand.prompts.length, // Uniquement GROQ pour tester et économiser les quotas
          tasksDone: 0
        }
      });
    });

    const engineId = "GROQ";
    let failedRunsData: { promptText: string, family?: string, snippet: string | null }[] = [];
    const runResults: any[] = [];

    // 3. Execute queries (séquentiel pour respecter les quotas d'API)
    for (const prompt of brand.prompts) {
      const result = await step.run(`query-${prompt.id}`, async () => {
        try {
          const run = await db.run.create({
            data: {
              campaignId: campaign.id,
              promptId: prompt.id,
              engine: engineId,
              status: "RUNNING"
            }
          });

          const engine = getEngine(engineId);
          const response = await engine.query({
            prompt: prompt.text,
            country: brand.country,
            language: brand.language
          });

          const mentionResult = await evaluateBrandMention(response.rawText, brand.brandName, brand.groundTruth);

          await db.run.update({
            where: { id: run.id },
            data: {
              status: "DONE",
              rawResponse: response.rawText,
              brandMentioned: mentionResult.isMentioned,
              brandPosition: mentionResult.position,
              sentiment: mentionResult.sentiment,
              competitorsFound: mentionResult.competitorsRecommended.length > 0 ? JSON.stringify(mentionResult.competitorsRecommended) : null,
              snippet: mentionResult.snippet,
              claimsGenerated: mentionResult.metrics?.claimsGenerated || null,
              claimsCorrect: mentionResult.metrics?.claimsCorrect || null,
              hallucinations: mentionResult.metrics?.hallucinations || null,
              positionScore: mentionResult.metrics?.positionScore || null,
              entitySalience: mentionResult.metrics?.entitySalience || null,
              latencyMs: response.latencyMs,
              costUsd: response.costUsd
            }
          });

          return { 
            success: true, 
            isMentioned: mentionResult.isMentioned, 
            promptText: prompt.text,
            snippet: mentionResult.snippet 
          };
        } catch (error: any) {
          return { success: false, error: error.message, promptText: prompt.text };
        }
      });

      if ((result as any).success) {
        runResults.push({ engineId, isMentioned: (result as any).isMentioned, position: null, family: prompt.family });
        if (!(result as any).isMentioned) {
          failedRunsData.push({ promptText: (result as any).promptText, family: prompt.family, snippet: (result as any).snippet });
        }
      }
    }

    // 4. Calculate Score & Generate Corrections
    await step.run("finalize-campaign", async () => {
      const report = calculateVisibilityScore(runResults);

      await db.campaign.update({
        where: { id: campaign.id },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
          tasksDone: runResults.length,
          visibilityScore: report.globalScore
        }
      });

      if (failedRunsData.length > 0) {
        await generateCorrectionsForCampaign(campaign.id, failedRunsData, brand.brandName, brand.industry);
      }
    });
    
    return { success: true, campaignId: campaign.id };
  }
);
