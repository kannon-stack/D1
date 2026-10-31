# Fonts

Archivo, by The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo), licensed under the SIL Open Font License 1.1. The full licence and copyright notice are in `OFL.txt`, which must ship with these files.

- `archivo-normal.woff2`: variable Archivo (normal), with the width (`wdth` 62–125) and weight (`wght` 100–900) axes.
- `archivo-italic.woff2`: variable Archivo Italic, with the same axes.

## How they are made

They are not subset locally. Both files are Google Fonts' own Archivo, served by the CSS2 API with a `text=` parameter, which returns variable WOFF2 files that contain only the requested glyphs (axes kept). `scripts/subset-fonts.mjs` does the whole job and is the only supported way to regenerate them:

```bash
cd studio-projects/northbound/site
node scripts/subset-fonts.mjs
```

It requests printable ASCII plus every non-ASCII character it finds anywhere in `src/` (copy, components and assets; both literal characters and `\uXXXX` escapes), downloads both faces into this folder, and rewrites the list below. Re-run it whenever copy or components add a character. `layout.tsx` loads the two files with `next/font/local`, and both are preloaded.

The ▲ / ▼ map markers are not text: Archivo has no geometric shapes, so they are drawn as SVG (`components/ui/Triangle.tsx`).

## Characters

<!-- chars:start -->
Printable ASCII U+0020–U+007E, plus these 20 characters found in `src/`:

- U+00A0 (no-break space)
- U+00A9 ©
- U+00B0 °
- U+00B7 ·
- U+00D7 ×
- U+2013 –
- U+2019 ’
- U+201C “
- U+2026 …
- U+2032 ′
- U+203A ›
- U+2192 →
- U+2193 ↓
- U+2212 −
- U+2248 ≈
- U+2264 ≤
- U+2265 ≥
- U+2500 ─
- U+25B2 ▲
- U+25BC ▼
<!-- chars:end -->
