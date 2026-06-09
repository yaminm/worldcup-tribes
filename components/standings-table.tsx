import { cn } from "@/lib/utils";
import type { StandingRow } from "@/lib/standings";

export function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2/60 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Team</th>
            <th className="px-2 py-2 text-center font-medium" title="Played">P</th>
            <th className="px-2 py-2 text-center font-medium" title="Won">W</th>
            <th className="px-2 py-2 text-center font-medium" title="Drawn">D</th>
            <th className="px-2 py-2 text-center font-medium" title="Lost">L</th>
            <th className="px-2 py-2 text-center font-medium" title="Goal difference">GD</th>
            <th className="px-2 py-2 text-center font-medium" title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.team}
              className={cn(
                "border-t border-border/60",
                i < 2 && "bg-accent/5", // top 2 advance
              )}
            >
              <td className="px-3 py-2 text-center text-muted">{i + 1}</td>
              <td className="px-3 py-2 font-medium">
                <span className="mr-2">{row.flag}</span>
                {row.team}
              </td>
              <td className="px-2 py-2 text-center text-muted">{row.played}</td>
              <td className="px-2 py-2 text-center text-muted">{row.won}</td>
              <td className="px-2 py-2 text-center text-muted">{row.drawn}</td>
              <td className="px-2 py-2 text-center text-muted">{row.lost}</td>
              <td className="px-2 py-2 text-center text-muted">
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </td>
              <td className="score-display px-2 py-2 text-center font-bold">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
