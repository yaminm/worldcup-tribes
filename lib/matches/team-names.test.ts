import { describe, it, expect } from "vitest";
import { canonTeam, pairKey } from "@/lib/matches/team-names";

describe("canonTeam", () => {
  it("unifies cross-source name variants", () => {
    expect(canonTeam("USA")).toBe(canonTeam("United States"));
    expect(canonTeam("South Korea")).toBe(canonTeam("Korea Republic"));
    expect(canonTeam("Czech Republic")).toBe(canonTeam("Czechia"));
    expect(canonTeam("Ivory Coast")).toBe(canonTeam("Côte d'Ivoire"));
    expect(canonTeam("Bosnia & Herzegovina")).toBe(canonTeam("Bosnia and Herzegovina"));
    expect(canonTeam("Turkey")).toBe(canonTeam("Türkiye"));
  });

  it("leaves matching names equal and distinct names different", () => {
    expect(canonTeam("Brazil")).toBe(canonTeam("brazil"));
    expect(canonTeam("Brazil")).not.toBe(canonTeam("Argentina"));
  });
});

describe("pairKey", () => {
  it("is order-independent and cross-source stable", () => {
    expect(pairKey("Mexico", "South Korea")).toBe(pairKey("Korea Republic", "Mexico"));
  });
});
