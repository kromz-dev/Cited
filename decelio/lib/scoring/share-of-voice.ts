/**
 * Calcule la part de voix (Share of Voice - SOV) d'une marque
 * par rapport à ses concurrents.
 */

export interface CompetitorMentions {
  brandName: string;
  mentionCount: number;
}

export function calculateShareOfVoice(
  myMentions: number, 
  competitors: CompetitorMentions[]
): number {
  const totalCompetitorMentions = competitors.reduce((acc, c) => acc + c.mentionCount, 0);
  const totalMentions = myMentions + totalCompetitorMentions;
  
  if (totalMentions === 0) return 0;
  
  const sov = (myMentions / totalMentions) * 100;
  return Math.round(sov * 10) / 10;
}
