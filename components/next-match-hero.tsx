import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { KickoffCountdown } from "@/components/kickoff-countdown";
import { LocalKickoff } from "@/components/local-kickoff";
import type { MatchView, PredictionView } from "@/lib/match-view";

export function NextMatchHero({
  match,
  prediction,
}: {
  match: MatchView;
  prediction: PredictionView | null;
}) {
  const showScore = match.status === "LIVE" || match.status === "FINISHED";

  return (
    <Card className="relative overflow-hidden border-accent/30">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(600px 200px at 50% -20%, rgba(198,255,58,0.12), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs">
          <Badge variant={match.status === "LIVE" ? "live" : "accent"}>
            {match.status === "LIVE" ? "LIVE" : "Next match"}
          </Badge>
          <span className="text-muted">
            {match.groupName}
            {match.stage === "KNOCKOUT" ? " · KO ×1.5" : ""}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-5xl">{match.homeFlag}</span>
            <span className="font-bold">{match.homeTeam}</span>
          </div>

          <div className="flex flex-col items-center px-2">
            {showScore ? (
              <span className="score-display text-4xl">
                {match.homeScore ?? 0}
                <span className="mx-1 text-muted">:</span>
                {match.awayScore ?? 0}
              </span>
            ) : (
              <span className="score-display text-2xl text-muted">vs</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-5xl">{match.awayFlag}</span>
            <span className="font-bold">{match.awayTeam}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-center text-sm">
          <KickoffCountdown kickoffTime={match.kickoffTime} status={match.status} />
          <span className="text-xs text-muted">
            <LocalKickoff iso={match.kickoffTime} mode="date" />
            {" · "}
            <LocalKickoff iso={match.kickoffTime} mode="time" />
          </span>
          {(match.venue || match.city) && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3 w-3" />
              {match.venue ? `${match.venue}, ` : ""}
              {match.city}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {prediction ? (
            <span className="text-sm text-muted">
              Your pick:{" "}
              <span className="font-semibold text-foreground">
                {prediction.homePredictedScore}–{prediction.awayPredictedScore}
              </span>
              {prediction.joker ? " · 2× joker" : ""}
            </span>
          ) : null}
          <Link href="/predict" className={buttonVariants({ size: "sm" })}>
            {prediction ? "Update pick" : "Predict now"}
          </Link>
        </div>
      </div>
    </Card>
  );
}
