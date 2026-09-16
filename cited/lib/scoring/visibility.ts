/**
 * Calcule le score de visibilité d'une marque (AEO Scoring).
 * 
 * Règle métier AEO (Pondération par position) :
 * Position 1 : 100%
 * Position 2 : 80%
 * Position 3 : 60%
 * Position 4 : 40%
 * Position 5+ : 20%
 * Non mentionné : 0%
 */

export interface RunData {
  engineId: string;
  isMentioned: boolean;
  position: number | null;
  family?: string;
}

export interface VisibilityReport {
  globalScore: number;
  problemScore: number | null;
  solutionScore: number | null;
  comparisonScore: number | null;
}

function getPositionWeight(position: number | null): number {
  if (position === null) return 0;
  if (position === 1) return 100;
  if (position === 2) return 80;
  if (position === 3) return 60;
  if (position === 4) return 40;
  return 20;
}

function calculateScoreForRuns(runs: RunData[]): number | null {
  if (!runs || runs.length === 0) return null;
  
  const totalWeight = runs.reduce((acc, run) => acc + (run.isMentioned ? getPositionWeight(run.position) : 0), 0);
  const score = totalWeight / runs.length;
  
  return Math.round(score * 10) / 10;
}

/**
 * Score et demi-intervalle de confiance à 95 %.
 *
 * Les moteurs de réponse IA ne sont pas déterministes : deux appels identiques
 * ne donnent pas la même réponse. Un score issu d'un seul appel par requête
 * mesure donc surtout du bruit. En interrogeant N fois la même requête, la
 * dispersion des résultats devient mesurable, et toute variation inférieure à
 * la marge ci-dessous ne doit pas être présentée comme une tendance.
 */
export function scoreWithConfidence(runs: RunData[]): {
  score: number;
  marginOfError: number;
} {
  if (!runs || runs.length === 0) return { score: 0, marginOfError: 0 };

  const weights = runs.map((r) =>
    r.isMentioned ? getPositionWeight(r.position) : 0,
  );
  const mean = weights.reduce((a, b) => a + b, 0) / weights.length;

  if (weights.length < 2) {
    return { score: Math.round(mean * 10) / 10, marginOfError: 0 };
  }

  // Écart-type d'échantillon, puis erreur-type de la moyenne.
  const variance =
    weights.reduce((acc, w) => acc + (w - mean) ** 2, 0) / (weights.length - 1);
  const standardError = Math.sqrt(variance) / Math.sqrt(weights.length);

  return {
    score: Math.round(mean * 10) / 10,
    marginOfError: Math.round(1.96 * standardError * 10) / 10,
  };
}

export function calculateVisibilityScore(runs: RunData[]): VisibilityReport {
  if (!runs || runs.length === 0) {
    return { globalScore: 0, problemScore: null, solutionScore: null, comparisonScore: null };
  }

  const globalScore = calculateScoreForRuns(runs) || 0;
  
  const problemRuns = runs.filter(r => r.family === "PROBLEM");
  const solutionRuns = runs.filter(r => r.family === "SOLUTION");
  const comparisonRuns = runs.filter(r => r.family === "COMPARISON");

  return {
    globalScore,
    problemScore: calculateScoreForRuns(problemRuns),
    solutionScore: calculateScoreForRuns(solutionRuns),
    comparisonScore: calculateScoreForRuns(comparisonRuns)
  };
}
