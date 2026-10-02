import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — the same mark as `icon.svg`, rebuilt from positioned divs.
 *
 * Satori (the renderer behind ImageResponse) only handles a narrow subset of
 * SVG, so the rails, edge and node are plain boxes here rather than strokes.
 * iOS composites this on a home screen and applies its own corner mask, hence
 * the full-bleed opaque background and no rounding of our own.
 */
export default function AppleIcon() {
  const rail = {
    position: "absolute" as const,
    top: 47,
    width: 11,
    height: 86,
    borderRadius: 6,
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
        }}
      >
        {/* Edge, drawn first so the rails and node sit above it */}
        <div
          style={{
            position: "absolute",
            left: 53,
            top: 84,
            width: 74,
            height: 11,
            borderRadius: 6,
            background: "#ededf2",
            opacity: 0.8,
          }}
        />
        <div style={{ ...rail, left: 53 }} />
        <div style={{ ...rail, left: 116 }} />

        {/* Node on the boundary */}
        <div
          style={{
            position: "absolute",
            left: 74.5,
            top: 74.5,
            width: 31,
            height: 31,
            borderRadius: 999,
            background: "#7c5cff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
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
