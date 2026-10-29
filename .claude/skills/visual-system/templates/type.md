# Typography

## Families
| Role | next/font/google export | Weights / axes | CSS variable | Fallback stack | Why |
|---|---|---|---|---|---|
| Display | `<Family_Name>` | <e.g. variable, wght 300–800, opsz> | `--font-<id>` | <e.g. Georgia, serif> | <reason> |
| Text | `<Family_Name>` | <…> | `--font-<id>` | <e.g. system-ui, sans-serif> | <reason> |
| Mono / accent (optional) | `<Family_Name>` | <…> | `--font-<id>` | <…> | <reason> |

## Scale
Generated with:
```bash
node .claude/studio-tools/scripts/type-scale.mjs --base <min:max> --ratio <min:max> --viewports 360:1440
```
The values are pasted into `tokens.css`.

## Usage map
| Element | Token | Family | Weight | Tracking | Case / features |
|---|---|---|---|---|---|
| Hero headline | `text-6xl` | display | | | |
| Section title | `text-4xl` | display | | | |
| Eyebrow | `text-xs` | text / mono | | `0.12em` | uppercase, `case` |
| Body | `text-base` | text | 400 | 0 | `onum` |
| Lead / subhead | `text-lg` | text | | | |
| Caption | `text-sm` | text | | | |
| Button | `text-sm` | text | 500 | | |
| Numerals / data | | | | | `tnum lnum` |

## Rules
- Measure: 60–75ch for body text (`max-w-prose` or `--container-prose`).
- Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`.
- <direction-specific rules, e.g. "display face never below text-3xl">
