export const POINTS_PER_POSITION = 5;

/**
 * Scores a predicted group order against the actual finishing order.
 * Awards POINTS_PER_POSITION for each team in its correct position.
 */
export function scoreGroupOrder(
  predicted: string[],
  actual: string[],
  perPosition = POINTS_PER_POSITION,
): number {
  let correct = 0;
  for (let i = 0; i < actual.length; i++) {
    if (predicted[i] && predicted[i] === actual[i]) correct++;
  }
  return correct * perPosition;
}

/** Group predictions lock at the group's first kickoff. */
export function isGroupLocked(
  firstKickoff: Date | string,
  now: number = Date.now(),
): boolean {
  const t =
    firstKickoff instanceof Date
      ? firstKickoff.getTime()
      : new Date(firstKickoff).getTime();
  return now >= t;
}

/** True when the four chosen teams are all present and distinct. */
export function isValidOrder(order: string[], teams: string[]): boolean {
  if (order.length !== teams.length) return false;
  const set = new Set(order);
  if (set.size !== order.length) return false;
  return order.every((t) => teams.includes(t));
}
