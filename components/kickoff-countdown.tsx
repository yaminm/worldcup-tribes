"use client";

import { useEffect, useState } from "react";

function format(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function KickoffCountdown({
  kickoffTime,
  status,
}: {
  kickoffTime: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
}) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(new Date(kickoffTime).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [kickoffTime]);

  if (status === "LIVE") {
    return (
      <span className="flex items-center gap-1.5 font-semibold text-danger">
        <span className="live-dot inline-block h-2 w-2 rounded-full bg-danger" />
        LIVE NOW
      </span>
    );
  }
  if (status === "FINISHED") return <span className="text-muted">Full time</span>;
  if (ms === null) return <span suppressHydrationWarning>&nbsp;</span>;
  if (ms <= 0) return <span className="text-accent">Kicking off…</span>;

  return (
    <span suppressHydrationWarning className="text-muted">
      Kicks off in <span className="font-semibold text-foreground">{format(ms)}</span>
    </span>
  );
}
