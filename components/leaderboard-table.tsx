import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/leaderboard";

function medal(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

export function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">No members yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2/60 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Player</th>
            <th className="px-3 py-2 text-center font-medium">Picks</th>
            <th className="px-3 py-2 text-center font-medium">Exact</th>
            <th className="px-3 py-2 text-right font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isMe = row.userId === currentUserId;
            return (
              <tr
                key={row.userId}
                className={cn(
                  "border-t border-border/60",
                  isMe && "bg-accent/10",
                )}
              >
                <td className="px-3 py-2 text-center font-semibold">
                  {medal(row.rank)}
                </td>
                <td className="px-3 py-2 font-medium">
                  {row.name}
                  {isMe && <span className="ml-1 text-xs text-accent">you</span>}
                </td>
                <td className="px-3 py-2 text-center text-muted">
                  {row.predictions}
                </td>
                <td className="px-3 py-2 text-center text-muted">
                  {row.exactHits}
                </td>
                <td className="score-display px-3 py-2 text-right text-base">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
