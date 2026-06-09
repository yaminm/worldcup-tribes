import { describe, it, expect } from "vitest";
import { computeStandings, type StandingMatch } from "@/lib/standings";

const F = (
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
): StandingMatch => ({ homeTeam, awayTeam, homeScore, awayScore, status: "FINISHED" });

describe("computeStandings", () => {
  it("lists all teams even with no finished matches", () => {
    const rows = computeStandings([
      { homeTeam: "A", awayTeam: "B", homeScore: null, awayScore: null, status: "SCHEDULED" },
      { homeTeam: "C", awayTeam: "D", homeScore: null, awayScore: null, status: "SCHEDULED" },
    ]);
    expect(rows.map((r) => r.team).sort()).toEqual(["A", "B", "C", "D"]);
    expect(rows.every((r) => r.played === 0 && r.points === 0)).toBe(true);
  });

  it("awards 3 for a win and 1 each for a draw", () => {
    const rows = computeStandings([F("A", "B", 2, 0), F("C", "D", 1, 1)]);
    const byTeam = Object.fromEntries(rows.map((r) => [r.team, r]));
    expect(byTeam.A.points).toBe(3);
    expect(byTeam.A.won).toBe(1);
    expect(byTeam.B.points).toBe(0);
    expect(byTeam.B.lost).toBe(1);
    expect(byTeam.C.points).toBe(1);
    expect(byTeam.D.points).toBe(1);
  });

  it("accumulates goals and computes goal difference", () => {
    const rows = computeStandings([F("A", "B", 3, 1), F("A", "C", 2, 2)]);
    const a = rows.find((r) => r.team === "A")!;
    expect(a.played).toBe(2);
    expect(a.gf).toBe(5);
    expect(a.ga).toBe(3);
    expect(a.gd).toBe(2);
    expect(a.points).toBe(4); // win + draw
  });

  it("orders by points, then goal difference, then goals for", () => {
    // A: 3 pts (+3). B: 3 pts (+1). Both won once.
    const rows = computeStandings([
      F("A", "X", 3, 0),
      F("B", "Y", 1, 0),
      F("X", "Y", 0, 0),
    ]);
    expect(rows[0].team).toBe("A"); // better GD
    expect(rows[1].team).toBe("B");
  });

  it("ignores non-finished matches for tallies", () => {
    const rows = computeStandings([
      F("A", "B", 1, 0),
      { homeTeam: "A", awayTeam: "C", homeScore: 5, awayScore: 0, status: "LIVE" },
    ]);
    const a = rows.find((r) => r.team === "A")!;
    expect(a.played).toBe(1);
    expect(a.gf).toBe(1);
  });
});
