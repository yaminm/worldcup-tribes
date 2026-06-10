import { describe, it, expect } from "vitest";
import { RULES, buildLlmsTxt, LOCK_MINUTES } from "@/lib/rules";
import { POINTS } from "@/lib/scoring";

describe("rules content", () => {
  it("derives the lock window in minutes", () => {
    expect(LOCK_MINUTES).toBe(5);
  });

  it("reflects the real scoring constants", () => {
    const match = RULES.find((r) => r.id === "match-predictions")!;
    expect(match.items.some((i) => i.includes(`${POINTS.EXACT} pts`))).toBe(true);
  });

  it("builds an llms.txt with the key sections and pages", () => {
    const txt = buildLlmsTxt("https://example.com");
    expect(txt).toContain("# Tribes");
    expect(txt).toContain("Scoring & rules");
    expect(txt).toContain(`Exact score — ${POINTS.EXACT} pts`);
    expect(txt).toContain("https://example.com/predict");
    expect(txt).toContain("https://example.com/how-it-works");
  });
});
