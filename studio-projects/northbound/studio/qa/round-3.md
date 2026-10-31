# Critique: round 3

- **Project:** `studio-projects/northbound/`
- **Date:** 2026-10-31
- **Site HEAD:** `1085f3b` (round-2 build fixes), with the Designer's spec edit `c84a190` and the tool fix `8b42246`
- **Verdict:** **PASS.** Every gate input holds and no blocker is open. R2-01 is closed on my own evidence: 144 of 144 in-page link and hash-load cases land the target exactly 64 px from the top, at 375, 768 and 1280, with smooth scrolling and with reduced motion. R2-02, R2-03 and R2-04 are closed too. Nothing from round 1 or round 2 has reappeared. One new minor defect is logged (R3-01, pre-existing).
- **Evidence:**
  - `round-3/shots/`: `screenshot.mjs`, 102 images.
  - `round-3/audit/`: `audit.mjs`, Lighthouse 3 runs.
  - `round-3/audit-confirm/`: a second full `audit.mjs` pass, another 3 runs.
  - `round-3/extra/`:
    - anchor landings: `anchors.json` and the `click-*` and `direct-*` shots
    - the Builder's own script output: `builder-check-anchors.txt`
    - label geometry and font checks: `geom.json`
    - final-state stage and plate crops
    - zooms: `zoom-*`
    - regression shots: form, route, 404, menu

## Gate
| Check | Result | Needs | Pass |
|---|---|---|---|
| Rubric average | 8.4 | ≥ 8.0 | yes |
| Lowest criterion | 8 (Hierarchy, Typography, Color, Spacing, Responsiveness and Craft are tied) | ≥ 7 | yes |
| axe serious + critical | 0. No violations at 375 or 1280, light or dark, in either pass. | 0 | yes |
| Lighthouse Performance (mobile) | **93**, the median of 3 (`audit/summary.md`). The confirmation pass gives **94**, another median of 3 (`audit-confirm/summary.md`). LCP 3.2 s and 3.0 s, TBT 90 ms and 120 ms, FCP 1.1 s, CLS 0, SI 1.1 s. Removing `content-visibility` cost nothing measurable (round 2 measured 93 and 93). | ≥ 90 | yes |
| Lighthouse Accessibility | 100 (Best practices 100, SEO 100), in both passes | 100 | yes |
| Horizontal overflow | none at 375, 768, 1280 or 1920 (`shots/manifest.json` `overflow: {}`) | none | yes |
| Console / page errors | 0. The manifest has none, and my anchor run listened in all 6 contexts and recorded 0 (`extra/anchors.json`). The form and route runs also recorded 0. | 0 | yes |
| Open blockers | 0 | 0 | yes |

## R2 items re-verified with my own evidence

### R2-01 (blocker): anchors. **Closed.**
- **Fix:** `content-visibility` and `contain-intrinsic-size` are gone from `globals.css`.
- **My check** (`extra/scripts/anchors.mjs`, output in `extra/anchors.json`) works differently from the Builder's script:
  - It enumerates every same-page `href="#…"` link from the DOM instead of using a hard-coded list. That adds footer "The curve", the nav "Start a subscription" and the logo links.
  - It scrolls to each link with mouse-wheel input and clicks real mouse coordinates.
  - It opens the menu below lg.
  - It measures the target at scroll settle and again 1.5 s later, to catch late drift.
  - It adds 768, direct loads of `/#roasts` and `/#roast-curve`, and an upward nav jump from the page bottom.
- **Result:** 144 of 144 section targets land at **exactly 64 px** at settle and again after 1.5 s. The maximum deviation is 0 px, across 375, 768 and 1280, smooth and reduced. The cases are:
  - nav and menu links
  - the hero "Start a subscription", "See current roasts ↓" and "Read this curve ↓"
  - the roasts CTA and the route CTA
  - all footer links
  - direct `/#subscribe`, `/#how-it-works`, `/#roasts` and `/#roast-curve`
- **Logo links:** the 12 `#top` rows my script flags are the logo links. They correctly scroll to `scrollY = 0`, which is the page top, so they aren't misses. The hero sits under a 56 px in-flow bar below lg.
- **Builder's script:** `site/scripts/check-anchors.mjs`, re-run by me, reports 56 of 56 at `top=64` (`extra/builder-check-anchors.txt`). **The two agree** on every case they share.
- **Visual check:**
  - `extra/click-1280-smooth-top-subscribe.png`: the hero CTA lands on the plan picker.
  - `extra/direct-1280-smooth-how-it-works.png`.
  - `extra/click-375-smooth-top-subscribe.png`.
  - `extra/direct-375-smooth-how-it-works.png`.
- **Side effect:** the full-page tiles no longer have blank bands (`shots/tiles/1280-light/tile-04…08.png`, `shots/reduced-1280-light-full.png`).

### R2-02 (minor): font character record. **Closed.**
- **README, comment and source agree:**
  - `fonts/README.md` lists printable ASCII plus 20 characters.
  - The `layout.tsx` comment says the same method: Google Fonts CSS2 `text=` via `scripts/subset-fonts.mjs`, with the list in the README.
  - A scan of every `.ts`, `.tsx`, `.css` and `.json` file in `src/`, including `\uXXXX` escapes, finds exactly those 20 characters. None is missing from the README and none is listed without a use.
- **Where the requested glyphs live:**
  - → in 6 files (components and CSS)
  - ↓ in `Glyphs.tsx`
  - × in `not-found.tsx`, `NotFoundTerrain.tsx` and others
  - ° in copy, metadata, assets and components
  - ′ in copy, the stage and CSS
- **The shipped files cover them:** a canvas test in the browser compares `archivo, monospace` with `archivo, serif` for each character. It shows all of ASCII plus `→ ↓ × ° ′ · – ’ “ … › − ≈ ≤ ≥ © NBSP` present in **both the roman and the italic** files (`extra/geom.json` → `coverage`).
- **Only gap:** U+2500 `─` is absent. Archivo has no box-drawing glyph, and `─` appears only in code comments, so it never renders. Not a defect.
- **No rendered fallback:** every text node on `/` (375 and 1280) and `/no-such-page` renders in Archivo, with 0 nodes in any other face (CDP `getPlatformFontsForNode`, `geom.json`).
- **Nit:** the "134 KB" in the comment is 136.5 kB (133 KiB) after the regeneration. Close enough, so no defect.

### R2-03 (minor): ▲/▼ markers. **Closed.**
- **No glyph text left:** there are 0 text nodes and 0 pseudo-element `content` values containing U+25B2 or U+25BC on the page.
- **17 `svg.tri` take their place:** the hero summit, the DROP waypoint, 3 roast-level markers, 5 radio-card summits, 4 list bullets and the hidden success mark (`geom.json` → `triangles`).
- **Visual checks:**
  - They are crisp and colour-matched in light and dark (`extra/zoom-1280-hero-summit.png`, `extra/zoom-1280-bullets.png`, `shots/tiles/1280-dark/tile-07.png`).
  - The bullets keep their round-2 position, a raised summit mark (compare `round-2/extra/subscribe-1280-light.png`).

### R2-04 (minor): y-labels crossed by curves. **Closed.**
- **Method:** every stroked path in `.profile` and `.plate-curves` is sampled along its length, mapped to screen space and tested against each label's box, dilated by half the stroke width plus 0.5 px.
  - To validate the test, I placed a control label on the plate's charge fall, and it registered 3 of 3 curves.
- **Result:** **0 hits** at 375, 768, 1280 and 1920, light and dark. That covers the roasts plate at 375 and 768 and the stage at all four widths.
- **Projection lines:** none overlaps a y-label.
- **Visual checks:**
  - `extra/plate-375-light.png` and `extra/plate-768-light.png`: 200°/150°/100° sit in the new gutter, and the charge fall starts at the plot edge.
  - `extra/stage-768-light-final.png` and `-dark-final.png`: 160°/120° sit in the clearing above the TP valley, and "120°" no longer meets the cooling curve.
  - `extra/stage-1280-light-final.png`, `extra/stage-1920-light-final.png` and `extra/stage-375-light-final.png`.
- **Design judgement on the Designer's choice:** dropping 200° and 80° at md+ and moving the axis labels left is the right call. The right edge is calm now, and the waypoints carry their own temperatures.

## Rubric
| # | Criterion | R2 | R3 | Evidence | Why |
|---|---|---|---|---|---|
| 1 | Concept clarity | 9 | 9 | `shots/frames/frame-01.png`, `shots/tiles/1280-light/tile-01.png` | Unchanged. "Every roast is a climb" sits over the section line, whose spot heights run 88° → 152° → 196° → ▲ 207° (now a crisp SVG summit). Every section speaks survey: route schedule, "On the record", "The next climb goes into the drum Tuesday." |
| 2 | Hierarchy | 8 | 8 | `extra/click-1280-smooth-top-subscribe.png`, `shots/tiles/1280-light/tile-06.png` | The primary CTA now delivers the reader to the plan picker, with heading, lede and picker in one view. The proof quote still outweighs its own section title, so this stays at 8. |
| 3 | Typography | 8 | 8 | `shots/tiles/1280-light/tile-04.png`, `shots/tiles/375-light/tile-07.png`, `extra/geom.json` | One family, three widths, all in the real faces, with zero fallback anywhere, including the italic and ×/′/→/↓. Two things keep it short of 9: the 375 proof title still strands "station" ("From washing / station / to kettle"), and the plan-card fine print is loosely tracked. |
| 4 | Color | 8 | 8 | `shots/tiles/1280-dark/tile-07.png`, `extra/stage-768-dark-final.png` | Unchanged. The dark scheme is designed: an umber ground, a lifted accent with dark ink, and a moss selection. The fold still has two filled accent buttons. |
| 5 | Spacing and rhythm | 8 | 8 | `shots/tiles/1280-light/tile-05.png` … `tile-07.png` | Now visible in the plain capture: a tight run, then a valley, then the decision. Section padding varies on purpose. |
| 6 | Motion quality | 9 | 9 | `shots/frames/frame-02.png` → `frame-03.png` → `frame-04.png`, `shots/reduced-1280-light-full.png` | The pen-plotter choreography is intact. Frame 03 shows the readout and the TP narration in step. Reduced motion is a complete, designed still: every section renders and the stage shows its final state. |
| 7 | Signature moment | 9 | 9 | `extra/stage-1280-light-final.png`, `extra/stage-375-light-final.png` | Section A–A′ is cleaner than in round 2: the y-axis now sits in a clearing and the right edge belongs to DROP and Cooling. One crossing remains at 375 (R3-01). |
| 8 | Originality | 9 | 9 | `shots/fold-1280-dark.png`, `extra/404-1280-light.png` | Unchanged. It passes the "any company" test easily, and none of the banned patterns appear. |
| 9 | Responsiveness | 8 | 8 | `shots/tiles/375-light/tile-01…10.png`, `extra/plate-375-light.png`, `extra/stage-768-light-final.png` | Both round-2 holds are gone: anchors are identical at every breakpoint, and the plate and 768 stage labels are clear. Two things hold it at 8 rather than 9: the 375 DROP label crossing (R3-01), and the open 375 menu sheet, which leaves the hero's second "Start a subscription" visible directly under the sheet's own (`extra/menu-375-dark-open.png`, pre-existing). |
| 10 | Craft details | 7 | **8** | `audit/focus/focus-1…6.png`, `shots/hover/*-after.png`, `extra/form-1280-success.png`, `extra/form-375-invalid.png`, `extra/route-1280-1week.png` | This was held at 7 only because of R2-01, which is fixed. Every in-page link is now exact. Markers are identical on every platform. The success panel takes focus on screen (h3 at 155 px at 1280 and 133 px at 375). The error state is clear, and focus rings are visible on every tested stop. |
| | **Average** | **8.3** | **8.4** | | |

## What works (protect these)
- **Plain native anchors:** `scroll-margin-top: 64px` and CSS `scroll-behavior`, with no JS. Don't reintroduce `content-visibility` on these sections. It bought nothing in Lighthouse (93/94 without it) and broke navigation.
- **The plate gutter and the stage y-axis in the clearing** (`extra/plate-375-light.png`, `extra/stage-1280-light-final.png`).
- **`Triangle.tsx`:** one em-sized `currentColor` SVG for every marker.
- **`scripts/subset-fonts.mjs`:** the README list is generated from `src/`, so it can't drift.
- **Everything listed in round 2:** subgrid roast rows, the scrolling success panel, server-rendered SVG layers, the narration tied to the readout, the route holiday note and the 404 clearing.

## Defects
| ID | Severity | Owner | Evidence | Expected | Actual | Suggested fix |
|---|---|---|---|---|---|---|
| R3-01 | minor | builder | `extra/zoom-375-drop-label.png`, `extra/stage-375-light-final.png`; also visible in `round-2/extra/stage-375-light-profile-crop.png` (pre-existing) | Labels sit in clearings and lines never cross them (direction principle 3). The DROP lane label "DROP 10:40 · 207 °C" is uncrossed at sm. | **To reproduce:** at 375×812, scroll the stage into view and let RC-sm finish (about 4 s). The 1 px ink `.cursor-line` (the playhead, x = 333 px, spanning y 212–536) stays visible at the drop position and runs through the label between "·" and "207". The label's bg knockout sits *under* the cursor layer. The `.drop-lane-leader` itself ends correctly at the label's bottom edge. | Either fade the cursor out at sm once the run reaches DROP (`cursorOpacity` → 0 when `final`), or stack `.drop-lane` above `.cursor-span` (z-index) so the knockout hides the line. Re-check `stage-375-light-final` and dark. |

**Owner counts:** builder 1 (minor) · designer 0 · copywriter 0.

**Notes, not defects:**
- U+2500 `─` is in the README list but not in the font files. It appears only in code comments, so it never renders.
- The 375 proof title widow "station" is the same as rounds 1–2. If anyone touches copy, `text-wrap: balance` or a non-breaking space in "washing station" would fix it (copywriter or builder).
- The 375 full-page tile 01 shows the skip link and fixed nav over the headline. That's a capture artifact of the full-page screenshot, the same as round 2. The real fold (`shots/fold-375-light.png`) is clean.
- `shots/tiles/*/tile-02…03` show the sticky 260 svh stage flattened at p = 0. That's a capture artifact, as in rounds 1–2. The stage is judged from `frames/` and `extra/stage-*-final.png`.

## Code checks
- **Hard-coded colours:** none in components outside `var(--token, #fallback)` in the generated SVG strings, the same as round 2.
- **Arbitrary values:** `h-[0.95em]` (NavBar), `h-[0.8em]` (Footer) and `min-h-[1.5em]` (RouteSchedule). These are em-relative glyph sizes with no token for the job. Unchanged and acceptable.
- **`"use client"` on page/layout:** no.
- **Reduced-motion coverage:** `MotionConfig reducedMotion="user"` in `MotionProvider`. The unguarded hits (`lib/motion.ts`, `lib/motion-features.ts`) are not components. The reduced capture is complete (`shots/reduced-1280-light-full.png`).
- **Extra dependencies:** none beyond next, react, react-dom and motion.
- **Tap targets (375):** 9 under 44 px. This is the same set as rounds 1–2: visually hidden radio inputs, the 40 px skip link, and 2 exempt inline links.

## Regression (round 3)
- **Score changes:** Craft details 7 → 8. All other criteria are unchanged. Average 8.3 → 8.4.
- **Closed this round:** R2-01, R2-02, R2-03 and R2-04, with evidence above.
- **Round-1 items, still closed:**
  - **R1-01:** Lighthouse 93 and 94.
  - **R1-02:** `extra/form-1280-success.png`; focus is on the h3 at 155 px (1280) and 133 px (375).
  - **R1-03:** `shots/tiles/1280-light/tile-07.png`, the full-width stat leader.
  - **R1-04:** `extra/stage-375-light-final.png`.
  - **R1-05:** `extra/form-1280-success.png`, the list under the lede.
  - **R1-06:** `shots/tiles/1280-light/tile-04.png`, field rows aligned across cards.
  - **R1-07:** `shots/frames/frame-03.png` shows T 3:45 with TP narration, and the narration follows the readout.
  - **R1-08:** `extra/route-1280-1week.png`, the "* Christmas falls on a Friday…" note.
  - **R1-09:** `extra/404-1280-light.png`, the copy in the clearing.
- **Reappeared:** none.
- **New or worse:** R3-01 (minor, pre-existing, newly logged). Nothing got worse.
