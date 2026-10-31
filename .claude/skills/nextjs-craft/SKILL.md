---
name: nextjs-craft
description: Builder method for the web studio. Implement a studio design and copy spec as a fast, accessible Next.js App Router + TypeScript + Tailwind CSS v4 + Motion site in studio-projects/<slug>/site, with craft-level motion and micro-interactions. Use when building or fixing a studio site.
user-invocable: false
---

# Next.js craft

**Inputs:** everything in `P/studio/design/` and `P/studio/content/`, plus `decisions.md`.
**Output:** `P/site/`, a Next.js app.
**Templates:** `.claude/skills/nextjs-craft/templates/`

You implement the spec; you don't redesign. When the spec is ambiguous, choose the option most faithful to `direction.md`, and note it in your reply so the Director can log it. Never silently simplify a signature moment. If one is infeasible, say so.

## 1. Scaffold (first build only)
```bash
cd P && npx -y create-next-app@latest site --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes
cd site && npm i motion
```
- **Read `P/site/AGENTS.md` first.** This Next.js version may differ from what you remember. Before you use an API you're unsure of (fonts, metadata, OG images, config, caching), check its guide in `P/site/node_modules/next/dist/docs/`.
- **Config: merge, don't replace.** Recent `create-next-app` versions wire Tailwind through `next.config.ts`, for example a `turbopack.rules` entry for `@tailwindcss/turbopack`, and enable options such as `cacheComponents`. Keep everything it generated, and add only the project-root pin (the studio lives inside another repo):
  ```ts
  import path from "node:path";
  const root = path.resolve(__dirname);
  // inside the existing nextConfig object:
  //   turbopack: { root, ...existing turbopack keys (rules etc.) },
  //   outputFileTracingRoot: root,
  ```
- **Clean out the starter:** delete the boilerplate SVGs in `public/` and the starter page and CSS content.
- **Structure:**
  ```
  src/app/layout.tsx          fonts, metadata, <MotionConfig>, skip link
  src/app/page.tsx            composes the sections in outline order (server component)
  src/app/globals.css         from templates/globals.css + tokens.css
  src/app/icon.svg            favicon from design/assets
  src/app/opengraph-image.tsx OG image (next/og ImageResponse)
  src/components/sections/    one file per section ID: Hero.tsx, Process.tsx…
  src/components/motion/      "use client" islands: Reveal, SplitLines, signature pieces
  src/components/ui/          Button, Link, form controls
  src/content/copy.ts         generated from content/copy.md (typed, `as const`)
  src/lib/motion.ts           tokens and presets from design/motion.md
  ```

## 2. Tokens, type and copy
- **`globals.css`:** start from `templates/globals.css` and paste `P/studio/design/tokens.css` where it says to, unchanged.
  - If the tokens use `@theme`, change it to `@theme static` so every variable is emitted. The dark override and the base styles read them directly.
  - Use only token utilities in components: `bg-bg`, `text-ink`, `text-muted`, `border-line`, `bg-accent text-accent-ink`, `font-display`, `text-6xl`, `py-section-md`, `gap-x-gutter`, `max-w-page`, `ease-out-expo`.
  - **No hex, rgb or oklch literals in components, and no arbitrary `[…]` values** where a token exists.
- **Fonts:** load them with `next/font/google` in `layout.tsx`, using `variable: "--font-display-face"` and `"--font-text-face"` (matching the tokens' `@theme inline` block) plus `display: "swap"`. Put both `.variable` class names on `<html>`.
  - If Google Fonts can't be reached at build time, `npm i @fontsource-variable/<family>` and use `next/font/local` pointing at its woff2 file.
  - If Lighthouse Performance ends up within a few points of 90, switch to subset local fonts (section 6).
- **Symbols:** don't let arrows, triangles, × or similar fall back to a system font. Either keep the glyph in the font subset, or draw it as one small inline-SVG component sized in `em` with `currentColor` (`components/ui/Triangle.tsx` in the Northbound build is a model).
- **Copy:** turn `content/copy.md` into `src/content/copy.ts`, one key per section and slot, using the chosen hero headline. **No user-facing strings hard-coded in JSX.**
- **Metadata:** take it from `content/metadata.md`.
  - `export const metadata` sets `metadataBase`, `title`, `description` and `openGraph`.
  - JSON-LD goes in `page.tsx` as `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />`.

## 3. Layout and components
- **Semantics:** `<header>`, `<nav aria-label>`, `<main id="main">`, one `<section aria-labelledby>` per section, and `<footer>`. There is exactly one `h1`, and no heading levels are skipped.
- **Skip link:** the first element in `<body>`, visible on focus.
- **Grid:** build it exactly as `layout-spec.md` gives it, e.g. `grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-gutter`, with the specified spans per breakpoint. Compose the 375px layout as specified; don't just let it stack.
- **Server Components by default.** Add `"use client"` only to leaf islands that need state, effects or Motion. Never put it on `page.tsx` or a whole section if only one element animates.
- **Interactive states:** every interactive element has hover, `focus-visible` (always visible, using `--color-focus`) and pressed (`active:` scale 0.98 or a translate) states.
  - Touch targets are at least 44×44px on mobile.
  - Disabled and loading states come from the microcopy.
- **Media:**
  - Use `next/image` with `sizes`, and add `priority` to the hero image only. Always set dimensions or an aspect ratio, so there's zero layout shift.
  - Inline SVGs from `design/assets/` become components that use `currentColor` or token classes. Decorative ones get `aria-hidden`.

## 4. Motion (`motion` package, imported from `motion/react`)
- **Presets:** `src/lib/motion.ts` comes from `templates/motion.ts`, with the values replaced by those in `design/motion.md`.
- **Reduced motion:** wrap the app in `<MotionConfig reducedMotion="user">` (a client component around `children` in `layout.tsx`). In custom effects, `useReducedMotion()` switches to the documented still fallback.
- **Patterns** (templates provided):
  - `Reveal`: in-view entrance with `once: true`, `amount` 0.2–0.4.
  - `SplitLines`: line-by-line masked reveal. The parent has an `aria-label` and the split spans are `aria-hidden`.
  - **Stagger:** a parent with `staggerChildren` and children with variants.
  - **Scroll-linked:** `const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })`, then `useTransform`, and apply the result to `style={{ y, opacity, pathLength, clipPath }}`.
  - **SVG draw:** `motion.path` with `style={{ pathLength }}`, or `initial={{ pathLength: 0 }}` with `whileInView`.
  - **Magnetic or cursor effects:** only if specified, and only under `@media (pointer: fine)`. Disable them on touch devices and with reduced motion.
- **The hero/LCP element must be visible in the server HTML.** Don't start it at `opacity: 0` waiting for hydration. Animate it with a CSS keyframe entrance, which runs at first paint, or with a transform-only mask reveal. Otherwise LCP and Lighthouse Performance suffer.
- **Animate transform, opacity and clip-path only.** No layout properties.
  - Canvas or WebGL pieces load via `next/dynamic` from a client component, cap `devicePixelRatio` at 2, pause offscreen (IntersectionObserver), and render a single still frame under reduced motion.

## 5. Self-check before handing off
1. `npm run build` passes with zero TypeScript errors. Also run `npm run lint` if it exists and fix every error.
2. Serve it and capture the fold. From the repo root:
   ```bash
   node .claude/studio-tools/scripts/serve.mjs start --dir P/site
   node .claude/studio-tools/scripts/screenshot.mjs --url http://localhost:3100 --out P/studio/qa/builder-check --widths 375,1280 --schemes light,dark --fold-only
   ```
   `serve.mjs start` waits until the site answers. Don't use `pkill -f "next start…"`: the pattern matches your own shell and kills it.
3. **Read the screenshots** and compare them with `layout-spec.md`. Fix anything obviously off: overflow, broken fonts, missing assets, unreadable dark mode.
4. Stop the server: `node .claude/studio-tools/scripts/serve.mjs stop`.

## 6. When Lighthouse is close to the gate
Learned on the first sample run (mobile Performance 88 against a gate of 90). Measure with `audit.mjs`, which reports the median of 3, before and after each change. In order of payoff:
1. **Subset local fonts.** Request the family from Google Fonts with `text=` (printable ASCII plus every non-ASCII character used in `src/`), keep the variable axes, save the woff2 files in `src/app/fonts/`, and load them with `next/font/local`.
   - Write `scripts/subset-fonts.mjs` that scans `src/` (literal characters and `\uXXXX` escapes) and rewrites the exact character list into `src/app/fonts/README.md`. Re-run it whenever copy or components add a character, or that character silently falls back to a system font.
   - Keep the font's licence file (SIL OFL for most Google families) beside the font files.
   - Preload every face used above the fold. Preloading only the roman gave no gain.
   - Log the deviation from `type.md` for the Director to record.
2. **Render static SVG on the server.** Terrain, plates and other static artwork stay in Server Components and reach client islands as `children` or slot props, so they add nothing to the client bundle.
3. **Don't use `content-visibility: auto` on below-fold sections unless you must.** Its placeholder heights shift the page as sections render, so smooth-scroll anchors and direct `/#hash` loads land hundreds of pixels off (the Critic measured −1198 px at 1280). The Northbound site reached 94 without it. If you do use it, force `content-visibility: visible` for in-page navigation and prove the anchors below.
4. **Anchors must land exactly.** Set `scroll-margin-top` to the nav height and check every in-page link at 375 and 1280, in smooth and reduced-motion modes, plus direct loads of each `/#id`. The target section's top should sit at the nav height (±4 px). `site/scripts/check-anchors.mjs` in the Northbound build is a model.

## 7. When fixing Critic defects
- Read `P/studio/qa/round-N.md` and fix exactly the defect IDs assigned to `builder`, plus any spec or copy changes the Director passes on.
- Don't refactor unrelated code. Re-run the self-check.
- In your reply, list each defect ID as `fixed` or `not fixed (why)`.

## Done when
- [ ] `npm run build` is clean, and lint is clean if it exists.
- [ ] Every section in `layout-spec.md` is implemented, with its spans, tokens, assets, motion rows and states.
- [ ] Copy comes only from `copy.ts`; metadata, JSON-LD, `icon.svg` and the OG image are present.
- [ ] Reduced motion leaves every piece of content visible and still.
- [ ] Every in-page link lands its section at the nav height, in smooth and reduced-motion modes.
- [ ] Self-check screenshots were read and match the spec.
