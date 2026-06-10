import Link from "next/link";
import type { Metadata } from "next";
import { RULES } from "@/lib/rules";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works — Tribes",
  description:
    "How Tribes scoring works: match predictions, knockout multiplier, jokers, bracket, group standings, outrights and leaderboards.",
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 py-6 text-center">
        <Badge variant="accent">How it works</Badge>
        <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Every way to score points in Tribes
        </h1>
        <p className="max-w-xl text-muted">
          Predict matches, knockouts, groups and the big tournament questions.
          Accuracy earns points; points climb leaderboards. Here&apos;s the full breakdown.
        </p>
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Start predicting
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {RULES.map((s) => (
          <Card key={s.id} className="flex flex-col gap-3">
            <div>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.summary}</CardDescription>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {s.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <p className="text-center text-xs text-muted">
        Building a bot or tool? There&apos;s a machine-readable summary at{" "}
        <Link href="/llms.txt" className="text-accent hover:underline">
          /llms.txt
        </Link>
        .
      </p>
    </div>
  );
}
