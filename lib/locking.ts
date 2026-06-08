/**
 * Prediction lock + predictability rules. Pure functions so they can be unit
 * tested and reused on both server (enforcement) and client (UI state).
 */

export const LOCK_WINDOW_MS = 5 * 60 * 1000; // 5 minutes before kickoff

export interface LockableMatch {
  kickoffTime: Date | string;
  teamsKnown: boolean;
}

function kickoffMs(kickoffTime: Date | string): number {
  return kickoffTime instanceof Date
    ? kickoffTime.getTime()
    : new Date(kickoffTime).getTime();
}

/**
 * A match is locked once we are within LOCK_WINDOW_MS of kickoff (or past it).
 * Predictions can no longer be created or updated.
 */
export function isLocked(
  match: Pick<LockableMatch, "kickoffTime">,
  now: number = Date.now(),
): boolean {
  return now >= kickoffMs(match.kickoffTime) - LOCK_WINDOW_MS;
}

/**
 * A match is predictable only when both teams are known AND it is not locked.
 * TBD knockout fixtures (teamsKnown === false) are never predictable yet.
 */
export function isPredictable(
  match: LockableMatch,
  now: number = Date.now(),
): boolean {
  return match.teamsKnown && !isLocked(match, now);
}

/** Milliseconds until the match locks (0 if already locked). */
export function msUntilLock(
  match: Pick<LockableMatch, "kickoffTime">,
  now: number = Date.now(),
): number {
  return Math.max(0, kickoffMs(match.kickoffTime) - LOCK_WINDOW_MS - now);
}
