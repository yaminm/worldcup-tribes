import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { normalizeInviteCode } from "@/lib/invite";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function JoinByLinkPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = normalizeInviteCode(code);

  const user = await getCurrentUser();
  if (!user) {
    // Send them to sign in, then back here to complete the join.
    redirect(`/login?callbackUrl=${encodeURIComponent(`/join/${normalized}`)}`);
  }

  const league = await prisma.league.findUnique({
    where: { inviteCode: normalized },
  });

  if (!league) {
    return (
      <Card className="mx-auto max-w-md">
        <CardTitle>Invite not found</CardTitle>
        <CardDescription>
          This invite link is invalid or the league no longer exists.
        </CardDescription>
        <Link
          href="/leagues/join"
          className={buttonVariants({ size: "sm", className: "mt-3" })}
        >
          Enter a code manually
        </Link>
      </Card>
    );
  }

  // Idempotent: joining again is a no-op.
  await prisma.leagueMember.upsert({
    where: { leagueId_userId: { leagueId: league.id, userId: user.id } },
    update: {},
    create: { leagueId: league.id, userId: user.id },
  });

  redirect(`/leagues/${league.id}`);
}
