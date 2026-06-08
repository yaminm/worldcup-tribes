"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Lock, Check, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/status-pill";
import { Countdown } from "@/components/countdown";
import { submitPrediction, type PredictionState } from "@/app/actions/predictions";
import { isLocked } from "@/lib/locking";
import type { MatchView, PredictionView } from "@/lib/match-view";

function AnimatedScore({ value }: { value: number }) {
  return (
    <div className="relative h-12 w-12 overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="score-display absolute inset-0 flex items-center justify-center text-4xl"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Stepper({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatedScore value={value} />
      {!disabled && (
        <div className="flex gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Decrease ${label}`}
            className="h-7 w-7"
            onClick={() => onChange(Math.max(0, value - 1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Increase ${label}`}
            className="h-7 w-7"
            onClick={() => onChange(Math.min(99, value + 1))}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function MatchPrediction({
  match,
  prediction,
}: {
  match: MatchView;
  prediction: PredictionView | null;
}) {
  const [home, setHome] = useState(prediction?.homePredictedScore ?? 0);
  const [away, setAway] = useState(prediction?.awayPredictedScore ?? 0);
  const [state, formAction, pending] = useActionState<PredictionState, FormData>(
    submitPrediction,
    {},
  );

  const finished = match.status === "FINISHED";
  const locked = !match.teamsKnown || isLocked({ kickoffTime: match.kickoffTime });
  const canPredict = match.teamsKnown && !locked && !finished;

  const kickoff = new Date(match.kickoffTime);
  const kickoffLabel = kickoff.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className="flex flex-col gap-4"
      data-testid={`match-${match.homeTeam}-${match.awayTeam}`}
    >
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-2">
          <StatusPill status={match.status} />
          {match.groupName && <span>{match.groupName}</span>}
          {match.stage === "KNOCKOUT" && (
            <Badge variant="warning">KO ×1.5</Badge>
          )}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {kickoffLabel}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-3xl">{match.homeFlag}</span>
          <span className="text-sm font-semibold">{match.homeTeam}</span>
        </div>

        {finished ? (
          <div className="flex flex-col items-center">
            <div className="score-display text-3xl">
              {match.homeScore}
              <span className="mx-1 text-muted">:</span>
              {match.awayScore}
            </div>
            {match.advancingSide && (
              <span className="text-[10px] text-muted">
                {match.advancingSide === "HOME" ? match.homeTeam : match.awayTeam} advanced
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Stepper value={home} onChange={setHome} disabled={!canPredict} label="home score" />
            <span className="score-display text-2xl text-muted">:</span>
            <Stepper value={away} onChange={setAway} disabled={!canPredict} label="away score" />
          </div>
        )}

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-3xl">{match.awayFlag}</span>
          <span className="text-sm font-semibold">{match.awayTeam}</span>
        </div>
      </div>

      {/* Result / prediction summary */}
      {finished ? (
        <div className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2 text-sm">
          {prediction ? (
            <>
              <span className="text-muted">
                You predicted{" "}
                <span className="font-semibold text-foreground">
                  {prediction.homePredictedScore}–{prediction.awayPredictedScore}
                </span>
              </span>
              <Badge variant={prediction.points ? "success" : "default"}>
                {prediction.points ?? 0} pts{prediction.isExact ? " · exact!" : ""}
              </Badge>
            </>
          ) : (
            <span className="text-muted">No prediction made</span>
          )}
        </div>
      ) : !match.teamsKnown ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2 text-sm text-muted">
          <Lock className="h-3.5 w-3.5" /> Teams not confirmed yet
        </div>
      ) : locked ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2 text-sm text-muted">
          <Lock className="h-3.5 w-3.5" /> Predictions locked
        </div>
      ) : (
        <form action={formAction} className="flex items-center justify-between gap-3">
          <input type="hidden" name="matchId" value={match.id} />
          <input type="hidden" name="homePredictedScore" value={home} />
          <input type="hidden" name="awayPredictedScore" value={away} />
          <span className="text-xs">
            <Countdown kickoffTime={match.kickoffTime} />
          </span>
          <div className="flex items-center gap-2">
            {state?.ok && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {state?.error && (
              <span className="text-xs text-danger">{state.error}</span>
            )}
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : prediction ? "Update" : "Predict"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
