export type Side = "HOME" | "AWAY";

/** Round-weighted points for correctly picking who advances. */
export const ROUND_POINTS: Record<string, number> = {
  "Round of 32": 5,
  "Round of 16": 8,
  "Quarter-final": 12,
  "Semi-final": 16,
  "Match for third place": 8,
  "Final": 25,
};

const ROUND_ORDER = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Match for third place",
  "Final",
];

export function roundPointsFor(roundName: string | null | undefined): number {
  if (!roundName) return 5;
  return ROUND_POINTS[roundName] ?? 5;
}

/** Sort key for displaying knockout rounds in bracket order. */
export function roundOrder(roundName: string | null | undefined): number {
  const i = roundName ? ROUND_ORDER.indexOf(roundName) : -1;
  return i === -1 ? 99 : i;
}

/** Points for an advancement pick: full round points if the picked side advanced. */
export function scoreAdvancement(
  advancingSide: Side | null | undefined,
  pickedSide: Side | null | undefined,
  roundPoints: number,
): number {
  if (!advancingSide || !pickedSide) return 0;
  return advancingSide === pickedSide ? roundPoints : 0;
}
