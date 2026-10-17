import { ImageResponse } from "next/og";

export const alt = "ChartKit. Charts from one JSON spec. Any framework. Built for agents.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3f1eb",
          color: "#1c1915",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
          <span>Chart</span>
          <span style={{ color: "#0c6b4d" }}>Kit</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, fontWeight: 650, letterSpacing: -2, lineHeight: 1.05 }}>
          <span>Charts from one JSON spec.</span>
          <span style={{ fontSize: 36, marginTop: 16, color: "#4a453e" }}>Any framework. Built for agents.</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 28 }}>
          <span>8.7 KB</span>
          <span>0.62 ms SSR</span>
          <span>42/42 with the docs</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
