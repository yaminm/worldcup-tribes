/** Pure logic for tournament outright ("bonus") questions. */

export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase();
}

/** Points for an outright answer: full points on an exact (case-insensitive) match, else 0. */
export function scoreOutrightAnswer(
  correctAnswer: string | null | undefined,
  answer: string | null | undefined,
  points: number,
): number {
  if (!correctAnswer || !answer) return 0;
  return normalizeAnswer(correctAnswer) === normalizeAnswer(answer) ? points : 0;
}

/** Outrights lock at their lockAt (typically the tournament opener). */
export function isOutrightLocked(
  lockAt: Date | string,
  now: number = Date.now(),
): boolean {
  const t = lockAt instanceof Date ? lockAt.getTime() : new Date(lockAt).getTime();
  return now >= t;
}
