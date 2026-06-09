import { prisma } from "@/lib/db";
import { scorePrediction } from "@/lib/scoring";
import { roundPointsFor, scoreAdvancement } from "@/lib/bracket";

/**
 * Idempotently scores knockout advancement ("who advances") picks for a match.
 * No-op for group matches (they have no advancement picks).
 */
export async function scoreAdvancementForMatch(matchId: string): Promise<number> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { advancementPicks: true },
  });
  if (!match || match.advancementPicks.length === 0) return 0;

  const resolved = match.status === "FINISHED" && match.advancingSide !== null;
  const roundPoints = roundPointsFor(match.groupName);
  const now = new Date();

  const updates = match.advancementPicks.map((pick) =>
    prisma.advancementPick.update({
      where: { id: pick.id },
      data: resolved
        ? {
            points: scoreAdvancement(match.advancingSide, pick.pickedSide, roundPoints),
            scoredAt: now,
          }
        : { points: null, scoredAt: null },
    }),
  );
  await prisma.$transaction(updates);
  return resolved ? updates.length : 0;
}

export interface ScoreMatchResult {
  matchId: string;
  scored: number;
  skipped: boolean;
}

/**
 * Idempotently (re)scores every prediction for a single match. Safe to run
 * repeatedly — it always recomputes from the current match result. If the match
 * is not finished or has no recorded score, predictions are reset to unscored.
 */
export async function scoreMatch(matchId: string): Promise<ScoreMatchResult> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { predictions: true },
  });
  if (!match) throw new Error(`Match ${matchId} not found`);

  const scorable =
    match.status === "FINISHED" &&
    match.homeScore !== null &&
    match.awayScore !== null;

  if (!scorable) {
    if (match.predictions.some((p) => p.points !== null)) {
      await prisma.prediction.updateMany({
        where: { matchId },
        data: { points: null, isExact: false, scoredAt: null },
      });
    }
    await scoreAdvancementForMatch(matchId);
    return { matchId, scored: 0, skipped: true };
  }

  const now = new Date();
  const updates = match.predictions.map((p) => {
    const { points, isExact } = scorePrediction(
      {
        stage: match.stage,
        homeScore: match.homeScore as number,
        awayScore: match.awayScore as number,
        advancingSide: match.advancingSide,
      },
      p,
    );
    return prisma.prediction.update({
      where: { id: p.id },
      data: { points, isExact, scoredAt: now },
    });
  });

  if (updates.length > 0) await prisma.$transaction(updates);
  await scoreAdvancementForMatch(matchId);
  return { matchId, scored: updates.length, skipped: false };
}

/** Rescores every finished match. Used by the admin "recalculate" action. */
export async function recalcAll(): Promise<{ matches: number; scored: number }> {
  const finished = await prisma.match.findMany({
    where: { status: "FINISHED" },
    select: { id: true },
  });
  let scored = 0;
  for (const m of finished) {
    const r = await scoreMatch(m.id);
    scored += r.scored;
  }
  return { matches: finished.length, scored };
}
