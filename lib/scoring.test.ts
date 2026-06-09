import { describe, it, expect } from "vitest";
import { basePoints, outcomeOf, scorePrediction } from "@/lib/scoring";

describe("outcomeOf", () => {
  it("classifies results", () => {
    expect(outcomeOf(2, 1)).toBe("HOME");
    expect(outcomeOf(1, 2)).toBe("AWAY");
    expect(outcomeOf(1, 1)).toBe("DRAW");
  });
});

describe("basePoints (PRD examples)", () => {
  it("exact match => 10", () => {
    expect(basePoints(2, 1, 2, 1)).toBe(10);
  });

  it("correct outcome + goal difference => 6", () => {
    // Pred 2-0, Actual 3-1: both home win, GD 2 == 2
    expect(basePoints(2, 0, 3, 1)).toBe(6);
  });

  it("correct outcome only => 4", () => {
    // Pred 1-0, Actual 3-1: both home win, GD differs
    expect(basePoints(1, 0, 3, 1)).toBe(4);
  });

  it("wrong outcome => 0", () => {
    expect(basePoints(0, 1, 3, 1)).toBe(0);
  });

  it("exact draw => 10", () => {
    expect(basePoints(1, 1, 1, 1)).toBe(10);
  });

  it("correct draw outcome with same GD => 6", () => {
    // Pred 0-0, Actual 1-1: both draw, GD 0 == 0
    expect(basePoints(0, 0, 1, 1)).toBe(6);
  });
});

describe("basePoints knockout split rule (penalties)", () => {
  // Actual 1-1, HOME advanced on penalties.
  it("predicting the right winner (non-draw) scores the outcome tier (4)", () => {
    expect(basePoints(2, 1, 1, 1, "HOME")).toBe(4);
  });

  it("predicting the wrong winner scores 0 even though scoreline was a draw", () => {
    expect(basePoints(1, 2, 1, 1, "HOME")).toBe(0);
  });

  it("predicting the exact scoreline still scores exact (10)", () => {
    expect(basePoints(1, 1, 1, 1, "HOME")).toBe(10);
  });

  it("predicting a different draw scoreline scores the GD tier (6)", () => {
    // Pred 0-0 vs actual 1-1 draw: scoreline tiers use the scoreline.
    expect(basePoints(0, 0, 1, 1, "HOME")).toBe(6);
  });
});

describe("scorePrediction (multiplier + isExact)", () => {
  it("group exact => 10 pts, exact flagged", () => {
    expect(
      scorePrediction(
        { stage: "GROUP", homeScore: 2, awayScore: 1 },
        { homePredictedScore: 2, awayPredictedScore: 1 },
      ),
    ).toEqual({ points: 10, isExact: true });
  });

  it("knockout exact => 15 pts (10 * 1.5)", () => {
    expect(
      scorePrediction(
        { stage: "KNOCKOUT", homeScore: 2, awayScore: 1 },
        { homePredictedScore: 2, awayPredictedScore: 1 },
      ),
    ).toEqual({ points: 15, isExact: true });
  });

  it("knockout correct outcome via penalties => 6 pts (4 * 1.5)", () => {
    expect(
      scorePrediction(
        { stage: "KNOCKOUT", homeScore: 1, awayScore: 1, advancingSide: "HOME" },
        { homePredictedScore: 2, awayPredictedScore: 1 },
      ),
    ).toEqual({ points: 6, isExact: false });
  });

  it("knockout goal-difference => 9 pts (6 * 1.5)", () => {
    expect(
      scorePrediction(
        { stage: "KNOCKOUT", homeScore: 3, awayScore: 1 },
        { homePredictedScore: 2, awayPredictedScore: 0 },
      ),
    ).toEqual({ points: 9, isExact: false });
  });

  it("wrong outcome => 0 pts", () => {
    expect(
      scorePrediction(
        { stage: "GROUP", homeScore: 3, awayScore: 1 },
        { homePredictedScore: 0, awayPredictedScore: 2 },
      ),
    ).toEqual({ points: 0, isExact: false });
  });

  it("joker doubles a group exact => 20 pts", () => {
    expect(
      scorePrediction(
        { stage: "GROUP", homeScore: 2, awayScore: 1 },
        { homePredictedScore: 2, awayPredictedScore: 1, joker: true },
      ),
    ).toEqual({ points: 20, isExact: true });
  });

  it("joker stacks with knockout multiplier => 30 pts (10 * 1.5 * 2)", () => {
    expect(
      scorePrediction(
        { stage: "KNOCKOUT", homeScore: 2, awayScore: 1 },
        { homePredictedScore: 2, awayPredictedScore: 1, joker: true },
      ),
    ).toEqual({ points: 30, isExact: true });
  });

  it("joker doubles a 0-point miss to still 0", () => {
    expect(
      scorePrediction(
        { stage: "GROUP", homeScore: 3, awayScore: 1 },
        { homePredictedScore: 0, awayPredictedScore: 2, joker: true },
      ),
    ).toEqual({ points: 0, isExact: false });
  });
});
