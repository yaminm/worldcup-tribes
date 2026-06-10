import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUser } from "@/lib/session";
import { isSuperadmin } from "@/lib/admin";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tribes — World Cup 2026 Predictions",
  description:
    "Predict every World Cup 2026 match, climb your league leaderboard, and prove you called it.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const isAdmin = isSuperadmin(user?.email);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteNav user={user} isAdmin={isAdmin} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4">
            <span>Tribes — World Cup 2026 predictions</span>
            <a href="/how-it-works" className="hover:text-foreground">How it works</a>
            <a href="/llms.txt" className="hover:text-foreground">llms.txt</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
