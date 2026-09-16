export interface RunData {
  engineId: string;
  isMentioned: boolean;
  position: number | null;
  family?: string;
  citationCount?: number;
  hasBrandCitation?: boolean;
}

export interface VisibilityReport {
  globalScore: number;
  visibilityRate: number;
  rankScore: number;
  citationRate: number | null;
  brandCitationRate: number | null;
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
  if (runs.length === 0) return null;
  const totalWeight = runs.reduce(
    (sum, run) => sum + (run.isMentioned ? getPositionWeight(run.position) : 0),
    0,
  );
  return Math.round((totalWeight / runs.length) * 10) / 10;
}

export function scoreWithConfidence(runs: RunData[]): {
  score: number;
  marginOfError: number;
} {
  if (runs.length === 0) return { score: 0, marginOfError: 0 };
  const weights = runs.map((run) =>
    run.isMentioned ? getPositionWeight(run.position) : 0,
  );
  const mean = weights.reduce((sum, value) => sum + value, 0) / weights.length;
  if (weights.length < 2) {
    return { score: Math.round(mean * 10) / 10, marginOfError: 0 };
  }
  const variance =
    weights.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (weights.length - 1);
  return {
    score: Math.round(mean * 10) / 10,
    marginOfError: Math.round((1.96 * Math.sqrt(variance / weights.length)) * 10) / 10,
  };
}

function percentage(predicate: (run: RunData) => boolean, runs: RunData[]): number {
  return Math.round((runs.filter(predicate).length / runs.length) * 1000) / 10;
}

export function calculateVisibilityScore(runs: RunData[]): VisibilityReport {
  if (runs.length === 0) {
    return {
      globalScore: 0,
      visibilityRate: 0,
      rankScore: 0,
      citationRate: null,
      brandCitationRate: null,
      problemScore: null,
      solutionScore: null,
      comparisonScore: null,
    };
  }

  const rankScore = calculateScoreForRuns(runs) ?? 0;
  const citationRuns = runs.filter((run) => run.citationCount !== undefined);
  const brandCitationRuns = runs.filter((run) => run.hasBrandCitation !== undefined);

  return {
    globalScore: rankScore,
    visibilityRate: percentage((run) => run.isMentioned, runs),
    rankScore,
    citationRate: citationRuns.length
      ? percentage((run) => (run.citationCount ?? 0) > 0, citationRuns)
      : null,
    brandCitationRate: brandCitationRuns.length
      ? percentage((run) => run.hasBrandCitation === true, brandCitationRuns)
      : null,
    problemScore: calculateScoreForRuns(runs.filter((run) => run.family === "PROBLEM")),
    solutionScore: calculateScoreForRuns(runs.filter((run) => run.family === "SOLUTION")),
    comparisonScore: calculateScoreForRuns(
      runs.filter((run) => run.family === "COMPARISON"),
    ),
  };
}
