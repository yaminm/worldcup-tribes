"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { generateInviteCode, normalizeInviteCode } from "@/lib/invite";
import { addBotsToLeague } from "@/lib/bots";

export interface FormState {
  error?: string;
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
});

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const code = generateInviteCode();
    const existing = await prisma.league.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique invite code");
}

export async function createLeague(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const inviteCode = await uniqueInviteCode();
  const league = await prisma.league.create({
    data: {
      name: parsed.data.name,
      inviteCode,
      adminId: user.id,
      members: { create: { userId: user.id } },
    },
  });

  // Bots compete in every league for fun.
  await addBotsToLeague(league.id);

  revalidatePath("/leagues");
  redirect(`/leagues/${league.id}`);
}

const joinSchema = z.object({
  code: z.string().trim().min(6).max(6),
});

export async function joinLeague(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = joinSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: "Enter a valid 6-character code" };
  }

  const code = normalizeInviteCode(parsed.data.code);
  const league = await prisma.league.findUnique({ where: { inviteCode: code } });
  if (!league) {
    return { error: "No league found with that code" };
  }

  await prisma.leagueMember.upsert({
    where: { leagueId_userId: { leagueId: league.id, userId: user.id } },
    update: {},
    create: { leagueId: league.id, userId: user.id },
  });

  revalidatePath("/leagues");
  redirect(`/leagues/${league.id}`);
}

export async function leaveLeague(formData: FormData): Promise<void> {
  const user = await requireUser();
  const leagueId = String(formData.get("leagueId") ?? "");
  if (!leagueId) return;

  await prisma.leagueMember.deleteMany({
    where: { leagueId, userId: user.id },
  });

  revalidatePath("/leagues");
  redirect("/leagues");
}
