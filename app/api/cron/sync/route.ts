import { NextRequest, NextResponse } from "next/server";
import { syncMatches } from "@/lib/matches/sync";
import { generateBotPredictions } from "@/lib/bots";
import { scoreGroupPredictions } from "@/lib/group-predict-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncMatches();
    await scoreGroupPredictions();
    const bots = await generateBotPredictions();
    return NextResponse.json({ ok: true, ...result, botPicks: bots.created });
  } catch (err) {
    console.error("[cron/sync] failed", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

// Supports both GET (Vercel Cron / cron-job.org) and POST (GitHub Actions).
export const GET = handle;
export const POST = handle;
