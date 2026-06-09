import { PrismaClient } from "@prisma/client";
import { scoreMatch } from "@/lib/scoring-service";
import { scoreOutright } from "@/lib/outright-service";

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  // Order matters for FK constraints.
  await prisma.prediction.deleteMany();
  await prisma.outrightPrediction.deleteMany();
  await prisma.outright.deleteMany();
  await prisma.leagueMember.deleteMany();
  await prisma.league.deleteMany();
  await prisma.match.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
}

const H = 3600 * 1000;

/**
 * Deterministic seed for local dev + E2E. Uses RELATIVE kickoff times so the
 * dataset always contains an open match, a locked match, a live match, finished
 * matches (group + a penalty-decided knockout), and a TBD knockout.
 */
export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  const now = Date.now();
  const at = (hoursFromNow: number) => new Date(now + hoursFromNow * H);

  const dev = await prisma.user.create({
    data: { email: "dev@tribes.local", name: "Dev Player" },
  });
  const rival = await prisma.user.create({
    data: { email: "rival@tribes.local", name: "Rival Riley" },
  });

  // --- Matches ---
  const open = await prisma.match.create({
    data: {
      externalId: "seed-open",
      homeTeam: "Mexico",
      awayTeam: "Croatia",
      groupName: "Group A",
      kickoffTime: at(48),
      status: "SCHEDULED",
      stage: "GROUP",
      teamsKnown: true,
    },
  });

  await prisma.match.create({
    data: {
      externalId: "seed-open2",
      homeTeam: "Brazil",
      awayTeam: "Serbia",
      groupName: "Group E",
      kickoffTime: at(72),
      status: "SCHEDULED",
      stage: "GROUP",
      teamsKnown: true,
    },
  });

  await prisma.match.create({
    data: {
      externalId: "seed-locked",
      homeTeam: "Spain",
      awayTeam: "Japan",
      groupName: "Group G",
      kickoffTime: at(0.05), // ~3 minutes => within the 5-minute lock window
      status: "SCHEDULED",
      stage: "GROUP",
      teamsKnown: true,
    },
  });

  await prisma.match.create({
    data: {
      externalId: "seed-live",
      homeTeam: "Argentina",
      awayTeam: "Nigeria",
      groupName: "Group C",
      kickoffTime: at(-0.5),
      status: "LIVE",
      stage: "GROUP",
      homeScore: 1,
      awayScore: 0,
      teamsKnown: true,
    },
  });

  const finishedGroup = await prisma.match.create({
    data: {
      externalId: "seed-fin-grp",
      homeTeam: "France",
      awayTeam: "Australia",
      groupName: "Group F",
      kickoffTime: at(-48),
      status: "FINISHED",
      stage: "GROUP",
      homeScore: 4,
      awayScore: 1,
      teamsKnown: true,
    },
  });

  const finishedKO = await prisma.match.create({
    data: {
      externalId: "seed-fin-ko",
      homeTeam: "England",
      awayTeam: "Germany",
      groupName: "Round of 16",
      kickoffTime: at(-24),
      status: "FINISHED",
      stage: "KNOCKOUT",
      homeScore: 1,
      awayScore: 1,
      advancingSide: "HOME", // England advanced on penalties
      teamsKnown: true,
    },
  });

  await prisma.match.create({
    data: {
      externalId: "seed-tbd",
      homeTeam: "TBD",
      awayTeam: "TBD",
      groupName: "Quarter-final",
      kickoffTime: at(240),
      status: "SCHEDULED",
      stage: "KNOCKOUT",
      teamsKnown: false,
    },
  });

  // --- Predictions (on finished matches, so they score) ---
  await prisma.prediction.createMany({
    data: [
      // Dev: exact on group (10), correct KO winner via penalties (4 * 1.5 = 6)
      {
        userId: dev.id,
        matchId: finishedGroup.id,
        homePredictedScore: 4,
        awayPredictedScore: 1,
      },
      {
        userId: dev.id,
        matchId: finishedKO.id,
        homePredictedScore: 2,
        awayPredictedScore: 1,
      },
      // Rival: wrong on group (0), correct KO winner (6)
      {
        userId: rival.id,
        matchId: finishedGroup.id,
        homePredictedScore: 1,
        awayPredictedScore: 1,
      },
      {
        userId: rival.id,
        matchId: finishedKO.id,
        homePredictedScore: 2,
        awayPredictedScore: 1,
      },
    ],
  });

  // --- League ---
  const league = await prisma.league.create({
    data: {
      name: "Demo Tribe",
      inviteCode: "DEMO01",
      adminId: dev.id,
      members: {
        create: [{ userId: dev.id }, { userId: rival.id }],
      },
    },
  });
  void open;
  void league;

  // --- Outrights (tournament-long bonus questions) ---
  await prisma.outright.create({
    data: { key: "champion", question: "World Cup winner", type: "TEAM", points: 30, lockAt: at(48), sortOrder: 1 },
  });
  await prisma.outright.create({
    data: { key: "golden_boot", question: "Golden Boot (top scorer)", type: "TEXT", points: 20, lockAt: at(48), sortOrder: 2 },
  });
  const resolvedOutright = await prisma.outright.create({
    data: {
      key: "top_scoring_team",
      question: "Highest-scoring team (demo, resolved)",
      type: "TEAM",
      points: 10,
      lockAt: at(-1),
      correctAnswer: "France",
      sortOrder: 3,
    },
  });
  await prisma.outrightPrediction.createMany({
    data: [
      { userId: dev.id, outrightId: resolvedOutright.id, answer: "France" },
      { userId: rival.id, outrightId: resolvedOutright.id, answer: "Brazil" },
    ],
  });

  // Score the finished matches + resolved outright.
  await scoreMatch(finishedGroup.id);
  await scoreMatch(finishedKO.id);
  await scoreOutright(resolvedOutright.id);
}
