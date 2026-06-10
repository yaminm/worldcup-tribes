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
    <form action={action} className="flex items-center gap-2">
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        <Dices className="h-4 w-4" />
        {pending ? "Filling…" : "LazyOz: autofill"}
      </Button>
      {state?.ok &&
        (state.filled && state.filled > 0 ? (
          <span className="text-xs text-success">
            Filled {state.filled} pick{state.filled === 1 ? "" : "s"} 🎲
          </span>
        ) : (
          <span className="text-xs text-muted">Nothing left to fill</span>
        ))}
    </form>
  );
}
