import { teamFlag } from "@/lib/teams";

export interface StandingRow {
  team: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface StandingMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
}

/**
 * Computes a group table from its matches. Every team that appears in the
 * matches is listed (so a group shows all teams even before kickoff). Only
 * FINISHED matches with both scores count. Win=3, Draw=1, Loss=0.
 *
 * Sort: points DESC, goal difference DESC, goals for DESC, name ASC.
 */
export function computeStandings(matches: StandingMatch[]): StandingRow[] {
  const table = new Map<string, StandingRow>();

  const ensure = (team: string): StandingRow => {
    let row = table.get(team);
    if (!row) {
      row = {
        team,
        flag: teamFlag(team),
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      };
      table.set(team, row);
    }
    return row;
  };

  for (const m of matches) {
    ensure(m.homeTeam);
    ensure(m.awayTeam);

    if (m.status !== "FINISHED" || m.homeScore === null || m.awayScore === null) {
      continue;
    }

    const home = ensure(m.homeTeam);
    const away = ensure(m.awayTeam);

    home.played++;
    away.played++;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (m.homeScore < m.awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of table.values()) row.gd = row.gf - row.ga;

  return [...table.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.team.localeCompare(b.team),
  );
}
