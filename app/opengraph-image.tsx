import { ImageResponse } from "next/og";

export const alt = "Miftaul Islam Shuvro — Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card for every route that does not bring its own image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(ellipse 70% 60% at 20% 0%, #1e3a8a 0%, #0b1120 60%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#7dd3fc", textTransform: "uppercase" }}>
          www.miftaul.com
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Miftaul Islam Shuvro</div>
          <div style={{ fontSize: 40, marginTop: 20, color: "#cbd5e1" }}>Full Stack Developer · Dhaka, Bangladesh</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#94a3b8" }}>
          React · Next.js · Node.js · NestJS · GraphQL · AWS
        </div>
      </div>
    ),
    size,
  );
}
