"use client";

import { useActionState } from "react";
import { RefreshCw, Calculator, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  runSyncAction,
  recalcAction,
  generateBotsAction,
  setResultAction,
  setOutrightAnswerAction,
  type AdminState,
} from "@/app/actions/admin";
import type { MatchView } from "@/lib/match-view";

export interface AdminOutright {
  id: string;
  question: string;
  points: number;
  correctAnswer: string | null;
}

export function AdminOutrightForm({ outright }: { outright: AdminOutright }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    setOutrightAnswerAction,
    {},
  );
  return (
    <form
      action={action}
      className="flex flex-wrap items-center gap-2 border-t border-border/60 py-3"
    >
      <input type="hidden" name="outrightId" value={outright.id} />
      <span className="min-w-40 flex-1 text-sm font-medium">
        {outright.question}{" "}
        <span className="text-xs text-muted">({outright.points} pts)</span>
      </span>
      <Input
        name="correctAnswer"
        defaultValue={outright.correctAnswer ?? ""}
        placeholder="Correct answer (blank = unresolved)"
        className="h-9 w-56"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.error && <span className="text-xs text-danger">{state.error}</span>}
      {state.ok && <span className="text-xs text-success">✓</span>}
    </form>
  );
}

export function SyncControls() {
  const [syncState, syncAction, syncing] = useActionState<AdminState, FormData>(
    runSyncAction,
    {},
  );
  const [recalcState, recalcDispatch, recalcing] = useActionState<
    AdminState,
    FormData
  >(recalcAction, {});
  const [botState, botDispatch, botRunning] = useActionState<AdminState, FormData>(
    generateBotsAction,
    {},
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <form action={syncAction}>
          <Button type="submit" disabled={syncing}>
            <RefreshCw className="h-4 w-4" />
            {syncing ? "Syncing…" : "Sync fixtures"}
          </Button>
        </form>
        <form action={recalcDispatch}>
          <Button type="submit" variant="secondary" disabled={recalcing}>
            <Calculator className="h-4 w-4" />
            {recalcing ? "Recalculating…" : "Recalculate scores"}
          </Button>
        </form>
        <form action={botDispatch}>
          <Button type="submit" variant="secondary" disabled={botRunning}>
            <Bot className="h-4 w-4" />
            {botRunning ? "Generating…" : "Generate bot picks"}
          </Button>
        </form>
      </div>
      {(syncState.message || syncState.error) && (
        <p className={syncState.error ? "text-sm text-danger" : "text-sm text-success"}>
          {syncState.error ?? syncState.message}
        </p>
      )}
      {(recalcState.message || recalcState.error) && (
        <p className={recalcState.error ? "text-sm text-danger" : "text-sm text-success"}>
          {recalcState.error ?? recalcState.message}
        </p>
      )}
      {(botState.message || botState.error) && (
        <p className={botState.error ? "text-sm text-danger" : "text-sm text-success"}>
          {botState.error ?? botState.message}
        </p>
      )}
    </div>
  );
}

export function AdminResultForm({ match }: { match: MatchView }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    setResultAction,
    {},
  );

  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-2 border-t border-border/60 py-3"
    >
      <input type="hidden" name="matchId" value={match.id} />
      <div className="min-w-40 flex-1">
        <div className="text-sm font-semibold">
          {match.homeFlag} {match.homeTeam} v {match.awayTeam} {match.awayFlag}
        </div>
        <div className="text-xs text-muted">
          {match.groupName} · {match.stage}
        </div>
      </div>

      <label className="flex flex-col text-xs text-muted">
        Status
        <select
          name="status"
          defaultValue={match.status}
          className="mt-1 h-9 rounded-lg border border-border bg-surface-2/60 px-2 text-sm text-foreground"
        >
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="LIVE">LIVE</option>
          <option value="FINISHED">FINISHED</option>
        </select>
      </label>

      <label className="flex w-16 flex-col text-xs text-muted">
        Home
        <Input
          name="homeScore"
          type="number"
          min={0}
          max={99}
          defaultValue={match.homeScore ?? ""}
          className="mt-1 h-9"
        />
      </label>
      <label className="flex w-16 flex-col text-xs text-muted">
        Away
        <Input
          name="awayScore"
          type="number"
          min={0}
          max={99}
          defaultValue={match.awayScore ?? ""}
          className="mt-1 h-9"
        />
      </label>

      <label className="flex flex-col text-xs text-muted">
        Advanced (KO)
        <select
          name="advancingSide"
          defaultValue={match.advancingSide ?? "NONE"}
          className="mt-1 h-9 rounded-lg border border-border bg-surface-2/60 px-2 text-sm text-foreground"
        >
          <option value="NONE">—</option>
          <option value="HOME">Home</option>
          <option value="AWAY">Away</option>
        </select>
      </label>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.error && <span className="text-xs text-danger">{state.error}</span>}
      {state.ok && <span className="text-xs text-success">✓</span>}
    </form>
  );
}
