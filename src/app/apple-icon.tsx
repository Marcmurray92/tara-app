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
          background: "#07060b",
          borderRadius: 40
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: 9999,
            border: "6px solid #9d7cf5",
            background: "#1c1730",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#c6b3ff",
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
