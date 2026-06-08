import { MatchPrediction } from "@/components/match-prediction";
import { toMatchView, toPredictionView } from "@/lib/match-view";

interface PredictionLike {
  homePredictedScore: number;
  awayPredictedScore: number;
  points: number | null;
  isExact: boolean;
}

interface MatchWithPrediction {
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
  predictions: PredictionLike[];
}

export function MatchList({ matches }: { matches: MatchWithPrediction[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {matches.map((m) => (
        <MatchPrediction
          key={m.id}
          match={toMatchView(m)}
          prediction={toPredictionView(m.predictions[0] ?? null)}
        />
      ))}
    </div>
  );
}
