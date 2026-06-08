import { describe, it, expect } from "vitest";
import {
  isPlaceholderTeam,
  parseKickoff,
  normalizeOpenfootballMatch,
} from "@/lib/matches/provider";

describe("parseKickoff", () => {
  it("converts a local time with UTC offset to UTC", () => {
    // 13:00 at UTC-6 => 19:00 UTC
    expect(parseKickoff("2026-06-11", "13:00 UTC-6").toISOString()).toBe(
      "2026-06-11T19:00:00.000Z",
    );
  });

  it("handles a different offset", () => {
    // 12:00 at UTC-4 => 16:00 UTC
    expect(parseKickoff("2026-06-18", "12:00 UTC-4").toISOString()).toBe(
      "2026-06-18T16:00:00.000Z",
    );
  });

  it("rolls over to the next day when needed", () => {
    // 20:00 at UTC-6 => 02:00 UTC next day
    expect(parseKickoff("2026-06-11", "20:00 UTC-6").toISOString()).toBe(
      "2026-06-12T02:00:00.000Z",
    );
  });

  it("falls back to noon UTC without a time", () => {
    expect(parseKickoff("2026-07-19").toISOString()).toBe(
      "2026-07-19T12:00:00.000Z",
    );
  });
});

describe("isPlaceholderTeam", () => {
  it("detects knockout slot placeholders", () => {
    expect(isPlaceholderTeam("2A")).toBe(true);
    expect(isPlaceholderTeam("1C")).toBe(true);
    expect(isPlaceholderTeam("W73")).toBe(true);
    expect(isPlaceholderTeam("L75")).toBe(true);
    expect(isPlaceholderTeam("RU-A")).toBe(true);
  });

  it("treats real country names as known (incl. W-starting names)", () => {
    expect(isPlaceholderTeam("Mexico")).toBe(false);
    expect(isPlaceholderTeam("Wales")).toBe(false);
    expect(isPlaceholderTeam("South Korea")).toBe(false);
  });
});

describe("normalizeOpenfootballMatch", () => {
  it("maps a group match with real teams", () => {
    const n = normalizeOpenfootballMatch({
      round: "Matchday 1",
      date: "2026-06-11",
      time: "13:00 UTC-6",
      team1: "Mexico",
      team2: "South Africa",
      group: "Group A",
    });
    expect(n.stage).toBe("GROUP");
    expect(n.teamsKnown).toBe(true);
    expect(n.status).toBe("SCHEDULED");
    expect(n.groupName).toBe("Group A");
  });

  it("maps a knockout placeholder fixture as not-yet-known", () => {
    const n = normalizeOpenfootballMatch({
      round: "Round of 32",
      num: 73,
      date: "2026-06-28",
      time: "12:00 UTC-7",
      team1: "2A",
      team2: "2B",
    });
    expect(n.stage).toBe("KNOCKOUT");
    expect(n.teamsKnown).toBe(false);
    expect(n.externalId).toBe("of-73");
    expect(n.groupName).toBe("Round of 32");
  });

  it("maps a finished match score", () => {
    const n = normalizeOpenfootballMatch({
      round: "Matchday 1",
      date: "2026-06-11",
      time: "13:00 UTC-6",
      team1: "Mexico",
      team2: "South Africa",
      group: "Group A",
      score: { ft: [2, 1] },
    });
    expect(n.status).toBe("FINISHED");
    expect(n.homeScore).toBe(2);
    expect(n.awayScore).toBe(1);
  });
});
