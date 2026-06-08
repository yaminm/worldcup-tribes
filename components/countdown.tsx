"use client";

import { useEffect, useState } from "react";
import { msUntilLock } from "@/lib/locking";

function format(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function Countdown({ kickoffTime }: { kickoffTime: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(msUntilLock({ kickoffTime }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [kickoffTime]);

  if (remaining === null) return <span className="text-muted">—</span>;
  if (remaining <= 0) return <span className="text-danger">Locked</span>;

  return (
    <span className="text-muted">
      Locks in <span className="font-semibold text-foreground">{format(remaining)}</span>
    </span>
  );
}
