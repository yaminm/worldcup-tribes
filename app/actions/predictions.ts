"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isPredictable } from "@/lib/locking";

export interface PredictionState {
  ok?: boolean;
  error?: string;
}

const schema = z.object({
  matchId: z.string().min(1),
  homePredictedScore: z.coerce.number().int().min(0).max(99),
  awayPredictedScore: z.coerce.number().int().min(0).max(99),
});

export async function submitPrediction(
  _prev: PredictionState,
  formData: FormData,
): Promise<PredictionState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    matchId: formData.get("matchId"),
    homePredictedScore: formData.get("homePredictedScore"),
    awayPredictedScore: formData.get("awayPredictedScore"),
  });
  if (!parsed.success) {
    return { error: "Enter valid scores (0–99)" };
  }

  const { matchId, homePredictedScore, awayPredictedScore } = parsed.data;
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return { error: "Match not found" };

  // Server-side enforcement of the lock + predictability rules. Never trust UI.
  if (!isPredictable(match)) {
    return {
      error: match.teamsKnown
        ? "This match is locked (within 5 minutes of kickoff)"
        : "Teams not confirmed yet — this match isn't open",
    };
  }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: user.id, matchId } },
    update: { homePredictedScore, awayPredictedScore, submittedAt: new Date() },
    create: { userId: user.id, matchId, homePredictedScore, awayPredictedScore },
  });

  revalidatePath("/predict");
  return { ok: true };
}
