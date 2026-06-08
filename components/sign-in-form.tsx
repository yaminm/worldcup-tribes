"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { devLogin, googleLogin, type AuthState } from "@/app/actions/auth";

export function SignInForm({
  googleEnabled,
  devEnabled,
  callbackUrl = "/",
}: {
  googleEnabled: boolean;
  devEnabled: boolean;
  callbackUrl?: string;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    devLogin,
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      {googleEnabled && (
        <form action={googleLogin}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Button type="submit" variant="secondary" size="lg" className="w-full">
            Continue with Google
          </Button>
        </form>
      )}

      {googleEnabled && devEnabled && (
        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {devEnabled && (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@tribes.local" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" type="text" placeholder="Your name" />
          </div>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Signing in…" : "Continue (dev login)"}
          </Button>
          <p className="text-center text-xs text-muted">
            Dev login is for local testing only.
          </p>
        </form>
      )}

      {!googleEnabled && !devEnabled && (
        <p className="text-sm text-danger">
          No sign-in method configured. Set Google credentials or enable dev login.
        </p>
      )}
    </div>
  );
}
