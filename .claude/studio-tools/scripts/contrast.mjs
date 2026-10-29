#!/usr/bin/env node
// Contrast checker for studio color tokens (no dependencies).
//
// Reads a tokens.css / globals.css, collects `--color-*` values from `@theme`
// (light) and from the dark override block (`@media (prefers-color-scheme: dark)`,
// `[data-theme="dark"]` or `.dark`), converts OKLCH / hex / rgb to sRGB and reports
// the WCAG 2 contrast ratio and APCA Lc for each pair, in both schemes.
//
// Usage:
//   node .claude/studio-tools/scripts/contrast.mjs <tokens.css> [--pairs "ink:bg:4.5,accent:bg:3"]
//   node .claude/studio-tools/scripts/contrast.mjs --fg "oklch(0.2 0.02 60)" --bg "#fff"
//
// Extra pairs can also be declared inside the CSS as comments:
//   /* contrast: accent-ink/accent 4.5 */
// Exit code 1 if any required pair fails in either scheme.
import fs from "node:fs";
import { parseArgs } from "../lib/common.mjs";

// ---------- color math ----------------------------------------------------

function oklchToLinearSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toEncoded = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

function parseNumber(token, percentScale = 1) {
  token = token.trim();
  if (token === "none") return 0;
  if (token.endsWith("%")) return (parseFloat(token) / 100) * percentScale;
  if (token.endsWith("deg")) return parseFloat(token);
  return parseFloat(token);
}

// Returns { linear: [r,g,b], encoded: [r,g,b], inGamut, alpha } or null.
export function parseColor(value) {
  const v = value.trim().toLowerCase();
  let linear;
  let alpha = 1;
  let m;
  if ((m = v.match(/^oklch\(\s*([^)]+)\)$/))) {
    const [main, a] = m[1].split("/");
    const parts = main.trim().split(/[\s,]+/);
    if (parts.length < 3) return null;
    const L = parseNumber(parts[0], 1);
    const C = parts[1].endsWith("%") ? (parseFloat(parts[1]) / 100) * 0.4 : parseFloat(parts[1]);
    const H = parseNumber(parts[2]);
    if (a) alpha = parseNumber(a, 1);
    linear = oklchToLinearSrgb(L, C, H);
  } else if ((m = v.match(/^#([0-9a-f]{3,8})$/))) {
    let hex = m[1];
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join("");
    const enc = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    if (hex.length === 8) alpha = parseInt(hex.slice(6, 8), 16) / 255;
    linear = enc.map(toLinear);
  } else if ((m = v.match(/^rgba?\(\s*([^)]+)\)$/))) {
    const [main, a] = m[1].split("/");
    const parts = main.trim().split(/[\s,]+/);
    const enc = parts.slice(0, 3).map((p) => (p.endsWith("%") ? parseFloat(p) / 100 : parseFloat(p) / 255));
    if (a || parts[3]) alpha = parseNumber(a || parts[3], 1);
    linear = enc.map(toLinear);
  } else if (v === "white") {
    linear = [1, 1, 1];
  } else if (v === "black") {
    linear = [0, 0, 0];
  } else {
    return null;
  }
  const inGamut = linear.every((c) => c >= -0.0005 && c <= 1.0005);
  const lin = linear.map(clamp01);
  return { linear: lin, encoded: lin.map(toEncoded), inGamut, alpha };
}

export function wcagRatio(fg, bg) {
  const Y = (c) => 0.2126 * c.linear[0] + 0.7152 * c.linear[1] + 0.0722 * c.linear[2];
  const [hi, lo] = [Y(fg), Y(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// APCA-W3 0.0.98G-4g. Returns signed Lc (positive: dark text on light bg).
export function apcaLc(fg, bg) {
  const Ys = (c) => 0.2126729 * c.encoded[0] ** 2.4 + 0.7151522 * c.encoded[1] ** 2.4 + 0.072175 * c.encoded[2] ** 2.4;
  const blkThrs = 0.022;
  const blkClmp = 1.414;
  const clampBlack = (y) => (y > blkThrs ? y : y + (blkThrs - y) ** blkClmp);
  const txtY = clampBlack(Ys(fg));
  const bgY = clampBlack(Ys(bg));
  if (Math.abs(bgY - txtY) < 0.0005) return 0;
  let out;
  if (bgY > txtY) {
    const sapc = (bgY ** 0.56 - txtY ** 0.57) * 1.14;
    out = sapc < 0.1 ? 0 : sapc - 0.027;
  } else {
    const sapc = (bgY ** 0.65 - txtY ** 0.62) * 1.14;
    out = sapc > -0.1 ? 0 : sapc + 0.027;
  }
  return out * 100;
}

// ---------- CSS parsing ---------------------------------------------------

function blockAfter(css, index) {
  const open = css.indexOf("{", index);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return null;
}

function blocksMatching(css, regex) {
  const blocks = [];
  for (const m of css.matchAll(regex)) {
    const b = blockAfter(css, m.index);
    if (b) blocks.push(b);
  }
  return blocks;
}

function declarations(block) {
  const vars = {};
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of clean.matchAll(/--color-([\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

function resolve(vars, name, depth = 0) {
  const raw = vars[name];
  if (!raw || depth > 8) return raw;
  const ref = raw.match(/^var\(\s*--color-([\w-]+)\s*(?:,[^)]*)?\)$/);
  return ref ? resolve(vars, ref[1], depth + 1) : raw;
}

// ---------- main ----------------------------------------------------------

const args = parseArgs();
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "n/a");

if (args.fg && args.bg) {
  const fg = parseColor(String(args.fg));
  const bg = parseColor(String(args.bg));
  if (!fg || !bg) {
    console.error("Could not parse --fg or --bg");
    process.exit(1);
  }
  console.log(`WCAG ratio ${fmt(wcagRatio(fg, bg))}:1 · APCA Lc ${fmt(apcaLc(fg, bg), 1)}`);
  process.exit(0);
}

const file = process.argv.slice(2).find((a) => !a.startsWith("--") && a.endsWith(".css"));
if (!file) {
  console.error('Usage: contrast.mjs <tokens.css> [--pairs "fg:bg:min,..."]  |  contrast.mjs --fg <color> --bg <color>');
  process.exit(1);
}
const css = fs.readFileSync(file, "utf8");

const light = Object.assign({}, ...blocksMatching(css, /@theme\b[^{]*/g).map(declarations));
const darkBlocks = [
  ...blocksMatching(css, /@media[^{]*prefers-color-scheme\s*:\s*dark[^{]*/g),
  ...blocksMatching(css, /\[data-theme=["']?dark["']?\][^{]*/g),
  ...blocksMatching(css, /(^|[\s,}])\.dark\b[^{]*/g),
];
const dark = { ...light, ...Object.assign({}, ...darkBlocks.map(declarations)) };
const hasDark = darkBlocks.length > 0;

// [fg, bg, min, kind] — kind "text" (4.5), "large" / "ui" (3), "info" (never fails)
const defaults = [
  ["ink", "bg", 4.5, "text"],
  ["ink", "surface", 4.5, "text"],
  ["muted", "bg", 4.5, "text"],
  ["muted", "surface", 4.5, "text"],
  ["accent-ink", "accent", 4.5, "text"],
  ["accent", "bg", 3, "large/ui"],
  ["accent", "surface", 3, "large/ui"],
  ["line", "bg", 0, "info"],
];
const pairs = defaults.filter(([f, b]) => light[f] && light[b]);
for (const m of css.matchAll(/contrast:\s*([\w-]+)\s*\/\s*([\w-]+)\s*([\d.]+)/g)) pairs.push([m[1], m[2], Number(m[3]), "declared"]);
if (args.pairs && args.pairs !== true) {
  for (const spec of String(args.pairs).split(",")) {
    const [f, b, min] = spec.split(":");
    pairs.push([f.trim(), b.trim(), Number(min ?? 4.5), "cli"]);
  }
}

if (!pairs.length) {
  console.error("No color pairs found. Expected --color-ink / --color-bg style tokens inside @theme.");
  process.exit(1);
}

let failures = 0;
const warnings = [];
const rows = [];
for (const [schemeName, vars] of [["light", light], ...(hasDark ? [["dark", dark]] : [])]) {
  for (const [f, b, min, kind] of pairs) {
    const fv = resolve(vars, f);
    const bv = resolve(vars, b);
    const fc = fv && parseColor(fv);
    const bc = bv && parseColor(bv);
    if (!fc || !bc) {
      warnings.push(`${schemeName}: could not parse ${f} (${fv}) or ${b} (${bv})`);
      continue;
    }
    if (!fc.inGamut) warnings.push(`${schemeName}: --color-${f} ${fv} is outside sRGB and was clipped`);
    if (!bc.inGamut) warnings.push(`${schemeName}: --color-${b} ${bv} is outside sRGB and was clipped`);
    if (fc.alpha < 1 || bc.alpha < 1) warnings.push(`${schemeName}: ${f}/${b} uses alpha; contrast computed as if opaque`);
    const ratio = wcagRatio(fc, bc);
    const lc = apcaLc(fc, bc);
    const pass = kind === "info" || ratio >= min;
    if (!pass) failures++;
    rows.push({ scheme: schemeName, pair: `${f} on ${b}`, ratio, lc, min, kind, pass });
  }
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad("scheme", 7), pad("pair", 26), pad("WCAG", 9), pad("APCA Lc", 9), pad("needs", 10), "result");
for (const r of rows) {
  const needs = r.kind === "info" ? "info" : `${r.min}:1`;
  const result = r.kind === "info" ? "-" : r.pass ? "pass" : "FAIL";
  console.log(pad(r.scheme, 7), pad(r.pair, 26), pad(`${fmt(r.ratio)}:1`, 9), pad(fmt(Math.abs(r.lc), 1), 9), pad(needs, 10), result);
}
if (!hasDark) console.log("\nNote: no dark override block found; only the light scheme was checked.");
for (const w of warnings) console.log(`warning: ${w}`);
const bodyLc = rows.filter((r) => r.kind === "text" && Math.abs(r.lc) < 75).map((r) => `${r.scheme} ${r.pair}`);
if (bodyLc.length) console.log(`\nAPCA stretch goal (Lc ≥ 75 for body text) not met by: ${bodyLc.join(", ")}`);
console.log(failures ? `\n${failures} pair(s) FAIL` : "\nAll required pairs pass");
process.exit(failures ? 1 : 0);
