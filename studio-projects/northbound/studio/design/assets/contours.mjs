#!/usr/bin/env node
// Northbound · Direction A "Contour" — terrain generator.
//
// Computes the hero contour map, the Section A–A′ plan strip, the A–A′ elevation
// profile and the three mini route profiles from roast data. Dependency-free and
// deterministic: the same inputs always write byte-identical files.
//
//   node studio-projects/northbound/studio/design/assets/contours.mjs [--out <dir>]
//
// Output (default: this script's folder):
//   terrain-hero.svg     hero contour map, 1600×1000, static (the land is still)
//   section-strip.svg    the band of map along A–A′, straightened, 720 × ~74
//   profile-a.svg        batch 214's BT curve as the A–A′ elevation profile, 720×160
//   mini-<batch>.svg     one mini profile per current roast, same 720×160 axes
//   contours-data.json   positions for every HTML label/marker the Builder overlays
//
// The one rule that makes the concept true: ON THE SECTION LINE A–A′ THE TERRAIN
// HEIGHT EQUALS THE BEAN TEMPERATURE. Off the line, the curve fades (Gaussian, σ)
// into a background landscape. So the crossings of the contour lines along A–A′
// are exactly the times at which batch 214 passed each 4 °C level.
//
// Parameters, inputs and how the Builder uses each file: README.md in this folder.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────── inputs ─────────────────────────

// Batch 214 (decisions.md #4). t in seconds, T = bean temperature (BT) in °C.
// CHARGE 200 °C is the probe reading at charge (proposed demo value, see README).
const BATCH_214 = {
  batch: 214,
  events: [
    { code: "CHARGE", t: 0, T: 200 },
    { code: "TP", t: 65, T: 88 },
    { code: "DE", t: 270, T: 152 },
    { code: "FC", t: 530, T: 196 },
    { code: "DROP", t: 640, T: 207 },
  ],
};

// The three current roasts (mini profiles share one axis). Batch 214 is logged;
// 212 and 213 are PROPOSED demo values — edit here and re-run if copy differs.
const ROASTS = [
  { batch: 212, origin: "Nyeri, Kenya", events: [[0, 198], [62, 87], [265, 151], [520, 194], [610, 203]] },
  { batch: 213, origin: "Huila, Colombia", events: [[0, 202], [68, 89], [280, 153], [545, 197], [680, 212]] },
  { batch: 214, origin: "Guji, Ethiopia", events: BATCH_214.events.map((e) => [e.t, e.T]) },
];

// Shape knots between CHARGE and TP (probe recovery after the beans drop in).
// Only the fall is shaped; every point from TP onward is a logged event.
const FALL_SHAPE = [
  [0.0, 1.0],
  [0.185, 0.625],
  [0.43, 0.268],
  [0.69, 0.081],
  [1.0, 0.0],
]; // [fraction of TP time, fraction of (CHARGE − TP)]

const T_END = 720; // section length in seconds: roast to 10:40, then 1:20 of tray cooling
const COOL = { ambient: 30, tau: 110 }; // cooling: T = ambient + (Tdrop − ambient)·e^(−(t−tdrop)/tau)

// Hero map geometry (viewBox units).
const W = 1600;
const H = 1000;
const A = [96, 870]; // section start (CHARGE)
const A2 = [1270, 700]; // section end A′ (12:00); DROP lands at (1140, 719) = 71% / 72%
const SIGMA = 56; // half-width of the ridge that carries the curve
const WARP = 34; // seconds of domain warp off the line (0 on the line)
const SEED = 214;
const GRID = 6; // marching-squares cell size (units)
const LEVEL_MIN = 64;
const LEVEL_MAX = 204;
const LEVEL_STEP = 4; // °C between contours
const INDEX_STEP = 20; // every 5th line is an index line, labelled
const CLEARING = { cx: 470, cy: 400, rx: 520, ry: 300, floor: 66 }; // headline clearing

// Background landscape (°C-equivalent heights). Gaussian hills: [x, y, radius, height].
const BASE = 70;
const BASE_NOISE = 15;
const HILLS = [
  [1000, 735, 170, 120], // summit massif: DROP sits on its east shoulder, so the summit is a true peak
  [1520, 170, 220, 74], // north-east spur (behind the route card)
  [870, 70, 210, 46], // north ridge
  [360, 1000, 170, 22], // south-west knoll
  [1560, 930, 180, 40], // south-east shoulder
];

// Profile y-domain (°C) shared by profile-a.svg and every mini-*.svg.
const Y_TOP = 220;
const Y_BOTTOM = 60;

// ───────────────────────── helpers ─────────────────────────

const here = path.dirname(fileURLToPath(import.meta.url));
const outIdx = process.argv.indexOf("--out");
const OUT = outIdx > -1 ? path.resolve(process.argv[outIdx + 1]) : here;
fs.mkdirSync(OUT, { recursive: true });

const r1 = (n) => {
  const v = Math.round(n * 10) / 10;
  return Object.is(v, -0) ? 0 : v;
};
const pct = (n) => Math.round(n * 1000) / 10; // 0..1 → percentage with 1 decimal
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (x) => x * x * (3 - 2 * x);

// mulberry32
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded value noise on a 64×64 lattice, fbm of 3 octaves, range ≈ [−1, 1].
const LAT = 64;
const lattice = (() => {
  const r = rng(SEED);
  return Array.from({ length: LAT * LAT }, () => r() * 2 - 1);
})();
function vnoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = smooth(x - xi);
  const fy = smooth(y - yi);
  const g = (i, j) => lattice[(((j % LAT) + LAT) % LAT) * LAT + (((i % LAT) + LAT) % LAT)];
  const a = g(xi, yi) + (g(xi + 1, yi) - g(xi, yi)) * fx;
  const b = g(xi, yi + 1) + (g(xi + 1, yi + 1) - g(xi, yi + 1)) * fx;
  return a + (b - a) * fy;
}
function fbm(x, y) {
  return (vnoise(x, y) * 0.6 + vnoise(x * 2.03 + 17, y * 2.03 + 5) * 0.28 + vnoise(x * 4.1 + 41, y * 4.1 + 23) * 0.12) / 0.75;
}

// Monotone cubic (Fritsch–Carlson) through knots [[x, y], …].
function monotone(knots, endSlope) {
  const n = knots.length;
  const xs = knots.map((k) => k[0]);
  const ys = knots.map((k) => k[1]);
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m = new Array(n);
  m[0] = d[0];
  m[n - 1] = endSlope ?? d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * (xs[i + 1] - xs[i]) + (xs[i] - xs[i - 1]);
      const w2 = (xs[i + 1] - xs[i]) + 2 * (xs[i] - xs[i - 1]);
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const s = (x - xs[i]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1;
    const h10 = s ** 3 - 2 * s ** 2 + s;
    const h01 = -2 * s ** 3 + 3 * s ** 2;
    const h11 = s ** 3 - s ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

// Build a BT(t) function for a roast from its 5 events, plus tray cooling to T_END.
function roastCurve(ev) {
  const [[, tc], [ttp, Ttp], ...rise] = ev;
  const fall = FALL_SHAPE.map(([ft, fT]) => [ft * ttp, Ttp + fT * (tc - Ttp)]);
  const knots = [...fall, ...rise];
  const [tdrop, Tdrop] = ev[ev.length - 1];
  const lastSlope = (Tdrop - ev[ev.length - 2][1]) / (tdrop - ev[ev.length - 2][0]);
  const f = monotone(knots, lastSlope);
  const bt = (t) => (t <= tdrop ? f(t) : COOL.ambient + (Tdrop - COOL.ambient) * Math.exp(-(t - tdrop) / COOL.tau));
  return { bt, tdrop, Tdrop };
}

const main = roastCurve(BATCH_214.events.map((e) => [e.t, e.T]));
const BT = main.bt;

// ───────────────────────── the field ─────────────────────────

const AX = A2[0] - A[0];
const AY = A2[1] - A[1];
const LEN = Math.hypot(AX, AY);
const UX = AX / LEN;
const UY = AY / LEN;
// Normal pointing "up the screen" (towards smaller y).
const NX = UY;
const NY = -UX;
const lineAt = (t) => [A[0] + (AX * t) / T_END, A[1] + (AY * t) / T_END];

function background(x, y) {
  let f = BASE + BASE_NOISE * fbm(x / 260, y / 260);
  for (const [hx, hy, r, h] of HILLS) f += h * Math.exp(-((x - hx) ** 2 + (y - hy) ** 2) / (2 * r * r));
  // the clearing: flatten to a meadow that sits between two contour levels
  const e = Math.hypot((x - CLEARING.cx) / CLEARING.rx, (y - CLEARING.cy) / CLEARING.ry);
  const c = e < 1 ? 1 : e > 1.35 ? 0 : 1 - smooth((e - 1) / 0.35);
  return f + (CLEARING.floor - f) * c;
}

function height(x, y) {
  const px = x - A[0];
  const py = y - A[1];
  const along = px * UX + py * UY;
  const s = clamp(along / LEN, 0, 1);
  const cx = A[0] + AX * s;
  const cy = A[1] + AY * s;
  const d = Math.hypot(x - cx, y - cy);
  const w = Math.exp(-((d / SIGMA) ** 2));
  const warp = WARP * Math.min(d / SIGMA, 2.5) * fbm(x / 140 + 9, y / 140 + 3);
  const t = clamp(s * T_END + warp, 0, T_END);
  return w * BT(t) + (1 - w) * background(x, y);
}

// ───────────────────────── marching squares ─────────────────────────

function sampleGrid(nx, ny, fn) {
  const g = new Float64Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) g[j * (nx + 1) + i] = fn(i, j);
  return g;
}

// Returns polylines [{pts:[[x,y]…], closed}] in grid coordinates.
function isolines(g, nx, ny, level) {
  const v = (i, j) => g[j * (nx + 1) + i];
  const segs = [];
  const lerp = (a, b) => (level - a) / (b - a);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = v(i, j); // tl
      const b = v(i + 1, j); // tr
      const c = v(i + 1, j + 1); // br
      const d = v(i, j + 1); // bl
      const idx = (a >= level ? 8 : 0) | (b >= level ? 4 : 0) | (c >= level ? 2 : 0) | (d >= level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T = { k: `h${i},${j}`, p: [i + lerp(a, b), j] };
      const R = { k: `v${i + 1},${j}`, p: [i + 1, j + lerp(b, c)] };
      const B = { k: `h${i},${j + 1}`, p: [i + lerp(d, c), j + 1] };
      const L = { k: `v${i},${j}`, p: [i, j + lerp(a, d)] };
      const centre = (a + b + c + d) / 4 >= level;
      const table = {
        1: [[L, B]], 2: [[B, R]], 3: [[L, R]], 4: [[T, R]],
        5: centre ? [[T, L], [B, R]] : [[T, R], [L, B]],
        6: [[T, B]], 7: [[T, L]], 8: [[T, L]], 9: [[T, B]],
        10: centre ? [[T, R], [L, B]] : [[T, L], [B, R]],
        11: [[T, R]], 12: [[L, R]], 13: [[B, R]], 14: [[L, B]],
      };
      for (const s of table[idx]) segs.push(s);
    }
  }
  // link segments by shared edge keys
  const byKey = new Map();
  segs.forEach((s, n) => {
    for (const e of s) {
      if (!byKey.has(e.k)) byKey.set(e.k, []);
      byKey.get(e.k).push(n);
    }
  });
  const used = new Uint8Array(segs.length);
  const lines = [];
  for (let n = 0; n < segs.length; n++) {
    if (used[n]) continue;
    used[n] = 1;
    const chain = [segs[n][0], segs[n][1]];
    const extend = (atEnd) => {
      for (;;) {
        const tip = atEnd ? chain[chain.length - 1] : chain[0];
        const next = (byKey.get(tip.k) || []).find((m) => !used[m]);
        if (next === undefined) return;
        used[next] = 1;
        const [p, q] = segs[next];
        const add = p.k === tip.k ? q : p;
        if (atEnd) chain.push(add);
        else chain.unshift(add);
      }
    };
    extend(true);
    extend(false);
    const closed = chain.length > 3 && chain[0].k === chain[chain.length - 1].k;
    if (closed) chain.pop();
    lines.push({ pts: chain.map((e) => e.p), closed });
  }
  return lines;
}

function chaikin(pts, closed) {
  if (pts.length < 3) return pts;
  const out = closed ? [] : [pts[0]];
  const n = pts.length;
  const lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    out.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]]);
    out.push([0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax;
    const dy = by - ay;
    const l = Math.hypot(dx, dy) || 1e-9;
    let worst = -1;
    let wd = 0;
    for (let i = a + 1; i < b; i++) {
      const dd = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / l;
      if (dd > wd) {
        wd = dd;
        worst = i;
      }
    }
    if (wd > tol) {
      keep[worst] = 1;
      stack.push([a, worst], [worst, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const polyLength = (pts, closed) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  if (closed) L += Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]);
  return L;
};

function toPath(pts, closed) {
  let s = `M${r1(pts[0][0])} ${r1(pts[0][1])}l`;
  let [px, py] = [r1(pts[0][0]), r1(pts[0][1])];
  const parts = [];
  for (let i = 1; i < pts.length; i++) {
    const x = r1(pts[i][0]);
    const y = r1(pts[i][1]);
    const dx = r1(x - px);
    const dy = r1(y - py);
    if (dx === 0 && dy === 0) continue;
    parts.push(`${dx} ${dy}`.replace(/ -/g, "-"));
    px = x;
    py = y;
  }
  s += parts.join(" ").replace(/ -/g, "-");
  return s + (closed ? "z" : "");
}

// Cut a gap of half-width g (arc length) around arc position s; returns open polylines.
function cutGap(pts, closed, s, g) {
  const ring = closed ? [...pts, pts[0]] : pts;
  const cum = [0];
  for (let i = 1; i < ring.length; i++) cum.push(cum[i - 1] + Math.hypot(ring[i][0] - ring[i - 1][0], ring[i][1] - ring[i - 1][1]));
  const L = cum.at(-1);
  const at = (u) => {
    u = closed ? ((u % L) + L) % L : clamp(u, 0, L);
    let i = 1;
    while (i < cum.length - 1 && cum[i] < u) i++;
    const f = (u - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    return [ring[i - 1][0] + (ring[i][0] - ring[i - 1][0]) * f, ring[i - 1][1] + (ring[i][1] - ring[i - 1][1]) * f];
  };
  const slice = (u0, u1) => {
    // u0 < u1; u1 may exceed L for a closed ring (wraps past the seam)
    const out = [at(u0)];
    for (let i = 0; i < ring.length; i++) if (cum[i] > u0 && cum[i] < Math.min(u1, L)) out.push(ring[i]);
    if (u1 > L) for (let i = 1; i < ring.length; i++) if (cum[i] + L < u1) out.push(ring[i]);
    out.push(at(u1));
    return out;
  };
  if (closed) return [slice(s + g, s - g + L)];
  const parts = [];
  if (s - g > 4) parts.push(slice(0, s - g));
  if (L - (s + g) > 4) parts.push(slice(s + g, L));
  return parts;
}

// ───────────────────────── hero terrain ─────────────────────────

const levels = [];
for (let L = LEVEL_MIN; L <= LEVEL_MAX; L += LEVEL_STEP) levels.push(L);

const nx = Math.ceil(W / GRID);
const ny = Math.ceil(H / GRID);
const field = sampleGrid(nx, ny, (i, j) => height(i * GRID, j * GRID));

// Zones where index labels may not sit: the clearing, the route card, the section line.
const LABEL_KEEP_OUT = [
  (x, y) => Math.hypot((x - CLEARING.cx) / (CLEARING.rx * 1.12), (y - CLEARING.cy) / (CLEARING.ry * 1.12)) < 1,
  (x, y) => x > 1110 && y < 520, // route card (cols 10–12, upper half)
  (x, y) => x < 70 || x > W - 70 || y < 120 || y > H - 50, // edges and nav band
];
const distToLine = (x, y) => {
  const s = clamp(((x - A[0]) * UX + (y - A[1]) * UY) / LEN, 0, 1);
  return Math.hypot(x - (A[0] + AX * s), y - (A[1] + AY * s));
};

const minorPaths = [];
const indexPaths = [];
const labels = [];
for (const level of levels) {
  const isIndex = level % INDEX_STEP === 0;
  const raw = isolines(field, nx, ny, level);
  for (const line of raw) {
    let pts = line.pts.map(([i, j]) => [i * GRID, j * GRID]);
    const len = polyLength(pts, line.closed);
    if (len < (line.closed ? 70 : 30)) continue; // drop specks
    pts = simplify(chaikin(chaikin(pts, line.closed), line.closed), 0.55);
    let pieces = [{ pts, closed: line.closed }];
    if (isIndex && len > 220 && labels.length < 12) {
      // try a few positions along the line for a label
      const ring = line.closed ? [...pts, pts[0]] : pts;
      const cum = [0];
      for (let i = 1; i < ring.length; i++) cum.push(cum[i - 1] + Math.hypot(ring[i][0] - ring[i - 1][0], ring[i][1] - ring[i - 1][1]));
      const L = cum.at(-1);
      for (const f of [0.5, 0.3, 0.7, 0.15, 0.85]) {
        const s = f * L;
        let i = 1;
        while (i < cum.length - 1 && cum[i] < s) i++;
        const [x, y] = ring[i];
        if (LABEL_KEEP_OUT.some((k) => k(x, y))) continue;
        if (distToLine(x, y) < 70) continue;
        if (labels.some((l) => Math.hypot(l.x - x, l.y - y) < 190)) continue;
        const a = ring[Math.max(0, i - 3)];
        const b = ring[Math.min(ring.length - 1, i + 3)];
        let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        if (ang > 90) ang -= 180;
        if (ang < -90) ang += 180;
        labels.push({ x, y, ang, text: `${level}°` });
        pieces = cutGap(pts, line.closed, cum[i], 17).map((p) => ({ pts: p, closed: false }));
        break;
      }
    }
    for (const p of pieces) (isIndex ? indexPaths : minorPaths).push(toPath(p.pts, p.closed));
  }
}

// spot heights along the line (markers in the SVG, labels in HTML)
const spot = (code, t) => {
  const [x, y] = lineAt(t);
  return { code, t, T: Math.round(BT(t)), x: r1(x), y: r1(y), left: pct(x / W), top: pct(y / H) };
};
const heroSpots = [spot("TP", 65), spot("DE", 270), spot("FC", 530), spot("DROP", 640)];

const style = `
.nb-c{fill:none;stroke:var(--color-contour-minor,#ddb499);stroke-width:.75;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.nb-i{fill:none;stroke:var(--color-contour-index,#ae5528);stroke-width:1.25;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.nb-l{fill:var(--color-contour-index,#ae5528);font:500 11px var(--font-text,Archivo,sans-serif);font-stretch:75%;letter-spacing:.02em;font-variant-numeric:tabular-nums}
.nb-sec{fill:none;stroke:var(--color-ink,#2b221a);stroke-width:1.25;stroke-dasharray:7 5;vector-effect:non-scaling-stroke}
.nb-end{fill:none;stroke:var(--color-ink,#2b221a);stroke-width:1.25;vector-effect:non-scaling-stroke}
.nb-spot{fill:var(--color-ink,#2b221a)}
.nb-summit{fill:var(--color-accent,#ae5528)}`.trim();

const secPath = `M${A[0]} ${A[1]}L${A2[0]} ${A2[1]}`;
// end ticks: short perpendiculars at A and A′
const tick = ([x, y]) => `M${r1(x - NX * 9)} ${r1(y - NY * 9)}l${r1(NX * 18)} ${r1(NY * 18)}`;
const spotMarks = heroSpots
  .filter((s) => s.code !== "DROP")
  .map((s) => `<circle class="nb-spot" cx="${s.x}" cy="${s.y}" r="2.6"/>`)
  .join("");
const drop = heroSpots.find((s) => s.code === "DROP");
const summit = `<path class="nb-summit" d="M${drop.x} ${r1(drop.y - 7)}l6.5 11h-13z"/>`;

const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<style>${style}</style>
<g id="nb-terrain"><g id="nb-minor">${minorPaths.map((d) => `<path class="nb-c" d="${d}"/>`).join("")}</g>
<g id="nb-index">${indexPaths.map((d) => `<path class="nb-i" d="${d}"/>`).join("")}</g>
<g id="nb-index-labels">${labels.map((l) => `<text class="nb-l" x="${r1(l.x)}" y="${r1(l.y)}" text-anchor="middle" dominant-baseline="central" transform="rotate(${r1(l.ang)} ${r1(l.x)} ${r1(l.y)})">${l.text}</text>`).join("")}</g></g>
<g id="nb-section"><path class="nb-sec" d="${secPath}"/><path class="nb-end" d="${tick(A)}${tick(A2).replace("M", "M")}"/></g>
<g id="nb-spots">${spotMarks}${summit}</g>
</svg>
`;

// ───────────────────────── section strip (plan view along A–A′) ─────────────────────────

const V = 60; // half-width of the band, hero units
const STRIP_H = r1((720 * 2 * V) / LEN); // natural height so the strip is undistorted at its natural aspect
const su = Math.ceil(LEN / 5);
const sv = Math.ceil((2 * V) / 5);
const stripField = sampleGrid(su, sv, (i, j) => {
  const u = (i / su) * LEN;
  const v = V - (j / sv) * 2 * V; // j=0 → +V (up the screen)
  return height(A[0] + UX * u + NX * v, A[1] + UY * u + NY * v);
});
const stripMinor = [];
const stripIndex = [];
for (const level of levels) {
  for (const line of isolines(stripField, su, sv, level)) {
    let pts = line.pts.map(([i, j]) => [(i / su) * 720, (j / sv) * STRIP_H]);
    if (polyLength(pts, line.closed) < 6) continue;
    pts = simplify(chaikin(pts, line.closed), 0.35);
    (level % INDEX_STEP === 0 ? stripIndex : stripMinor).push(toPath(pts, line.closed));
  }
}
const stripSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 ${STRIP_H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<style>${style}</style>
<g id="nb-strip-terrain">${stripMinor.map((d) => `<path class="nb-c" d="${d}"/>`).join("")}${stripIndex.map((d) => `<path class="nb-i" d="${d}"/>`).join("")}</g>
<path id="nb-strip-line" class="nb-sec" d="M0 ${r1(STRIP_H / 2)}H720"/>
</svg>
`;

// contour crossings along the line (= times BT passes each level)
const crossings = [];
for (let t = 0; t < T_END; t += 0.25) {
  const a = BT(t);
  const b = BT(t + 0.25);
  for (const level of levels) {
    if ((a - level) * (b - level) < 0) {
      const tc = t + (0.25 * (level - a)) / (b - a);
      crossings.push({ t: r1(tc), T: level, index: level % INDEX_STEP === 0, left: pct(tc / T_END) });
    }
  }
}

// ───────────────────────── profile + minis ─────────────────────────

const py = (T) => r1(Y_TOP - T);
const PH = Y_TOP - Y_BOTTOM;

function curvePath(bt, t0, t1, step) {
  const pts = [];
  for (let t = t0; t <= t1 + 1e-9; t += step) pts.push([t, Y_TOP - bt(t)]);
  if (pts.at(-1)[0] !== t1) pts.push([t1, Y_TOP - bt(t1)]);
  return toPath(simplify(pts, 0.05), false);
}

const profStyle = `
.nb-grid{stroke:var(--color-line,#dbd3c8);stroke-width:1;vector-effect:non-scaling-stroke}
.nb-rule{stroke:var(--color-muted,#645850);stroke-width:1;stroke-dasharray:2 4;vector-effect:non-scaling-stroke}
.nb-ground{fill:var(--color-ground,#f2e8db)}
.nb-roast{fill:none;stroke:var(--color-accent,#ae5528);stroke-width:2.25;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
.nb-cool{fill:none;stroke:var(--color-lake,#3c7d9a);stroke-width:2;stroke-dasharray:6 5;vector-effect:non-scaling-stroke}`.trim();

const groundPts = [];
for (let t = 0; t <= T_END; t += 2) groundPts.push([t, Y_TOP - BT(t)]);
const groundD = toPath(simplify([[0, PH], ...groundPts, [T_END, PH]], 0.05), true);
const gridD = [];
for (let T = 80; T <= 200; T += 20) gridD.push(`M0 ${py(T)}H720`);

const [, , de, fc, dr] = BATCH_214.events;
const profileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 ${PH}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<style>${profStyle}</style>
<path id="nb-ground" class="nb-ground" d="${groundD}"/>
<path id="nb-grid" class="nb-grid" d="${gridD.join("")}"/>
<path id="nb-phase-rules" class="nb-rule" d="M${de.t} 0V${PH}M${fc.t} 0V${PH}M${dr.t} 0V${PH}"/>
<path id="nb-roast" class="nb-roast" d="${curvePath(BT, 0, main.tdrop, 2)}"/>
<path id="nb-cooling" class="nb-cool" d="${curvePath(BT, main.tdrop, T_END, 4)}"/>
</svg>
`;

const minis = ROASTS.map((r) => {
  const c = roastCurve(r.events);
  const [tdrop, Tdrop] = r.events.at(-1);
  const [tfc] = r.events[3];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 ${PH}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<style>${profStyle}</style>
<path class="nb-roast" d="${curvePath(c.bt, 0, tdrop, 4)}"/>
</svg>
`;
  return {
    batch: r.batch,
    origin: r.origin,
    file: `mini-${r.batch}.svg`,
    svg,
    drop: { t: tdrop, T: Tdrop, left: pct(tdrop / T_END), top: pct((Y_TOP - Tdrop) / PH) },
    fc: { t: tfc, T: r.events[3][1] },
    dtr: Math.round(((tdrop - tfc) / tdrop) * 1000) / 10,
  };
});

// ───────────────────────── data for the Builder ─────────────────────────

const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;
const ev = BATCH_214.events.map((e) => ({
  code: e.code,
  t: e.t,
  time: mmss(e.t),
  T: e.T,
  left: pct(e.t / T_END),
  top: pct((Y_TOP - e.T) / PH),
}));
const bt = [];
for (let t = 0; t <= T_END; t++) bt.push(r1(BT(t)));

const data = {
  generatedBy: "contours.mjs",
  seed: SEED,
  note: "All `left`/`top` values are percentages of the element box the SVG fills. Profile/strip/minis: x = t / 720 s; profile y = (220 − T) / 160.",
  hero: {
    viewBox: [W, H],
    sectionLine: {
      A: { left: pct(A[0] / W), top: pct(A[1] / H) },
      A2: { left: pct(A2[0] / W), top: pct(A2[1] / H) },
      angleDeg: r1((Math.atan2(AY, AX) * 180) / Math.PI),
    },
    spots: heroSpots.map(({ code, t, T, left, top }) => ({ code, t, T, left, top })),
    clearing: { left: pct(CLEARING.cx / W), top: pct(CLEARING.cy / H), rx: pct(CLEARING.rx / W), ry: pct(CLEARING.ry / H) },
    indexLabels: labels.length,
  },
  strip: { viewBox: [720, STRIP_H], crossings },
  profile: {
    viewBox: [720, PH],
    xDomain: [0, T_END],
    yDomain: [Y_BOTTOM, Y_TOP],
    gridlines: [80, 100, 120, 140, 160, 180, 200],
    events: ev,
    phases: [
      { id: "drying", from: 0, to: de.t, duration: mmss(de.t), pct: Math.round((de.t / dr.t) * 100) },
      { id: "maillard", from: de.t, to: fc.t, duration: mmss(fc.t - de.t), pct: Math.round(((fc.t - de.t) / dr.t) * 100) },
      { id: "development", from: fc.t, to: dr.t, duration: mmss(dr.t - fc.t), pct: Math.round(((dr.t - fc.t) / dr.t) * 100) },
      { id: "cooling", from: dr.t, to: T_END, duration: mmss(T_END - dr.t), pct: null },
    ],
    btPerSecond: bt,
  },
  minis: minis.map(({ svg, ...m }) => m),
};

// ───────────────────────── write ─────────────────────────

const files = {
  "terrain-hero.svg": heroSvg,
  "section-strip.svg": stripSvg,
  "profile-a.svg": profileSvg,
  "contours-data.json": JSON.stringify(data, null, 1) + "\n",
};
for (const m of minis) files[m.file] = m.svg;
let total = 0;
for (const [name, body] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), body);
  const kb = Buffer.byteLength(body) / 1024;
  if (name.endsWith(".svg")) total += kb;
  console.log(`${name.padEnd(20)} ${kb.toFixed(1).padStart(6)} KB`);
}
console.log(`SVG total            ${total.toFixed(1).padStart(6)} KB · ${minorPaths.length + indexPaths.length} hero paths · ${labels.length} index labels · ${crossings.length} crossings`);
