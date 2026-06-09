import { requireUser } from "@/lib/session";
import { getGlobalLeaderboard } from "@/lib/leaderboard";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard-table";

export default async function GlobalLeaderboardPage() {
  const user = await requireUser();
  const rows = await getGlobalLeaderboard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Global leaderboard</h1>
        <p className="text-muted">
          Every Tribes player, ranked by total points across all predictions.
        </p>
      </div>

      <Card>
        <CardTitle className="mb-1">Everyone</CardTitle>
        <CardDescription className="mb-3">
          {rows.length} player{rows.length === 1 ? "" : "s"} competing
        </CardDescription>
        <LeaderboardTable rows={rows} currentUserId={user.id} />
      </Card>
    </div>
  );
}
