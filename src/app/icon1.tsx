import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * PNG fallback for the SVG favicon.
 *
 * Next emits a `<link rel="icon">` for each numbered `icon*` file, so modern
 * browsers take `icon.svg` and anything without SVG favicon support — older
 * Safari, feed readers, most link-preview crawlers — falls back to this.
 *
 * Geometry matches `icon.svg` on the same 32-unit grid, rebuilt from boxes
 * because Satori only supports a narrow subset of SVG.
 */
export default function Icon() {
  const rail = {
    position: "absolute" as const,
    top: 7.2,
    width: 2.6,
    height: 17.6,
    borderRadius: 1.3,
    background: "#ededf2",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0c0c11",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 9.2,
            top: 14.7,
            width: 13.6,
            height: 2.6,
            borderRadius: 1.3,
            background: "#ededf2",
            opacity: 0.8,
          }}
        />
        <div style={{ ...rail, left: 9.2 }} />
        <div style={{ ...rail, left: 20.2 }} />

        <div
          style={{
            position: "absolute",
            left: 13.05,
            top: 13.05,
            width: 5.9,
            height: 5.9,
            borderRadius: 999,
            background: "#7c5cff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 2.1,
              height: 2.1,
              borderRadius: 999,
              background: "#0c0c11",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
