import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          borderRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "76px",
              background: "#ffffff",
              borderRadius: "27px",
            }}
          />
          <div
            style={{
              width: "70px",
              height: "6px",
              background: "#ffffff",
              borderRadius: "3px",
              marginTop: "13px",
            }}
          />
          <div
            style={{
              width: "8px",
              height: "16px",
              background: "#ffffff",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
