import Link from "next/link";
import { Target, Trophy, Users, Zap, Dices } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { LOCK_WINDOW_MS } from "@/lib/locking";
import { getGlobalLeaderboard } from "@/lib/leaderboard";
import { toMatchView, toPredictionView } from "@/lib/match-view";
import { teamFlag } from "@/lib/teams";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchList } from "@/components/match-list";
import { NextMatchHero } from "@/components/next-match-hero";
import { LazyOzButton } from "@/components/lazy-oz-button";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return <Landing />;

  const now = new Date();
  const lockCutoff = new Date(now.getTime() + LOCK_WINDOW_MS);
  const withMyPred = { predictions: { where: { userId: user.id } } } as const;

  const [memberships, openMatches, liveMatch, nextMatch, recentFinished, board] =
    await Promise.all([
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
        include: withMyPred,
      }),
      prisma.match.findFirst({
        where: { status: "LIVE" },
        orderBy: { kickoffTime: "asc" },
        include: withMyPred,
      }),
      prisma.match.findFirst({
        where: { status: "SCHEDULED", teamsKnown: true, kickoffTime: { gt: now } },
        orderBy: { kickoffTime: "asc" },
        include: withMyPred,
      }),
      prisma.match.findMany({
        where: { status: "FINISHED" },
        orderBy: { kickoffTime: "desc" },
        take: 4,
        include: withMyPred,
      }),
      getGlobalLeaderboard(),
    ]);

  const unpredicted = openMatches.filter((m) => m.predictions.length === 0);
  const hero = liveMatch ?? nextMatch;
  const myRow = board.find((r) => r.userId === user.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
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

      {hero && (
        <NextMatchHero
          match={toMatchView(hero)}
          prediction={toPredictionView(hero.predictions[0] ?? null)}
        />
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Total points" value={myRow?.points ?? 0} />
        <StatTile
          label="Global rank"
          value={myRow ? `#${myRow.rank}` : "—"}
          hint={`of ${board.length}`}
        />
        <StatTile label="Exact scores" value={myRow?.exactHits ?? 0} />
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

      {unpredicted.length > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Short on time?</CardTitle>
              <CardDescription>
                LazyOz fills random picks for every game you haven&apos;t predicted yet.
              </CardDescription>
            </div>
          </div>
          <LazyOzButton variant="primary" label="Auto-fill my picks" />
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

      {recentFinished.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Recent results</h2>
          <Card className="flex flex-col divide-y divide-border/60 p-0">
            {recentFinished.map((m) => {
              const pred = m.predictions[0] ?? null;
              return (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <span>{teamFlag(m.homeTeam)}</span>
                    <span className="truncate">{m.homeTeam}</span>
                    <span className="score-display font-semibold">
                      {m.homeScore}–{m.awayScore}
                    </span>
                    <span className="truncate">{m.awayTeam}</span>
                    <span>{teamFlag(m.awayTeam)}</span>
                  </span>
                  {pred ? (
                    <Badge variant={pred.points ? "success" : "default"}>
                      {pred.homePredictedScore}–{pred.awayPredictedScore} · {pred.points ?? 0} pts
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted">no pick</span>
                  )}
                </div>
              );
            })}
          </Card>
        </section>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="score-display text-2xl sm:text-3xl">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </Card>
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
