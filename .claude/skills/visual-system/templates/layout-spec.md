# Layout spec

## Global
- **Grid:** sm (<640) 4 columns · md (≥768) 8 columns · lg (≥1024) 12 columns · xl (≥1280) 12 columns. Gutter `--spacing-gutter`, max width `--container-page`.
- **Section rhythm:** <e.g. hero → sm → md → lg (signature) → md → sm → footer>
- **Nav:** <position (sticky / static / hidden-on-scroll), contents, mobile behavior>
- **Skip link:** first focusable element; visually hidden until focused.
- **Footer:** <contents>

---

## `hero`
**Purpose:** <…>

Desktop (1280):
```text
<ASCII sketch>
```
Mobile (375):
```text
<ASCII sketch>
```

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| headline | 4 / 8 / 1–9 / 1–8 | `text-6xl` display | ink | | M1 | |
| CTA | 4 / 4 / 1–3 / 1–3 | `text-sm` | accent / accent-ink | | | hover, focus, pressed |

**Copy slots** (`max chars per line × lines`, or max chars):
- `hero.eyebrow`: 32
- `hero.headline`: 20 × 3
- `hero.subhead`: 140
- `hero.cta`: 22

**Mobile changes:** <what is recomposed, not just stacked>

---

## `<next-section-id>`
<same structure>
