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
            TRIBES · WORLD CUP 2026 PREDICTION LEAGUE
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 36, marginTop: 40, color: "#8a93a6" }}>
          You&apos;re invited to
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            marginTop: 6,
            lineHeight: 1.05,
          }}
        >
          {name}
        </div>

        <div style={{ display: "flex", gap: "14px", marginTop: 40, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              border: "1px solid #262c38",
              borderRadius: 14,
              padding: "12px 22px",
              fontSize: 30,
              color: "#c6ff3a",
            }}
          >
            {members} member{members === 1 ? "" : "s"}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#e8edf4" }}>
            Join &amp; predict the World Cup →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
