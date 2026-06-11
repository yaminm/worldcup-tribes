import { prisma } from "@/lib/db";
import { scoreMatch } from "@/lib/scoring-service";
import { fetchMatches } from "./provider";
import type { MatchStatus, NormalizedMatch, Side } from "./types";

export interface SyncResult {
  source: string;
  total: number;
  created: number;
  updated: number;
  scored: number;
}

export interface ResultFields {
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  advancingSide: Side | null;
}

function hasResult(r: ResultFields | null | undefined): boolean {
  return !!r && r.status === "FINISHED" && r.homeScore !== null && r.awayScore !== null;
}

/**
 * Decides which result to keep when syncing. The provider is authoritative
 * only when it actually has a finished result (so it can correct scores);
 * otherwise an existing finished result is preserved — a lagging feed must
 * never wipe a real (e.g. manually entered) result.
 */
export function resolveResult(
  existing: ResultFields | null,
  provider: ResultFields,
): ResultFields {
  if (hasResult(provider) || !hasResult(existing)) return provider;
  return existing as ResultFields;
}

// Metadata fields that are always safe to refresh from the provider.
function metaRecord(m: NormalizedMatch) {
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
    stage: m.stage,
    teamsKnown: m.teamsKnown,
  };
}

function providerResult(m: NormalizedMatch): ResultFields {
  return {
    status: m.status,
    homeScore: m.homeScore ?? null,
    awayScore: m.awayScore ?? null,
    advancingSide: m.advancingSide ?? null,
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
    const meta = metaRecord(m);
    const existing = await prisma.match.findUnique({
      where: { externalId: m.externalId },
      select: {
        id: true,
        status: true,
        homeScore: true,
        awayScore: true,
        advancingSide: true,
      },
    });

    const result = resolveResult(existing, providerResult(m));

    const record = existing
      ? await prisma.match.update({
          where: { externalId: m.externalId },
          data: { ...meta, ...result },
        })
      : await prisma.match.create({
          data: { ...meta, ...result, externalId: m.externalId },
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
