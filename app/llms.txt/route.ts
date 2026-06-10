import { NextRequest } from "next/server";
import { buildLlmsTxt } from "@/lib/rules";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const baseUrl = new URL(req.url).origin;
  return new Response(buildLlmsTxt(baseUrl), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
