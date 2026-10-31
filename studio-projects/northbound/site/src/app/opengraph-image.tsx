import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { terrainHeroInner } from "@/assets/terrain";
import { northTickInner } from "@/assets/tick";
import { copy } from "@/content/copy";
import { site } from "@/content/metadata";

// Composition from studio/design/assets/README.md (Open Graph image).
export const alt = site.og.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori can't read CSS variables: resolve each var(--x, #hex) to its hex fallback (the light scheme).
const resolveVars = (svg: string) => svg.replace(/var\(--[\w-]+,\s*([^)]+)\)/g, "$1");
const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

// The OG image is a print: the light-scheme hex values from the README stand in for the tokens.
const PAPER = "#f8f5ed";
const INK = "#2b221a";
const SURFACE = "#fdfbf7";
const LINE = "#dbd3c8";

export default async function Image() {
  const font = (f: string) => readFile(join(process.cwd(), "assets/og", f));
  const [wide300, wide300i, wide600, cond500] = await Promise.all([
    font("archivo-wide-300.ttf"),
    font("archivo-wide-300-italic.ttf"),
    font("archivo-wide-600.ttf"),
    font("archivo-condensed-500.ttf"),
  ]);

  const terrain = dataUri(
    resolveVars(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${terrainHeroInner}</svg>`),
  );
  const tick = dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" style="color:${INK}">${northTickInner.replace(/currentColor/g, INK)}</svg>`,
  );
  const [line1, line2] = copy.hero.headline.split("\n");
  const rc = copy.hero.route_card;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: PAPER, color: INK }}>
        <img src={terrain} width={1200} height={750} alt="" style={{ position: "absolute", left: 0, top: -120 }} />

        <div style={{ position: "absolute", left: 48, top: 48, display: "flex", alignItems: "center", gap: 10 }}>
            <img src={tick} width={13} height={21} alt="" />
          <span style={{ fontFamily: "Archivo Wide 600", fontSize: 22, letterSpacing: "0.06em" }}>
            {copy.footer.wordmark.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            top: 150,
            display: "flex",
            flexDirection: "column",
            fontFamily: "Archivo Wide",
            fontSize: 96,
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
          }}
        >
          <span>{line1}</span>
          <span style={{ display: "flex" }}>
            {line2.split("*")[0].replace(/ $/, "\u00A0")}
            <span style={{ fontStyle: "italic" }}>{line2.split("*")[1]}</span>
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            right: 64,
            bottom: 64,
            width: 280,
            height: 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
            padding: "0 18px",
            background: SURFACE,
            border: `1px solid ${LINE}`,
            fontFamily: "Archivo Condensed",
            fontSize: 18,
          }}
        >
          <span>{`${rc.batch} · ${rc.origin}`.toUpperCase()}</span>
          <span>{copy["roast-curve"].date_line}</span>
          <span>{`${rc.drop} · ${rc.dtr}`}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo Wide", data: wide300, weight: 300, style: "normal" },
        { name: "Archivo Wide", data: wide300i, weight: 300, style: "italic" },
        { name: "Archivo Wide 600", data: wide600, weight: 600, style: "normal" },
        { name: "Archivo Condensed", data: cond500, weight: 500, style: "normal" },
      ],
    },
  );
}
