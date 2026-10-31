#!/usr/bin/env node
// Agkbuilds · Direction A "Working Drawing" — drawing generator.
//
// Writes every drawing on the page from fixed geometry. Dependency-free and
// deterministic: no randomness, fixed rounding, fixed attribute order, so running
// it twice produces byte-identical files.
//
//   node studio-projects/agkbuilds/studio/design/assets/drawing.mjs [--out <dir>]
//
// Output (default: this script's folder):
//   hero-construction.svg   hero construction set piece (circles, centre lines,
//                           protractor ticks, radius, tangents, leader), 600×600, inline
//   process-plate.svg       "How we work" plate, 4 cumulative layers, 640×480, inline
//   process-step-1..4.svg   the same plate frozen at step n, colours embedded
//                           (light + dark via @media), for <img> use on mobile
//   balloon.svg             parts-list item balloon (circle only), 40×40, inline
//   icon.svg                favicon: a wide "A" over a dimension bracket, 32×32
//   og-sketch.svg           1200×630 target look for the Open Graph image (next/og)
//   drawing-data.json       anchor points for the few HTML labels laid over drawings
//
// Colours: the inline SVGs use CSS variables from tokens.css (with hex fallbacks).
// The <img> SVGs embed hex values converted from tokens.css at generation time, so
// re-run this script whenever a colour token changes.
//
// Every path that "draws on" has pathLength="1": animate stroke-dasharray: 1 1 and
// stroke-dashoffset 1 → 0 (see motion.md). Strokes are 1 CSS px at any size
// (vector-effect: non-scaling-stroke).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outArg = process.argv.indexOf("--out");
const OUT = outArg > -1 ? path.resolve(process.argv[outArg + 1]) : here;
fs.mkdirSync(OUT, { recursive: true });

// ───────────────────────── helpers ─────────────────────────

const r2 = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? "0" : String(v);
};
const pt = (x, y) => `${r2(x)} ${r2(y)}`;
const polar = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
// Full circle as a path that starts at `startDeg` and runs clockwise (SVG y-down),
// so the pen starts where we want it.
const circlePath = (cx, cy, r, startDeg) => {
  const [x0, y0] = polar(cx, cy, r, startDeg);
  const [x1, y1] = polar(cx, cy, r, startDeg + 180);
  return `M${pt(x0, y0)}A${r2(r)} ${r2(r)} 0 1 1 ${pt(x1, y1)}A${r2(r)} ${r2(r)} 0 1 1 ${pt(x0, y0)}`;
};
const line = (x1, y1, x2, y2) => `M${pt(x1, y1)}L${pt(x2, y2)}`;
const poly = (pts) => `M${pts.map(([x, y]) => pt(x, y)).join("L")}`;
const rectPath = (x, y, w, h) => `M${pt(x, y)}H${r2(x + w)}V${r2(y + h)}H${r2(x)}Z`;
const write = (name, text) => {
  fs.writeFileSync(path.join(OUT, name), text.endsWith("\n") ? text : text + "\n");
  return Buffer.byteLength(text);
};

// Arrowhead (filled triangle) pointing from (fx,fy) toward tip (tx,ty).
const arrow = (fx, fy, tx, ty, len = 9, half = 3) => {
  const dx = tx - fx;
  const dy = ty - fy;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const bx = tx - ux * len;
  const by = ty - uy * len;
  return `M${pt(tx, ty)}L${pt(bx - uy * half, by + ux * half)}L${pt(bx + uy * half, by - ux * half)}Z`;
};

// ── OKLCH → sRGB hex (for the <img> SVGs that cannot read CSS variables) ──
function oklchToHex(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const enc = lin.map((c) => {
    const x = Math.min(1, Math.max(0, c));
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  });
  return "#" + enc.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
}

// Read the palette from tokens.css so the embedded colours never drift.
function readPalette() {
  const css = fs.readFileSync(path.join(here, "..", "tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const grab = (block) => {
    const out = {};
    for (const m of block.matchAll(/--color-([\w-]+)\s*:\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g)) {
      out[m[1]] = oklchToHex(Number(m[2]), Number(m[3]), Number(m[4]));
    }
    return out;
  };
  const darkAt = css.indexOf("prefers-color-scheme: dark");
  const light = grab(css.slice(0, darkAt));
  const dark = { ...light, ...grab(css.slice(darkAt)) };
  return { light, dark };
}
const PAL = readPalette();
const v = (name, scheme = "dark") => `var(--color-${name}, ${PAL[scheme][name]})`; // dark = home look fallback

const SVG_OPEN = (w, h, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none" aria-hidden="true" focusable="false"${extra}>`;

// ───────────────────── 1. hero-construction.svg ─────────────────────
// A drafting "detail" set piece. Centre (300,300). Everything hangs off two
// concentric construction circles, the way a part is laid out with a compass
// before a single solid line is committed.
const HC = {
  W: 600,
  H: 600,
  c: [300, 300],
  rOuter: 236,
  rInner: 92,
  tickIn: 236,
  tickOut: 246,
  tickMajorOut: 258,
  tickEvery: 10, // degrees; every 3rd tick (30°) is major
  radiusDeg: -38, // radius dimension, up-right
  leaderDeg: 52, // leader leaves the outer circle down-right
  leaderOut: 54, // diagonal run past the circle
  leaderEndX: 592, // horizontal run ends here; HTML label sits above it, right-aligned
  tangentFromX: 0,
};
function heroConstruction() {
  const [cx, cy] = HC.c;
  const parts = [];
  // centre lines (dash-dot, the drafting convention): animate with transform scale, not dashes
  const cl = HC.rOuter + 34;
  parts.push(
    `<g id="hc-centre" class="hc-centreline" stroke="${v("draft")}" stroke-dasharray="22 5 3 5">` +
      `<path d="${line(cx - cl, cy, cx + cl, cy)}"/>` +
      `<path d="${line(cx, cy - cl, cx, cy + cl)}"/>` +
      `</g>`
  );
  // tangent construction lines running left toward the headline
  parts.push(
    `<g id="hc-tangents" stroke="${v("draft")}" stroke-dasharray="2 6">` +
      `<path pathLength="1" d="${line(cx, cy - HC.rOuter, HC.tangentFromX, cy - HC.rOuter)}"/>` +
      `<path pathLength="1" d="${line(cx, cy + HC.rOuter, HC.tangentFromX, cy + HC.rOuter)}"/>` +
      `</g>`
  );
  // the two construction circles; the pen starts lower-left (160°) and runs clockwise
  parts.push(
    `<g id="hc-circles" stroke="${v("draft")}">` +
      `<path id="hc-outer" pathLength="1" d="${circlePath(cx, cy, HC.rOuter, 160)}"/>` +
      `<path id="hc-inner" pathLength="1" d="${circlePath(cx, cy, HC.rInner, 160)}"/>` +
      `</g>`
  );
  // protractor ticks
  const ticks = [];
  for (let d = 0; d < 360; d += HC.tickEvery) {
    const major = d % 30 === 0;
    const [x1, y1] = polar(cx, cy, HC.tickIn, d - 90);
    const [x2, y2] = polar(cx, cy, major ? HC.tickMajorOut : HC.tickOut, d - 90);
    ticks.push(`<path pathLength="1" d="${line(x1, y1, x2, y2)}"/>`);
  }
  parts.push(`<g id="hc-ticks" stroke="${v("draft")}">${ticks.join("")}</g>`);
  // radius dimension: centre → outer circle, arrowhead at the circle, datum dot at centre
  const [rx, ry] = polar(cx, cy, HC.rOuter, HC.radiusDeg);
  parts.push(
    `<g id="hc-radius">` +
      `<path pathLength="1" stroke="${v("draft")}" d="${line(cx, cy, rx, ry)}"/>` +
      `<path fill="${v("draft")}" d="${arrow(cx, cy, rx, ry)}"/>` +
      `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="3.5" fill="${v("accent")}"/>` +
      `</g>`
  );
  // leader: hard 90° elbow, like an Oxide/ISO callout
  const [lx0, ly0] = polar(cx, cy, HC.rOuter, HC.leaderDeg);
  const [lx1, ly1] = polar(cx, cy, HC.rOuter + HC.leaderOut, HC.leaderDeg);
  parts.push(
    `<g id="hc-leader" stroke="${v("muted")}">` +
      `<path pathLength="1" d="${poly([
        [lx0, ly0],
        [lx1, ly1],
        [HC.leaderEndX, ly1],
      ])}"/>` +
      `<circle cx="${r2(lx0)}" cy="${r2(ly0)}" r="2.5" fill="${v("muted")}" stroke="none"/>` +
      `</g>`
  );
  const svg =
    SVG_OPEN(HC.W, HC.H, ' class="agk-hc"') +
    `<style>.agk-hc path{vector-effect:non-scaling-stroke;stroke-width:1}</style>` +
    parts.join("") +
    `</svg>`;
  return {
    svg,
    data: {
      viewBox: [HC.W, HC.H],
      centre: [cx, cy],
      // the HTML callout (`hero.drawing_label`) sits ABOVE the leader's horizontal run,
      // right-aligned to its end: right edge at leaderEnd.x, bottom 6px above leaderEnd.y
      leaderEnd: { x: HC.leaderEndX, y: +r2(ly1), leftPct: +r2((HC.leaderEndX / HC.W) * 100), topPct: +r2((ly1 / HC.H) * 100) },
      leaderElbow: { x: +r2(lx1), y: +r2(ly1), leftPct: +r2((lx1 / HC.W) * 100) },
      tangentsY: [cy - HC.rOuter, cy + HC.rOuter],
    },
  };
}

// ───────────────────── 2. process plate ─────────────────────
// An abstract assembly plate: a measured boundary, a planned layout of modules,
// the modules built (heavier line, section hatching, connectors), then solid.
// Layer n belongs to step n of "How we work". Nothing in it is a literal UI.
const PL = {
  W: 640,
  H: 480,
  frame: { x: 60, y: 50, w: 520, h: 380 },
  modules: [
    { id: "m1", x: 80, y: 70, w: 300, h: 140, hatch: false },
    { id: "m2", x: 396, y: 70, w: 164, h: 140, hatch: false },
    { id: "m3", x: 80, y: 226, w: 140, h: 184, hatch: true },
    { id: "m4", x: 236, y: 226, w: 200, h: 88, hatch: false },
    { id: "m5", x: 236, y: 330, w: 200, h: 80, hatch: true },
  ],
  disc: { cx: 506, cy: 318, r: 50 },
  hatchGap: 11,
  fillInset: 7,
};

// 45° hatch lines clipped to a rectangle analytically (no clipPath needed, so the
// SVG also works as an <img> and inside display-toggled containers).
function hatch(x, y, w, h, gap) {
  const out = [];
  // lines x - y = k  →  points where y' = x' - k
  for (let k = x - (y + h) + gap; k < x + w - y; k += gap) {
    const pts = [];
    // intersect with the four edges
    const cand = [
      [x, x - k],
      [x + w, x + w - k],
      [y + k, y],
      [y + h + k, y + h],
    ];
    for (const [px, py] of cand) {
      if (px >= x - 1e-9 && px <= x + w + 1e-9 && py >= y - 1e-9 && py <= y + h + 1e-9) {
        if (!pts.some(([qx, qy]) => Math.abs(qx - px) < 1e-6 && Math.abs(qy - py) < 1e-6)) pts.push([px, py]);
      }
    }
    if (pts.length >= 2) {
      pts.sort((a, b) => a[0] - b[0]);
      out.push(line(pts[0][0], pts[0][1], pts[pts.length - 1][0], pts[pts.length - 1][1]));
    }
  }
  return out;
}

// colours: `css` mode uses variables (inline SVG), `img` mode uses classes styled by an
// embedded <style> with light + dark hex values.
function processPlate({ mode, upTo = 4 }) {
  const { frame: F, modules: M, disc: D } = PL;
  const col = (name) => (mode === "css" ? v(name) : null);
  // paint(kind, name, base) returns the class + colour attributes for one element.
  // In `img` mode the colour is a class too, so it is merged into the SAME class
  // attribute as `base` (two class attributes on one element is invalid XML and
  // breaks the file as <img src>). `css` mode output is unchanged.
  // `extra` (other attributes) sits between the class and the colour attribute.
  const paint = (kind, name, base = "", extra = "") => {
    if (mode === "css") return (base ? ` class="${base}"` : "") + extra + ` ${kind}="${col(name)}"`;
    const cls = [base, `${kind === "stroke" ? "s" : "f"}-${name}`].filter(Boolean).join(" ");
    return ` class="${cls}"${extra}`;
  };
  const strokeAttr = (name, base, extra) => paint("stroke", name, base, extra);
  const fillAttr = (name, base, extra) => paint("fill", name, base, extra);
  const P = (d, extra = "") => `<path pathLength="1" d="${d}"${extra}/>`;
  const layers = [];

  // L1 · measure: boundary, overall dimensions, centre mark
  {
    const g = [];
    g.push(P(rectPath(F.x, F.y, F.w, F.h)));
    // top dimension: extension lines + dimension line + arrowheads
    const dy = F.y - 24;
    g.push(P(line(F.x, F.y - 6, F.x, dy - 8)));
    g.push(P(line(F.x + F.w, F.y - 6, F.x + F.w, dy - 8)));
    g.push(P(line(F.x, dy, F.x + F.w, dy)));
    // left dimension
    const dx = F.x - 26;
    g.push(P(line(F.x - 6, F.y, dx - 8, F.y)));
    g.push(P(line(F.x - 6, F.y + F.h, dx - 8, F.y + F.h)));
    g.push(P(line(dx, F.y, dx, F.y + F.h)));
    // centre mark
    const cx = F.x + F.w / 2;
    const cy = F.y + F.h / 2;
    g.push(P(line(cx - 14, cy, cx + 14, cy)));
    g.push(P(line(cx, cy - 14, cx, cy + 14)));
    const heads =
      `<path d="${arrow(F.x + 40, dy, F.x, dy)}"/>` +
      `<path d="${arrow(F.x + F.w - 40, dy, F.x + F.w, dy)}"/>` +
      `<path d="${arrow(dx, F.y + 40, dx, F.y)}"/>` +
      `<path d="${arrow(dx, F.y + F.h - 40, dx, F.y + F.h)}"/>`;
    layers.push(
      `<g id="pl-1"${strokeAttr("draft", "pl-layer")}>${g.join("")}<g${fillAttr("draft", "pl-heads", ' stroke="none"')}>${heads}</g></g>`
    );
  }
  // L2 · plan: construction lines through module edges + thin module outlines + disc
  {
    const g = [];
    const xs = [...new Set(M.flatMap((m) => [m.x, m.x + m.w]))].sort((a, b) => a - b);
    const ys = [...new Set(M.flatMap((m) => [m.y, m.y + m.h]))].sort((a, b) => a - b);
    const cons = [];
    for (const x of xs) cons.push(P(line(x, F.y + 6, x, F.y + F.h - 6)));
    for (const y of ys) cons.push(P(line(F.x + 6, y, F.x + F.w - 6, y)));
    g.push(`<g class="pl-construction" stroke-dasharray="2 5">${cons.join("")}</g>`);
    for (const m of M) g.push(P(rectPath(m.x, m.y, m.w, m.h)));
    g.push(P(circlePath(D.cx, D.cy, D.r, 180)));
    g.push(P(line(D.cx - D.r - 8, D.cy, D.cx + D.r + 8, D.cy)));
    g.push(P(line(D.cx, D.cy - D.r - 8, D.cx, D.cy + D.r + 8)));
    layers.push(`<g id="pl-2"${strokeAttr("draft", "pl-layer")}>${g.join("")}</g>`);
  }
  // L3 · build: committed outlines (ink), hatching, connectors with nodes
  {
    const g = [];
    for (const m of M) g.push(P(rectPath(m.x, m.y, m.w, m.h)));
    g.push(P(circlePath(D.cx, D.cy, D.r, 180)));
    const h = M.filter((m) => m.hatch).flatMap((m) => hatch(m.x, m.y, m.w, m.h, PL.hatchGap));
    g.push(`<g class="pl-hatch">${h.map((d) => P(d)).join("")}</g>`);
    const conn = [
      poly([
        [436, 270],
        [446, 270],
        [446, D.cy],
        [D.cx - D.r, D.cy],
      ]),
      poly([
        [478, 210],
        [478, 238],
        [D.cx, 238],
        [D.cx, D.cy - D.r],
      ]),
      poly([
        [230, 210],
        [230, 218],
        [300, 218],
        [300, 226],
      ]),
    ];
    g.push(conn.map((d) => P(d)).join(""));
    const nodes = [
      [436, 270],
      [478, 210],
      [230, 210],
      [300, 226],
    ]
      .map(([x, y]) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="3"/>`)
      .join("");
    layers.push(
      `<g id="pl-3"${strokeAttr("ink", "pl-layer pl-built")}>${g.join("")}<g${fillAttr("ink", "pl-nodes", ' stroke="none"')}>${nodes}</g></g>`
    );
  }
  // L4 · solid: modules filled, inset by PL.fillInset so the built outline and its
  // hatching stay visible as a crisp edge around each solid; the disc is the one accent
  {
    const i = PL.fillInset;
    const fills = M.map((m) => `<path d="${rectPath(m.x + i, m.y + i, m.w - 2 * i, m.h - 2 * i)}"/>`).join("");
    layers.push(
      `<g id="pl-4" class="pl-layer pl-solid" stroke="none">` +
        `<g${fillAttr("ink")}>${fills}</g>` +
        `<circle${fillAttr("accent")} cx="${r2(D.cx)}" cy="${r2(D.cy)}" r="${r2(D.r - i)}"/>` +
        `</g>`
    );
  }

  if (mode === "css") {
    return (
      SVG_OPEN(PL.W, PL.H, ' class="agk-plate"') +
      `<style>.agk-plate path{vector-effect:non-scaling-stroke;stroke-width:1}.agk-plate .pl-built>path{stroke-width:1.75}</style>` +
      layers.join("") +
      `</svg>`
    );
  }
  // img mode: freeze at step `upTo`. Layers above it are omitted; at step 4 the
  // measure + plan layers recede (same rule as the inline plate, motion P4).
  const L = PAL.light;
  const Dk = PAL.dark;
  const style =
    `<style>` +
    `path{vector-effect:non-scaling-stroke;stroke-width:1}.pl-built>path{stroke-width:1.75}` +
    `.s-draft{stroke:${L.draft}}.f-draft{fill:${L.draft}}.s-ink{stroke:${L.ink}}.f-ink{fill:${L.ink}}.f-accent{fill:${L.accent}}` +
    (upTo === 4 ? `#pl-1,#pl-2{opacity:.45}` : "") +
    `@media (prefers-color-scheme:dark){.s-draft{stroke:${Dk.draft}}.f-draft{fill:${Dk.draft}}.s-ink{stroke:${Dk.ink}}.f-ink{fill:${Dk.ink}}.f-accent{fill:${Dk.accent}}}` +
    `</style>`;
  return SVG_OPEN(PL.W, PL.H) + style + layers.slice(0, upTo).join("") + `</svg>`;
}

// ───────────────────── 3. icon.svg ─────────────────────
// A wide, heavy "A" (drawn as geometry, so the favicon never depends on a font)
// standing on a dimension bracket ├──┤ in signal orange. Graphite tile in both
// schemes: the sheet is the brand.
function icon() {
  const A =
    poly([
      [6.5, 23],
      [13, 5],
      [19, 5],
      [25.5, 23],
      [20.6, 23],
      [19.5, 19.6],
      [12.5, 19.6],
      [11.4, 23],
    ]) +
    "Z" +
    poly([
      [13.8, 15.6],
      [18.2, 15.6],
      [16, 9],
    ]) +
    "Z";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" fill="${PAL.dark.bg}"/>` +
    `<path fill="${PAL.dark.ink}" fill-rule="evenodd" d="${A}"/>` +
    `<path stroke="${PAL.dark.accent}" stroke-width="1.5" fill="none" d="M6.75 27.25H25.25M6.75 25V29.5M25.25 25V29.5"/>` +
    `</svg>`
  );
}

// ───────────────────── 3b. balloon.svg ─────────────────────
// Drafting item balloon for the parts list: one circle, pen starts at 9 o'clock.
// The numeral is HTML laid over it (mono, centred), so the SVG has no text.
function balloon() {
  return (
    SVG_OPEN(40, 40, ' class="agk-balloon"') +
    `<path pathLength="1" stroke="currentColor" style="vector-effect:non-scaling-stroke;stroke-width:1" d="${circlePath(20, 20, 19.5, 180)}"/>` +
    `</svg>`
  );
}

// ───────────────────── 4. og-sketch.svg ─────────────────────
// Target look for src/app/opengraph-image.tsx (next/og). Text is set in Archivo
// (wdth 125 / 800 for the headline) and JetBrains Mono; the Builder reproduces this
// layout in JSX. Copy here mirrors the directions preview; the Builder uses copy.md.
function ogSketch() {
  const W = 1200;
  const H = 630;
  const m = 64;
  const g = 20;
  const colW = (W - 2 * m - 11 * g) / 12;
  const D = PAL.dark;
  const guides = [];
  for (let i = 0; i <= 12; i++) {
    const x = m + i * (colW + g);
    guides.push(line(x, 0, x, H));
  }
  const hc = heroConstruction().svg
    .replace(/<svg[^>]*>/, "")
    .replace("</svg>", "")
    .replace(/var\(--color-[\w-]+, (#[0-9a-f]{6})\)/g, "$1");
  const lines = ["CUSTOM", "SOFTWARE,", "DRAWN TO FIT.", "THEN BUILT."];
  const fs0 = 92;
  const lh = 0.88 * fs0;
  const top = 150;
  const text = lines
    .map(
      (t, i) =>
        `<text x="${m}" y="${r2(top + i * lh + 0.774 * fs0)}" fill="${i === 3 ? D.accent : D.ink}">${t}</text>`
    )
    .join("");
  const rows = lines
    .map((_, i) => {
      const y0 = top + i * lh;
      return line(0, y0 + 0.071 * fs0, W, y0 + 0.071 * fs0) + line(0, y0 + 0.774 * fs0, W, y0 + 0.774 * fs0);
    })
    .join("");
  const dimY = top + 4 * lh + 34;
  const dimR = m + 0.736 * 13 * fs0;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="${D.bg}"/>` +
    `<path stroke="${D.grid}" d="${guides.join("")}"/>` +
    `<path stroke="${D.line}" d="${rows}"/>` +
    `<g fill="none" transform="translate(830 60) scale(0.72)">${hc}</g>` +
    `<g font-family="Archivo, sans-serif" font-weight="800" font-stretch="125%" font-size="${fs0}" letter-spacing="-0.9">${text}</g>` +
    `<path stroke="${D.draft}" d="${line(m, dimY, dimR, dimY)}${line(m, dimY - 8, m, dimY + 8)}${line(dimR, dimY - 8, dimR, dimY + 8)}"/>` +
    `<g font-family="JetBrains Mono, monospace" font-weight="500" font-size="15" letter-spacing="0.9" fill="${D.muted}">` +
    `<text x="${m}" y="40">AGK — BUILDS</text>` +
    `<text x="${W - m}" y="40" text-anchor="end">SHEET 01 / 04</text>` +
    `<rect x="${m + 180}" y="${dimY - 12}" width="250" height="24" fill="${D.bg}"/>` +
    `<text x="${m + 196}" y="${dimY + 5}">FIG. 01 · CUSTOM SOFTWARE</text>` +
    `</g>` +
    `</svg>`
  );
}

// ───────────────────── write everything ─────────────────────
const sizes = {};
const hero = heroConstruction();
sizes["hero-construction.svg"] = write("hero-construction.svg", hero.svg);
sizes["process-plate.svg"] = write("process-plate.svg", processPlate({ mode: "css" }));
for (let n = 1; n <= 4; n++) sizes[`process-step-${n}.svg`] = write(`process-step-${n}.svg`, processPlate({ mode: "img", upTo: n }));
sizes["icon.svg"] = write("icon.svg", icon());
sizes["balloon.svg"] = write("balloon.svg", balloon());
sizes["og-sketch.svg"] = write("og-sketch.svg", ogSketch());
const data = {
  generator: "drawing.mjs",
  hero: hero.data,
  plate: {
    viewBox: [PL.W, PL.H],
    frame: PL.frame,
    layers: { "pl-1": "measure", "pl-2": "plan", "pl-3": "build", "pl-4": "solid" },
  },
  palette: PAL,
};
sizes["drawing-data.json"] = write("drawing-data.json", JSON.stringify(data, null, 2));
for (const [k, b] of Object.entries(sizes)) console.log(`${k.padEnd(24)} ${(b / 1024).toFixed(1)} KB`);
