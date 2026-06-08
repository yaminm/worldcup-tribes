"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLeague,
  joinLeague,
  type FormState,
} from "@/app/actions/leagues";

export function CreateLeagueForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createLeague,
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="name">League name</Label>
        <Input id="name" name="name" placeholder="The Office Tribe" required />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create league"}
      </Button>
    </form>
  );
}

export function JoinLeagueForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    joinLeague,
    {},
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="code">Invite code</Label>
        <Input
          id="code"
          name="code"
          placeholder="ABC123"
          maxLength={6}
          className="score-display uppercase tracking-[0.3em]"
          required
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Joining…" : "Join league"}
      </Button>
    </form>
  );
}
