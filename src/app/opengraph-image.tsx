import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time. Mirrors the site's visual identity rather than
 * shipping a separate design: near-black field, hairline grid, violet accent.
 *
 * Note: every element in a Satori tree needs an explicit display value when it
 * has more than one child, hence the verbose flex declarations.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080b",
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 15% 0%, rgba(124,92,255,0.22), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 30%, rgba(45,212,222,0.12), transparent 60%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#7c5cff",
              marginRight: 16,
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: "#9b9bab",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Full Stack Engineer
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              color: "#ededf2",
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            Harsh Sahu
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#9b9bab",
              marginTop: 24,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            Scalable transactional systems, AI-powered applications, real-time
            architectures and blockchain integrations.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {["NestJS", "Next.js", "PostgreSQL", "Redis", "ClickHouse", "Web3"].map(
            (tech) => (
              <div
                key={tech}
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "#9b9bab",
                  border: "1px solid #2a2a38",
                  borderRadius: 999,
                  padding: "10px 22px",
                  marginRight: 14,
                }}
              >
                {tech}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
