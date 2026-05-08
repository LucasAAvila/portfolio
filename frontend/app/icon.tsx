import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "-0.05em",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      LA
    </div>,
    size
  );
}
