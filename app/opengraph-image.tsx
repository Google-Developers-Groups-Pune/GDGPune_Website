import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "GDG Pune — Start. Build. Grow. with the GDG Pune Community!";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoBuffer = await readFile(join(process.cwd(), "public/gdg-pune-horizontal.png"));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 54px 32px 54px",
          background: "#ffffff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
        }}
      >
        {/* Top 4-Color Google Accent Stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            display: "flex",
          }}
        >
          <div style={{ flex: 1, background: "#1a73e8" }} />
          <div style={{ flex: 1, background: "#ea4335" }} />
          <div style={{ flex: 1, background: "#fbbc04" }} />
          <div style={{ flex: 1, background: "#34a853" }} />
        </div>

        {/* Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo */}
          <img
            src={logoBase64}
            width={340}
            height={69}
            style={{ objectFit: "contain" }}
            alt="Google Developer Group Pune"
          />

          {/* Location Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #dadce0",
              background: "#f8f9fa",
              borderRadius: 999,
              padding: "8px 18px",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a73e8" }}>📍</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#5f6368",
                letterSpacing: "0.08em",
              }}
            >
              पुणे, भारत | Pune, India
            </span>
          </div>
        </div>

        {/* Sundar Pichai Quote */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            fontSize: 14,
            color: "#5f6368",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: "#202124", marginRight: 4 }}>“</span>
          <span style={{ fontStyle: "italic" }}>A diverse mix of voices leads to better discussions, decisions, and outcomes for everyone.</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#202124", marginLeft: 4, marginRight: 8 }}>”</span>
          <span style={{ fontWeight: 600, color: "#202124" }}>— Sundar Pichai</span>
        </div>

        {/* Main Hero & DevFest Split */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 28,
          }}
        >
          {/* Left Column: Headline, Subtitle, Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 650,
            }}
          >
            {/* Headline */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.05,
                color: "#202124",
                letterSpacing: "-0.04em",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", fontSize: 50, fontWeight: 900, color: "#111827" }}>
                <span>Start</span>
                <div style={{ width: 11, height: 11, borderRadius: 999, background: "#34a853", margin: "0 10px" }} />
                <span>Build</span>
                <div style={{ width: 11, height: 11, borderRadius: 999, background: "#fbbc04", margin: "0 10px" }} />
                <span>Grow</span>
                <div style={{ width: 11, height: 11, borderRadius: 999, background: "#ea4335", margin: "0 10px" }} />
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ color: "#5f6368", fontWeight: 600 }}>with the&nbsp;</span>
                <span style={{ color: "#1a73e8" }}>GDG Pune Community!</span>
              </div>
            </div>

            {/* Subtitle */}
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#5f6368",
                lineHeight: 1.4,
                marginTop: 14,
                maxWidth: 580,
              }}
            >
              A Google Developer Group for builders, innovators, and creators in Pune, India—exploring code, cloud, AI, and startups.
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#1a73e8",
                  color: "#ffffff",
                  borderRadius: 999,
                  padding: "10px 22px",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Become a member
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #dadce0",
                  background: "#ffffff",
                  color: "#202124",
                  borderRadius: 999,
                  padding: "10px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Explore community ↗
              </div>
            </div>
          </div>

          {/* Right Column: DevFest Pune 2026 Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              width: 410,
              border: "1.5px solid #d2e3fc",
              background: "#f8faff",
              borderRadius: 24,
              padding: "24px 28px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#1a73e8",
                background: "#e8f0fe",
                padding: "4px 12px",
                borderRadius: 999,
                marginBottom: 8,
              }}
            >
              ANNUAL FLAGSHIP CONFERENCE
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 800,
                color: "#202124",
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              DevFest Pune&nbsp;<span style={{ color: "#1a73e8" }}>2026</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                color: "#5f6368",
                lineHeight: 1.35,
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              Build, Secure, Scale — Agentic AI, Tokenization &amp; Quantum.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1a73e8",
                color: "#ffffff",
                borderRadius: 999,
                padding: "8px 24px",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Register Now
            </div>
          </div>
        </div>

        {/* Footer Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: 14,
            borderTop: "1px solid #e8eaed",
          }}
        >
          {/* 4 Google Dots & Motto */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: 999, background: "#1a73e8" }} />
              <div style={{ width: 9, height: 9, borderRadius: 999, background: "#ea4335" }} />
              <div style={{ width: 9, height: 9, borderRadius: 999, background: "#fbbc04" }} />
              <div style={{ width: 9, height: 9, borderRadius: 999, background: "#34a853" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#202124" }}>
              Curious minds! Shared momentum!
            </span>
          </div>

          {/* Domain */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1a73e8" }}>
              gdgpune.in
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
