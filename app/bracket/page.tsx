import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { toMatchView } from "@/lib/match-view";
import { roundOrder, roundPointsFor } from "@/lib/bracket";
import { AdvancementPick } from "@/components/advancement-pick";

export default async function BracketPage() {
  const user = await requireUser();

  const matches = await prisma.match.findMany({
    where: { stage: "KNOCKOUT" },
    orderBy: { kickoffTime: "asc" },
    include: { advancementPicks: { where: { userId: user.id } } },
  });

  // Group by round, ordered R32 -> Final.
  const rounds = new Map<string, typeof matches>();
  for (const m of matches) {
    const key = m.groupName ?? "Knockout";
    if (!rounds.has(key)) rounds.set(key, []);
    rounds.get(key)!.push(m);
  }
  const roundNames = [...rounds.keys()].sort(
    (a, b) => roundOrder(a) - roundOrder(b),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Bracket</h1>
        <p className="text-muted">
          Call who advances in every knockout tie. Later rounds are worth more.
        </p>
      </div>

      {roundNames.length === 0 && (
        <p className="text-sm text-muted">No knockout matches loaded yet.</p>
      )}

      {roundNames.map((name) => (
        <section key={name} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">
            {name}{" "}
            <span className="text-sm font-normal text-muted">
              · {roundPointsFor(name)} pts each
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rounds.get(name)!.map((m) => (
              <AdvancementPick
                key={m.id}
                match={toMatchView(m)}
                pick={
                  m.advancementPicks[0]
                    ? {
                        pickedSide: m.advancementPicks[0].pickedSide,
                        points: m.advancementPicks[0].points,
                      }
                    : null
                }
                roundPoints={roundPointsFor(m.groupName)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
