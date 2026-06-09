"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isPredictable } from "@/lib/locking";
import { JOKERS_PER_STAGE } from "@/lib/joker";

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

export async function setJoker(
  _prev: PredictionState,
  formData: FormData,
): Promise<PredictionState> {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";
  if (!matchId) return { error: "Match not found" };

  const prediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: user.id, matchId } },
    include: { match: true },
  });
  if (!prediction) return { error: "Make a prediction before using a joker" };

  if (!isPredictable(prediction.match)) {
    return { error: "This match is locked" };
  }

  if (enabled && !prediction.joker) {
    const stage = prediction.match.stage;
    const used = await prisma.prediction.count({
      where: { userId: user.id, joker: true, match: { stage }, NOT: { matchId } },
    });
    if (used >= JOKERS_PER_STAGE[stage]) {
      return { error: `No ${stage.toLowerCase()} jokers left` };
    }
  }

  await prisma.prediction.update({
    where: { userId_matchId: { userId: user.id, matchId } },
    data: { joker: enabled },
  });

  revalidatePath("/predict");
  return { ok: true };
}
