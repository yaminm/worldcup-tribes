export type JokerStage = "GROUP" | "KNOCKOUT";

/** How many jokers (double-points tokens) a user gets per stage. */
export const JOKERS_PER_STAGE: Record<JokerStage, number> = {
  GROUP: 2,
  KNOCKOUT: 2,
};

export function jokersRemaining(stage: JokerStage, used: number): number {
  return Math.max(0, JOKERS_PER_STAGE[stage] - used);
}
