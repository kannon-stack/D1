# Typography

One family in two cuts plus a mono, the way a drawing set letters everything: a wide, heavy title face for what the sheet *is*, a plain face for notes, and the drafting hand for every label. Archivo carries "bold" and "engineered" (its true width axis gives a wide cut that no other Google grotesk matches); JetBrains Mono carries "precise".

## Families
| Role | next/font/google export | Instance used | CSS variable | Fallback stack | Why |
|---|---|---|---|---|---|
| Display | `Archivo` | **static** wdth 125, wght 800, normal | `--font-archivo-wide` | `"Archivo", "Arial Black", Arial, sans-serif` | Wide heavy caps: engineered, calm at size, reads as "title of the sheet". One weight only; the hierarchy comes from size. |
| Text | `Archivo` | **static** wdth 100, wght 400 and wght 600, normal | `--font-archivo` | `"Archivo", ui-sans-serif, "Helvetica Neue", Arial, sans-serif` | Same skeleton as the display, so the page is one voice in two widths. 600 is only for buttons, the contact name and table values. |
| Mono (drafting hand) | `JetBrains_Mono` | **static** wght 500 | `--font-jetbrains-mono` | `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` | Sheet numbers, FIG. labels, column heads, balloons, email and phone values, hints. Clear zero/O and 1/l distinction for the email and phone. |

No italic anywhere. No other weights.

### Delivery: subset static instances from day one (Lighthouse lesson, `nextjs-craft` §6)
The page has little copy, so every face is subset to the characters used and served as a **static instance**, not the variable file. Measured on 2026-10-31 (Google Fonts css2 API, `text=` = printable ASCII + `→↑↓·×–—’“”…©`):

| File (`src/app/fonts/`) | Google request (`family=`) | Size |
|---|---|---|
| `archivo-wide-800.woff2` | `Archivo:wdth,wght@125,800` | 9.0 KB |
| `archivo-400.woff2` | `Archivo:wdth,wght@100,400` | 9.3 KB |
| `archivo-600.woff2` | `Archivo:wdth,wght@100,600` | 8.6 KB |
| `jetbrains-mono-500.woff2` | `JetBrains Mono:wght@500` | 18.4 KB |

Total ≈ **45 KB**, against ≈ 112 KB for variable Archivo (latin, 90 KB) + mono. **Request one instance per call.** A call that asks for several instances at once (`wdth,wght@100,400;100,600;125,800`) returns the whole variable font (62 KB) for every face. Send a desktop Chrome User-Agent so the API returns woff2.

- `scripts/subset-fonts.mjs` (the Builder writes it, as in Northbound) scans `src/` for literal characters and `\uXXXX` escapes, adds printable ASCII, fetches the four files above with `text=<chars>`, saves them, and writes the exact character list into `src/app/fonts/README.md`. Re-run it whenever copy adds a character. Keep `OFL.txt` (both families are SIL OFL 1.1) beside the files.
- Load with `next/font/local`, one call per role, `display: "swap"`, `preload: true` for **all four** (all are above the fold at 375 and 1280: headline, subhead, button, mono labels). `adjustFontFallback: "Arial"` (the default) for the Archivo faces, `false` for the mono.

```ts
// src/app/fonts.ts
import localFont from "next/font/local";
export const archivoWide = localFont({ src: "./fonts/archivo-wide-800.woff2", weight: "800", variable: "--font-archivo-wide", display: "swap" });
export const archivo = localFont({
  src: [
    { path: "./fonts/archivo-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/archivo-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
});
export const mono = localFont({ src: "./fonts/jetbrains-mono-500.woff2", weight: "500", variable: "--font-jetbrains-mono", display: "swap", adjustFontFallback: false });
// <html lang="en" className={`${archivoWide.variable} ${archivo.variable} ${mono.variable}`}>
```
Because the wide cut is its own `@font-face` family, **no `font-stretch` is needed anywhere**. Always set `font-weight: 800` with `font-display` text so a fallback doesn't render synthetic bold differently.

- **Arrows** (`→ ↑ ↓`) are always set in the mono face (JetBrains Mono has them; don't rely on Archivo).
- **The wordmark's dimension bracket** `├─ builds ─┤` is drawn with CSS borders, not box-drawing characters.
- **CLS guard:** every display line is its own `<span class="block">` with a fixed `line-height`, so a font swap can change width only. Lines that may wrap on mobile (hero line 3, section titles) are balanced.

## Scale
Generated with:
```bash
node .claude/studio-tools/scripts/type-scale.mjs --base 16:18 --ratio 1.2:1.25 --viewports 360:1440
```
A moderate ratio because wide heavy caps are already huge per character (measured **0.80–0.86 em per character** including spaces; 0.95 em for "AGK"). The drama is the hero size `--text-hero`: **40 px @375 · 70 px @768 · 110 px @1280 · 120 px @≥1409**, capped by `14.5svh` on short screens (104 px at 1280×720). That is 2.5× body on a phone and 6.7× body at 1440. All values are in `tokens.css`.

| Token | 360 px | 1440 px | Use |
|---|---|---|---|
| `text-xs` | 11.1 | 12.5 | every mono annotation (`annotate` utility) |
| `text-sm` | 13.3 | 15 | balloons, copy-button labels, footer lines |
| `text-base` | 16 | 18 | body, button label, email/phone values (mono) |
| `text-lg` | 19.2 | 22.5 | hero subhead, section intros, contact body |
| `text-xl` | 23 | 28.1 | step titles; item names (sm) |
| `text-2xl` | 27.6 | 35.2 | item names (md+); section titles (sm) |
| `text-3xl` | 33.2 | 43.9 | contact headline (sm) |
| `text-4xl` | 39.8 | 54.9 | section titles (md+) |
| `text-5xl` | 47.8 | 68.7 | contact headline (md+) |
| `text-hero` | 40 | 120 | hero headline only |

**Width ready reckoner** (Chromium, these exact instances; use it for copy budgets):
- Display caps (wide 800): **0.86 em per character** worst case. "CUSTOM SOFTWARE," = 13.65 em; "DRAWN TO FIT." = 9.56 em; "SOFTWARE," = 7.66 em; "WHAT WE BUILD" = 10.34 em.
- Text 400: **0.443 em** per character (sentence case). Text 600: 0.46 em.
- Mono 500: **0.60 em** per character (0.66 em with the 0.06em label tracking). "agkbuilds@gmail.com" = 11.4 em.

**Vertical metrics** (display instance, measured): cap height 0.703 em, baseline at 0.774 em from the top of a 0.88 em row. These drive the hero's cap-line and baseline guides (`--hl-cap`, `--hl-base`, `--hl-row` in `tokens.css`). If the line-height of the hero changes, re-measure.

## Usage map
| Element | Token | Family | Weight | Tracking | Case / features | Colour |
|---|---|---|---|---|---|---|
| Hero headline (h1) | `text-hero` | display | 800 | −0.01em | UPPERCASE (CSS `uppercase` on sentence-case source), one span per line, `text-wrap: balance` per line | ink; line 4 accent |
| Section title (h2) | `text-2xl` sm · `text-4xl` md+ | display | 800 | token | UPPERCASE, line spans | ink |
| Contact headline (h2) | `text-3xl` sm · `text-5xl` md+ | display | 800 | token | UPPERCASE, line spans | ink |
| Item name (h3, parts list) | `text-xl` sm · `text-2xl` md+ | display | 800 | token | UPPERCASE | ink |
| Step title (h3) | `text-xl` | display | 800 | token | UPPERCASE | ink |
| Wordmark "AGK" | 22 px (nav) · `text-5xl` (footer, md+) / `text-3xl` (sm) | display | 800 | 0.02em | UPPERCASE | ink |
| Wordmark "builds" | 10 px (nav) · `text-xs` (footer) | mono | 500 | 0.12em | UPPERCASE | muted |
| Sheet labels, FIG. labels, column heads, hints, step labels, counts | `text-xs` | mono | 500 | 0.06em | UPPERCASE, `tnum` (`annotate`) | muted |
| Nav index links | `text-xs` | mono | 500 | 0.06em | UPPERCASE, `tnum` | ink-soft; hover ink |
| Body / item line / step body | `text-base` | text | 400 | 0 | sentence; `text-wrap: pretty` | ink-soft |
| Lead (hero subhead, section intros, contact body) | `text-lg` | text | 400 | token | sentence | ink-soft |
| Button label | `text-base` | text | 600 | 0 | sentence case; arrow in mono | accent-ink on accent |
| Email / phone value | `text-base` | mono | 500 | 0 | as written, `tnum` | ink |
| Contact name (title block) | `text-base` | text | 600 | 0 | as written | ink |
| Copy-button label / state | `text-xs` | mono | 500 | 0.06em | UPPERCASE | ink; "Copied" accent; failed ink |
| Balloon numeral | `text-sm` | mono | 500 | 0 | `tnum` | ink |
| Footer lines | `text-sm` | text | 400 | 0 | sentence | ink-soft; links ink |

## OpenType features
- `tnum` is set by the `annotate` and `num` utilities: sheet numbers, balloons, counts, phone number.
- Archivo has no `ss01`, `onum` or `case` worth enabling; don't specify them. Kerning stays on.
- JetBrains Mono: **turn ligatures off** (`font-variant-ligatures: none`) on email/phone values and labels so nothing like `--` or `->` is ligated.

## Rules
- Measure: body max `--container-prose` (36rem ≈ 68 ch at 18 px); leads max 34rem; item lines and step bodies max 30rem.
- Headings `text-wrap: balance`; paragraphs `text-wrap: pretty` (in `tokens.css` base).
- The display cut is never used below `text-xl`, and never in sentence case.
- Mono is never used for a sentence longer than one line, except the hint lines (≤ 40 characters).
- Body text is always `ink-soft` or `ink`, never `muted` (muted is for labels only).
- No word in `hero.headline` may be longer than **9 characters** including punctuation (it must fit one 375 px line at 40 px). Other display slots: no word longer than **14 characters**.
