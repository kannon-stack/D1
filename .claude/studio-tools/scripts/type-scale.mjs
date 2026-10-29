#!/usr/bin/env node
// Fluid type scale generator. Prints Tailwind v4 `--text-*` theme variables
// (with paired `--line-height` and `--letter-spacing`) whose sizes interpolate
// with clamp() between a small and a large viewport.
//
// Usage:
//   node .claude/studio-tools/scripts/type-scale.mjs
//     [--base 16:18]        base size in px at min:max viewport
//     [--ratio 1.2:1.333]   scale ratio at min:max viewport
//     [--viewports 360:1440]
//     [--steps xs:-2,sm:-1,base:0,lg:1,xl:2,2xl:3,3xl:4,4xl:5,5xl:6,6xl:7]
import { parseArgs } from "../lib/common.mjs";

const args = parseArgs();
const pair = (v, fallback) => {
  const [a, b] = String(v ?? fallback).split(":").map(Number);
  return [a, b ?? a];
};
const [baseMin, baseMax] = pair(args.base, "16:18");
const [ratioMin, ratioMax] = pair(args.ratio, "1.2:1.333");
const [vwMin, vwMax] = pair(args.viewports, "360:1440");
const steps = String(args.steps ?? "xs:-2,sm:-1,base:0,lg:1,xl:2,2xl:3,3xl:4,4xl:5,5xl:6,6xl:7")
  .split(",")
  .map((s) => {
    const [name, step] = s.split(":");
    return [name.trim(), Number(step)];
  });

const rem = (px) => `${+(px / 16).toFixed(4)}rem`;

// Tighter leading and tracking as size grows; display sizes get negative tracking.
function leading(px) {
  if (px <= 18) return 1.6;
  if (px <= 24) return 1.45;
  if (px <= 36) return 1.25;
  if (px <= 56) return 1.1;
  return 1.0;
}
function tracking(px) {
  if (px <= 14) return "0.01em";
  if (px <= 24) return "0";
  if (px <= 48) return "-0.015em";
  if (px <= 80) return "-0.025em";
  return "-0.035em";
}

const lines = ["@theme {", `  /* fluid scale: ${baseMin}→${baseMax}px base, ratio ${ratioMin}→${ratioMax}, viewport ${vwMin}→${vwMax}px */`];
for (const [name, step] of steps) {
  // Below-base steps keep the small ratio at both ends, so caption sizes grow
  // with the base instead of shrinking on large screens.
  const min = baseMin * ratioMin ** step;
  const max = baseMax * (step < 0 ? ratioMin : ratioMax) ** step;
  const slope = (max - min) / (vwMax - vwMin);
  const intercept = min - slope * vwMin;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const value =
    Math.abs(max - min) < 0.01
      ? rem(min)
      : `clamp(${rem(lo)}, ${rem(intercept)} + ${+(slope * 100).toFixed(4)}vw, ${rem(hi)})`;
  lines.push(`  --text-${name}: ${value}; /* ${min.toFixed(1)}px → ${max.toFixed(1)}px */`);
  lines.push(`  --text-${name}--line-height: ${leading(max)};`);
  lines.push(`  --text-${name}--letter-spacing: ${tracking(max)};`);
}
lines.push("}");
console.log(lines.join("\n"));
