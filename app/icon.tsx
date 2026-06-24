import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          borderRadius: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Mic body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0",
          }}
        >
          {/* Mic capsule */}
          <div
            style={{
              width: "56px",
              height: "80px",
              background: "#ffffff",
              borderRadius: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          {/* Mic stand arc (simplified as bar) */}
          <div
            style={{
              width: "72px",
              height: "6px",
              background: "#ffffff",
              borderRadius: "3px",
              marginTop: "14px",
            }}
          />
          {/* Mic post */}
          <div
            style={{
              width: "8px",
              height: "18px",
              background: "#ffffff",
              borderRadius: "4px",
              marginTop: "0",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
