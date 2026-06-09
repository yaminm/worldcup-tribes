"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isOutrightLocked } from "@/lib/outright";

export interface OutrightState {
  ok?: boolean;
  error?: string;
}

const schema = z.object({
  outrightId: z.string().min(1),
  answer: z.string().trim().min(1).max(100),
});

export async function submitOutright(
  _prev: OutrightState,
  formData: FormData,
): Promise<OutrightState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    outrightId: formData.get("outrightId"),
    answer: formData.get("answer"),
  });
  if (!parsed.success) return { error: "Please choose an answer" };

  const { outrightId, answer } = parsed.data;
  const outright = await prisma.outright.findUnique({ where: { id: outrightId } });
  if (!outright) return { error: "Question not found" };

  if (isOutrightLocked(outright.lockAt)) {
    return { error: "This question is locked" };
  }

  await prisma.outrightPrediction.upsert({
    where: { userId_outrightId: { userId: user.id, outrightId } },
    update: { answer, submittedAt: new Date() },
    create: { userId: user.id, outrightId, answer },
  });

  revalidatePath("/outrights");
  return { ok: true };
}
