import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0f16"
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 9999,
            border: "10px solid #d4af37",
            background: "#1b2435",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              background: "#d4af37",
              transform: "rotate(45deg)",
              borderRadius: 24
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
