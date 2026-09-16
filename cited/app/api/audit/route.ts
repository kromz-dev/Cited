import { NextResponse } from "next/server";
import { getEngine } from "@/lib/engines";
import { generateSmartPrompts } from "@/lib/prompts/query-generator";
import { evaluateBrandMention } from "@/lib/analysis/llm-judge";
import { calculateVisibilityScore } from "@/lib/scoring/visibility";
import { db } from "@/lib/db";

// Force Node.js runtime car Prisma n'est pas compatible Edge sans configuration spécifique
export const runtime = "nodejs";
export const maxDuration = 60; // Autoriser jusqu'à 60s pour l'API Gemini

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, brandName } = body;

    if (!domain || !brandName) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const engine = getEngine("GROQ");

    // 0. Découverte intelligente du secteur, des concurrents et génération des requêtes (Funnel d'achat)
    console.log(`\n🔍 [DÉCOUVERTE] Analyse du domaine ${domain} pour la marque ${brandName}...`);
    
    // Génération dynamique des 5 requêtes par l'IA
    const prompts = await generateSmartPrompts(domain, brandName, engine);
    
    console.log(`✅ [DÉCOUVERTE RÉUSSIE] ${prompts.length} requêtes générées.`);

    // 2. Lancer les requêtes par petits lots (Chunking) pour éviter le Rate Limit
    const results: any[] = [];
    
    // Chunking function
    const chunkArray = (arr: any[], size: number) => 
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
      );

    const promptChunks = chunkArray(prompts, 2); // Exécute 2 par 2

    for (const chunk of promptChunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(async (p) => {
          // LOG POUR LE DEBUG EN LOCAL
          console.log(`\n=============================================================`);
          console.log(`🧠 [MOTEUR IA] ENVOI DE LA REQUÊTE : "${p.text}"`);
          console.log(`=============================================================`);
          
          const startTime = Date.now();
          const response = await engine.query({
            prompt: p.text,
            country: "FR",
            language: "fr"
          });
          const duration = Date.now() - startTime;

          // 3. Analyser la réponse avec le LLM-as-a-judge
          const mention = await evaluateBrandMention(response.rawText, brandName);

          console.log(`\n⏱️ [TEMPS DE RÉPONSE] : ${duration}ms`);
          console.log(`📄 [RÉPONSE COMPLÈTE DE L'IA] :\n${response.rawText}`);
          console.log(`\n🔗 [CITATIONS TROUVÉES] :`, response.citations);
          console.log(`🎯 [RECHERCHE DE LA MARQUE] : "${brandName}"`);
          console.log(`✅ [RÉSULTAT DU MATCHING] : ${mention.isMentioned ? 'TROUVÉE (isMentioned=true)' : 'NON TROUVÉE (isMentioned=false)'}`);
          console.log(`=============================================================\n`);

          return {
            prompt: p.text,
            family: p.family,
            response: response.rawText,
            citations: response.citations,
            mention,
          };
        })
      );
      
      results.push(...chunkResults);
    }

    // 4. Agréger les résultats
    const runs = results.map(r => r.status === "fulfilled" ? r.value : null).filter(Boolean) as any[];
    
    const runDataForScore = runs.map(r => ({
      engineId: "GROQ",
      isMentioned: r.mention.isMentioned,
      position: r.mention.position,
      family: r.family
    }));

    const report = calculateVisibilityScore(runDataForScore);

    // 5. Sauvegarder anonymement en DB
    // On ne stocke pas les rawText intégraux pour l'audit gratuit pour éviter de gonfler la DB,
    // mais on garde une trace du lead.
    // Note: L'email n'est pas encore capturé ici (c'est l'étape d'après dans le funnel)
    // Mais on peut déjà créer un enregistrement temporaire ou juste retourner les données.

    return NextResponse.json({
      brandName,
      domain,
      score: report.globalScore,
      detailedScore: report,
      runs: runs.map(r => ({
        prompt: r.prompt,
        family: r.family,
        isMentioned: r.mention.isMentioned,
        sentiment: r.mention.sentiment,
        competitorsRecommended: r.mention.competitorsRecommended,
        snippet: r.mention.snippet,
        citationCount: r.citations.length,
        hasBrandCitation: r.citations.some((c: any) => c.domain.includes(domain.replace(/^www\./, '')))
      }))
    });

  } catch (error) {
    console.error("Erreur Audit API:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'audit" }, 
      { status: 500 }
    );
  }
}
