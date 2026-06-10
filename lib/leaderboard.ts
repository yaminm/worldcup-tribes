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

interface LbUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

/**
 * Builds a ranked leaderboard for a set of users.
 *
 * Ranking: total points DESC (match + outright), then exact-hit count DESC,
 * then earliest cumulative submission ASC, then name.
 */
async function buildLeaderboard(users: LbUser[]): Promise<LeaderboardRow[]> {
  const rows: Omit<LeaderboardRow, "rank">[] = await Promise.all(
    users.map(async (u) => {
      const preds = await prisma.prediction.findMany({
        where: { userId: u.id },
        select: { points: true, isExact: true, submittedAt: true },
      });

      const matchPoints = preds.reduce((sum, p) => sum + (p.points ?? 0), 0);
      const exactHits = preds.filter((p) => p.isExact).length;
      const submittedTimes = preds.map((p) => p.submittedAt.getTime());

      const [outrightAgg, advancementAgg, groupAgg] = await Promise.all([
        prisma.outrightPrediction.aggregate({
          where: { userId: u.id },
          _sum: { points: true },
        }),
        prisma.advancementPick.aggregate({
          where: { userId: u.id },
          _sum: { points: true },
        }),
        prisma.groupPrediction.aggregate({
          where: { userId: u.id },
          _sum: { points: true },
        }),
      ]);
      const points =
        matchPoints +
        (outrightAgg._sum.points ?? 0) +
        (advancementAgg._sum.points ?? 0) +
        (groupAgg._sum.points ?? 0);

      return {
        userId: u.id,
        name: u.name ?? u.email ?? "Player",
        image: u.image,
        points,
        exactHits,
        predictions: preds.length,
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

/** Per-league leaderboard. */
export async function getLeaderboard(leagueId: string): Promise<LeaderboardRow[]> {
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    include: { user: true },
  });
  return buildLeaderboard(members.map((m) => m.user));
}

/** Global leaderboard across everyone who has made at least one prediction. */
export async function getGlobalLeaderboard(): Promise<LeaderboardRow[]> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { predictions: { some: {} } },
        { outrightPredictions: { some: {} } },
        { advancementPicks: { some: {} } },
        { groupPredictions: { some: {} } },
      ],
    },
  });
  return buildLeaderboard(users);
}
