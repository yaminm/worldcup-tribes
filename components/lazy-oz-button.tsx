"use client";

import { useActionState } from "react";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lazyFill, type PredictionState } from "@/app/actions/predictions";

export function LazyOzButton() {
  const [state, action, pending] = useActionState<PredictionState, FormData>(
    lazyFill,
    {},
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={pending}
        title="Randomly predicts every open match (and knockout pick) you haven't filled in yet. Won't touch picks you already made."
      >
        <Dices className="h-4 w-4" />
        {pending ? "Filling…" : "LazyOz — auto-fill my picks"}
      </Button>
      <span className="text-xs text-muted">
        {state?.ok
          ? state.filled && state.filled > 0
            ? `Filled ${state.filled} random pick${state.filled === 1 ? "" : "s"} 🎲`
            : "You're already fully predicted ✅"
          : "One click: random picks for every game you haven't filled"}
      </span>
    </form>
  );
}
