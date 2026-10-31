# Assets · Agkbuilds "Working Drawing"

Every visual on the page is type, CSS, or one of these files. No photography, no icons, no raster images.

| File | Size | What it is | Where it goes |
|---|---|---|---|
| `drawing.mjs` | — | Generator (Node ≥ 18, no dependencies, deterministic) | stays here; the Builder copies its **outputs** |
| `hero-construction.svg` | 3.1 KB | Construction set piece: outer + inner construction circles, dash-dot centre lines, 36 protractor ticks, radius with arrowhead, orange datum dot, two tangent construction lines, elbowed leader. viewBox 600×600 | `hero`, inlined in `div.hc` |
| `process-plate.svg` | 5.3 KB | The method plate in 4 cumulative layers (`#pl-1` measure · `#pl-2` plan · `#pl-3` build · `#pl-4` solid). viewBox 640×480 | `process` (lg+), inlined in the sticky figure |
| `process-step-1.svg` … `-4.svg` | 1.1 / 2.1 / 5.1 / 5.4 KB | The same plate frozen at step n, with light and dark colours embedded (`@media (prefers-color-scheme: dark)`) | `process` (sm/md), as `<img>` from `/public/drawings/`, `loading="lazy"` |
| `balloon.svg` | 0.3 KB | Parts-list item balloon (one circle, `currentColor`); numeral is HTML on top | `build`, inlined per row |
| `icon.svg` | 0.3 KB | Favicon: paper "A" (geometry, no font) over an orange dimension bracket on a graphite tile | `src/app/icon.svg` |
| `og-sketch.svg` | 4.2 KB | Target look for the 1200×630 Open Graph image (rendered by `next/og`, not shipped) | reference only |
| `drawing-data.json` | 1.4 KB | Anchor points for HTML laid over drawings (hero leader end for `hero.drawing_label`), plate layer names, the palette in hex | read by the Builder |

Inline SVG on the page: ≈ 9.4 KB (+0.3 KB per balloon), before compression.

## Run it
```bash
node studio-projects/agkbuilds/studio/design/assets/drawing.mjs            # writes next to the script
node studio-projects/agkbuilds/studio/design/assets/drawing.mjs --out /tmp/x
```
Running it twice gives byte-identical files (verified with `md5sum`): there is no randomness, numbers are rounded to 2 decimals, and the attribute order is fixed. It reads `../tokens.css` to embed hex colours in the `<img>` SVGs and the favicon, so **re-run it whenever a colour token changes**, then commit the outputs.

## Geometry (all fixed in the script)
| Constant | Value | Effect |
|---|---|---|
| `HC.rOuter` / `HC.rInner` | 236 / 92 (of 600) | Outer circle diameter 472 = 78.67 % of the box. With the box at `width: 4.25em` of the hero size and `top: -0.382em`, the outer circle is tangent to line 1's cap line and line 4's baseline (3.343 em apart). |
| `HC.tickEvery` | 10° (major every 30°: 22 units long, minor 10) | protractor scale |
| `HC.radiusDeg` / `HC.leaderDeg` | −38° / 52° | radius up-right; leader leaves down-right, 54 units out, then runs horizontally to x 592 (`leaderEnd` 98.67 % / 88.09 %) |
| Pen start | 160° on both circles | the circles draw from lower-left, clockwise, toward the headline |
| `PL.frame` | 60, 50, 520 × 380 | plate boundary; dimension lines 24–26 units outside it |
| `PL.modules` | 5 rectangles + disc (506, 318, r 50) | the planned layout; hatching (45°, gap 11) on two modules, clipped analytically (no `clipPath`) |
| `PL.fillInset` | 7 | solids sit 7 units inside the built outlines, so the outline and hatching stay visible as a crisp edge |

## How the Builder uses the files
- **Inline** `hero-construction.svg`, `process-plate.svg` and `balloon.svg` (server components that read the file at build time, or paste into TSX). They reference `--color-draft`, `--color-muted`, `--color-accent`, `--color-ink` with dark-scheme hex fallbacks, so they follow the scheme. As `<img>` they would lose the theme.
- Every SVG has `aria-hidden="true"` and `focusable="false"`; they carry no information that isn't in the HTML.
- All strokes are `vector-effect: non-scaling-stroke`, 1 px (plate "built" layer 1.75 px), at any rendered size.
- **Draw-on hooks:** every path meant to draw has `pathLength="1"`. Set `stroke-dasharray: 1 1` and animate `stroke-dashoffset: 1 → 0` (`motion.md`). Dash-dot centre lines (`#hc-centre`) and dotted tangents keep their own dash pattern and are revealed with `transform: scale()` / `clip-path` instead.
- Hooks: `#hc-centre`, `#hc-tangents`, `#hc-circles` (`#hc-outer`, `#hc-inner`), `#hc-ticks`, `#hc-radius`, `#hc-leader`; `#pl-1` … `#pl-4` (`.pl-construction`, `.pl-hatch`, `.pl-heads`, `.pl-nodes` inside).
- The embedded `<style>` blocks use prefixed classes (`.agk-hc`, `.agk-plate`, `.agk-balloon`), so inlining doesn't leak.

## Open Graph image (1200 × 630)
`src/app/opengraph-image.tsx` with `export const dynamic = "force-static"`, layout per `og-sketch.svg`:
- Ground graphite `#101419`; 13 column hairlines in `--color-grid` (`#1b2128`) on a 64 px margin / 20 px gutter grid.
- Cap and baseline rules (`#353e47`) across the full width for each headline row.
- Headline: `hero.headline` in Archivo wdth 125 / 800, 92 px, line-height 0.88, tracking −0.01em, uppercase, from x 64, first row top 150; lines 1–3 paper `#f0eeea`, line 4 orange `#fd7933`.
- The construction set piece at `translate(830, 60) scale(0.72)`, cropped by the right edge.
- Top row, 15 px JetBrains Mono 500, tracking 0.06em, pencil `#aeb5bd`: "AGK — BUILDS" at left, "SHEET 01 / 04" at right (x 1136, right-aligned).
- Dimension line 34 px under the headline with end ticks and `hero.fig_label` knocked out of it.
- Satori needs TTF/OTF, not woff2: fetch the two static instances as TTF at build time (Google css2 without a browser UA returns TTF) or commit them under `src/app/og/`.
