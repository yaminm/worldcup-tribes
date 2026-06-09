import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeProfileStats } from "@/lib/stats";
import { Card } from "@/components/ui/card";

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
    <Card className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="score-display text-3xl">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </Card>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();

  const [preds, outrightAgg, leagueCount] = await Promise.all([
    prisma.prediction.findMany({
      where: { userId: user.id },
      select: { points: true, isExact: true, joker: true, match: { select: { stage: true } } },
    }),
    prisma.outrightPrediction.aggregate({
      where: { userId: user.id },
      _sum: { points: true },
    }),
    prisma.leagueMember.count({ where: { userId: user.id } }),
  ]);

  const stats = computeProfileStats(
    preds.map((p) => ({
      points: p.points,
      isExact: p.isExact,
      joker: p.joker,
      stage: p.match.stage,
    })),
    outrightAgg._sum.points ?? 0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {user.name ?? "Your profile"}
        </h1>
        <p className="text-muted">
          {user.email} · in {leagueCount} league{leagueCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Total points" value={stats.totalPoints} hint="match + outrights" />
        <StatTile label="Predictions" value={stats.predictionsMade} hint={`${stats.scored} scored`} />
        <StatTile label="Exact scores" value={stats.exactHits} />
        <StatTile label="Accuracy" value={`${stats.accuracy}%`} hint="scored picks with points" />
        <StatTile label="Avg / pick" value={stats.avgPoints} hint="points per scored pick" />
        <StatTile label="Jokers used" value={stats.jokersUsed} />
        <StatTile label="Group pts" value={stats.groupPoints} />
        <StatTile label="Knockout pts" value={stats.knockoutPoints} />
        <StatTile label="Outright pts" value={stats.outrightPoints} />
        <StatTile label="Correct outcomes" value={stats.correctOutcomes} />
      </div>
    </div>
  );
}
