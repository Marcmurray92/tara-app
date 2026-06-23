import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0f16",
          borderRadius: 40
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: 9999,
            border: "6px solid #d4af37",
            background: "#1b2435",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#d4af37",
              transform: "rotate(45deg)",
              borderRadius: 10
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
