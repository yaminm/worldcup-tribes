import { prisma } from "@/lib/db";
import { computeStandings } from "@/lib/standings";
import { scoreGroupOrder } from "@/lib/group-predict";

/**
 * Scores group-order predictions for every group whose matches are all
 * finished. Idempotent. Returns how many predictions were scored.
 */
export async function scoreGroupPredictions(): Promise<{ scored: number }> {
  const groupMatches = await prisma.match.findMany({ where: { stage: "GROUP" } });

  const byGroup = new Map<string, typeof groupMatches>();
  for (const m of groupMatches) {
    const key = m.groupName ?? "Group";
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key)!.push(m);
  }

  let scored = 0;
  for (const [groupName, matches] of byGroup) {
    const complete =
      matches.length > 0 && matches.every((m) => m.status === "FINISHED");
    if (!complete) continue;

    const actual = computeStandings(
      matches.map((m) => ({
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        status: m.status,
      })),
    ).map((r) => r.team);

    const preds = await prisma.groupPrediction.findMany({ where: { groupName } });
    const now = new Date();
    for (const p of preds) {
      await prisma.groupPrediction.update({
        where: { id: p.id },
        data: { points: scoreGroupOrder(p.order, actual), scoredAt: now },
      });
      scored++;
    }
  }

  return { scored };
}
