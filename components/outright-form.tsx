"use client";

import { useActionState } from "react";
import { Check, Lock, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { submitOutright, type OutrightState } from "@/app/actions/outrights";
import { isOutrightLocked } from "@/lib/outright";
import { teamFlag } from "@/lib/teams";

export interface OutrightView {
  id: string;
  question: string;
  type: "TEAM" | "TEXT";
  points: number;
  lockAt: string;
  correctAnswer: string | null;
}

export interface OutrightPredictionView {
  answer: string;
  points: number | null;
}

export function OutrightForm({
  outright,
  prediction,
  teams,
}: {
  outright: OutrightView;
  prediction: OutrightPredictionView | null;
  teams: string[];
}) {
  const [state, action, pending] = useActionState<OutrightState, FormData>(
    submitOutright,
    {},
  );

  const resolved = outright.correctAnswer !== null;
  const locked = resolved || isOutrightLocked(outright.lockAt);

  const renderAnswer = (a: string) =>
    outright.type === "TEAM" ? `${teamFlag(a)} ${a}` : a;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          <span className="font-semibold">{outright.question}</span>
        </div>
        <Badge variant="accent">{outright.points} pts</Badge>
      </div>

      {resolved ? (
        <div className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2 text-sm">
          <span className="text-muted">
            Answer:{" "}
            <span className="font-semibold text-foreground">
              {renderAnswer(outright.correctAnswer!)}
            </span>
            {prediction && (
              <>
                {" "}
                · you said{" "}
                <span className="text-foreground">{renderAnswer(prediction.answer)}</span>
              </>
            )}
          </span>
          <Badge variant={prediction?.points ? "success" : "default"}>
            {prediction?.points ?? 0} pts
          </Badge>
        </div>
      ) : locked ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2 text-sm text-muted">
          <Lock className="h-3.5 w-3.5" />
          {prediction ? `Locked · you picked ${renderAnswer(prediction.answer)}` : "Locked"}
        </div>
      ) : (
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="outrightId" value={outright.id} />
          {outright.type === "TEAM" ? (
            <select
              name="answer"
              defaultValue={prediction?.answer ?? ""}
              required
              className="h-10 flex-1 rounded-lg border border-border bg-surface-2/60 px-3 text-sm text-foreground"
            >
              <option value="" disabled>
                Pick a team…
              </option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <Input
              name="answer"
              defaultValue={prediction?.answer ?? ""}
              placeholder="Your answer"
              required
              className="flex-1"
            />
          )}
          {state?.ok && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          {state?.error && <span className="text-xs text-danger">{state.error}</span>}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "…" : prediction ? "Update" : "Pick"}
          </Button>
        </form>
      )}
    </Card>
  );
}
