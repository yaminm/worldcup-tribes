"use client";

import { useMounted } from "./use-mounted";

type Mode = "datetime" | "time" | "date";

const OPTS: Record<Mode, Intl.DateTimeFormatOptions> = {
  datetime: { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
  time: { hour: "2-digit", minute: "2-digit" },
  date: { weekday: "short", month: "short", day: "numeric" },
};

/** Renders an ISO timestamp in the viewer's local timezone, mount-gated to
 *  avoid an SSR/hydration mismatch. */
export function LocalKickoff({ iso, mode = "datetime" }: { iso: string; mode?: Mode }) {
  const mounted = useMounted();
  const label = mounted ? new Date(iso).toLocaleString(undefined, OPTS[mode]) : "";
  return <span suppressHydrationWarning>{label || "\u00a0"}</span>;
}
