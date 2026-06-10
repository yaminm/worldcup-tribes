import { prisma } from "@/lib/db";
import { requireSuperadmin } from "@/lib/session";
import { toMatchView } from "@/lib/match-view";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  SyncControls,
  AdminResultForm,
  AdminOutrightForm,
  SimulatorControls,
} from "@/components/admin-controls";

export default async function AdminPage() {
  await requireSuperadmin();

  const [matches, outrights] = await Promise.all([
    prisma.match.findMany({ orderBy: { kickoffTime: "asc" } }),
    prisma.outright.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const provider = process.env.FOOTBALL_DATA_API_TOKEN
    ? "football-data.org"
    : "openfootball";
  const simulatorEnabled = process.env.ENABLE_SIMULATOR === "true";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Admin</h1>
        <p className="text-muted">Match data source: {provider}</p>
      </div>

      {simulatorEnabled && (
        <Card className="flex flex-col gap-3 border-warning/40">
          <CardTitle>Simulator (testing only)</CardTitle>
          <CardDescription>
            Fast-forward the tournament to verify locking, results and scoring.
            &quot;Kick off&quot; sets matches LIVE now (locking predictions);
            &quot;Finish&quot; assigns random results and scores them. Run a Sync to
            reset back to the real schedule.
          </CardDescription>
          <SimulatorControls />
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <CardTitle>Sync &amp; scoring</CardTitle>
        <CardDescription>
          Pull the latest fixtures/results, then (re)score finished matches.
        </CardDescription>
        <SyncControls />
      </Card>

      <Card>
        <CardTitle className="mb-2">Match results ({matches.length})</CardTitle>
        <CardDescription>
          Manually set a result. Saving a FINISHED match scores it immediately.
        </CardDescription>
        <div className="mt-2 flex flex-col">
          {matches.map((m) => (
            <AdminResultForm key={m.id} match={toMatchView(m)} />
          ))}
          {matches.length === 0 && (
            <p className="py-4 text-sm text-muted">
              No matches yet — run a sync above.
            </p>
          )}
        </div>
      </Card>

      {outrights.length > 0 && (
        <Card>
          <CardTitle className="mb-2">Outright answers</CardTitle>
          <CardDescription>
            Set the correct answer to score an outright. Blank leaves it unresolved.
          </CardDescription>
          <div className="mt-2 flex flex-col">
            {outrights.map((o) => (
              <AdminOutrightForm
                key={o.id}
                outright={{
                  id: o.id,
                  question: o.question,
                  points: o.points,
                  correctAnswer: o.correctAnswer,
                }}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
