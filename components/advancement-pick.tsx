"use client";

import { useActionState } from "react";
import { Lock, Check, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitAdvancement, type PredictionState } from "@/app/actions/predictions";
import { isLocked } from "@/lib/locking";
import type { MatchView } from "@/lib/match-view";

export interface AdvancementPickView {
  pickedSide: "HOME" | "AWAY";
  points: number | null;
}

export function AdvancementPick({
  match,
  pick,
  roundPoints,
}: {
  match: MatchView;
  pick: AdvancementPickView | null;
  roundPoints: number;
}) {
  const [state, action, pending] = useActionState<PredictionState, FormData>(
    submitAdvancement,
    {},
  );

  const finished = match.status === "FINISHED";
  const locked = !match.teamsKnown || isLocked({ kickoffTime: match.kickoffTime });
  const advanced =
    match.advancingSide === "HOME"
      ? match.homeTeam
      : match.advancingSide === "AWAY"
        ? match.awayTeam
        : null;
  const pickedTeam =
    pick?.pickedSide === "HOME"
      ? match.homeTeam
      : pick?.pickedSide === "AWAY"
        ? match.awayTeam
        : null;

  return (
    <Card
      className="flex flex-col gap-2"
      data-testid={`adv-${match.homeTeam}-${match.awayTeam}`}
    >
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{match.groupName}</span>
        <Badge variant="warning">{roundPoints} pts</Badge>
      </div>

      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {match.homeFlag} {match.homeTeam}
        </span>
        <span className="text-muted">vs</span>
        <span>
          {match.awayTeam} {match.awayFlag}
        </span>
      </div>

      {finished ? (
        <div className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2 text-sm">
          <span className="flex items-center gap-1 text-muted">
            <Trophy className="h-3.5 w-3.5 text-accent" />
            {advanced ?? "—"} advanced
          </span>
          <Badge variant={pick?.points ? "success" : "default"}>
            {pickedTeam ? `${pickedTeam} · ` : "no pick · "}
            {pick?.points ?? 0} pts
          </Badge>
        </div>
      ) : !match.teamsKnown ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2 text-xs text-muted">
          <Lock className="h-3.5 w-3.5" /> Teams to be confirmed
        </div>
      ) : locked ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2 text-xs text-muted">
          <Lock className="h-3.5 w-3.5" />
          {pickedTeam ? `Locked · you picked ${pickedTeam}` : "Locked"}
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-1">
          <input type="hidden" name="matchId" value={match.id} />
          <div className="flex gap-2">
            <Button
              type="submit"
              name="side"
              value="HOME"
              size="sm"
              variant={pick?.pickedSide === "HOME" ? "primary" : "secondary"}
              className="flex-1"
              disabled={pending}
            >
              {match.homeTeam}
            </Button>
            <Button
              type="submit"
              name="side"
              value="AWAY"
              size="sm"
              variant={pick?.pickedSide === "AWAY" ? "primary" : "secondary"}
              className="flex-1"
              disabled={pending}
            >
              {match.awayTeam}
            </Button>
          </div>
          {state?.ok && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="h-3.5 w-3.5" /> Pick saved
            </span>
          )}
          {state?.error && <span className="text-xs text-danger">{state.error}</span>}
        </form>
      )}
    </Card>
  );
}
