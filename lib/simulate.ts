import { prisma } from "@/lib/db";
import { scoreMatch } from "@/lib/scoring-service";
import { scoreGroupPredictions } from "@/lib/group-predict-service";

export interface SimResult {
  homeScore: number;
  awayScore: number;
  advancingSide: "HOME" | "AWAY" | null;
}

/** A plausible random result. Pure (takes an RNG) so it's testable. */
export function simulatedResult(
  stage: "GROUP" | "KNOCKOUT",
  rnd: () => number = Math.random,
): SimResult {
  const homeScore = Math.floor(rnd() * 4); // 0..3
  const awayScore = Math.floor(rnd() * 4);
  let advancingSide: "HOME" | "AWAY" | null = null;
  if (stage === "KNOCKOUT") {
    // Knockouts can't end level: pick a winner (penalties if drawn).
    advancingSide =
      homeScore === awayScore
        ? rnd() < 0.5
          ? "HOME"
          : "AWAY"
        : homeScore > awayScore
          ? "HOME"
          : "AWAY";
  }
  return { homeScore, awayScore, advancingSide };
}

/**
 * Simulates kickoff for the next `count` scheduled matches: sets kickoff to now
 * and status to LIVE, which locks predictions immediately (proving the lock).
 */
export async function simulateKickoff(count = 4): Promise<number> {
  const matches = await prisma.match.findMany({
    where: { status: "SCHEDULED", teamsKnown: true },
    orderBy: { kickoffTime: "asc" },
    take: count,
  });
  const now = new Date();
  for (const m of matches) {
    await prisma.match.update({
      where: { id: m.id },
      data: { status: "LIVE", kickoffTime: now },
    });
  }
  return matches.length;
}

/**
 * Finishes all LIVE matches with random results and (re)scores everything:
 * predictions, knockout advancement, and completed group standings.
 */
export async function simulateResults(): Promise<number> {
  const matches = await prisma.match.findMany({ where: { status: "LIVE" } });
  for (const m of matches) {
    const r = simulatedResult(m.stage);
    await prisma.match.update({
      where: { id: m.id },
      data: {
        status: "FINISHED",
        homeScore: r.homeScore,
        awayScore: r.awayScore,
        advancingSide: r.advancingSide,
      },
    });
    await scoreMatch(m.id);
  }
  await scoreGroupPredictions();
  return matches.length;
}
