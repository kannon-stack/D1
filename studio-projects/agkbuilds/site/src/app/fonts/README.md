# Fonts

Both families are licensed under the SIL Open Font License 1.1. The licence texts, with their copyright notices, sit beside the files and must ship with them:

- **Archivo** by The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo): `OFL-Archivo.txt`
- **JetBrains Mono** by The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono): `OFL-JetBrainsMono.txt`

| File | Instance | Role |
|---|---|---|
| `archivo-wide-800.woff2` | Archivo wdth 125 / wght 800 | display (headline, titles, wordmark) |
| `archivo-400.woff2` | Archivo wdth 100 / wght 400 | text |
| `archivo-600.woff2` | Archivo wdth 100 / wght 600 | button labels, contact name |
| `jetbrains-mono-500.woff2` | JetBrains Mono 500 | every mono label, email and phone, arrows |
| `../og/archivo-wide-800.ttf`, `../og/jetbrains-mono-500.ttf` | same instances, TrueType | Open Graph image only (Satori can't read woff2) |

## How they are made

They are static instances served by Google Fonts' CSS2 API with a `text=` parameter, one request per instance, so each file carries only the glyphs this site sets. `scripts/subset-fonts.mjs` is the only supported way to regenerate them:

```bash
cd studio-projects/agkbuilds/site
node scripts/subset-fonts.mjs
```

It requests printable ASCII plus every non-ASCII character it finds in `src/` (copy, components, CSS and SVG; literal characters and `\uXXXX` escapes), downloads all six files and rewrites the list below. Re-run it whenever copy or a component adds a character. `src/app/fonts.ts` loads the four woff2 files with `next/font/local`, all preloaded (all four are above the fold).

The arrows (→ ↑ ↓) are always set in JetBrains Mono, which has them. The wordmark's dimension bracket is CSS borders, not box-drawing characters.

## Characters

<!-- chars:start -->
Printable ASCII U+0020–U+007E, plus these 19 characters found in `src/`:

- U+00A0 (no-break space)
- U+00A9 ©
- U+00B7 ·
- U+00D7 ×
- U+2013 –
- U+2014 —
- U+2019 ’
- U+2026 …
- U+2191 ↑
- U+2192 →
- U+2193 ↓
- U+2212 −
- U+2248 ≈
- U+2265 ≥
- U+2318 ⌘
- U+2500 ─
- U+251C ├
- U+2524 ┤
- U+2550 ═
<!-- chars:end -->
