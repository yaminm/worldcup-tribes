import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { MatchList } from "@/components/match-list";
import { jokersRemaining } from "@/lib/joker";
import { Badge } from "@/components/ui/badge";
import { LazyOzButton } from "@/components/lazy-oz-button";

export default async function PredictPage() {
  const user = await requireUser();

  const [matches, groupJokers, koJokers] = await Promise.all([
    prisma.match.findMany({
      orderBy: { kickoffTime: "asc" },
      include: { predictions: { where: { userId: user.id } } },
    }),
    prisma.prediction.count({
      where: { userId: user.id, joker: true, match: { stage: "GROUP" } },
    }),
    prisma.prediction.count({
      where: { userId: user.id, joker: true, match: { stage: "KNOCKOUT" } },
    }),
  ]);

  const upcoming = matches.filter((m) => m.status !== "FINISHED");
  const finished = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => b.kickoffTime.getTime() - a.kickoffTime.getTime());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Matches</h1>
          <p className="text-muted">
            Lock in a scoreline up to 5 minutes before kickoff.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Jokers left</span>
            <Badge variant="accent">Group {jokersRemaining("GROUP", groupJokers)}</Badge>
            <Badge variant="accent">KO {jokersRemaining("KNOCKOUT", koJokers)}</Badge>
          </div>
          <LazyOzButton />
        </div>
      </div>

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Upcoming &amp; live</h2>
          <MatchList matches={upcoming} />
        </section>
      )}

      {finished.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Results</h2>
          <MatchList matches={finished} />
        </section>
      )}

      {matches.length === 0 && (
        <p className="text-sm text-muted">
          No matches loaded yet. An admin can sync fixtures from the admin page.
        </p>
      )}
    </div>
  );
}
