import Link from "next/link";
import { Trophy } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import type { SessionUser } from "@/lib/session";

export function SiteNav({
  user,
  isAdmin,
}: {
  user: SessionUser | null;
  isAdmin: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <Trophy className="h-5 w-5 text-accent" />
          <span className="text-lg">
            Tribes<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link href="/predict" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Predict
              </Link>
              <Link href="/groups" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Groups
              </Link>
              <Link href="/outrights" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Outrights
              </Link>
              <Link href="/leagues" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Leagues
              </Link>
              {isAdmin && (
                <Link href="/admin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Admin
                </Link>
              )}
              <div className="ml-2 flex items-center gap-2">
                <span className="hidden text-muted sm:inline">{user.name}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
