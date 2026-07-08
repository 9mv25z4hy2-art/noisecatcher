import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          borderRadius: "96px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
          <div style={{ width: "148px", height: "212px", background: "#ffffff", borderRadius: "74px" }} />
          <div style={{ width: "192px", height: "16px", background: "#ffffff", borderRadius: "8px", marginTop: "38px" }} />
          <div style={{ width: "22px", height: "48px", background: "#ffffff", borderRadius: "11px", marginTop: "0" }} />
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
