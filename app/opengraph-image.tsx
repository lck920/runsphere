// Link preview image for Instagram / WhatsApp / Telegram shares. Generated at build time.
import { ImageResponse } from "next/og";

export const alt = "RunSphere: small runs, every week, big habit";
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
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #2b3a06 0%, #0a0a0a 60%)",
          color: "#f5f5f2",
        }}
      >
        <div style={{ fontSize: 40, color: "#c8f52c", letterSpacing: 4 }}>SDG 3 · GOOD HEALTH & WELL-BEING</div>
        <div style={{ display: "flex", fontSize: 128, fontWeight: 800, marginTop: 20 }}>
          Run<span style={{ color: "#c8f52c" }}>Sphere</span>
        </div>
        <div style={{ fontSize: 48, marginTop: 20, color: "#a3a39c" }}>
          Weekly running challenges for uni students in Malaysia. Free, no sign-up.
        </div>
      </div>
    ),
    size,
  );
}
