import { prisma } from "@/lib/db";
import { scoreOutrightAnswer } from "@/lib/outright";

/** Idempotently (re)scores all predictions for one outright. */
export async function scoreOutright(outrightId: string): Promise<{
  scored: number;
  skipped: boolean;
}> {
  const outright = await prisma.outright.findUnique({
    where: { id: outrightId },
    include: { predictions: true },
  });
  if (!outright) throw new Error(`Outright ${outrightId} not found`);

  if (!outright.correctAnswer) {
    if (outright.predictions.some((p) => p.points !== null)) {
      await prisma.outrightPrediction.updateMany({
        where: { outrightId },
        data: { points: null, scoredAt: null },
      });
    }
    return { scored: 0, skipped: true };
  }

  const now = new Date();
  const updates = outright.predictions.map((p) =>
    prisma.outrightPrediction.update({
      where: { id: p.id },
      data: {
        points: scoreOutrightAnswer(outright.correctAnswer, p.answer, outright.points),
        scoredAt: now,
      },
    }),
  );
  if (updates.length > 0) await prisma.$transaction(updates);
  return { scored: updates.length, skipped: false };
}

export async function recalcAllOutrights(): Promise<{ outrights: number; scored: number }> {
  const resolved = await prisma.outright.findMany({
    where: { correctAnswer: { not: null } },
    select: { id: true },
  });
  let scored = 0;
  for (const o of resolved) scored += (await scoreOutright(o.id)).scored;
  return { outrights: resolved.length, scored };
}
