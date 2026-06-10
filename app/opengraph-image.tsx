import { ImageResponse } from "next/og";

export const alt = "Tribes — World Cup 2026 Predictions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 26, height: 26, borderRadius: 9999, background: "#c6ff3a" }} />
          <div style={{ fontSize: 32, letterSpacing: 2, color: "#8a93a6" }}>
            WORLD CUP 2026 · PREDICTION LEAGUE
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 150, fontWeight: 800, letterSpacing: -4, marginTop: 24 }}>
          Tribes
          <span style={{ color: "#c6ff3a" }}>.</span>
        </div>

        <div style={{ display: "flex", fontSize: 46, marginTop: 4 }}>
          Predict every match. Rule your tribe.
        </div>

        <div style={{ display: "flex", gap: "14px", marginTop: 44 }}>
          {["10 EXACT", "6 GOAL DIFF", "4 RESULT", "KO ×1.5"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                border: "1px solid #262c38",
                borderRadius: 14,
                padding: "12px 22px",
                fontSize: 30,
                color: "#c6ff3a",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
