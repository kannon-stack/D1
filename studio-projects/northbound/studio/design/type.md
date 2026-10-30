# Typography

One family, three widths, the way a topographic sheet letters everything in one face: wide for the sheet title, regular for notes, condensed for map lettering. Warmth comes from paper and sienna, not from a second face.

## Families
| Role | next/font/google export | Weights / axes | CSS variable | Fallback stack | Why |
|---|---|---|---|---|---|
| Display + text + map lettering | `Archivo` | variable `wght` 100–900 + `axes: ["wdth"]` (62–125); `style: ["normal", "italic"]` | `--font-archivo` | `"Archivo", ui-sans-serif, "Helvetica Neue", Arial, sans-serif` | A grotesk drawn for print and data, with a true width axis: wdth 125 is a calm, wide survey-sheet title; wdth 75 is a crisp label face with tabular figures. One file per style does every job. |

No mono and no second family.

```ts
// src/app/layout.tsx
import { Archivo } from "next/font/google";
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
// <html lang="en" className={archivo.variable}>
```
- Both styles are preloaded (≈ 90 KB normal + 100 KB italic, latin). Italic is above the fold (the hero's "*climb.*"), so don't lazy-load it.
- Width is set with `font-stretch` through the utilities in `tokens.css`: `width-wide` 125 %, `width-semi` 112 %, `width-text` 100 %, `width-map` 75 %. Weight is set with normal `font-weight` (any value 100–900, e.g. `font-[340]`).
- **CLS guard:** the fallback (Arial) is much narrower than wdth 125. Every display line that could rewrap (hero headline, hero coda, section titles) uses author-controlled line breaks (`<span class="block">` per line) and a fixed `line-height`, so the swap changes width only, never height.

## Scale
Generated with:
```bash
node .claude/studio-tools/scripts/type-scale.mjs --base 16:18 --ratio 1.2:1.3 --viewports 360:1440
```
A moderate ratio (1.2 → 1.3) because wide letters are already large per character. The drama is in the hero size, which replaces `--text-6xl` with `clamp(3.25rem, 8.4vw, 7.5rem)`: **52 px at 375 → 86 px at 1024 → 120 px at 1440**. That is 3.25× body on mobile and 6.7× body on desktop. Line-heights and tracking were re-tuned for the wide cut (wide letters need less negative tracking). All values are in `tokens.css`.

| Token | 360 px | 1440 px | Use |
|---|---|---|---|
| `text-xs` | 11.1 | 12.5 | map lettering, eyebrows, axis and spot labels (always `width-map`, 500–600) |
| `text-sm` | 13.3 | 15 | captions, buttons, nav, table values |
| `text-base` | 16 | 18 | body |
| `text-lg` | 19.2 | 23.4 | lead, hero subhead, origin names |
| `text-xl` | 23 | 30.4 | step titles, form legends |
| `text-2xl` | 27.6 | 39.5 | card names, readouts, quote (mobile) |
| `text-3xl` | 33.2 | 51.4 | hero coda, section titles (mobile), prices, quote (desktop) |
| `text-4xl` | 39.8 | 66.8 | section titles (md+) |
| `text-5xl` | 47.8 | 86.9 | proof figure, footer wordmark (md+) |
| `text-6xl` | 52 | 120 | hero headline only |

**Width ready reckoner** (measured in Chromium with Archivo; use it to check copy budgets). Average advance per character, including spaces: `width-wide` weight 340 ≈ **0.56 em** · `width-semi` 340 ≈ 0.51 em · `width-text` 400 ≈ **0.47 em** · `width-map` 600 caps ≈ **0.60 em** (+ tracking) · `width-map` italic 400 ≈ 0.34 em.

## Usage map
| Element | Token | Width | Weight | Tracking | Case / features | Colour |
|---|---|---|---|---|---|---|
| Hero headline | `text-6xl` | wide | 340 | token (−0.03em) | sentence; one word in italic (same weight); explicit line spans | ink |
| Hero coda ("We send you the map.") | `text-3xl` | wide | 340 | token | sentence | ink |
| Section title (h2) | `text-3xl md:text-4xl` | wide | 360 | token | sentence; explicit line spans | ink |
| Card name (h3, roasts) | `text-2xl` | wide (semi below md) | 400 | token | sentence | ink |
| Step title (h3, how-it-works) | `text-xl` | wide | 400 | token | sentence | ink |
| Eyebrow / sheet label | `text-xs` | map | 600 | 0.06em (token) | UPPERCASE, `num` | muted |
| Body | `text-base` | text | 400 | 0 | sentence; `text-wrap: pretty`; max 35rem | ink-soft |
| Lead / hero subhead | `text-lg` | text | 400 | 0 | sentence; max 30rem | ink-soft |
| Caption, hint | `text-sm` | text | 400 | token | sentence | muted |
| Button | `text-sm` | text | 600 | 0.01em | sentence case, trailing arrow glyph from Archivo (`→` `↓`) | accent-ink on accent |
| Nav link | `text-sm` | text | 500 | 0.005em | sentence | ink |
| Wordmark (nav) | `text-sm` | wide | 600 | 0.06em | UPPERCASE, preceded by `north-tick.svg` at cap height | ink |
| Wordmark (footer) | `text-3xl md:text-5xl` | wide | 300 | 0.02em | UPPERCASE | ink |
| Origin / place name | `text-lg` (cards) · `text-sm` (route card) | map | 400 | 0.01em | *italic*, as topo place names | ink |
| Spot heights, event labels, axis ticks | `text-xs` | map | 500 | 0.02em | `num`; events as `FC 8:50 · 196°` (code in caps 600) | ink (labels) / muted (axes) |
| Plumb readout (roast-curve) | `text-2xl` | map | 400 | 0 | `num`; `T 8:50` / `196.0°` | ink; unit in muted |
| Phase-bar labels | `text-xs` | map | 600 | 0.06em | UPPERCASE + `num` | ink on moss / sienna tint; accent-ink on accent |
| Table term (dt) | `text-xs` | map | 600 | 0.06em | UPPERCASE | muted |
| Table value (dd) | `text-sm` | text | 400 | 0 | `num` where numeric | ink |
| Price | `text-3xl` | wide | 340 | token | `num` | ink |
| Proof quote | `text-2xl md:text-3xl` | semi | 340 | −0.015em | sentence; hanging open-quote in accent | ink |
| Proof figure | `text-5xl` | wide | 300 | token | `num` | ink |
| Form label / legend | `text-sm` / `text-xl` | text / wide | 600 / 400 | 0 | sentence | ink |
| Error message | `text-sm` | text | 500 | 0 | sentence | danger |

## OpenType features (verified in the Archivo build)
- `tnum` (tabular) **exists and is required** for every time, temperature, date, price and batch number (`num` utility). Archivo's default figures are proportional.
- `frac` exists: use it for brew ratios written as fractions only if the copy uses them; ratios like `1:16` need nothing.
- Archivo has **no** `onum`, `ss01` or `case` alternates. Don't specify them. Figures in body text are lining, which suits the data voice.
- Kerning is on by default; don't disable it.

## Rules
- Measure: body 35rem max (≈ 66 characters at 18 px); hero subhead 30rem; captions 26rem.
- Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty` (set in `tokens.css` base).
- `width-wide` is used only at `text-xl` and above, plus the nav wordmark. Below `text-xl` it reads as stretched.
- `width-map` is never used for sentences longer than one line, except origin names in italic.
- At most one italic word in any display line. In the hero it is the verb's object ("*climb.*").
- `--color-muted` is for labels, captions and axes only. Body copy is always `ink-soft` or `ink` (APCA Lc ≥ 75 in both schemes).
- Numbers are never set in the display width at less than `text-3xl` (they get too wide); tables use `width-map` + `num`.
