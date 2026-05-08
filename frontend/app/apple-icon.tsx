import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0d0d0d",
        color: "#f59e0b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 96,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      LA
    </div>,
    size
  );
}
