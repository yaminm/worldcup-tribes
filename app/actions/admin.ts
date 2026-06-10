"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSuperadmin } from "@/lib/session";
import { syncMatches } from "@/lib/matches/sync";
import { recalcAll, scoreMatch } from "@/lib/scoring-service";
import { scoreOutright } from "@/lib/outright-service";
import { generateBotPredictions } from "@/lib/bots";

export interface AdminState {
  ok?: boolean;
  message?: string;
  error?: string;
}

export async function runSyncAction(
  _prev: AdminState,
  _formData: FormData,
): Promise<AdminState> {
  await requireSuperadmin();
  try {
    const r = await syncMatches();
    revalidatePath("/admin");
    revalidatePath("/predict");
    return {
      ok: true,
      message: `Synced ${r.total} from ${r.source} (+${r.created} new, ${r.updated} updated, ${r.scored} scored)`,
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function generateBotsAction(
  _prev: AdminState,
  _formData: FormData,
): Promise<AdminState> {
  await requireSuperadmin();
  const r = await generateBotPredictions();
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
  return { ok: true, message: `Generated ${r.created} bot predictions` };
}

export async function recalcAction(
  _prev: AdminState,
  _formData: FormData,
): Promise<AdminState> {
  await requireSuperadmin();
  const r = await recalcAll();
  revalidatePath("/admin");
  return { ok: true, message: `Recalculated ${r.matches} matches, ${r.scored} predictions` };
}

const resultSchema = z.object({
  matchId: z.string().min(1),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]),
  homeScore: z.coerce.number().int().min(0).max(99).optional(),
  awayScore: z.coerce.number().int().min(0).max(99).optional(),
  advancingSide: z.enum(["HOME", "AWAY", "NONE"]).optional(),
});

export async function setResultAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireSuperadmin();

  const raw = {
    matchId: formData.get("matchId"),
    status: formData.get("status"),
    homeScore: formData.get("homeScore") || undefined,
    awayScore: formData.get("awayScore") || undefined,
    advancingSide: formData.get("advancingSide") || undefined,
  };
  const parsed = resultSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { matchId, status, homeScore, awayScore, advancingSide } = parsed.data;

  await prisma.match.update({
    where: { id: matchId },
    data: {
      status,
      homeScore: status === "SCHEDULED" ? null : homeScore ?? null,
      awayScore: status === "SCHEDULED" ? null : awayScore ?? null,
      advancingSide:
        advancingSide === "HOME" || advancingSide === "AWAY"
          ? advancingSide
          : null,
    },
  });

  const result = await scoreMatch(matchId);
  revalidatePath("/admin");
  revalidatePath("/predict");

  return {
    ok: true,
    message: result.skipped
      ? "Saved (not finished, predictions reset to unscored)"
      : `Saved and scored ${result.scored} predictions`,
  };
}

const outrightSchema = z.object({
  outrightId: z.string().min(1),
  correctAnswer: z.string().trim().max(100).optional(),
});

export async function setOutrightAnswerAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireSuperadmin();

  const parsed = outrightSchema.safeParse({
    outrightId: formData.get("outrightId"),
    correctAnswer: formData.get("correctAnswer") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input" };

  const { outrightId, correctAnswer } = parsed.data;
  await prisma.outright.update({
    where: { id: outrightId },
    data: { correctAnswer: correctAnswer && correctAnswer.length > 0 ? correctAnswer : null },
  });

  const result = await scoreOutright(outrightId);
  revalidatePath("/admin");
  revalidatePath("/outrights");
  return {
    ok: true,
    message: result.skipped
      ? "Cleared (predictions reset to unscored)"
      : `Saved and scored ${result.scored} predictions`,
  };
}
