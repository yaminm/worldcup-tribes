import { describe, it, expect } from "vitest";
import { simulatedResult } from "@/lib/simulate";

// Deterministic RNG that yields a fixed sequence (looping).
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("simulatedResult", () => {
  it("produces scores in 0..3", () => {
    const r = simulatedResult("GROUP", seq([0, 0.99]));
    expect(r.homeScore).toBe(0);
    expect(r.awayScore).toBe(3);
    expect(r.advancingSide).toBeNull();
  });

  it("group matches never set an advancing side", () => {
    const r = simulatedResult("GROUP", seq([0.5, 0.1]));
    expect(r.advancingSide).toBeNull();
  });

  it("knockout winner follows the scoreline when decisive", () => {
    const r = simulatedResult("KNOCKOUT", seq([0.9, 0.1])); // 3-0
    expect(r.advancingSide).toBe("HOME");
  });

  it("knockout draw is decided by the RNG (penalties)", () => {
    // home=1, away=1 (rnd 0.4,0.4), then 0.2 < 0.5 => HOME advances
    const r = simulatedResult("KNOCKOUT", seq([0.4, 0.4, 0.2]));
    expect(r.homeScore).toBe(r.awayScore);
    expect(r.advancingSide).toBe("HOME");
  });
});
