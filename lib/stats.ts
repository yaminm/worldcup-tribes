export interface ProfileStatInput {
  points: number | null;
  isExact: boolean;
  joker: boolean;
  stage: "GROUP" | "KNOCKOUT";
}

export interface ProfileStats {
  totalPoints: number;
  matchPoints: number;
  outrightPoints: number;
  predictionsMade: number;
  scored: number;
  exactHits: number;
  correctOutcomes: number;
  accuracy: number; // % of scored predictions that earned points
  avgPoints: number; // average points per scored prediction
  jokersUsed: number;
  groupPoints: number;
  knockoutPoints: number;
}

/** Computes a player's profile stats from their predictions. Pure + testable. */
export function computeProfileStats(
  preds: ProfileStatInput[],
  outrightPoints = 0,
): ProfileStats {
  const scoredPreds = preds.filter((p) => p.points !== null);
  const scored = scoredPreds.length;
  const matchPoints = scoredPreds.reduce((s, p) => s + (p.points ?? 0), 0);
  const correctOutcomes = scoredPreds.filter((p) => (p.points ?? 0) > 0).length;
  const exactHits = preds.filter((p) => p.isExact).length;
  const jokersUsed = preds.filter((p) => p.joker).length;
  const groupPoints = scoredPreds
    .filter((p) => p.stage === "GROUP")
    .reduce((s, p) => s + (p.points ?? 0), 0);
  const knockoutPoints = scoredPreds
    .filter((p) => p.stage === "KNOCKOUT")
    .reduce((s, p) => s + (p.points ?? 0), 0);

  return {
    totalPoints: matchPoints + outrightPoints,
    matchPoints,
    outrightPoints,
    predictionsMade: preds.length,
    scored,
    exactHits,
    correctOutcomes,
    accuracy: scored > 0 ? Math.round((correctOutcomes / scored) * 100) : 0,
    avgPoints: scored > 0 ? Math.round((matchPoints / scored) * 10) / 10 : 0,
    jokersUsed,
    groupPoints,
    knockoutPoints,
  };
}
