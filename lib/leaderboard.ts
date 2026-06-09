import { prisma } from "@/lib/db";

export interface LeaderboardRow {
  userId: string;
  name: string;
  image: string | null;
  points: number;
  exactHits: number;
  predictions: number;
  lastSubmittedAt: number; // epoch ms of latest scored submission (tie-break)
  rank: number;
}

/**
 * Computes a league leaderboard.
 *
 * Ranking: total points DESC, then exact-hit count DESC, then earliest
 * cumulative submission ASC (rewards people who locked in sooner), then name.
 */
export async function getLeaderboard(leagueId: string): Promise<LeaderboardRow[]> {
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    include: { user: true },
  });

  const rows: Omit<LeaderboardRow, "rank">[] = await Promise.all(
    members.map(async (m) => {
      const preds = await prisma.prediction.findMany({
        where: { userId: m.userId },
        select: { points: true, isExact: true, submittedAt: true },
      });

      const matchPoints = preds.reduce((sum, p) => sum + (p.points ?? 0), 0);
      const exactHits = preds.filter((p) => p.isExact).length;
      const submittedTimes = preds.map((p) => p.submittedAt.getTime());

      // Tournament outright points count toward the same total.
      const outrightAgg = await prisma.outrightPrediction.aggregate({
        where: { userId: m.userId },
        _sum: { points: true },
      });
      const points = matchPoints + (outrightAgg._sum.points ?? 0);

      return {
        userId: m.userId,
        name: m.user.name ?? m.user.email ?? "Player",
        image: m.user.image,
        points,
        exactHits,
        predictions: preds.length,
        // Sum of submission times — a stable proxy for "locked in earlier".
        lastSubmittedAt: submittedTimes.reduce((a, b) => a + b, 0),
      };
    }),
  );

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
    if (a.lastSubmittedAt !== b.lastSubmittedAt)
      return a.lastSubmittedAt - b.lastSubmittedAt;
    return a.name.localeCompare(b.name);
  });

  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}
