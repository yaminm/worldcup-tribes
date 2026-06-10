import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const alt = "Tribes league";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const league = await prisma.league.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });

  const name = league?.name ?? "A Tribes league";
  const members = league?._count.members ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0c10",
          backgroundImage:
            "radial-gradient(900px 420px at 50% -10%, rgba(198,255,58,0.18), transparent 70%)",
          color: "#e8edf4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: 22, height: 22, borderRadius: 9999, background: "#c6ff3a" }} />
          <div style={{ fontSize: 30, letterSpacing: 2, color: "#8a93a6" }}>
            TRIBES · WORLD CUP 2026 PREDICTOR
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 44, marginTop: 40, color: "#8a93a6" }}>
          Think you can beat me in
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: -3,
            marginTop: 4,
            lineHeight: 1.02,
            color: "#c6ff3a",
          }}
        >
          {name}?
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: 44, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              background: "#c6ff3a",
              color: "#0a0c10",
              borderRadius: 9999,
              padding: "16px 34px",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            Join now →
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#8a93a6" }}>
            {members} already playing
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
