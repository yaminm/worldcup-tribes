"use client";

import { useActionState } from "react";
import { Dices, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { lazyFill, type PredictionState } from "@/app/actions/predictions";

export function LazyOzButton({
  variant = "secondary",
  label = "LazyOz — auto-fill",
}: {
  variant?: ButtonProps["variant"];
  label?: string;
}) {
  const [state, action, pending] = useActionState<PredictionState, FormData>(
    lazyFill,
    {},
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <Button
        type="submit"
        variant={variant}
        size="sm"
        disabled={pending}
        title="Randomly predicts every open match (and knockout pick) you haven't filled yet. Never overwrites picks you already made."
      >
        <Dices className="h-4 w-4" />
        {pending ? "Filling…" : label}
      </Button>
      {state?.ok && (
        <span className="flex items-center gap-1 text-xs text-success">
          <Check className="h-3.5 w-3.5" />
          {state.filled && state.filled > 0
            ? `Filled ${state.filled} pick${state.filled === 1 ? "" : "s"}`
            : "All set"}
        </span>
      )}
    </form>
  );
}
