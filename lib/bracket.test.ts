import { describe, it, expect } from "vitest";
import {
  scoreAdvancement,
  roundPointsFor,
  roundOrder,
  ROUND_POINTS,
} from "@/lib/bracket";

describe("roundPointsFor", () => {
  it("returns the configured round points", () => {
    expect(roundPointsFor("Round of 16")).toBe(8);
    expect(roundPointsFor("Final")).toBe(25);
  });
  it("falls back to 5 for unknown rounds", () => {
    expect(roundPointsFor("Mystery")).toBe(5);
    expect(roundPointsFor(null)).toBe(5);
  });
});

describe("roundOrder", () => {
  it("orders rounds R32 -> Final", () => {
    expect(roundOrder("Round of 32")).toBeLessThan(roundOrder("Final"));
    expect(roundOrder("Quarter-final")).toBeLessThan(roundOrder("Semi-final"));
  });
});

describe("scoreAdvancement", () => {
  it("awards round points when the picked side advanced", () => {
    expect(scoreAdvancement("HOME", "HOME", ROUND_POINTS["Final"])).toBe(25);
  });
  it("awards 0 for the wrong side", () => {
    expect(scoreAdvancement("HOME", "AWAY", 8)).toBe(0);
  });
  it("awards 0 when unresolved or unpicked", () => {
    expect(scoreAdvancement(null, "HOME", 8)).toBe(0);
    expect(scoreAdvancement("HOME", null, 8)).toBe(0);
  });
});
