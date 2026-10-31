import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { heroConstruction } from "@/assets/drawings";
import { copy } from "@/content/copy";
import { site } from "@/content/metadata";
import { headlineLines, sheetLabel } from "@/lib/data";

// Static export: rendered once at build time (studio/design/assets/README.md "Open Graph image",
// composition per og-sketch.svg). The OG image is the home look, so it uses the dark palette hex
// values from drawing-data.json (Satori can't read CSS variables).
export const dynamic = "force-static";
export const alt = site.og.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#101419";
const GRID = "#1b2128";
const LINE = "#353e47";
const DRAFT = "#4a5765";
const INK = "#f0eeea";
const MUTED = "#aeb5bd";
const ACCENT = "#fd7933";

const HL = 92; // headline px
const TOP = 150; // first row top
const ROW = 0.88 * HL;

const resolveVars = (svg: string) => svg.replace(/var\(--[\w-]+,\s*([^)]+)\)/g, "$1");
const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function background() {
  // 12 columns on a 64 px margin / 20 px gutter grid: a hairline at each column's left edge + one past the last
  const col = (1200 - 128 - 11 * 20) / 12;
  const cols = Array.from({ length: 13 }, (_, k) => `M${64 + k * (col + 20)} 0V630`).join("");
  const rows = headlineLines
    .map((_, k) => {
      const top = TOP + k * ROW;
      return `M0 ${top + 0.071 * HL}H1200M0 ${top + 0.774 * HL}H1200`;
    })
    .join("");
  const hc = resolveVars(heroConstruction)
    .replace(/^<svg[^>]*>/, '<g fill="none" transform="translate(830 60) scale(0.72)">')
    .replace(/<\/svg>$/, "</g>");
  return dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">` +
      `<rect width="1200" height="630" fill="${BG}"/>` +
      `<path stroke="${GRID}" d="${cols}"/><path stroke="${LINE}" d="${rows}"/>${hc}</svg>`,
  );
}

export default async function Image() {
  const font = (f: string) => readFile(join(process.cwd(), "src/app/og", f));
  const [wide, mono] = await Promise.all([font("archivo-wide-800.ttf"), font("jetbrains-mono-500.ttf")]);
  const label = { fontFamily: "Mono", fontSize: 15, letterSpacing: "0.06em", color: MUTED, textTransform: "uppercase" } as const;
  const dimY = TOP + headlineLines.length * ROW + 34;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: BG }}>
        <img src={background()} width={1200} height={630} alt="" style={{ position: "absolute", left: 0, top: 0 }} />

        <div style={{ ...label, position: "absolute", left: 64, top: 26, display: "flex" }}>AGK — builds</div>
        <div style={{ ...label, position: "absolute", right: 64, top: 26, display: "flex" }}>
          {sheetLabel("top", "").replace(/ · $/, "")}
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            top: TOP,
            display: "flex",
            flexDirection: "column",
            fontFamily: "Wide",
            fontSize: HL,
            lineHeight: 0.88,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: INK,
          }}
        >
          {headlineLines.map((line, k) => (
            <div key={k} style={{ display: "flex", height: ROW, color: k === headlineLines.length - 1 ? ACCENT : INK }}>
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            top: dimY - 8,
            width: 880,
            height: 16,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ width: 1, height: 16, background: DRAFT }} />
          <div style={{ width: 180, height: 1, background: DRAFT }} />
          <div style={{ ...label, display: "flex", padding: "0 16px" }}>{copy.hero.fig_label}</div>
          <div style={{ flex: 1, height: 1, background: DRAFT }} />
          <div style={{ width: 1, height: 16, background: DRAFT }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Wide", data: wide, weight: 800, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
