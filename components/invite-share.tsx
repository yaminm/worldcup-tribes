"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InviteShare({ code }: { code: string }) {
  const [copied, setCopied] = useState<null | "code" | "link">(null);

  async function copy(kind: "code" | "link") {
    const value =
      kind === "code" ? code : `${window.location.origin}/join/${code}`;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => copy("code")}
        title="Copy code"
        className="score-display rounded-lg border border-border bg-surface-2/60 px-3 py-1.5 text-sm tracking-[0.2em] hover:border-accent/50"
      >
        {code}
        {copied === "code" ? (
          <Check className="ml-2 inline h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="ml-2 inline h-3.5 w-3.5 text-muted" />
        )}
      </button>
      <Button type="button" size="sm" onClick={() => copy("link")}>
        {copied === "link" ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied === "link" ? "Link copied" : "Copy invite link"}
      </Button>
    </div>
  );
}
