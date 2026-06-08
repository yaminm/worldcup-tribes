/**
 * Pure scoring logic for Tribes. No DB access here so it is trivially testable.
 *
 * Rules (from the PRD):
 *  - Exact score          => 10 pts
 *  - Correct outcome + GD  => 6 pts
 *  - Correct outcome only  => 4 pts
 *  - Wrong outcome         => 0 pts
 *  - Knockout multiplier   => base * 1.5
 *
 * Knockout split rule (decided during planning):
 *  - EXACT and GOAL-DIFFERENCE tiers are judged against the regulation+ET
 *    scoreline (which may be a draw, e.g. 1-1).
 *  - The OUTCOME tier is judged by who ADVANCED (penalty shootouts count),
 *    supplied via `advancingSide`.
 */

export type Outcome = "HOME" | "AWAY" | "DRAW";
export type Side = "HOME" | "AWAY";

export function outcomeOf(home: number, away: number): Outcome {
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

/**
 * Base points (before any knockout multiplier).
 *
 * @param ph predicted home score
 * @param pa predicted away score
 * @param ah actual home score (regulation + extra time)
 * @param aa actual away score (regulation + extra time)
 * @param advancing which side advanced (penalties). Only meaningful for
 *        knockout matches that were level after ET. Optional.
 */
export function basePoints(
  ph: number,
  pa: number,
  ah: number,
  aa: number,
  advancing?: Side | null,
): number {
  // EXACT — uses the scoreline.
  if (ph === ah && pa === aa) return 10;

  const predScoreOutcome = outcomeOf(ph, pa);
  const actualScoreOutcome = outcomeOf(ah, aa);

  // GOAL DIFFERENCE — uses the scoreline outcome + identical goal difference.
  if (predScoreOutcome === actualScoreOutcome && ph - pa === ah - aa) {
    return 6;
  }

  // OUTCOME — penalties count: the "actual winner" is who advanced when the
  // scoreline was a draw but a side progressed.
  const actualWinner: Outcome =
    actualScoreOutcome === "DRAW" && advancing ? advancing : actualScoreOutcome;

  if (predScoreOutcome === actualWinner) return 4;

  return 0;
}

const KNOCKOUT_MULTIPLIER = 1.5;

export interface MatchResult {
  stage: "GROUP" | "KNOCKOUT";
  homeScore: number;
  awayScore: number;
  advancingSide?: Side | null;
}

export interface PredictionInput {
  homePredictedScore: number;
  awayPredictedScore: number;
}

export interface ScoreResult {
  points: number;
  isExact: boolean;
}

/**
 * Computes final points (including knockout multiplier) and whether the
 * prediction was an exact-score hit (used for leaderboard tie-breaks).
 */
export function scorePrediction(
  match: MatchResult,
  prediction: PredictionInput,
): ScoreResult {
  const base = basePoints(
    prediction.homePredictedScore,
    prediction.awayPredictedScore,
    match.homeScore,
    match.awayScore,
    match.advancingSide ?? null,
  );

  const multiplier = match.stage === "KNOCKOUT" ? KNOCKOUT_MULTIPLIER : 1;
  // All base values (0,4,6,10) * 1.5 are integers; round defensively anyway.
  const points = Math.round(base * multiplier);

  return { points, isExact: base === 10 };
}
