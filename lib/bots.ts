import { prisma } from "@/lib/db";
import { teamRating, predictScoreline } from "@/lib/strength";
import { LOCK_WINDOW_MS } from "@/lib/locking";

export const BOTS = [
  { email: "coco@bots.tribes", name: "Coco the Monkey 🐵", strategy: "MONKEY" },
  { email: "analyst@bots.tribes", name: "The Analyst 🤖", strategy: "ANALYST" },
] as const;

const GOLDEN_BOOT_GUESSES = [
  "Kylian Mbappé",
  "Harry Kane",
  "Lautaro Martínez",
  "Vinícius Júnior",
  "Erling Haaland",
];

/** Monkey: skewed-random goals (mostly 0-3). */
function monkeyGoals(): number {
  const r = Math.random();
  if (r < 0.3) return 0;
  if (r < 0.6) return 1;
  if (r < 0.82) return 2;
  if (r < 0.95) return 3;
  return 4;
}

function predictMatch(strategy: string, home: string, away: string): [number, number] {
  if (strategy === "ANALYST") {
    return predictScoreline(teamRating(home), teamRating(away));
  }
  return [monkeyGoals(), monkeyGoals()];
}

function pickSide(strategy: string, home: string, away: string): "HOME" | "AWAY" {
  if (strategy === "ANALYST") {
    return teamRating(home) >= teamRating(away) ? "HOME" : "AWAY";
  }
  return Math.random() < 0.5 ? "HOME" : "AWAY";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function groupOrder(strategy: string, teams: string[]): string[] {
  if (strategy === "ANALYST") {
    return [...teams].sort((a, b) => teamRating(b) - teamRating(a));
  }
  return shuffle(teams);
}

function outrightAnswer(
  strategy: string,
  type: "TEAM" | "TEXT",
  teams: string[],
): string {
  if (type === "TEXT") {
    if (strategy === "ANALYST") return GOLDEN_BOOT_GUESSES[0];
    return GOLDEN_BOOT_GUESSES[Math.floor(Math.random() * GOLDEN_BOOT_GUESSES.length)];
  }
  if (teams.length === 0) return "";
  if (strategy === "ANALYST") {
    return [...teams].sort((a, b) => teamRating(b) - teamRating(a))[0];
  }
  return teams[Math.floor(Math.random() * teams.length)];
}

/** Creates the bot users if they don't exist. */
export async function ensureBots(): Promise<void> {
  for (const b of BOTS) {
    await prisma.user.upsert({
      where: { email: b.email },
      update: { name: b.name, isBot: true, botStrategy: b.strategy },
      create: { email: b.email, name: b.name, isBot: true, botStrategy: b.strategy },
    });
  }
}

/** Adds all bots as members of a league (used on league creation). */
export async function addBotsToLeague(leagueId: string): Promise<void> {
  const bots = await prisma.user.findMany({ where: { isBot: true }, select: { id: true } });
  if (bots.length === 0) return;
  await prisma.leagueMember.createMany({
    data: bots.map((b) => ({ leagueId, userId: b.id })),
    skipDuplicates: true,
  });
}

/**
 * Generates predictions for all bots across every currently-open match
 * (+ knockout advancement + open outrights), and keeps bots in every league.
 * Idempotent: existing picks are left untouched.
 */
export async function generateBotPredictions(): Promise<{ created: number }> {
  await ensureBots();
  const bots = await prisma.user.findMany({ where: { isBot: true } });

  // Keep bots in every league so they show on league leaderboards.
  const leagues = await prisma.league.findMany({ select: { id: true } });
  if (leagues.length > 0) {
    await prisma.leagueMember.createMany({
      data: leagues.flatMap((l) => bots.map((b) => ({ leagueId: l.id, userId: b.id }))),
      skipDuplicates: true,
    });
  }

  const botIds = bots.map((b) => b.id);
  const lockCutoff = new Date(Date.now() + LOCK_WINDOW_MS);

  // A few bulk reads instead of hundreds of per-row round-trips (keeps the
  // sync endpoint well under serverless time limits).
  const [matches, outrights, groupRows, existPred, existAdv, existOut, existGrp] =
    await Promise.all([
      prisma.match.findMany({
        where: { teamsKnown: true, status: "SCHEDULED", kickoffTime: { gt: lockCutoff } },
      }),
      prisma.outright.findMany(),
      prisma.match.findMany({
        where: { stage: "GROUP", teamsKnown: true },
        select: { groupName: true, homeTeam: true, awayTeam: true, kickoffTime: true },
      }),
      prisma.prediction.findMany({ where: { userId: { in: botIds } }, select: { userId: true, matchId: true } }),
      prisma.advancementPick.findMany({ where: { userId: { in: botIds } }, select: { userId: true, matchId: true } }),
      prisma.outrightPrediction.findMany({ where: { userId: { in: botIds } }, select: { userId: true, outrightId: true } }),
      prisma.groupPrediction.findMany({ where: { userId: { in: botIds } }, select: { userId: true, groupName: true } }),
    ]);

  const teams = [...new Set(groupRows.flatMap((m) => [m.homeTeam, m.awayTeam]))];
  const hasPred = new Set(existPred.map((p) => `${p.userId}:${p.matchId}`));
  const hasAdv = new Set(existAdv.map((p) => `${p.userId}:${p.matchId}`));
  const hasOut = new Set(existOut.map((p) => `${p.userId}:${p.outrightId}`));
  const hasGrp = new Set(existGrp.map((p) => `${p.userId}:${p.groupName}`));

  const groupInfo = new Map<string, { teams: Set<string>; first: Date }>();
  for (const r of groupRows) {
    const key = r.groupName ?? "Group";
    const info = groupInfo.get(key) ?? { teams: new Set<string>(), first: r.kickoffTime };
    info.teams.add(r.homeTeam);
    info.teams.add(r.awayTeam);
    if (r.kickoffTime < info.first) info.first = r.kickoffTime;
    groupInfo.set(key, info);
  }

  const predData: { userId: string; matchId: string; homePredictedScore: number; awayPredictedScore: number }[] = [];
  const advData: { userId: string; matchId: string; pickedSide: "HOME" | "AWAY" }[] = [];
  const outData: { userId: string; outrightId: string; answer: string }[] = [];
  const grpData: { userId: string; groupName: string; order: string[] }[] = [];

  for (const bot of bots) {
    const strategy = bot.botStrategy ?? "MONKEY";
    for (const m of matches) {
      if (!hasPred.has(`${bot.id}:${m.id}`)) {
        const [h, a] = predictMatch(strategy, m.homeTeam, m.awayTeam);
        predData.push({ userId: bot.id, matchId: m.id, homePredictedScore: h, awayPredictedScore: a });
      }
      if (m.stage === "KNOCKOUT" && !hasAdv.has(`${bot.id}:${m.id}`)) {
        advData.push({ userId: bot.id, matchId: m.id, pickedSide: pickSide(strategy, m.homeTeam, m.awayTeam) });
      }
    }
    for (const o of outrights) {
      if (o.lockAt.getTime() <= Date.now()) continue;
      if (!hasOut.has(`${bot.id}:${o.id}`)) {
        outData.push({ userId: bot.id, outrightId: o.id, answer: outrightAnswer(strategy, o.type, teams) });
      }
    }
    for (const [groupName, info] of groupInfo) {
      if (info.first.getTime() <= Date.now()) continue;
      if (!hasGrp.has(`${bot.id}:${groupName}`)) {
        grpData.push({ userId: bot.id, groupName, order: groupOrder(strategy, [...info.teams]) });
      }
    }
  }

  if (predData.length) await prisma.prediction.createMany({ data: predData, skipDuplicates: true });
  if (advData.length) await prisma.advancementPick.createMany({ data: advData, skipDuplicates: true });
  if (outData.length) await prisma.outrightPrediction.createMany({ data: outData, skipDuplicates: true });
  if (grpData.length) await prisma.groupPrediction.createMany({ data: grpData, skipDuplicates: true });

  return { created: predData.length };
}
