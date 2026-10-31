# Critique: round 2

- **Project:** `studio-projects/agkbuilds/`
- **Date:** 2026-10-31
- **Verdict:** **PASS** (all 7 round-1 defects closed; 1 new minor, which doesn't block the gate)
- **Site HEAD:** `d52c429` (builder fixes R1-01..R1-07), after `61b77b9` (copy R1-06) and `0189cb5` (design R1-02/03/05)
- **Evidence:** `round-2/shots/` (screenshot capture), `round-2/audit/` (run on its own after the capture finished, so no overlap), `round-2/checks/` (my own plate, anchor, dimension, tap-target, copy-state, font, headline, 404 and no-JS evidence; text logs `plate-states.txt`, `plate-wheel.txt`, `plate-keys.txt`, `checks.txt`, `regression.txt`)
- **Build:** `npm run build` with `NEXT_PUBLIC_SITE_URL` unset. Next 16.4.3 static export; postbuild: "og:image → /opengraph-image.png (root-relative) in 9 files; no localhost, canonical or og:url in 11 files". Served with `serve.mjs` (static, port 3100).

## Gate
| Check | Result | Needs | Pass |
|---|---|---|---|
| Rubric average | 8.6 | ≥ 8.0 | yes |
| Lowest criterion | 8 (Hierarchy, Typography, Spacing, Originality) | ≥ 7 | yes |
| axe serious + critical | 0 (no violations of any impact at 375/1280 × light/dark) | 0 | yes |
| Lighthouse Performance (mobile) | 99 (my median of 3, `audit/summary.json` → `runs: 3`) | ≥ 90 | yes |
| Lighthouse Accessibility | 100 | 100 | yes |
| Horizontal overflow | none (`shots/manifest.json` → `overflow: {}`) | none | yes |
| Console / page errors | 0 / 0 (manifest, and every check run below) | 0 | yes |
| Open blockers | 0 | 0 | yes |

Lighthouse metrics: FCP 0.9 s · LCP 2.0 s · TBT 60 ms · CLS 0 · SI 0.9 s. Best practices 100, SEO 100. Keyboard: 14 tab stops, skip link first, every stop has a visible focus ring.

## Round-1 defects: verification (my own evidence)
| ID | Status | Evidence | What I measured |
|---|---|---|---|
| R1-01 (major) | **closed** | `checks/sheet-1280-motion-light-down.png`, `checks/sheet-1024-motion-light-down.png`, `checks/sheet-1920-motion-dark-down.png`, `checks/sheet-1280-motion-light-up.png`, `shots/frames/frame-05.png`–`frame-09.png`, `checks/plate-states.txt`, `checks/plate-wheel.txt` | Computed `stroke-dashoffset` on every stroked path (9 / 21 / 63 paths in `#pl-1/2/3`). **Step 1:** `#pl-1` 0px, `#pl-2` 1px, `#pl-3` 1px, `#pl-4` clip `inset(0 100% 0 0)`. **Step 2:** `#pl-2` 0px, `#pl-3` 1px. 250 ms into the step-2 draw the 21 paths read 0.65 → 1px (a real per-path staggered draw). **Step 3:** `#pl-3` 0px, its nodes at opacity 1. **Step 4:** clip `inset(0)`, `#pl-1/#pl-2` opacity 0.45, orange disc filled. Scrolling back up (4 → 3 → 2 → 1) restores each state: at step 2 `#pl-3` returns to 1px and the clip resets; at step 1 `#pl-2` returns to 1px. Identical at 1024 × 768, 1280 × 800 and 1920 × 1080 (dark). The four screenshots differ visibly: measure frame only, then the plan grid and circle, then the built outlines with hatching and connectors, then the solid fill with the orange disc. Real wheel scrolling (80 px ticks) gives 1→2→3→4 going down and 4→3→2→1 going up at all three widths. Keyboard Arrow and PageUp/PageDown in both motion modes: `data-step` is always one of the steps in the band (`plate-keys.txt`). |
| R1-02 | **closed** | `checks/sheet-1280-reduced-light-down.png`, `shots/reduced-1280-light-full.png`, `checks/plate-1280-nojs-light.png`, `checks/nojs-1280-dark-full.png` | Reduced motion: 60 ms after each step change, the plate state already matches it (dashoffsets, clip and opacity as above), so the swap is instant with no transition. Counter, bar segments, step box and plate agree at every step, down and up. In the reduced full-page shot the plate shows only the measure layer under "01 / 04". JS off: `data-step="4"`, the plate is finished, the counter reads `04 / 04`, all 4 segments are accent, no step box is highlighted and there's no `aria-current`. |
| R1-03 | **closed** | `checks/dim-375.png`, `checks/dim-320.png`, `checks/dim-768.png`, `checks/dim-1280.png`, `shots/tiles/375-light/tile-01.png` | 375: `.dim` spans x16–359 (343 px): tick, a 55 px line, the 184 px label, a 55 px line, then a tick at x358. 320: 288 px with 27 px lines and both ticks. md+ is unchanged: the dimension equals the h1 width (673 px at 768, 1052 px at 1280). Same in reduced motion. See R2-01 for how the right end reads at 375. |
| R1-04 | **closed** | `checks/phone-375.png`, `checks/checks.txt`, `audit/tap-targets.json` | `#phone-value` is 115 × 46 px at 375 (121 × 47 at 768, 127 × 48 at 1280) through 10 px padding with a −10 px margin. `elementFromPoint` hits the link at its top, middle and bottom at 375. The audit's under-44 list no longer includes it. No layout shift: the round-1 and round-2 tiles `375-light/tile-03`, `768-light/tile-03` and `1280-light/tile-04` are **pixel-identical** (PIL difference bbox `None`), and full-page heights are unchanged. |
| R1-05 | **closed** | `checks/checks.txt`, `checks/direct-top-1280.png` | Wordmark and "Back to top" (clicked from the page bottom) land at `scrollY` 0 with the nav top at 0, at 375 and 1280, in smooth and reduced modes. A direct `/#top` load also lands at `scrollY` 0. `#build` / `#process` / `#contact` land 23.6–24.2 px from the top for nav clicks (an injected link at 375, where the nav has only Contact) and direct loads, in every mode. |
| R1-06 | **closed** | `checks/copy-failed-768.png`, `checks/copy-failed-1280.png`, `checks/copy-failed-375.png` | With `writeText` rejected, "Couldn't copy. Text selected." renders on one line (height equals one line-height) at 768 (223 px wide), 1280 (235 px) and 375. The email is selected, and the live region announces the same string. `copy.ts` matches `copy.md` line 119. |
| R1-07 | **closed** | `checks/checks.txt` | `out/opengraph-image.png` is a 1200 × 630 PNG served as `Content-Type: image/png`. `og:image` and `twitter:image` are `/opengraph-image.png?5a7db6fc26a7cfb5` (root-relative) in `index.html` and `404.html`, with `og:image:type image/png`. There's no `localhost`, canonical or `og:url` in `out/*.html`; the only "localhost" string is inside a Next framework chunk, as in round 1. |

Note on method: an *instant programmatic jump* from the step-4 position to step 3's centre leaves `data-step=4` (`plate-states.txt`, "up step 3"; the `*-up-step3.png` crops show step 4). Step 4's `li` is only 140 px tall, so step 3 is already inside the observer band at the step-4 position and no new entry fires. Wheel, keyboard and smooth scrolling never hit this (`plate-wheel.txt`, `plate-keys.txt`), so I haven't filed it. If the Builder touches `PageEffects`, deriving the active step from the full set of currently intersecting steps would make it robust.

## Regression checks (round 1 list)
| Check | Result | Evidence |
|---|---|---|
| Facts rule | **Clean.** The page text (`checks/text-1280.txt`) is the same as in round 1 (the shortened copy-failed string appears only on failure). The only specifics are custom software, the three kinds, agkbuilds@gmail.com, 254-231-1149 and Dylan Borgen. Searching for client, year, team, award, trusted, since, %, location or place names finds nothing. Meta, OG and Twitter text and JSON-LD (Organization: name, description, email, telephone) carry only the same facts. | `checks/regression.txt` |
| mailto / tel | Hero and contact CTAs and the footer email all use `mailto:agkbuilds@gmail.com?subject=Custom%20software%20inquiry`. The title block and footer both use `tel:+12542311149`. The 404 page keeps the footer email and phone. | `checks/regression.txt` |
| Copy buttons | Success: the clipboard reads `agkbuilds@gmail.com` / `254-231-1149`, the label shows COPIED in accent, "Email address copied." is announced, and the label reverts after 2.4 s. Failure: see R1-06. With JS off, 0 buttons render and the values show. | `checks/copy-success-1280-dark.png`, `checks/nojs-1280-dark-full.png` |
| 404 | `/no-such-sheet` returns HTTP 404 with the title "Sheet not found: Agkbuilds" and a designed sheet page. The only failed resource is the document itself. | `checks/404-1280-light.png`, `checks/404-375-dark.png` |
| h1 | Accessible name: `heading "Custom software, drawn to fit. Then built." [level=1]`. All 12 overlay layers end `visibility: hidden` (1280 and 375), and under reduced motion they are `display: none`. | `checks/regression.txt` |
| Headline animation | Unchanged: rules draw, the circle constructs, the outlines pen in, then the fill sweeps behind the orange pen edge and leaves "THEN BUILT." solid orange. Reduced motion has 0 animations and the solid headline at first paint. | `checks/sheet-hero-1280-a.png`, `checks/sheet-hero-1280-b.png`, `checks/sheet-hero-375.png`, `shots/reduced-1280-light-fold.png` |
| Fonts | CDP `getPlatformFontsForNode` over every element at 1280 dark, 375 light and the 404 page finds only Archivo, Archivo SemiBold, Archivo Expanded ExtraBold and JetBrains Mono Medium. **No system font.** | `checks/regression.txt` |
| Images | All 4 `/drawings/process-step-n.svg` thumbnails load at 375 (naturalWidth 200) in both motion modes. At lg they are `display: none` and lazy, so they don't load there (correct). No broken images. | `checks/regression.txt`, `shots/tiles/375-light/tile-02.png`, `shots/tiles/768-dark/tile-02.png` |
| Dependencies | Unchanged (`next`, `react`, `react-dom`; dev: tailwind, eslint, ts). `eslint src` is clean. | `site/package.json` |

## Rubric
| # | Criterion | Score | Evidence | Why |
|---|---|---|---|---|
| 1 | Concept clarity | 9 | `shots/tiles/1280-dark/tile-01.png`, `shots/frames/frame-05.png`–`frame-09.png`, `checks/404-375-dark.png` | "Every build starts as a drawing" reads in seconds and now carries through the method plate too: one sheet drawn in four passes under "FIG. 02 · ONE DRAWING, FOUR PASSES". |
| 2 | Hierarchy | 8 | `shots/frames/frame-01.png`, `shots/fold-375-light.png` | The eye goes headline, then subhead, then the orange CTA. Labels stay quiet. Unchanged from round 1. |
| 3 | Typography | 8 | `shots/tiles/1280-light/tile-01.png`, `shots/tiles/1280-light/tile-04.png` | A characterful pairing with a dramatic scale (110 / 18 px) and balanced, pretty-wrapped prose. The very tight display leading on "TELL US / WHAT TO / BUILD." still holds it at 8. |
| 4 | Color | 9 | `checks/sheet-1920-motion-dark-down.png`, `shots/tiles/1280-dark/tile-02.png` | One orange that only means built or actionable. Dark is designed: the plate's solids turn paper-coloured, with its own accent value. The plate now uses the accent at exactly one moment (the step 4 disc). |
| 5 | Spacing and rhythm | 8 | `shots/frames/frame-03.png`, `shots/frames/frame-09.png` | Scale-based, with the intended tight run and then a breath. The lg process column still leaves about 400 px of empty right column once the plate scrolls off (`frame-09`). |
| 6 | Motion quality | 9 | `checks/sheet-1280-motion-light-down.png`, `shots/frames/frame-05.png`–`frame-09.png`, `checks/sheet-hero-1280-b.png`, `checks/sheet-1280-reduced-light-down.png` | The plate now does what motion.md promises: measure, then plan, then build drawn with a per-path pen stagger (measured mid-draw at 0.65 → 1px), then the fill sweeps 700 ms later and measure and plan recede to 0.45. It plays back correctly in both scroll directions and at 1024 / 1280 / 1920. Together with the 9-level headline, motion is choreographed and every bit of it expresses the concept. Reduced motion is a designed instant state swap, not a frozen contradiction. |
| 7 | Signature moment | 9 | `checks/hero-1280-dark-t1250.png`, `checks/sheet-1280-motion-light-down.png` | Outline-to-solid "THEN BUILT." is screenshot-worthy and *is* the sentence. Its second act, a blank measured sheet becoming a built, filled drawing in four scroll-driven passes, now lands and repeats the idea at section scale. |
| 8 | Originality | 8 | `shots/tiles/1280-dark/tile-01.png`, `shots/tiles/375-light/tile-02.png` | No banned patterns. The drawing-set system is specific to "builds". The headline words alone could still belong to another custom-software firm. |
| 9 | Responsiveness | 9 | `shots/tiles/375-light/tile-01.png`, `shots/tiles/375-light/tile-03.png`, `shots/tiles/768-dark/tile-02.png`, `shots/tiles/1920-light/tile-02.png`, `checks/dim-320.png`, `checks/phone-375.png` | Every breakpoint is composed: the 375 tower with a full-width dimension, the 768 thumbnail steps, the sticky plate at lg/xl. Targets are ≥ 44 px (phone 46, copy 44 via `::before`, nav and footer 44). It works at 320. The only blemish is the 375 right dimension end overlapping the circle (R2-01, minor). |
| 10 | Craft details | 9 | `shots/hover/*`, `audit/focus/*`, `checks/copy-failed-768.png`, `checks/copy-success-1280-dark.png`, `checks/404-375-dark.png` | Hover, focus (2 px orange ring), pressed, `::selection`, favicon, an OG image now typed `image/png`, a designed 404, copy success and failure states on one line, the no-JS state, the skip link, and back-to-top landing at 0. All three round-1 craft deductions are fixed. |
| | **Average** | **8.6** | | |

## What works (protect in fixes)
- **The process plate fix.** Structural selectors and state rules sit outside the motion query, with only the transitions inside `no-preference`. This one structure gives the animated draw, the instant reduced-motion swap and the no-JS finished state. Don't go back to `[pathLength]` selectors.
- **The headline reveal:** timing, layering, a single-sentence accessible name, and LCP not delayed (Performance 99).
- **The bill of materials**, with the closing double rule and "03 PARTS · END OF LIST".
- **The title block** as the contact UI. The R1-04 hit area changed nothing visually (pixel-identical tiles).
- **Anchors:** `#top` lands at 0, everything else at 24 ± 0.4 px.
- **Fonts:** full glyph coverage, no fallback anywhere.

## Defects
| ID | Severity | Owner | Evidence | Expected | Actual | Suggested fix |
|---|---|---|---|---|---|---|
| R2-01 | minor | designer | `checks/dim-375-right-zoom.png`, `checks/dim-375.png`, `shots/tiles/375-light/tile-01.png` | At 375 the dimension line reads as its own figure: a tick, a line, the label, a line and a tick, with both ends legible (R1-03 intent). | Geometrically correct (right tick at x358–359, a 55 px right line), but at 375 the right tick lands on the hero circle's vertical dash-dot centre line (also about x358). The circle's lower arc and tick marks also cross the right line half, so the right end reads as part of the circle rather than as a dimension end. It reads cleanly at 320 (`dim-320.png`) and md+. | In `layout-spec.md` (hero, sm), either inset `.dim` at sm so its right tick clears the circle's axis (for example end it 16–24 px short of the content edge), or move the sm circle so its centre line doesn't coincide with the content edge. Keep both halves at least 24 px. |

Counts: designer 1 (minor) · builder 0 · copywriter 0. Blockers: 0. Majors: 0.

## Code checks
- **Hard-coded colours:** only the `var(--token, #fallback)` fallbacks inside the generated SVG strings (`src/assets/drawings.ts`) and the two `theme-color` literals in `layout.tsx`, which metadata requires. Not defects (unchanged).
- **Arbitrary values:** `max-w-[30rem]` ×3, `max-w-[34rem]`, `max-w-[22rem]`, `pt-[0.2em]`, `w-[max(100%,280px)]` and `gap-[calc(var(--spacing-section-xs)/2)]` are exact spec values with no matching token. Unchanged and not defects. The new CSS uses `--nav-h` (56 / 72 px) as a local custom property, which the layout spec defines.
- **`"use client"` on page/layout:** no. The client islands are only `CopyButton.tsx` and `PageEffects.tsx`.
- **Reduced-motion coverage:** CSS-only motion, with 7 `prefers-reduced-motion` blocks. The process **states** now sit outside the motion query on purpose (motion.md R1-02) and only their transitions sit inside `no-preference`. No `motion/react` and no `MotionConfig` (correct by decisions #21).
- **Extra dependencies:** none.
- **Methods** (scripts in the session scratchpad, read-only against the site): Playwright at 1024/1280/1920 sampling computed `stroke-dashoffset`, opacity and clip-path for every plate path at each step, both directions, plus a mid-draw sample; 80 px wheel and keyboard scroll sweeps logging `data-step` against the steps in the observer band; anchor clicks and direct loads at 375/1280 × smooth/reduce; a rejected clipboard and a granted clipboard; JS disabled; `getAnimations()` paused at fixed times for the headline frames; CDP `CSS.getPlatformFontsForNode` over all elements; and a PIL pixel diff of round-1 vs round-2 tiles.

## Regression (round 2)
- Score changes: Motion quality 7 → 9; Signature moment 8 → 9; Responsiveness 8 → 9; Craft details 8 → 9; all others unchanged (Concept 9, Hierarchy 8, Typography 8, Color 9, Spacing 8, Originality 8). Average 8.1 → 8.6.
- Closed: R1-01, R1-02, R1-03, R1-04, R1-05, R1-06, R1-07.
- Still open: none.
- New or worse: R2-01 (minor, designer), a side effect of the R1-03 full-width dimension at 375. Nothing regressed: page text, links, fonts, headline, 404, no-JS and the contact layout (pixel-identical) all match round 1. No closed defect reappeared.
