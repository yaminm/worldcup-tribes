import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  MatchProvider,
  MatchStatus,
  NormalizedMatch,
  Side,
  Stage,
} from "./types";

const FD_BASE = "https://api.football-data.org/v4";
const FD_COMPETITION = "WC"; // FIFA World Cup

function mapStatus(raw: string): MatchStatus {
  switch (raw) {
    case "FINISHED":
    case "AWARDED":
      return "FINISHED";
    case "IN_PLAY":
    case "PAUSED":
    case "LIVE":
      return "LIVE";
    default:
      return "SCHEDULED";
  }
}

function mapStage(raw: string | null | undefined): Stage {
  return raw === "GROUP_STAGE" ? "GROUP" : "KNOCKOUT";
}

function mapWinner(winner: string | null | undefined): Side | null {
  if (winner === "HOME_TEAM") return "HOME";
  if (winner === "AWAY_TEAM") return "AWAY";
  return null;
}

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  stage?: string | null;
  group?: string | null;
  homeTeam?: { name?: string | null; crest?: string | null } | null;
  awayTeam?: { name?: string | null; crest?: string | null } | null;
  score?: {
    winner?: string | null;
    fullTime?: { home?: number | null; away?: number | null } | null;
  } | null;
}

export function normalizeFootballDataMatch(m: FootballDataMatch): NormalizedMatch {
  const homeName = m.homeTeam?.name ?? null;
  const awayName = m.awayTeam?.name ?? null;
  const teamsKnown = Boolean(homeName) && Boolean(awayName);

  return {
    externalId: `fd-${m.id}`,
    homeTeam: homeName ?? "TBD",
    awayTeam: awayName ?? "TBD",
    homeCrest: m.homeTeam?.crest ?? null,
    awayCrest: m.awayTeam?.crest ?? null,
    groupName: m.group ?? null,
    kickoffTime: m.utcDate,
    status: mapStatus(m.status),
    stage: mapStage(m.stage),
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    advancingSide: mapWinner(m.score?.winner),
    teamsKnown,
  };
}

export const footballDataProvider: MatchProvider = {
  name: "football-data.org",
  async getMatches() {
    const token = process.env.FOOTBALL_DATA_API_TOKEN;
    if (!token) throw new Error("FOOTBALL_DATA_API_TOKEN is not set");

    const res = await fetch(`${FD_BASE}/competitions/${FD_COMPETITION}/matches`, {
      headers: { "X-Auth-Token": token },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`football-data.org responded ${res.status}`);
    }
    const data = (await res.json()) as { matches?: FootballDataMatch[] };
    return (data.matches ?? []).map(normalizeFootballDataMatch);
  },
};

export const jsonProvider: MatchProvider = {
  name: "json-fixtures",
  async getMatches() {
    const file = path.join(process.cwd(), "prisma", "data", "worldcup2026.json");
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as NormalizedMatch[];
  },
};

// ---- openfootball (real World Cup 2026 fixtures) ----

const OPENFOOTBALL_URL =
  process.env.OPENFOOTBALL_URL ??
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

interface OpenfootballMatch {
  round: string;
  num?: number;
  date: string; // YYYY-MM-DD
  time?: string; // "HH:MM UTC-6"
  team1: string;
  team2: string;
  group?: string;
  ground?: string;
  score?: { ft?: [number, number] } | null;
}

export interface OpenfootballMeta {
  /** team name -> FIFA code (e.g. "Mexico" -> "MEX") */
  teamCodes?: Map<string, string>;
  /** ground/city -> stadium info */
  stadiums?: Map<string, { name: string; cc: string; capacity: number }>;
}

/** Knockout slots look like "2A", "1C", "W73", "L73", "RU-A" — not real teams. */
export function isPlaceholderTeam(name: string): boolean {
  const t = name.trim();
  return (
    /^\d/.test(t) || // "2A", "1B", "3CDEF"
    /^W\d+$/.test(t) || // winner of match
    /^L\d+$/.test(t) || // loser of match
    /^RU/i.test(t) || // runner-up
    /^Winner/i.test(t) ||
    /^Runner/i.test(t)
  );
}

/** Parses "2026-06-11" + "13:00 UTC-6" into a real UTC Date. */
export function parseKickoff(date: string, time?: string): Date {
  if (!time) return new Date(`${date}T12:00:00.000Z`);
  const m = time.match(/^(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})?/i);
  if (!m) return new Date(`${date}T12:00:00.000Z`);
  const [y, mo, d] = date.split("-").map(Number);
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  const offset = m[3] ? Number(m[3]) : 0; // e.g. -6
  // UTC = local - offset; Date.UTC normalizes any hour overflow/underflow.
  return new Date(Date.UTC(y, mo - 1, d, hh - offset, mm));
}

export function normalizeOpenfootballMatch(
  m: OpenfootballMatch,
  meta: OpenfootballMeta = {},
): NormalizedMatch {
  const isGroup = Boolean(m.group);
  const teamsKnown = !isPlaceholderTeam(m.team1) && !isPlaceholderTeam(m.team2);
  const ft = m.score?.ft;
  const hasScore = Array.isArray(ft) && ft.length === 2;

  const externalId =
    m.num != null
      ? `of-${m.num}`
      : `of-${m.date}-${m.team1}-${m.team2}`.replace(/\s+/g, "_");

  const stadium = m.ground ? meta.stadiums?.get(m.ground) : undefined;

  return {
    externalId,
    homeTeam: m.team1,
    awayTeam: m.team2,
    homeCrest: null,
    awayCrest: null,
    homeCode: teamsKnown ? meta.teamCodes?.get(m.team1) ?? null : null,
    awayCode: teamsKnown ? meta.teamCodes?.get(m.team2) ?? null : null,
    groupName: m.group ?? m.round,
    venue: stadium?.name ?? null,
    city: m.ground ?? null,
    country: stadium?.cc ?? null,
    venueCapacity: stadium?.capacity ?? null,
    kickoffTime: parseKickoff(m.date, m.time).toISOString(),
    status: hasScore ? "FINISHED" : "SCHEDULED",
    stage: isGroup ? "GROUP" : "KNOCKOUT",
    homeScore: hasScore ? ft![0] : null,
    awayScore: hasScore ? ft![1] : null,
    advancingSide: null,
    teamsKnown,
  };
}

const OPENFOOTBALL_BASE =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026";

async function fetchOpenfootballMeta(): Promise<OpenfootballMeta> {
  try {
    const [teamsRes, stadiumsRes] = await Promise.all([
      fetch(`${OPENFOOTBALL_BASE}/worldcup.teams.json`, { cache: "no-store" }),
      fetch(`${OPENFOOTBALL_BASE}/worldcup.stadiums.json`, { cache: "no-store" }),
    ]);

    const teamCodes = new Map<string, string>();
    if (teamsRes.ok) {
      const data = (await teamsRes.json()) as
        | { name: string; fifa_code?: string }[]
        | { teams?: { name: string; fifa_code?: string }[] };
      const list = Array.isArray(data) ? data : data.teams ?? [];
      for (const t of list) {
        if (t.fifa_code) teamCodes.set(t.name, t.fifa_code);
      }
    }

    const stadiums = new Map<string, { name: string; cc: string; capacity: number }>();
    if (stadiumsRes.ok) {
      const data = (await stadiumsRes.json()) as
        | { city: string; name: string; cc: string; capacity: number }[]
        | { stadiums?: { city: string; name: string; cc: string; capacity: number }[] };
      const list = Array.isArray(data) ? data : data.stadiums ?? [];
      for (const s of list) {
        stadiums.set(s.city, { name: s.name, cc: s.cc, capacity: s.capacity });
      }
    }

    return { teamCodes, stadiums };
  } catch {
    return {};
  }
}

export const openfootballProvider: MatchProvider = {
  name: "openfootball",
  async getMatches() {
    const [res, meta] = await Promise.all([
      fetch(OPENFOOTBALL_URL, { cache: "no-store" }),
      fetchOpenfootballMeta(),
    ]);
    if (!res.ok) throw new Error(`openfootball responded ${res.status}`);
    const data = (await res.json()) as { matches?: OpenfootballMatch[] };
    return (data.matches ?? []).map((m) => normalizeOpenfootballMatch(m, meta));
  },
};

/**
 * openfootball is the canonical FIXTURE source (stable IDs that predictions are
 * tied to). football-data.org is used only as a RESULTS overlay (see
 * lib/matches/results.ts), never as a fixture provider, so match IDs never
 * change underneath existing predictions.
 */
export function getMatchProvider(): MatchProvider {
  return openfootballProvider;
}

/**
 * Tries the configured provider; if the online provider fails for any reason,
 * falls back to the bundled JSON fixtures so a sync never hard-crashes.
 */
export async function fetchMatches(): Promise<{
  source: string;
  matches: NormalizedMatch[];
}> {
  const provider = getMatchProvider();
  try {
    return { source: provider.name, matches: await provider.getMatches() };
  } catch (err) {
    if (provider.name === jsonProvider.name) throw err;
    console.error(
      `[matches] provider "${provider.name}" failed, falling back to JSON:`,
      err,
    );
    return {
      source: `${jsonProvider.name} (fallback)`,
      matches: await jsonProvider.getMatches(),
    };
  }
}
