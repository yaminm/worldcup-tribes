import { describe, it, expect } from "vitest";
import { teamRating, predictScoreline } from "@/lib/strength";

describe("teamRating", () => {
  it("returns known ratings and a default for unknown teams", () => {
    expect(teamRating("Brazil")).toBeGreaterThan(80);
    expect(teamRating("Nowhere FC")).toBe(65);
  });
});

describe("predictScoreline", () => {
  it("predicts a draw for evenly matched teams", () => {
    expect(predictScoreline(75, 75)).toEqual([1, 1]);
  });

  it("favours the stronger home side", () => {
    const [h, a] = predictScoreline(92, 60);
    expect(h).toBeGreaterThan(a);
  });

  it("favours the stronger away side", () => {
    const [h, a] = predictScoreline(60, 92);
    expect(a).toBeGreaterThan(h);
  });

  it("widens the margin for bigger rating gaps", () => {
    const close = predictScoreline(80, 72); // diff 8
    const blowout = predictScoreline(92, 58); // diff 34
    expect(blowout[0] - blowout[1]).toBeGreaterThan(close[0] - close[1]);
  });
});
