import { describe, it, expect } from "vitest";
import {
  isLocked,
  isPredictable,
  msUntilLock,
  LOCK_WINDOW_MS,
} from "@/lib/locking";

const NOW = new Date("2026-06-11T12:00:00.000Z").getTime();

describe("isLocked", () => {
  it("is open well before kickoff", () => {
    const kickoff = new Date(NOW + 60 * 60 * 1000); // 1h away
    expect(isLocked({ kickoffTime: kickoff }, NOW)).toBe(false);
  });

  it("locks exactly at the 5-minute window", () => {
    const kickoff = new Date(NOW + LOCK_WINDOW_MS);
    expect(isLocked({ kickoffTime: kickoff }, NOW)).toBe(true);
  });

  it("is locked just inside the window", () => {
    const kickoff = new Date(NOW + LOCK_WINDOW_MS - 1000); // 4m59s away
    expect(isLocked({ kickoffTime: kickoff }, NOW)).toBe(true);
  });

  it("is locked after kickoff", () => {
    const kickoff = new Date(NOW - 1000);
    expect(isLocked({ kickoffTime: kickoff }, NOW)).toBe(true);
  });

  it("accepts ISO strings", () => {
    const kickoff = new Date(NOW + 60 * 60 * 1000).toISOString();
    expect(isLocked({ kickoffTime: kickoff }, NOW)).toBe(false);
  });
});

describe("isPredictable", () => {
  const future = new Date(NOW + 60 * 60 * 1000);

  it("true when teams known and not locked", () => {
    expect(isPredictable({ kickoffTime: future, teamsKnown: true }, NOW)).toBe(true);
  });

  it("false when teams unknown (TBD)", () => {
    expect(isPredictable({ kickoffTime: future, teamsKnown: false }, NOW)).toBe(false);
  });

  it("false when locked even if teams known", () => {
    const soon = new Date(NOW + 60 * 1000); // 1 min away
    expect(isPredictable({ kickoffTime: soon, teamsKnown: true }, NOW)).toBe(false);
  });
});

describe("msUntilLock", () => {
  it("returns remaining time before lock", () => {
    const kickoff = new Date(NOW + 60 * 60 * 1000);
    expect(msUntilLock({ kickoffTime: kickoff }, NOW)).toBe(
      60 * 60 * 1000 - LOCK_WINDOW_MS,
    );
  });

  it("clamps to zero once locked", () => {
    const kickoff = new Date(NOW + 60 * 1000);
    expect(msUntilLock({ kickoffTime: kickoff }, NOW)).toBe(0);
  });
});
