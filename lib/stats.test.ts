import { describe, it, expect } from "vitest";
import { computeProfileStats, type ProfileStatInput } from "@/lib/stats";

const P = (
  points: number | null,
  isExact = false,
  stage: "GROUP" | "KNOCKOUT" = "GROUP",
  joker = false,
): ProfileStatInput => ({ points, isExact, stage, joker });

describe("computeProfileStats", () => {
  it("handles an empty history", () => {
    const s = computeProfileStats([]);
    expect(s).toMatchObject({
      totalPoints: 0,
      predictionsMade: 0,
      scored: 0,
      accuracy: 0,
      avgPoints: 0,
    });
  });

  it("counts only scored (non-null) predictions for accuracy/avg", () => {
    const s = computeProfileStats([
      P(10, true), // scored, correct
      P(0), // scored, wrong
      P(null), // unscored (future match)
    ]);
    expect(s.predictionsMade).toBe(3);
    expect(s.scored).toBe(2);
    expect(s.correctOutcomes).toBe(1);
    expect(s.exactHits).toBe(1);
    expect(s.accuracy).toBe(50);
    expect(s.matchPoints).toBe(10);
    expect(s.avgPoints).toBe(5);
  });

  it("splits group vs knockout points and adds outrights", () => {
    const s = computeProfileStats(
      [P(20, true, "GROUP", true), P(6, false, "KNOCKOUT")],
      10,
    );
    expect(s.groupPoints).toBe(20);
    expect(s.knockoutPoints).toBe(6);
    expect(s.matchPoints).toBe(26);
    expect(s.outrightPoints).toBe(10);
    expect(s.totalPoints).toBe(36);
    expect(s.jokersUsed).toBe(1);
  });
});
