"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

export function MobileMenu({
  user,
  isAdmin,
}: {
  user: SessionUser | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links: { href: string; label: string }[] = user
    ? [
        { href: "/predict", label: "Predict" },
        { href: "/groups", label: "Groups" },
        { href: "/outrights", label: "Outrights" },
        { href: "/bracket", label: "Bracket" },
        { href: "/leagues", label: "Leagues" },
        { href: "/leaderboard", label: "Global" },
        { href: "/how-it-works", label: "How it works" },
        ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [{ href: "/how-it-works", label: "How it works" }];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden />
          <div className="glass absolute right-0 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-[var(--radius)] p-2 shadow-xl shadow-black/40">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="rounded-lg px-3 py-2 text-sm hover:bg-surface-2/70"
              >
                {l.label}
              </Link>
            ))}

            <div className="my-1 h-px bg-border" />

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={close}
                  className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2/70"
                >
                  {user.name ?? "Profile"}
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full")}
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={close}
                className={cn(buttonVariants({ variant: "primary", size: "sm" }), "w-full")}
              >
                Sign in
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
