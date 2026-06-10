import { describe, it, expect } from "vitest";
import {
  scoreGroupOrder,
  isGroupLocked,
  isValidOrder,
} from "@/lib/group-predict";

describe("scoreGroupOrder", () => {
  const actual = ["A", "B", "C", "D"];

  it("awards 5 per correct position (perfect = 20)", () => {
    expect(scoreGroupOrder(["A", "B", "C", "D"], actual)).toBe(20);
  });

  it("scores partial correctness", () => {
    // A and C correct (positions 0 and 2), B/D swapped
    expect(scoreGroupOrder(["A", "D", "C", "B"], actual)).toBe(10);
  });

  it("awards 0 when nothing matches", () => {
    expect(scoreGroupOrder(["D", "C", "B", "A"], actual)).toBe(0);
  });
});

describe("isGroupLocked", () => {
  const now = Date.UTC(2026, 5, 11, 12, 0, 0);
  it("open before first kickoff", () => {
    expect(isGroupLocked(new Date(now + 3600_000), now)).toBe(false);
  });
  it("locked at/after first kickoff", () => {
    expect(isGroupLocked(new Date(now), now)).toBe(true);
  });
});

describe("isValidOrder", () => {
  const teams = ["A", "B", "C", "D"];
  it("accepts a complete distinct ordering", () => {
    expect(isValidOrder(["B", "A", "D", "C"], teams)).toBe(true);
  });
  it("rejects duplicates", () => {
    expect(isValidOrder(["A", "A", "C", "D"], teams)).toBe(false);
  });
  it("rejects wrong length", () => {
    expect(isValidOrder(["A", "B", "C"], teams)).toBe(false);
  });
});
