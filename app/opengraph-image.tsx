import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "GDG Pune — Build with the cloud community of Pune.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const headline = "Build with the cloud community of Pune.";
const footer = "gdgcloudpune.in";

// Fetches a static Google Sans Flex instance subset to the given text.
// Falls back to the built-in font if Google Fonts is unreachable at build time.
async function loadGoogleSansFlex(weight: number, text: string) {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const fontUrl = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!fontUrl) return null;
    return await (await fetch(fontUrl)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [logo, bold, regular] = await Promise.all([
    readFile(join(process.cwd(), "public/gdg-cloud-pune-logo.png")),
    loadGoogleSansFlex(700, headline),
    loadGoogleSansFlex(400, footer),
  ]);
  const fonts = [
    bold && { name: "Google Sans Flex", data: bold, weight: 700 as const, style: "normal" as const },
    regular && { name: "Google Sans Flex", data: regular, weight: 400 as const, style: "normal" as const },
  ].filter((font) => !!font);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#1e1e1e",
          color: "#f0f0f0",
          fontFamily: "Google Sans Flex",
        }}
      >
        <img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          width={520}
          height={60}
          alt=""
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
          }}
        >
          <div style={{ display: "flex" }}>
            Build with the&nbsp;<span style={{ color: "#57caff" }}>cloud</span>
          </div>
          <div style={{ display: "flex" }}>community of Pune.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {["#4285f4", "#34a853", "#f9ab00", "#ea4335"].map((color) => (
              <div key={color} style={{ width: 72, height: 10, borderRadius: 999, background: color }} />
            ))}
          </div>
          <div style={{ fontSize: 30, color: "#c9c9c9", fontWeight: 400 }}>{footer}</div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
