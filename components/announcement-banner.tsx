"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { useMounted } from "@/components/use-mounted";

const STORAGE_KEY = "tribes-banner-2026-06-10";

export function AnnouncementBanner() {
  const mounted = useMounted();
  const [dismissed, setDismissed] = useState(false);

  // Only render on the client so we can respect the saved dismissal (and avoid
  // a hydration mismatch).
  if (!mounted) return null;
  const hidden =
    dismissed ||
    (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1");
  if (hidden) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  return (
    <div
      dir="rtl"
      className="relative flex items-center justify-center gap-3 bg-accent/15 px-10 py-2 text-center text-sm text-foreground"
    >
      <Sparkles className="h-4 w-4 shrink-0 text-accent" />
      <span>
        חדש ב‑Tribes: בוטים מתחרים, ניחוש טבלאות בית, ודשבורד חי.{" "}
        <Link href="/whats-new" className="font-semibold text-accent hover:underline">
          קראו עוד ←
        </Link>
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="סגירה"
        className="absolute left-3 text-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
