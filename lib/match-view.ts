import { teamFlag } from "@/lib/teams";

export interface MatchView {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  groupName: string | null;
  kickoffTime: string; // ISO
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  stage: "GROUP" | "KNOCKOUT";
  homeScore: number | null;
  awayScore: number | null;
  advancingSide: "HOME" | "AWAY" | null;
  teamsKnown: boolean;
}

export interface PredictionView {
  homePredictedScore: number;
  awayPredictedScore: number;
  points: number | null;
  isExact: boolean;
}

interface MatchLike {
  id: string;
  homeTeam: string;
  awayTeam: string;
  groupName: string | null;
  kickoffTime: Date;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  stage: "GROUP" | "KNOCKOUT";
  homeScore: number | null;
  awayScore: number | null;
  advancingSide: "HOME" | "AWAY" | null;
  teamsKnown: boolean;
}

export function toMatchView(m: MatchLike): MatchView {
  return {
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeFlag: teamFlag(m.homeTeam),
    awayFlag: teamFlag(m.awayTeam),
    groupName: m.groupName,
    kickoffTime: m.kickoffTime.toISOString(),
    status: m.status,
    stage: m.stage,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    advancingSide: m.advancingSide,
    teamsKnown: m.teamsKnown,
  };
}

interface PredictionLike {
  homePredictedScore: number;
  awayPredictedScore: number;
  points: number | null;
  isExact: boolean;
}

export function toPredictionView(p: PredictionLike | null): PredictionView | null {
  if (!p) return null;
  return {
    homePredictedScore: p.homePredictedScore,
    awayPredictedScore: p.awayPredictedScore,
    points: p.points,
    isExact: p.isExact,
  };
}
