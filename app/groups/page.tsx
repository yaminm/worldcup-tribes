import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeStandings } from "@/lib/standings";
import { teamFlag } from "@/lib/teams";
import { Card, CardTitle } from "@/components/ui/card";
import { StandingsTable } from "@/components/standings-table";
import { LocalKickoff } from "@/components/local-kickoff";
import { GroupPredictForm } from "@/components/group-predict-form";

export default async function GroupsPage() {
  const user = await requireUser();

  const [matches, myGroupPreds] = await Promise.all([
    prisma.match.findMany({
      where: { stage: "GROUP" },
      orderBy: { kickoffTime: "asc" },
    }),
    prisma.groupPrediction.findMany({ where: { userId: user.id } }),
  ]);
  const predByGroup = new Map(myGroupPreds.map((p) => [p.groupName, p]));

  // Group by groupName.
  const groups = new Map<string, typeof matches>();
  for (const m of matches) {
    const key = m.groupName ?? "Group";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  const groupNames = [...groups.keys()].sort();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Groups</h1>
        <p className="text-muted">
          Live standings update as results come in. Top two advance (highlighted).
        </p>
      </div>

      {groupNames.length === 0 && (
        <p className="text-sm text-muted">No group matches loaded yet.</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {groupNames.map((name) => {
          const groupMatches = groups.get(name)!;
          const rows = computeStandings(
            groupMatches.map((m) => ({
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              status: m.status,
            })),
          );

          const groupTeams = [
            ...new Set(groupMatches.flatMap((m) => [m.homeTeam, m.awayTeam])),
          ];
          const myPred = predByGroup.get(name);

          return (
            <Card key={name} className="flex flex-col gap-3" data-testid={`group-${name}`}>
              <CardTitle>{name}</CardTitle>
              <StandingsTable rows={rows} />

              <GroupPredictForm
                group={{
                  groupName: name,
                  teams: groupTeams,
                  firstKickoff: groupMatches[0].kickoffTime.toISOString(),
                  order: myPred?.order ?? null,
                  points: myPred?.points ?? null,
                }}
              />

              <div className="mt-1 flex flex-col gap-1">
                {groupMatches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2/40"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{teamFlag(m.homeTeam)}</span>
                      <span className="truncate">{m.homeTeam}</span>
                      <span className="text-muted">v</span>
                      <span className="truncate">{m.awayTeam}</span>
                      <span>{teamFlag(m.awayTeam)}</span>
                    </span>
                    {m.status === "FINISHED" ? (
                      <span className="score-display shrink-0 font-semibold">
                        {m.homeScore}–{m.awayScore}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-muted">
                        <LocalKickoff iso={m.kickoffTime.toISOString()} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
