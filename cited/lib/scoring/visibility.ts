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
