import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { OutrightForm } from "@/components/outright-form";

export default async function OutrightsPage() {
  const user = await requireUser();

  const [outrights, myPreds, groupMatches] = await Promise.all([
    prisma.outright.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.outrightPrediction.findMany({ where: { userId: user.id } }),
    prisma.match.findMany({
      where: { stage: "GROUP", teamsKnown: true },
      select: { homeTeam: true, awayTeam: true },
    }),
  ]);

  const byOutright = new Map(myPreds.map((p) => [p.outrightId, p]));
  const teams = [
    ...new Set(groupMatches.flatMap((m) => [m.homeTeam, m.awayTeam])),
  ].sort();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Outrights</h1>
        <p className="text-muted">
          Big-picture calls for the whole tournament. Lock them in before kickoff.
        </p>
      </div>

      {outrights.length === 0 ? (
        <p className="text-sm text-muted">No outright questions have been set up yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {outrights.map((o) => {
            const pred = byOutright.get(o.id) ?? null;
            return (
              <OutrightForm
                key={o.id}
                outright={{
                  id: o.id,
                  question: o.question,
                  type: o.type,
                  points: o.points,
                  lockAt: o.lockAt.toISOString(),
                  correctAnswer: o.correctAnswer,
                }}
                prediction={
                  pred ? { answer: pred.answer, points: pred.points } : null
                }
                teams={teams}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
