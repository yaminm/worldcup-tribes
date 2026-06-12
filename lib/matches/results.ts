import { prisma } from "@/lib/db";
import { scoreMatch } from "@/lib/scoring-service";
import { pairKey } from "./team-names";

const FD_BASE = "https://api.football-data.org/v4";
const FD_COMPETITION = "WC";

interface FdMatch {
  utcDate: string;
  status: string;
  homeTeam?: { name?: string | null } | null;
  awayTeam?: { name?: string | null } | null;
  score?: {
    winner?: string | null;
    fullTime?: { home?: number | null; away?: number | null } | null;
  } | null;
}

export interface ResultsSyncOutcome {
  source: string;
  finishedUpstream: number;
  matched: number;
  scored: number;
  unmatched: string[];
}

/**
 * Overlays finished results from football-data.org onto existing matches
 * (matched by team-pair + nearest kickoff), without touching match IDs or
 * predictions. No-op when FOOTBALL_DATA_API_TOKEN isn't set.
 */
export async function syncResultsFromFootballData(): Promise<ResultsSyncOutcome | null> {
  const token = process.env.FOOTBALL_DATA_API_TOKEN;
  if (!token) return null;

  const res = await fetch(`${FD_BASE}/competitions/${FD_COMPETITION}/matches`, {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`football-data.org responded ${res.status}`);
  const data = (await res.json()) as { matches?: FdMatch[] };

  const finished = (data.matches ?? []).filter(
    (m) =>
      m.status === "FINISHED" &&
      m.homeTeam?.name &&
      m.awayTeam?.name &&
      m.score?.fullTime?.home != null &&
      m.score?.fullTime?.away != null,
  );

  // Index existing matches by team-pair (a pair can recur: group + knockout).
  const dbMatches = await prisma.match.findMany({
    select: { id: true, homeTeam: true, awayTeam: true, kickoffTime: true },
  });
  const byPair = new Map<string, { id: string; kickoff: number }[]>();
  for (const d of dbMatches) {
    const k = pairKey(d.homeTeam, d.awayTeam);
    (byPair.get(k) ?? byPair.set(k, []).get(k)!).push({
      id: d.id,
      kickoff: d.kickoffTime.getTime(),
    });
  }

  let matched = 0;
  let scored = 0;
  const unmatched: string[] = [];

  for (const fm of finished) {
    const k = pairKey(fm.homeTeam!.name!, fm.awayTeam!.name!);
    const candidates = byPair.get(k);
    if (!candidates || candidates.length === 0) {
      unmatched.push(`${fm.homeTeam!.name} v ${fm.awayTeam!.name}`);
      continue;
    }
    // Pick the candidate whose kickoff is nearest the upstream date.
    const target = new Date(fm.utcDate).getTime();
    const best = candidates.reduce((a, b) =>
      Math.abs(a.kickoff - target) <= Math.abs(b.kickoff - target) ? a : b,
    );

    const advancingSide =
      fm.score!.winner === "HOME_TEAM"
        ? "HOME"
        : fm.score!.winner === "AWAY_TEAM"
          ? "AWAY"
          : null;

    await prisma.match.update({
      where: { id: best.id },
      data: {
        status: "FINISHED",
        homeScore: fm.score!.fullTime!.home as number,
        awayScore: fm.score!.fullTime!.away as number,
        advancingSide,
      },
    });
    matched++;
    scored += (await scoreMatch(best.id)).scored;
  }

  return {
    source: "football-data.org",
    finishedUpstream: finished.length,
    matched,
    scored,
    unmatched,
  };
}
