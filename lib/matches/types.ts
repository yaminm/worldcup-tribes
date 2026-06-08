export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";
export type Stage = "GROUP" | "KNOCKOUT";
export type Side = "HOME" | "AWAY";

/**
 * Provider-agnostic match shape. Every provider normalizes into this so the
 * sync layer never depends on a specific upstream API.
 */
export interface NormalizedMatch {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string | null;
  awayCrest?: string | null;
  groupName?: string | null;
  kickoffTime: string; // ISO 8601
  status: MatchStatus;
  stage: Stage;
  homeScore?: number | null;
  awayScore?: number | null;
  advancingSide?: Side | null;
  teamsKnown: boolean;
}

export interface MatchProvider {
  readonly name: string;
  getMatches(): Promise<NormalizedMatch[]>;
}
