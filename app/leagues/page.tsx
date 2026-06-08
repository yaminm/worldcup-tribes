import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function LeaguesPage() {
  const user = await requireUser();
  const memberships = await prisma.leagueMember.findMany({
    where: { userId: user.id },
    include: { league: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Your leagues</h1>
        <div className="flex gap-2">
          <Link href="/leagues/join" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Join
          </Link>
          <Link href="/leagues/new" className={buttonVariants({ size: "sm" })}>
            Create
          </Link>
        </div>
      </div>

      {memberships.length === 0 ? (
        <Card className="flex flex-col gap-2">
          <CardTitle>No leagues yet</CardTitle>
          <CardDescription>
            Create a league and invite friends, or join one with a code.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {memberships.map((m) => (
            <Link key={m.leagueId} href={`/leagues/${m.leagueId}`}>
              <Card className="transition-colors hover:border-accent/50">
                <CardTitle>{m.league.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {m.league._count.members} member
                  {m.league._count.members === 1 ? "" : "s"}
                  {m.league.adminId === user.id && (
                    <span className="ml-1 text-accent">· admin</span>
                  )}
                </CardDescription>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
