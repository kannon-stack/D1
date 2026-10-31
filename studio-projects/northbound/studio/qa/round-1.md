# Critique: round 1

- **Project:** `studio-projects/northbound/`
- **Date:** 2026-10-31
- **Verdict:** **FAIL** (on one gate input only: Lighthouse mobile Performance 88, confirmed twice)
- **Evidence:** `round-1/shots/`, `round-1/audit/`, plus `round-1/extra/` (settled hero, pinned stage at set scroll progress, interaction and form states, 404, OG, selection) and `round-1/audit-confirm/` (a second 3-run Lighthouse pass for confirmation)

## Gate
| Check | Result | Needs | Pass |
|---|---|---|---|
| Rubric average | 8.2 | ≥ 8.0 | yes |
| Lowest criterion | 7 (Spacing and rhythm; Craft details) | ≥ 7 | yes |
| axe serious + critical | 0 (no violations at 375 or 1280, light or dark) | 0 | yes |
| Lighthouse Performance (mobile) | **88** (median of 3). Confirmation pass, another median of 3: **88**. LCP 3.5 s, TBT 210 ms, FCP 1.2 s, CLS 0, SI 1.3 s | ≥ 90 | **no** |
| Lighthouse Accessibility | 100 (BP 100, SEO 100) | 100 | yes |
| Horizontal overflow | none (375, 768, 1280, 1920) | none | yes |
| Console / page errors | 0 on `/` (the only 404s logged were the intentional `/no-such-page` request) | 0 | yes |
| Open blockers | 1 (R1-01) | 0 | **no** |

**How close is Performance?** It is 2 points short, not "exactly 90". Six runs over two passes, with nothing else running against the server, both gave a median of 88 with identical metrics. So this is not noise. LCP (weight 25) scores 0.65 at 3.5 s, and TBT (weight 30) scores 0.89 at 210 ms. Either cutting LCP to about 2.8 s or cutting TBT to about 120 ms would get it over the line. Aim for 93 or more so normal variance can't tip it back.

## Rubric
| # | Criterion | Score | Evidence | Why |
|---|---|---|---|---|
| 1 | Concept clarity | 9 | `extra/settled-fold-1280-light.png`, `extra/stage-1280-light-p100.png` | "Every roast is a climb. We send you the map." sits over a map whose section line carries the spot heights 88° → 152° → 196° → ▲ 207°, with the legend "height = bean temperature". You can state the concept within 5 seconds. Every later section speaks the survey language: section A–A′, a shared temperature axis, route chainage, the moss "vegetation" selection and the map collar. |
| 2 | Hierarchy | 8 | `extra/settled-fold-1280-light.png`, `shots/tiles/1280-light/tile-07.png` | The hero reads headline → subhead → CTA, with the route card as clear secondary proof. The roasts and route sections have a clean order. Noise: in subscribe the "included" list floats mid-column (R1-05), and the 7-line proof quote at `text-3xl` weighs as much as its own section title. |
| 3 | Typography | 8 | `shots/tiles/1280-light/tile-01.png`, `shots/tiles/1280-light/tile-04.png` | One family carrying wide display, normal text and condensed map lettering is characterful and exactly on concept. The scale is dramatic and figures are tabular. Deductions: a separator leads a wrapped line ("· Caramel"), the producer wrap breaks the row rhythm (R1-06), and the plan-card fine print looks loosely tracked. |
| 4 | Color | 8 | `shots/tiles/1280-dark/tile-07.png`, `extra/stage-1280-dark-p100.png` | Sienna does the line work and the CTAs. Moss, sienna tint and lake each have a single job (drying/selected, Maillard, cooling). Dark is designed rather than inverted: warm umber ground, a lifted accent with dark ink on buttons, and a deepened moss. The fold has two filled accent buttons (nav and hero), which goes against the "one filled button per viewport" rule. |
| 5 | Spacing and rhythm | 7 | `shots/tiles/1280-light/tile-06.png`, `shots/tiles/1280-light/tile-07.png` | The planned rhythm reads: a tight data run, then the valley (proof), then the decision. But the subscribe left column has an accidental ~230 px hole (R1-05), and the proof stat's leader has no room (R1-03). |
| 6 | Motion quality | 9 | `shots/frames/frame-03.png`, `extra/stage-1280-light-p015.png` → `p045` → `p085` → `p100` | The pen-plotter pace is real. The strip ticks land, projections drop, the curve plots under a plumb cursor with a live `T 3:48 · BT 139.5°` readout, waypoints pin, and the phase bar fills last. The hero section line plots and spot heights pin as it passes, while the land stays still. Reduced motion is a designed still (`shots/reduced-1280-light-full.png`). Small flaw: the 375 narration leads the readout (R1-07). |
| 7 | Signature moment | 9 | `extra/stage-1280-light-p100.png`, `shots/frames/frame-03.png` | Section A–A′ is screenshot-worthy, and it is the concept proven with data: the map you saw becomes batch 214's roast curve, labelled CHARGE/TP/DE/FC/DROP with the DTR readout. |
| 8 | Originality | 9 | `extra/settled-fold-1280-dark.png`, `extra/og-image.png` | Passes the "any company" test easily: batch numbers, Guji/Wachu Hora, roast date, contour interval in °C. No banned patterns: no gradients, glass, blobs, emoji, stock imagery or template stack. |
| 9 | Responsiveness | 8 | `shots/tiles/375-light/tile-01.png` … `tile-10.png`, `extra/stage-375-light-final.png`, `shots/fold-768-light.png` | 375 is recomposed, not stacked: a map window cropped to the summit with the route card overlapping it, a comparison plate before the cards, a vertical route with text Skip buttons, one-row plan radios with the default first, and a full-bleed form. 768 is composed too. Deduction: right-edge label pile-up in the 375 stage (R1-04). |
| 10 | Craft details | 7 | `shots/hover/*`, `audit/focus/*`, `extra/selection-1280-light.png`, `extra/form-1280-*.png`, `extra/404-1280-light.png` | Hover, focus and pressed states are present. Moss `::selection`, favicon, OG image and a designed 404 all exist. The form has empty, invalid, loading, error and success states, and the skip link comes first. Held at 7 because the success state renders off-screen (R1-02). Also: the desktop holiday asterisk has no visible note (R1-08), and the 404 body sits on contours (R1-09). |
| | **Average** | **8.2** | | |

## What works (protect these in fixes)
- **The hero, settled** (`extra/settled-fold-1280-light.png`, `-dark.png`): the meadow clearing under the headline, knockout spot heights, the route card's 214 + mini curve, and the bordered legend. The fold shots (`shots/fold-1280-*.png`) catch it mid-survey: the line is around 60 %, 196° and ▲ 207° are not yet pinned, and the legend is not shown. That is choreography H1/H2/H5 working as specified, not a defect.
- **Section A–A′** in every state: the projection lines resting at 0.35, the event labels, the readout's final "Drop 10:40 · 207.0° · DTR 17%", and the DTR definition in the narration row. Its legibility as real data meets the brief's success criterion.
- **Roasts:** one set of 200° / 150° / 100° gridlines running edge to edge through all three cards (`shots/tiles/1280-light/tile-04.png`), plus the shared light→dark scale with ▼ markers.
- **Route schedule:** pins re-pin on cadence change; skip gives a hollow pin with a strike and "Skipped"; the readout updates; the Christmas shift is handled (`extra/route-1280-skipped.png`, `extra/route-1280-1week.png`, `extra/route-375-skipped.png`).
- **The form state machine:** invalid (danger border, message, focus to input), "Starting…" with disabled inputs, and the `?fail` error with Try again (`extra/form-1280-invalid.png`, `-loading.png`, `extra/form-1280-error-viewport.png`).
- The dark scheme as a whole, and the reduced-motion page.

## Builder's declared deviations (judged on merit)
| Deviation | Verdict |
|---|---|
| No hero entrance animation | **Correct.** motion.md H4 says the headline, coda, subhead, CTAs and terrain are static on first paint. |
| Phase names in the bar only from 1024 px | **Accept.** At 768 the development segment is about 117 px and cannot hold "DEVELOPMENT 1:50 · 17%". The caption row reads cleanly (`extra/stage-768-light-p100.png`). The Designer should fold this into layout-spec (md behaves like sm). |
| Thinned strip index-tick labels | **Accept.** 9 labels, each legible, none colliding (`shots/frames/frame-03.png`). |
| Subscribe title spans cols 1–6 | **Accept.** It sets as 2 clean lines and stops at the panel gutter. |
| Extra strings in `specCopy` | **Accept.** All 10 are quoted from layout-spec (home aria-label, T/BT, A/A′, table heads). No invented prose. The Copywriter can adopt them into copy.md for a single source; this is not a defect. |
| Footer links in ink | **Accept.** The spec's "accent with underline on hover" reads as the hover state, and ink at rest keeps the accent scarce. |
| OG image uses static TTFs | **Accept.** The render is correct and on-brand (`extra/og-image.png`). |
| 404 terrain loads after hydration | **Accept** for a non-entry page; it is in place once settled (`extra/404-*.png`). The 404's text placement is a separate defect (R1-09). |
| "Performance sits at exactly 90" | **Not reproduced.** The median is 88 on two independent 3-run passes. See R1-01. |

## Defects
| ID | Severity | Owner | Evidence | Expected | Actual | Suggested fix |
|---|---|---|---|---|---|---|
| R1-01 | blocker | builder | `audit/summary.md`, `audit/lighthouse.json`, `audit-confirm/summary.md` | Lighthouse mobile Performance ≥ 90 (median of 3) | 88 and 88. LCP 3.5 s; the LCP element is the hero subhead text `p.hero-sub`, gated by the font swap. TBT 210 ms. Main thread 2.7 s: 0.8 s other, 0.7 s script eval, 0.63 s style/layout, 0.41 s rendering. Two preloaded Archivo files at 102 KB and 90 KB compete on the simulated slow 4G link. | (1) Preload only the roman. Load the italic as a second `next/font` instance with `preload: false`; it is used only for "climb." and origin names, and the swap there is sub-pixel. (2) Move the static strip/profile SVG strings out of the client `RoastStage` bundle (`0hf1-tjcpb7g_.js`, 65 KB raw, 25 long path strings). Render those layers in the server `RoastCurve` and pass them to the client stage as children/slots, so only the overlays hydrate. (3) Put `content-visibility: auto` with a `contain-intrinsic-size` on the below-fold sections (roasts, how-it-works, proof, subscribe) to cut style, layout and paint. Re-audit; target ≥ 93. |
| R1-02 | major | builder | `extra/form-1280-success-viewport.png`, `extra/form-375-success-viewport.png` | After a valid submit, the success panel (▲, "You're on the route.", the summary) is on screen and focused (S3) | The form is swapped for the much shorter success panel and the page doesn't move. The focused `h3` ends up 298 px (1280) and 256 px (375) **above** the viewport because `focus({ preventScroll: true })` is used. The user sees the closing line and footer with no confirmation. | After S3, call `panel.scrollIntoView({ block: "start" })` (smooth only under `prefers-reduced-motion: no-preference`), with `scroll-margin-top: 80px` on the panel, then focus the heading with `preventScroll`. Or keep the panel's min-height at the form's height until the user scrolls. |
| R1-03 | minor | designer | `shots/tiles/1280-light/tile-06.png`, `shots/frames/frame-08.png` | proof stat: a 1 px accent leader from the value's right edge to the column edge, then 24 px down (P1) | At 1280, "2.6 days" at `text-5xl` wide fills the 373 px span, so the leader is a ~3 px stub. It works at 375 (`shots/tiles/375-light/tile-07.png`). | Use `text-4xl` for the value up to 1439 px and `text-5xl` from 1440, or route the leader under the value to the caption. |
| R1-04 | minor | designer | `extra/stage-375-light-final.png`, `extra/stage-1280-light-p100.png` | Labels in clearings, never crossed by lines (direction principle 3) | At 375 the last ~15 % of the profile stacks the FC label, "Cooling", the 200° y-label, the dashed cooling curve and the DROP label on the strip edge. At 1280 the dashed lake curve runs through "Cooling". | At sm, put the FC label above-left of its dot and the DROP label below the strip with a knockout. Drop the in-plot "Cooling" label at sm (the phase bar already says COOLING). At md+, move the label to about left 90 % / top 70 %, below the curve. |
| R1-05 | minor | builder | `shots/tiles/1280-light/tile-07.png`, `extra/form-1280-error-viewport.png` | subscribe left column: `included_title` 40 px under the lede; only `closing` bottom-aligns with the panel | "Every delivery includes" starts ~230 px below the lede, leaving a hole mid-column. | Remove the column-level `justify-between` (or the auto margin on the list). Put `margin-top: auto` on `closing` only. |
| R1-06 | minor | builder | `shots/tiles/1280-light/tile-04.png`, `shots/tiles/375-light/tile-05.png` | Three roasts comparable at a glance: fields on the same rows across cards | Guji's producer "Wachu Hora / washing station" wraps, so all its rows sit 22 px lower than Nyeri's and Huila's. The tasting notes wrap with the separator leading the line ("· Caramel", "· Brown sugar" at 375). | Align the field rows across the three cards with CSS subgrid (`grid-row: span N; grid-template-rows: subgrid`). Render each separator + note pair as `white-space: nowrap` with the "·" at the end of the previous item, so lines break after separators. |
| R1-07 | minor | builder | `shots/tiles/375-dark/tile-02.png`, `shots/tiles/375-light/tile-02.png` | Narration shows the last event the readout has passed (RC5/RC6) | At 375 the narration says "DROP · Out of the drum…" while the readout shows T 10:01 / 10:29: the narration follows the raw head and the readout follows the spring. | Derive the narration event from the same smoothed `t` that feeds the readout. |
| R1-08 | minor | builder | `extra/route-1280-1week.png` | Every mark explained on the page | The desktop route shows "Thu 24*" (1-week cadence) but `holiday_note` only renders in the mobile list and the per-stop readout. | When any visible stop has `holiday`, render `holiday_note` (text-xs muted) under the timeline legend at md+. |
| R1-09 | minor | builder | `extra/404-1280-light.png` | 404: title, body (max 30rem) and link stacked in the clearing; no contour under text | At 1280 the body copy sits in the right half over contour lines and a "100°" index label. | Stack the body under the title inside the clearing column, as the 375 layout already does (`extra/404-375-light.png`). |

**Owner counts:** builder 7 (1 blocker, 1 major, 5 minor) · designer 2 (minor) · copywriter 0.

**Capture artifacts (not defects):**
- In `shots/tiles/375-*/tile-01.png` the skip link appears and the nav is offset. In a real 375 load the skip link sits at top −68 px and nothing is focused (`extra/extra-log.json`, `extra/settled-fold-375-light.png`).
- The blank band in `shots/tiles/*/tile-03.png` is the 260 svh sticky track flattened by the full-page capture. The frames and `extra/stage-1280-*` show it pinning correctly.

## Code checks
- **Hard-coded colours:** none in components. The only hex values are `var(--token, #fallback)` fallbacks inside the generated SVG strings in `src/assets/*.ts`, which is acceptable. OG image excluded.
- **Arbitrary values:** `h-[0.95em]` (NavBar wordmark tick), `h-[0.8em]` (footer tick) and `h-[1.5em]` (RouteSchedule). All are em-relative glyph sizes the spec gives exactly; no token exists for them. Acceptable.
- **`"use client"` on page/layout:** no.
- **Reduced-motion coverage:** `MotionConfig reducedMotion="user"` in `MotionProvider` wraps `LazyMotion`. The two "unguarded" hits, `lib/motion.ts` (tokens/types) and `lib/motion-features.ts` (`domAnimation` export), are not components, so they are false positives. The reduced capture shows a complete still page.
- **Extra dependencies:** none beyond next, react, react-dom and motion.
- **Tap targets (375):** 9 under 44 px. 5 are the visually hidden radio inputs, whose labels (the cards) are the real targets. The others are the skip link (40 px) and inline links. The desktop waypoint pins are 32 px (md+ only, pointer). Nothing to fix for the gate.

## Regression (round 2+)
- Not applicable (round 1).
