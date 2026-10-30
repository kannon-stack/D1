# Assets · Northbound "Contour"

Everything visual on the page is either type or one of these files. No photography.

| File | Size | What it is | Where it goes |
|---|---|---|---|
| `contours.mjs` | — | Generator (Node ≥ 18, no dependencies, deterministic) | stays in `studio/design/assets/`; the Builder copies its **outputs** |
| `terrain-hero.svg` | 34.4 KB | Hero contour map, viewBox 1600×1000 | `hero`, inlined |
| `section-strip.svg` | 12.1 KB | Plan view of the band along A–A′, straightened, viewBox 720×72.9 | `roast-curve` stage, inlined |
| `profile-a.svg` | 2.0 KB | Batch 214 elevation profile (= BT curve), viewBox 720×160 | `roast-curve` stage, inlined |
| `mini-212.svg` · `mini-213.svg` · `mini-214.svg` | 1.0 KB each | Mini route profiles on the shared 720×160 axes | `hero` route card (214), `roasts` cards + mobile comparison plate |
| `contours-data.json` | 15.4 KB | Every overlay position (spot heights, events, crossings, phases, BT per second) | imported by the Builder |
| `icon.svg` | 1 KB | Favicon (summit inside two contours + north tick; light/dark aware) | `src/app/icon.svg` |
| `north-tick.svg` | <1 KB | Wordmark glyph (surveyor's north arrow, `currentColor`) | nav + footer wordmark, inlined |

SVG total shipped on the page: **51.6 KB** (budget 60 KB) before compression, ≈ 20 KB gzipped.

## Run it

```bash
node studio-projects/northbound/studio/design/assets/contours.mjs            # writes next to the script
node studio-projects/northbound/studio/design/assets/contours.mjs --out /tmp/x
```
Running it twice produces byte-identical files (seeded PRNG, fixed rounding). Re-run only if an input below changes, then commit the outputs.

## The rule that makes it true

**On the section line A–A′ the terrain's height equals batch 214's bean temperature.**
`height(p) = w·BT(t′) + (1 − w)·background(p)`, with `w = exp(−(d/σ)²)`, `d` = distance from p to the segment A–A′, `t` = p's projection onto A–A′ mapped to 0–720 s, and `t′ = t + warp` where the warp is 0 on the line. So every contour line crosses A–A′ at exactly the second when the roast passed that temperature. `contours-data.json → strip.crossings` lists those 77 crossings; the profile's projection lines in `roast-curve` drop from them.

## Inputs

| Input | Value | Source |
|---|---|---|
| Batch 214 events (t s / BT °C) | CHARGE 0 / **200** · TP 65 / 88 · DE 270 / 152 · FC 530 / 196 · DROP 640 / 207 | `decisions.md` #4. **CHARGE 200 °C is new** (probe reading at charge; proposed demo value, needs a log entry) |
| Curve between events | Monotone cubic (Fritsch–Carlson) through the events; the CHARGE→TP fall is shaped by 3 fixed knots (`FALL_SHAPE`) so the probe-recovery dip looks real. Resulting RoR peaks ≈ 25 °C/min at 3:00 and declines to ≈ 6 °C/min at DROP | script |
| Cooling (DROP → 12:00) | `T = 30 + (Tdrop − 30)·e^(−(t − tdrop)/110)`; ends at 115.5 °C at 12:00. Drawn dashed in `--color-lake`, never labelled with a number | script (illustrative) |
| Batch 212 (proposed) | Nyeri, Kenya: 0/198 · 62/87 · 265/151 · 520/194 · 610/203 → DTR 14.8 %, light | **proposed demo**, align with Copywriter |
| Batch 213 (proposed) | Huila, Colombia: 0/202 · 68/89 · 280/153 · 545/197 · 680/212 → DTR 19.9 %, medium | **proposed demo**, align with Copywriter |

## Parameters

| Constant | Value | Effect |
|---|---|---|
| `W × H` | 1600 × 1000 | hero viewBox (aspect 8 : 5) |
| `A`, `A2` | (96, 900) → (1270, 735) | section line; 6 % / 90 % → 79.4 % / 73.5 % of the box; DROP lands at 71.2 % / 75.3 % |
| `T_END` | 720 s | the line spans 0:00–12:00 (roast + 1:20 cooling) |
| `SIGMA` | 50 units | half-width of the ridge carrying the curve |
| `WARP` | 34 s | off-line domain warp (0 on the line) so flanks aren't parallel stripes |
| `SEED` | 214 | mulberry32 seed for the value-noise lattice |
| `GRID` | 6 units | marching-squares cell |
| Levels | 64–204 °C every 4 °C (36 lines) | index line every 20 °C (every 5th), 1.25 px, labelled "…°" in condensed Archivo with a gap cut in the line |
| `CLEARING` | superellipse (n = 4) at (520, 430), r 580 × 290, floor 66 °C, 35 % soft edge | the headline clearing: terrain flattened to a meadow between two contour levels, so **no line passes under the hero copy** at lg+ (verified at 1024×768, 1280×720, 1440×900, 1920×1080 with the layout-spec geometry) |
| `HILLS` | summit massif (1000, 770), NE spur, N ridge, SW knoll, SE shoulder | background landscape; the massif puts DROP on a true peak |
| Smoothing | Chaikin ×2, Douglas–Peucker 0.55 units; specks < 70 units dropped | file size vs. smoothness |
| Strip band | ±60 units across A–A′, 5-unit cells | `section-strip.svg`; natural aspect 720 : 72.9 |
| Profile y-domain | 60–220 °C, x 0–720 s | shared by `profile-a.svg` and all `mini-*.svg`: **one temperature axis** |

## How the Builder uses the files

- **Inline every SVG** (server component reads the file at build time and injects it, or paste into a TSX component). They reference CSS variables (`--color-contour-minor`, `--color-contour-index`, `--color-ink`, `--color-accent`, `--color-line`, `--color-ground`, `--color-lake`, `--color-muted`, `--font-text`) with hex fallbacks, so they follow light/dark automatically. As `<img>` they'd lose the theme, so don't.
- Every SVG already has `aria-hidden="true"` and `focusable="false"`. The data they show is given to assistive tech by the HTML around them (see `layout-spec.md`).
- All strokes use `vector-effect: non-scaling-stroke`, so `section-strip.svg`, `profile-a.svg` and the minis can be stretched with `preserveAspectRatio="none"` to any box and keep 0.75 / 1.25 / 2.25 px lines.
- **Overlay rule:** HTML labels and markers sit in a wrapper with the *same box* as the SVG and are positioned with `left: <left>%; top: <top>%` from `contours-data.json`. Profile, strip and minis: `left = t / 720`, profile `top = (220 − T) / 160`.
- Hooks for motion: `#nb-section` (hero section line + end ticks), `#nb-spots` (hero spot markers), `#nb-strip-line`, `#nb-roast`, `#nb-cooling`, `#nb-ground`, `#nb-grid`, `#nb-phase-rules`. The terrain itself (`#nb-terrain`) never animates.
- Embedded `<style>` blocks use `nb-` prefixed classes; they become global when inlined, which is intended (identical rules in every file). To restyle one instance (e.g. the mobile comparison plate), scope a selector with higher specificity: `.plate-213 .nb-roast { stroke: var(--color-ink) }`.

## Open Graph image (1200 × 630)

Build with `src/app/opengraph-image.tsx` (`next/og`), Archivo loaded from the same font file.
- Ground `#f8f5ed` (paper). Terrain: `terrain-hero.svg` as a data-URI `<img>` (the hex fallbacks apply in Satori), width 1600 × 1000 scaled to 1200 × 750 and shifted up 120 px, so the section line and ▲ 207° sit in the lower third (y ≈ 430–555).
- Left, 64 px inset, top 150: "Every roast / is a *climb.*" in Archivo wdth 125, weight 340, 96 px, line-height 0.92, ink `#2b221a`. The headline sits in the clearing; nothing crosses it.
- Top-left 48 px: north tick + NORTHBOUND (wdth 125, weight 600, 22 px, tracking 0.06em).
- Bottom-right, 64 px inset: a route card, surface `#fdfbf7`, 1 px `#dbd3c8` border, 280 × 120: "BATCH 214 · GUJI, ETHIOPIA" / "Roasted Tue 27 Oct 2026" / "Drop 10:40 · 207 °C · DTR 17 %" in 18 px condensed (wdth 75) tabular.
