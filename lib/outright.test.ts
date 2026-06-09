import { describe, it, expect } from "vitest";
import {
  normalizeAnswer,
  scoreOutrightAnswer,
  isOutrightLocked,
} from "@/lib/outright";

describe("scoreOutrightAnswer", () => {
  it("awards full points on an exact match", () => {
    expect(scoreOutrightAnswer("Brazil", "Brazil", 30)).toBe(30);
  });

  it("is case- and whitespace-insensitive", () => {
    expect(scoreOutrightAnswer("Brazil", "  brazil ", 30)).toBe(30);
  });

  it("awards 0 for a wrong answer", () => {
    expect(scoreOutrightAnswer("Brazil", "Argentina", 30)).toBe(0);
  });

  it("awards 0 when unresolved or unanswered", () => {
    expect(scoreOutrightAnswer(null, "Brazil", 30)).toBe(0);
    expect(scoreOutrightAnswer("Brazil", null, 30)).toBe(0);
    expect(scoreOutrightAnswer("Brazil", "", 30)).toBe(0);
  });
});

describe("normalizeAnswer", () => {
  it("trims and lowercases", () => {
    expect(normalizeAnswer("  Harry KANE ")).toBe("harry kane");
  });
});

describe("isOutrightLocked", () => {
  const now = new Date("2026-06-11T12:00:00.000Z").getTime();
  it("is open before lockAt", () => {
    expect(isOutrightLocked(new Date(now + 3600_000), now)).toBe(false);
  });
  it("is locked at/after lockAt", () => {
    expect(isOutrightLocked(new Date(now), now)).toBe(true);
    expect(isOutrightLocked(new Date(now - 1000), now)).toBe(true);
  });
});
