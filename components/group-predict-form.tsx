"use client";

import { useActionState } from "react";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitGroupPrediction, type PredictionState } from "@/app/actions/predictions";
import { isGroupLocked } from "@/lib/group-predict";
import { teamFlag } from "@/lib/teams";

export interface GroupPredictView {
  groupName: string;
  teams: string[];
  firstKickoff: string; // ISO
  order: string[] | null; // user's predicted order
  points: number | null;
}

export function GroupPredictForm({ group }: { group: GroupPredictView }) {
  const [state, action, pending] = useActionState<PredictionState, FormData>(
    submitGroupPrediction,
    {},
  );

  const locked = isGroupLocked(group.firstKickoff);
  const scored = group.points !== null;

  if (locked) {
    return (
      <div className="rounded-lg bg-surface-2/50 px-3 py-2 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Lock className="h-3.5 w-3.5" />
          {group.order
            ? `Your call: ${group.order.join(" › ")}`
            : "Predictions locked"}
          {scored && (
            <Badge variant={group.points ? "success" : "default"} className="ml-2">
              {group.points} pts
            </Badge>
          )}
        </span>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="groupName" value={group.groupName} />
      <span className="text-xs text-muted">Predict the finishing order:</span>
      <div className="grid grid-cols-2 gap-2">
        {group.teams.map((_, i) => (
          <label key={i} className="flex items-center gap-2 text-sm">
            <span className="w-4 text-muted">{i + 1}.</span>
            <select
              name={`pos${i + 1}`}
              defaultValue={group.order?.[i] ?? ""}
              required
              className="h-9 flex-1 rounded-lg border border-border bg-surface-2/60 px-2 text-sm text-foreground"
            >
              <option value="" disabled>
                Pick…
              </option>
              {group.teams.map((t) => (
                <option key={t} value={t}>
                  {teamFlag(t)} {t}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {state?.ok && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
        {state?.error && <span className="text-xs text-danger">{state.error}</span>}
        <Button type="submit" size="sm" disabled={pending} className="ml-auto">
          {pending ? "Saving…" : group.order ? "Update order" : "Save order"}
        </Button>
      </div>
    </form>
  );
}
