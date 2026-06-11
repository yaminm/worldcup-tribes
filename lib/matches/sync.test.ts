import { describe, it, expect } from "vitest";
import { resolveResult, type ResultFields } from "@/lib/matches/sync";

const finished = (h: number, a: number, adv: "HOME" | "AWAY" | null = null): ResultFields => ({
  status: "FINISHED",
  homeScore: h,
  awayScore: a,
  advancingSide: adv,
});
const scheduled: ResultFields = {
  status: "SCHEDULED",
  homeScore: null,
  awayScore: null,
  advancingSide: null,
};

describe("resolveResult (sync never clobbers a real result)", () => {
  it("keeps an existing finished result when the provider has no result yet", () => {
    expect(resolveResult(finished(2, 0), scheduled)).toEqual(finished(2, 0));
  });

  it("lets the provider correct a finished result", () => {
    expect(resolveResult(finished(2, 0), finished(2, 1))).toEqual(finished(2, 1));
  });

  it("applies the provider when nothing is stored yet", () => {
    expect(resolveResult(null, scheduled)).toEqual(scheduled);
    expect(resolveResult(null, finished(1, 1))).toEqual(finished(1, 1));
  });

  it("applies provider progression (LIVE) when no existing result", () => {
    const live: ResultFields = { status: "LIVE", homeScore: 1, awayScore: 0, advancingSide: null };
    expect(resolveResult(scheduled, live)).toEqual(live);
  });

  it("does not let a LIVE provider overwrite a finished result", () => {
    const live: ResultFields = { status: "LIVE", homeScore: 0, awayScore: 0, advancingSide: null };
    expect(resolveResult(finished(2, 0), live)).toEqual(finished(2, 0));
  });
});
