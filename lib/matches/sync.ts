import { prisma } from "@/lib/db";
import { scoreMatch } from "@/lib/scoring-service";
import { fetchMatches } from "./provider";
import type { NormalizedMatch } from "./types";

export interface SyncResult {
  source: string;
  total: number;
  created: number;
  updated: number;
  scored: number;
}

function toRecord(m: NormalizedMatch) {
  return {
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeCrest: m.homeCrest ?? null,
    awayCrest: m.awayCrest ?? null,
    homeCode: m.homeCode ?? null,
    awayCode: m.awayCode ?? null,
    groupName: m.groupName ?? null,
    venue: m.venue ?? null,
    city: m.city ?? null,
    country: m.country ?? null,
    venueCapacity: m.venueCapacity ?? null,
    kickoffTime: new Date(m.kickoffTime),
    status: m.status,
    stage: m.stage,
    homeScore: m.homeScore ?? null,
    awayScore: m.awayScore ?? null,
    advancingSide: m.advancingSide ?? null,
    teamsKnown: m.teamsKnown,
  };
}

/**
 * Pulls fixtures from the active provider and upserts them by externalId.
 * Any match that is finished (with a recorded score) is (re)scored, keeping
 * the leaderboard in sync. Idempotent: safe to run on any schedule.
 */
export async function syncMatches(): Promise<SyncResult> {
  const { source, matches } = await fetchMatches();
  let created = 0;
  let updated = 0;
  let scored = 0;

  for (const m of matches) {
    const data = toRecord(m);
    const existing = await prisma.match.findUnique({
      where: { externalId: m.externalId },
      select: { id: true },
    });

    const record = existing
      ? await prisma.match.update({ where: { externalId: m.externalId }, data })
      : await prisma.match.create({
          data: { ...data, externalId: m.externalId },
        });

    if (existing) updated++;
    else created++;

    if (
      record.status === "FINISHED" &&
      record.homeScore !== null &&
      record.awayScore !== null
    ) {
      const r = await scoreMatch(record.id);
      scored += r.scored;
    }
  }

  return { source, total: matches.length, created, updated, scored };
}
