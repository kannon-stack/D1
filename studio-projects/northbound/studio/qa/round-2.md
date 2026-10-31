# Critique: round 2

- **Project:** `studio-projects/northbound/`
- **Date:** 2026-10-31
- **Verdict:** **FAIL** (one new blocker, R2-01: with `content-visibility` on the four lower sections, in-page anchors land in the wrong place. The primary "Start a subscription" CTA puts the user on the footer at 1280 and short of the form at 375. Every numeric gate input passes.)
- **Evidence:** `round-2/shots/`, `round-2/audit/`, `round-2/audit-confirm/` (a second 3-run Lighthouse pass), `round-2/extra/` (settled folds, the stage at set progress, form states, route, 404, anchor-landing tests, wheel-scroll frames, font-fallback report, crops) and `round-2/extra/cvtiles/` (full-page tiles with `content-visibility` neutralised; see "Capture artifacts")
- **Runs:** the build, `screenshot.mjs` and `audit.mjs` all completed in the first session (102 images, Lighthouse 3 runs), and the source hasn't changed since that build. After the usage-limit stop I restarted the server and did **not** re-run `screenshot.mjs` or `audit.mjs`. I added `audit-confirm/` (a full second `audit.mjs` pass) and the `extra/` captures.

## Gate
| Check | Result | Needs | Pass |
|---|---|---|---|
| Rubric average | 8.3 | ≥ 8.0 | yes |
| Lowest criterion | 7 (Craft details) | ≥ 7 | yes |
| axe serious + critical | 0 (no violations at 375 or 1280, light or dark; both passes) | 0 | yes |
| Lighthouse Performance (mobile) | **93** (median of 3). Confirmation pass, another median of 3: **93**. LCP 3.1 s, TBT 70 ms, FCP 1.1 s, CLS 0, SI 1.1 s. (The Builder claimed 94. I measure 93; the difference is within run noise.) | ≥ 90 | yes |
| Lighthouse Accessibility | 100 (BP 100, SEO 100) | 100 | yes |
| Horizontal overflow | none (375, 768, 1280, 1920) | none | yes |
| Console / page errors | 0 on `/` (the only 404s are the intentional `/no-such-page` requests) | 0 | yes |
| Open blockers | **1** (R2-01) | 0 | **no** |

## Rubric
| # | Criterion | R1 | R2 | Evidence | Why |
|---|---|---|---|---|---|
| 1 | Concept clarity | 9 | 9 | `shots/frames/frame-01.png`, `extra/stage-1280-light-p100.png` | Unchanged and still strong. The settled hero reads "Every roast is a climb" over the section line with its spot heights 88° → 152° → 196° → ▲ 207°. Every section stays in the survey language. |
| 2 | Hierarchy | 8 | 8 | `extra/form-1280-success-viewport.png`, `extra/cvtiles/1280-light/tile-06.png` | The subscribe hole is gone. "Every delivery includes" now sits right under the lede, so the left column reads lede → list → closing. The 7-line proof quote still outweighs its own section title. |
| 3 | Typography | 8 | 8 | `extra/cvtiles/1280-light/tile-04.png`, `extra/cvtiles/375-light/tile-04.png`, `extra/font-fallback.json` | Better. Roast fields now align across cards, and the tasting notes break *after* the separators ("Blackcurrant · / Grapefruit · Brown sugar"). The arrows are now Archivo's own long → instead of round 1's fallback glyph (compare `round-1/shots/fold-1280-light.png` with `shots/fold-1280-light.png`). The real italic face (`Archivo-SemiBoldItalic`) is used. Still short of 9: the plan-card fine print is loosely tracked, and at 375 the proof title strands "station" on its own line. |
| 4 | Color | 8 | 8 | `extra/cvtiles/1280-dark/tile-07.png`, `extra/stage-1280-dark-p100.png` | Unchanged. Dark is designed (umber ground, deepened moss, lifted accent with dark ink). The fold still has two filled accent buttons. |
| 5 | Spacing and rhythm | 7 | **8** | `extra/cvtiles/1280-light/tile-07.png`, `extra/stat-1280-light-crop.png` | Both round-1 holes are fixed: the subscribe column is closed up (R1-05), and the stat now has a full-width leader under "2.6 days" with a 12 px rhythm (R1-03). The tight-run → valley → decision rhythm reads as planned. |
| 6 | Motion quality | 9 | 9 | `shots/frames/frame-02.png` → `frame-03.png`, `extra/stage-1280-light-p045.png`, `extra/extra-log.json` (`narration375`) | The narration now follows the readout. At 375 every sample pairs correctly, e.g. T 0:38 → CHARGE, 1:34 → TP, 5:13 → DE, 8:50 → FC, 10:40 → DROP (R1-07). The pen-plotter choreography is intact with the server-rendered layers. Reduced motion is a designed still (`extra/cvtiles/1280-light-reduced/tile-02.png`). |
| 7 | Signature moment | 9 | 9 | `extra/stage-1280-light-p100.png`, `extra/stage-375-light-final.png` | Section A–A′ is cleaner. At 375 the right edge no longer piles up (FC label above-left, DROP label in its own lane, no in-plot Cooling). At 1280 "Cooling" sits in clear space below the curve. |
| 8 | Originality | 9 | 9 | `shots/fold-1280-dark.png`, `extra/404-1280-light.png` | Unchanged. Passes the "any company" test easily, with no banned patterns. |
| 9 | Responsiveness | 8 | 8 | `extra/cvtiles/375-light/tile-01.png` … `tile-10.png`, `extra/stage-375-light-profile-crop.png`, `extra/stage-768-light-p100.png` | 375 is still recomposed rather than stacked, and its stage is now legible. Held at 8: the comparison-plate y-labels are crossed by the charge fall at 375 and 768 (R2-04), and anchor landing differs by breakpoint (R2-01). |
| 10 | Craft details | 7 | 7 | `extra/form-375-success-viewport.png`, `extra/route-1280-1week.png`, `extra/404-1280-light.png`, `shots/hover/*`, `audit/focus/*`, `extra/anchor-1280-smooth-subscribe.png` | Three round-1 gaps are closed: the success panel is on screen and focused, the holiday asterisk is explained at md+, and the 404 copy sits in the clearing. Hover and focus states are intact (`audit/focus/focus-1…6.png`, `shots/hover/*-after.png`). Held at 7 because the primary CTA now lands on the footer (1280) or the proof stat (375) instead of the plan picker (R2-01). |
| | **Average** | **8.2** | **8.3** | | |

## What works (protect these in fixes)
- **Section A–A′ labels** (`extra/stage-375-light-profile-crop.png`, `extra/crop-stage-1280-light-right.png`): the label lane, FC above-left, and Cooling at 90 %/70 %. Nothing crosses a label at 375 or 1280 any more.
- **Subgrid roast rows** (`extra/cvtiles/1280-light/tile-04.png`): measured row tops are identical across all three cards (840/901/940/979/1018/1079 px, `extra-log.json` `roastRows-1280`), and so are those at 1440. The `display: contents` on the `dl` passes axe.
- **The success panel** scrolls to 80 px under the nav and takes focus (`extra/form-1280-success-viewport.png`: h3 at 155 px; `extra/form-375-success-viewport.png`: h3 at 133 px).
- **Local subset fonts:** every text node on `/` and `/no-such-page` at 375 and 1280 renders in Archivo, including °, ′, →, ↓, ×, …, ’ and the italic. The only exceptions are ▲/▼ (R2-03, pre-existing). See `extra/font-fallback.json`.
- **Server-rendered SVG layers:** the stage renders exactly as before in light and dark. TBT fell from 210 ms to 70 ms.
- **No pop or blank band while scrolling:** in wheel-scroll runs at 1280 and 375, a per-frame check found **0** frames where a `content-visibility` section was on screen but unrendered, and **0** layout-shift entries (`extra-log.json` `scroll-1280`, `scroll-375`; viewport shots `extra/scroll-*.png`).
- Everything listed under "What works" in round 1: the hero, the route schedule, the form state machine, the dark scheme and the reduced-motion page.

## Builder's and Designer's changes, judged on merit
| Change | Verdict |
|---|---|
| Local subset Archivo (decision #14) | **Accept.** No text falls back except ▲/▼, which Archivo doesn't contain (pre-existing, R2-03). It's a genuine improvement: in round 1 the → was a fallback glyph. `OFL.txt` (full OFL 1.1 with the Archivo Project copyright) and `README.md` sit beside the `.woff2` files. The README's regeneration recipe is incomplete (R2-02). |
| `content-visibility: auto` on roasts, how-it-works, proof, subscribe | **Reject in its current form.** Scrolling is clean, but anchors break (R2-01). The intrinsic sizes are far off: at 1280, 1800/1400/1300/1500 px against 1364/1251/1121/1302 rendered, so the page shrinks by about 2,150 px as you scroll. At 375 the sections grow by about 730 px. |
| Server-rendered SVG layers in the stage | **Accept.** Pixel-equivalent render, and a lighter client bundle. |
| Scrolling success panel | **Accept.** Closes R1-02. |
| Subgrid roast rows, separators kept with the previous note | **Accept.** Closes R1-06. |
| Narration from the spring-smoothed head | **Accept.** Closes R1-07. |
| Designer: stat leader under the value (layout-spec, motion P1) | **Accept.** The render matches the spec: a 1 px accent rule 12 px below the value, the full column width (372 px at 1280, 422 px at 1440), and a 6 px end tick (`extra/stat-1280-light-crop.png`). It works at every width. |
| Designer: A–A′ label repositioning (layout-spec row 5, motion RC8) | **Accept.** The render matches the spec at 375, 768 and 1280. One adjacent issue remains on the stage: at 768 the dashed cooling curve touches the right-aligned "120°" y-label. This is pre-existing and folded into R2-04. |

## Defects
| ID | Severity | Owner | Evidence | Expected | Actual | Suggested fix |
|---|---|---|---|---|---|---|
| R2-01 | **blocker** | builder | `extra/anchor-1280-smooth-subscribe.png`, `extra/anchor-1280-smooth-how-it-works.png`, `extra/anchor-375-hero-cta-subscribe.png`, `extra/anchor-1280-hashload-subscribe.png`, `extra/extra-log.json` (`anchors`); correct for comparison: `extra/anchor-1280-reduced-subscribe.png` | Every in-page link (nav, hero CTA, roasts CTA, route CTA, footer, a direct `/#subscribe` load) lands with the target section 64 px under the nav. Reduced motion does this (top 64/64/64/65). | With default smooth scrolling, and on direct hash loads: at **1280**, `#how-it-works` lands at −560 px and `#subscribe` at −1198 px. The **hero "Start a subscription"** leaves the whole form above the viewport (form bottom −46 px), so the user sees the footer. At **375**, `#how-it-works` lands at +593 px and `#subscribe` at +670 px (the form starts at 1036 px in an 812 px viewport, so the user sees the proof stat). Cause: the smooth-scroll target is computed against the `contain-intrinsic-size` placeholders, then the skipped sections render mid-scroll at very different heights. `#roasts` and `#roast-curve` are fine. This is a regression introduced by the R1-01 fix. | (1) Remove `content-visibility`/`contain-intrinsic-size` from all four sections and re-audit. Fonts plus server SVG may already clear 90 (keep ≥ 92 for margin). (2) If cv is needed for the score, keep it but make navigation exact. On any `a[href^="#"]` click and on initial load with a hash, add a root class that sets `content-visibility: visible` on the four sections, force layout, then `scrollIntoView` the target. Remove the class once the scroll settles; `auto` will then remember the real sizes. Re-test the nav, the hero/roasts/route CTAs and a direct `/#subscribe` load at 375 and 1280, in smooth and reduced motion. |
| R2-02 | minor | builder | `site/src/app/fonts/README.md`, `site/src/app/layout.tsx` comment, `extra/font-fallback.json` | The regeneration note reproduces today's glyph set | The README says to subset to ASCII plus "the non-ASCII characters in `src/content/copy.ts`". But →, ↓ and × live only in components (`Glyphs.tsx`, `Hero.tsx`, `NotFoundTerrain.tsx`, …), and copy.ts has none of them. Following the recipe would drop them to a system font. The layout comment ("requested with `text=`" from Google Fonts) also contradicts the README (`pyftsubset`). | Record the exact character list (or commit the subset script) including the component glyphs → ↓ ×. Make the comment and the README describe the same method. |
| R2-03 | minor | builder | `extra/font-fallback.json` (15 ▲/▼ nodes in a system face on `/`) | Map markers render the same on every platform | The ▲ summit/plan markers and the ▼ roast-scale markers come from whatever system font has U+25B2/U+25BC, because Archivo has no geometric shapes. This is pre-existing, not caused by the subset. | Draw them as a small inline SVG (or a CSS `clip-path` triangle) in `Glyphs.tsx`, sized in em. |
| R2-04 | minor | designer | `extra/crop-375-plate.png`, `extra/roasts-768-light.png`, `extra/crop-768-right-r1-vs-r2.png` | Labels in clearings, never crossed by lines (direction principle 3) | On the roasts comparison plate at 375 and 768, the 200°/150°/100° y-labels sit on the charge fall, and the line runs through "150°" and "100°". On the A–A′ stage at 768, the dashed cooling curve runs into the right-aligned "120°". Both were there in round 1. | Plate: inset the plot about 32 px so the y-labels sit in a gutter left of the curves. Stage at md: hide "120°" as sm does, or move the md y-labels left of the drop rule. |

**Owner counts:** builder 3 (1 blocker, 2 minor) · designer 1 (minor) · copywriter 0.

**Capture artifacts (not defects):**
- `shots/tiles/*/tile-04…07` (1280) and the matching 375/768/1920 tiles, plus the lower half of `shots/reduced-1280-light-full.png`, show **blank bands** where roasts, how-it-works, proof and subscribe should be. Chromium doesn't paint off-screen `content-visibility: auto` content in a full-page capture. In real scrolling they render: see `shots/frames/frame-04…08.png`, `extra/scroll-*.png`, and the zero-skip per-frame check. I judged those sections from `extra/cvtiles/` (the same page after a real scroll-through, with `content-visibility: visible` injected). Director: `screenshot.mjs` could neutralise cv for its tiles.
- `shots/frames/frame-09.png` and `frame-10.png` are identical because the frame sampler sized its steps from the initial (cv-inflated) page height. This is a side effect of the size mismatch described in R2-01.
- As in round 1, the blank band in `shots/tiles/*/tile-03.png` is the 260 svh sticky track flattened by the full-page capture.

## Code checks
- **Hard-coded colours:** none in components. Hex values appear only as `var(--token, #fallback)` inside the generated SVG strings in `src/assets/*`, which is acceptable. No new colour literals in the `globals.css` diff.
- **Arbitrary values:** `h-[0.95em]` (NavBar), `h-[0.8em]` (Footer) and `min-h-[1.5em]` (RouteSchedule). These are em-relative glyph sizes and no token exists for them. Unchanged from round 1; acceptable.
- **`"use client"` on page/layout:** no.
- **Reduced-motion coverage:** `MotionConfig reducedMotion="user"` in `MotionProvider`. The two unguarded hits (`lib/motion.ts`, `lib/motion-features.ts`) are not components. The reduced capture is complete (`extra/cvtiles/1280-light-reduced/`).
- **Extra dependencies:** none beyond next, react, react-dom and motion. `next/font/local` is part of next.
- **Fonts:** `src/app/fonts/OFL.txt` (93 lines, SIL OFL 1.1 with "Copyright 2020 The Archivo Project Authors") and `README.md` exist beside `archivo-normal.woff2` (63 KB) and `archivo-italic.woff2` (71 KB).
- **Tap targets (375):** 9 under 44 px, the same set as round 1: visually hidden radio inputs, the skip link at 40 px, and inline links. Nothing to fix for the gate.

## Regression (round 2)
- **Score changes:** Spacing and rhythm 7 → 8. All other criteria are unchanged (Concept 9, Hierarchy 8, Typography 8, Color 8, Motion 9, Signature 9, Originality 9, Responsiveness 8, Craft 7). Average 8.2 → 8.3.
- **Closed (all 9), each with new evidence:**
  - **R1-01:** Lighthouse mobile 93 and 93 (two 3-run medians; `audit/summary.md`, `audit-confirm/summary.md`). LCP 3.5 → 3.1 s, TBT 210 → 70 ms. The LCP element is still `p.hero-sub`.
  - **R1-02:** `extra/form-1280-success-viewport.png` and `extra/form-375-success-viewport.png`. The panel is at 80 px and the focused h3 is on screen.
  - **R1-03:** `extra/stat-1280-light-crop.png`. A full-width leader under the value.
  - **R1-04:** `extra/stage-375-light-profile-crop.png` and `extra/crop-stage-1280-light-right.png`.
  - **R1-05:** `extra/form-1280-success-viewport.png` and `extra/cvtiles/1280-light/tile-07.png`. The list sits directly under the lede.
  - **R1-06:** `extra/cvtiles/1280-light/tile-04.png`, `extra/cvtiles/375-light/tile-04.png` and `roastRows-1280` in `extra-log.json`.
  - **R1-07:** `extra-log.json` `narration375`, and `shots/tiles/375-light/tile-02.png` (T 9:35 paired with FC).
  - **R1-08:** `extra/route-1280-1week.png`. "* Christmas falls on a Friday, so this one arrives Thu 24 Dec." is visible at 1280.
  - **R1-09:** `extra/404-1280-light.png` and `extra/404-1280-dark.png`. The copy is stacked in the clearing, with no contour under the text.
- **Still open:** none.
- **Reappeared:** none.
- **New or worse:** R2-01 (blocker, a regression from the `content-visibility` part of the R1-01 fix). R2-02 and R2-03 come with the new font setup; R2-03's cause predates it. R2-04 is pre-existing and newly logged.
