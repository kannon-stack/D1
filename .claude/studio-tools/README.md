# Studio tools

These are the scripts the web-studio bots run. Every command runs from the repo root.

## Setup

```bash
node .claude/studio-tools/scripts/doctor.mjs --install
```

This checks for Node 22.19 or newer, Playwright and Chromium, and installs `axe-core`, `lighthouse` and `chrome-launcher` into `.claude/studio-tools/node_modules` (that folder is gitignored).

Playwright is not a dependency here. The scripts load whichever copy can be found, local or global (`NODE_PATH`). On a fresh machine, install it once:

```bash
npm i -g playwright
```

```bash
npx playwright install chromium
```

The scripts use `/opt/pw-browsers/chromium` when that path exists (the Claude cloud container). To use a different browser binary, set `STUDIO_CHROMIUM`.

## Scripts

| Script | Used by | What it does |
|---|---|---|
| `scripts/doctor.mjs [--install]` | Director | Environment check; `--install` adds missing deps. |
| `scripts/check-content.mjs PROJECT` | Director | Validates `content/copy.md` and `metadata.md` (YAML and JSON-LD parse, banned words, `# used/budget` counts, title and description limits) and checks that every `section.slot` in `layout-spec.md` has copy. Exits 1 on errors. Budgets written in the layout spec are not machine-checked. |
| `scripts/serve.mjs start --dir SITE` / `stop` / `status` | Builder, Critic | Runs `next start` for a built site on port 3100 (`--port` to change), waits until it answers, and stops it cleanly. |
| `scripts/screenshot.mjs --url U --out DIR` | Critic, Builder, Designer | Captures fold and full-page shots per width (`--widths 375,768,1280,1920`) and color scheme (`--schemes light,dark`). Also produces full-page tiles, a 10-frame scroll sequence, a reduced-motion pass and hover crops, and writes `manifest.json` with horizontal overflow and console errors. `--fold-only` takes quick reference shots. |
| `scripts/audit.mjs --url U --out DIR` | Critic | Runs axe at 375 and 1280 in light and dark, a keyboard tab-walk with focus crops, a tap-target scan, a structure check (lang, h1, headings, alt, meta, JSON-LD) and Lighthouse mobile. Writes `summary.md` and `summary.json`. `--no-lighthouse` skips Lighthouse; Lighthouse reports the median of 3 runs by default (`--lh-runs N` to change). |
| `scripts/contrast.mjs tokens.css` | Designer, Critic | WCAG ratio and APCA Lc for every `--color-*` pair, in light and dark. Exits 1 on failure. `--fg X --bg Y` checks a single pair. |
| `scripts/type-scale.mjs` | Designer | Fluid `clamp()` type scale as Tailwind v4 `--text-*` variables. Options: `--base 16:18 --ratio 1.2:1.333`. |
| `hooks/critic-write-guard.mjs` | Critic (hook) | Blocks Critic writes outside `*/studio/qa/`. |

## Serving a site for capture

Always capture a production build. Dev mode is slower and shows dev overlays.

```bash
(cd studio-projects/<slug>/site && npm run build)
```

```bash
node .claude/studio-tools/scripts/serve.mjs start --dir studio-projects/<slug>/site
```

Then run the scripts against `http://localhost:3100`, and stop the server:

```bash
node .claude/studio-tools/scripts/serve.mjs stop
```

`serve.mjs` tracks the server by its process ID. Don't use `pkill -f "next start…"`: that pattern also matches the shell running the command.
