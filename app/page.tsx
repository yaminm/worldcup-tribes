import Link from "next/link";
import { Target, Trophy, Users, Zap } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { LOCK_WINDOW_MS } from "@/lib/locking";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MatchList } from "@/components/match-list";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return <Landing />;

  const now = new Date();
  const lockCutoff = new Date(now.getTime() + LOCK_WINDOW_MS);

  const [memberships, openMatches] = await Promise.all([
    prisma.leagueMember.findMany({
      where: { userId: user.id },
      include: { league: { include: { _count: { select: { members: true } } } } },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.match.findMany({
      where: {
        teamsKnown: true,
        status: { not: "FINISHED" },
        kickoffTime: { gt: lockCutoff },
      },
      orderBy: { kickoffTime: "asc" },
      take: 10,
      include: { predictions: { where: { userId: user.id } } },
    }),
  ]);

  const unpredicted = openMatches.filter((m) => m.predictions.length === 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted">
            {unpredicted.length > 0
              ? `${unpredicted.length} open match${unpredicted.length === 1 ? "" : "es"} still need your call.`
              : "You're all caught up. Nice."}
          </p>
        </div>
        <Link href="/leagues" className={buttonVariants({ variant: "secondary" })}>
          My leagues
        </Link>
      </div>

      {memberships.length === 0 && (
        <Card className="flex flex-col items-start gap-2">
          <CardTitle>Join your first tribe</CardTitle>
          <CardDescription>
            Create a league or join one with an invite code to start competing.
          </CardDescription>
          <div className="mt-2 flex gap-2">
            <Link href="/leagues/new" className={buttonVariants({ size: "sm" })}>
              Create a league
            </Link>
            <Link
              href="/leagues/join"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Join with code
            </Link>
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Predict next</h2>
          <Link href="/predict" className="text-sm text-accent hover:underline">
            All matches →
          </Link>
        </div>
        {unpredicted.length > 0 ? (
          <MatchList matches={unpredicted.slice(0, 4)} />
        ) : (
          <p className="text-sm text-muted">No open matches need a prediction right now.</p>
        )}
      </section>
    </div>
  );
}

function Landing() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          World Cup 2026
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Call every match.
          <br />
          <span className="text-accent">Rule your tribe.</span>
        </h1>
        <p className="max-w-xl text-muted">
          Predict scores, earn points for accuracy, and climb private league
          leaderboards with your friends all summer long.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Start predicting
          </Link>
          <Link
            href="/how-it-works"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            How it works
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Feature icon={<Target className="h-5 w-5 text-accent" />} title="Score predictions">
          Pick the exact scoreline for every fixture before kickoff.
        </Feature>
        <Feature icon={<Zap className="h-5 w-5 text-accent" />} title="Smart points">
          10 for exact, 6 for goal difference, 4 for the right call.
        </Feature>
        <Feature icon={<Trophy className="h-5 w-5 text-accent" />} title="Knockout ×1.5">
          Every knockout pick is worth 50% more. Stakes rise with the rounds.
        </Feature>
        <Feature icon={<Users className="h-5 w-5 text-accent" />} title="Private leagues">
          Spin up a league, share a code, settle it once and for all.
        </Feature>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-2">
      {icon}
      <CardTitle className="text-base">{title}</CardTitle>
      <CardDescription>{children}</CardDescription>
    </Card>
  );
}
