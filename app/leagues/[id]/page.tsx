import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLeaderboard } from "@/lib/leaderboard";
import { leaveLeague } from "@/app/actions/leagues";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { InviteShare } from "@/components/invite-share";
import { LeaderboardTable } from "@/components/leaderboard-table";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const league = await prisma.league.findUnique({
    where: { id },
    select: { name: true },
  });
  const name = league?.name ?? "League";
  const description = `Join "${name}" and predict the World Cup 2026 against your friends.`;
  return {
    title: name,
    description,
    openGraph: { title: `${name} · Tribes`, description },
    twitter: { title: `${name} · Tribes`, description },
  };
}

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const league = await prisma.league.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });
  if (!league) notFound();

  const membership = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId: id, userId: user.id } },
  });

  if (!membership) {
    return (
      <Card className="mx-auto max-w-md">
        <CardTitle>{league.name}</CardTitle>
        <CardDescription>
          You&apos;re not a member of this league.
        </CardDescription>
        <Link
          href="/leagues/join"
          className={buttonVariants({ size: "sm", className: "mt-3" })}
        >
          Join with a code
        </Link>
      </Card>
    );
  }

  const rows = await getLeaderboard(id);
  const isAdmin = league.adminId === user.id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{league.name}</h1>
          <p className="flex items-center gap-1 text-sm text-muted">
            <Users className="h-3.5 w-3.5" />
            {league._count.members} member{league._count.members === 1 ? "" : "s"}
            {isAdmin && <span className="ml-1 text-accent">· you&apos;re admin</span>}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-muted">Invite friends</span>
          <InviteShare code={league.inviteCode} />
        </div>
      </div>

      <Card>
        <CardTitle className="mb-3">Leaderboard</CardTitle>
        <LeaderboardTable rows={rows} currentUserId={user.id} />
      </Card>

      <form action={leaveLeague} className="self-start">
        <input type="hidden" name="leagueId" value={league.id} />
        <button
          type="submit"
          className={buttonVariants({ variant: "danger", size: "sm" })}
        >
          Leave league
        </button>
      </form>
    </div>
  );
}
