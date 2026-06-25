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
          background: "#07060b"
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 9999,
            border: "10px solid #9d7cf5",
            background: "#1c1730",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              background: "#c6b3ff",
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
