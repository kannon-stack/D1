# Motion

**Personality:** drafted, not animated. Lines go down at an even pen speed, then a surface fills in one decisive move. Nothing bounces, nothing loops, nothing moves twice.

**Engine: CSS only, plus one ~1 KB script.** No Motion / Framer Motion, no GSAP. The hero runs on CSS keyframes from the first paint (works without JavaScript). The only script is a client island that (a) sets `data-step` on the process section from an IntersectionObserver, (b) adds `.is-inview` to `[data-inview]` elements once, and (c) runs the copy buttons. This keeps the JS bundle tiny for the Lighthouse ≥ 90 gate.

## Tokens
| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 120ms | hover colour, press |
| `--duration-fast` | 200ms | arrow nudge, copy-state swap, link underline |
| `--duration-base` | 400ms | small draws (balloons, leader, label fade) |
| `--duration-fill` | 460ms | every fill wipe (hero lines, CTA, plate solid) |
| `--duration-pen` | 520ms | one headline line's outline; rules |
| `--duration-slow` | 700ms | guides, plate layers |
| `--duration-drawing` | 900ms | construction circles (signature only) |

**Easing:** drawn lines use `--ease-pen` `cubic-bezier(0.3, 0, 0.4, 1)` (nearly even, settling into the end of the stroke). Fills use `--ease-fill` `cubic-bezier(0.7, 0, 0.2, 1)` (holds, commits, lands; no overshoot). Hover and state changes use `--ease-out-expo`. There are no exits. Nothing is scroll-scrubbed: the process plate is **step-linked** (a state per step), which is easier to read and costs nothing per frame.

**Springs:** none. (No Motion library on this page.)

## Choreography
All rows except the copy states live inside `@media (prefers-reduced-motion: no-preference)`. Outside it, every decorative layer is in its final state from the first paint, and the overlays used only for the reveal (`.hl-cover`, `.hl-draw`, `.hl-edge`) are `display: none`. "t" is ms after the first paint.

| ID | Section | Element | Trigger | Property: from → to | Timing | Reduced motion |
|---|---|---|---|---|---|---|
| H1 | `hero` | fixed column guides (`.sheet-guides`) | load | `clip-path: inset(0 0 100% 0)` → `inset(0)` (draw down) | slow, pen, t 0 | guides shown |
| H2 | `hero` | cap/baseline row guides (`.hl-rules`, behind the h1) | load | `clip-path: inset(0 100% 0 0)` → `inset(0)` (left → right) | 600ms, pen, t 80 | shown |
| H3 | `hero` | construction: `#hc-outer`, `#hc-inner` | load | `stroke-dashoffset: 1 → 0` (`stroke-dasharray: 1 1`, pathLength 1) | drawing (900), pen, t 150; inner t 300 | shown |
| H3b | `hero` | construction: `#hc-centre` (2 dash-dot lines) | load | `transform: scale(0, 1)` / `scale(1, 0)` → `scale(1)` from the centre (`transform-box: fill-box; transform-origin: center`) | 500ms, pen, t 100 | shown |
| H3c | `hero` | construction: `#hc-ticks` (36 paths) | load | `stroke-dashoffset 1 → 0` | 160ms each, linear, stagger 14ms from t 450 (ends ≈ 1100) | shown |
| H3d | `hero` | `#hc-tangents`, `#hc-radius` line | load | `stroke-dashoffset 1 → 0`; radius arrowhead + datum dot `opacity 0 → 1` at its end | base, pen, t 700 | shown |
| H3e | `hero` | `#hc-leader` then `hero.drawing_label` | load | leader `stroke-dashoffset 1 → 0`; label `opacity 0 → 1` | base, pen, t 1050; label fast at t 1400 | shown |
| H4 | `hero` | headline outline layer `.hl-draw` per line (i = 0…3) | load | `clip-path: inset(0 100% 0 0)` → `inset(0)` | pen (520), pen, t 250 + i·110 | `display: none` |
| H5 | `hero` | fill: `.hl-cover` **and** `.hl-draw` per line | load | `clip-path: inset(0)` → `inset(0 0 0 100%)` (both wipe away left → right, revealing the solid h1 text underneath) | fill (460), fill, t 1000 + i·90 (line 4 ends at 1730) | `display: none` |
| H5b | `hero` | pen edge `.hl-edge` per line (2 px accent bar) | load | base `opacity: 0`; keyframes `translateX(0)`, opacity 1 → `translateX(100%)` of the line box, opacity 1 until 85 %, then 0 + `visibility: hidden`. Use `animation-fill-mode: forwards` (**not** `both`), so the bar is invisible while it waits | same as H5 | `display: none` |
| H6 | `hero` | dimension line under the h1 (`.dim` two halves + end ticks) | load | halves `scale(0,1)` → `scale(1)` from the label outward; end ticks `scale(1,0)` → `scale(1)`; label `opacity 0 → 1` | pen, t 700; label fast at t 1150 | shown |
| B1 | `build` | header rule + each row's bottom rule | in-view amount 0.4 (whole list) | `transform: scaleX(0)` → `scaleX(1)`, origin left | pen, stagger 80ms per rule | shown |
| B2 | `build` | balloons (`.balloon` inline SVG circle, pathLength 1) | same | `stroke-dashoffset 1 → 0`, numeral `opacity 0 → 1` at the end | base, pen, stagger 80ms, starts 120ms after its rule | shown |
| B3 | `build` | end double rule + count line | same, after the last row | rules `scaleX 0 → 1`; count `opacity 0 → 1` | pen; count fast | shown |
| P1 | `process` | plate layer `#pl-n` when step n becomes active (n = 1…3) | `data-step ≥ n` (IntersectionObserver, threshold 0.55 on each step, rootMargin `-35% 0px -35% 0px`) | every `path[pathLength]` in the layer: `stroke-dashoffset 1 → 0`; arrowheads/nodes `opacity 0 → 1` at 70 % | slow (700), pen, stagger 30ms per path (cap 300ms total stagger) | all layers 1–4 shown, step 4 state |
| P2 | `process` | `#pl-4` solids at step 4 | `data-step ≥ 4` | `clip-path: inset(0 100% 0 0)` → `inset(0)` | fill (460), fill | shown |
| P3 | `process` | `#pl-1`, `#pl-2` recede at step 4 | `data-step = 4` | `opacity 1 → 0.45` | slow, pen | 0.45 |
| P4 | `process` | active step marker (number box, segment in the bar) | step becomes active | background `transparent → accent`, numeral `ink → accent-ink`; inactive steps' titles `ink → ink-soft` | fast, expo-out | same colours, instant (state, not motion) |
| C1 | `contact` | title-block cell rules | in-view amount 0.4 | outer frame + inner rules `scaleX/scaleY 0 → 1` from the top-left corner | pen, stagger 60ms | shown |
| C2 | `contact` | CTA fill (`.cta-fill` layer under the label) | same, t +300ms | `clip-path: inset(0 100% 0 0)` → `inset(0)`; label `ink → accent-ink` at 50 % | fill (460), fill | filled from the start |
| U1 | all | button hover | hover | bg `accent → accent-hover`; arrow `translateX(0 → 4px)` | instant / fast, expo-out | colour only, no arrow nudge |
| U2 | all | text-link hover | hover | underline thickness 1 → 2 px, colour → `ink` (nav) or `accent` (in text) | instant | same |
| U3 | `contact` | copy button state | click | label swaps to "Copied" (accent) or the failed message; reverts after 2400 ms | instant | same |

### Reference CSS for H4–H5b (verified in Chromium at 1280, frames at 650 / 1200 / 2200 ms)
```css
@media (prefers-reduced-motion: no-preference) {
  .hl-cover { display: block; position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: var(--hl-rows), var(--sheet-cols), var(--color-bg);
    animation: hl-wipe var(--duration-fill) var(--ease-fill) calc(1000ms + var(--i) * 90ms) both; }
  .hl-draw { display: block; position: absolute; inset: 0; z-index: 2; user-select: none; pointer-events: none;
    color: transparent; -webkit-text-stroke: 1px var(--color-ink);
    animation: hl-pen var(--duration-pen) var(--ease-pen) calc(250ms + var(--i) * 110ms) both,
               hl-wipe var(--duration-fill) var(--ease-fill) calc(1000ms + var(--i) * 90ms) forwards; }
  .hl-line:last-child .hl-draw { -webkit-text-stroke-color: var(--color-accent); }
  .hl-edge { display: block; position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0;
    border-left: 2px solid var(--color-accent);
    animation: hl-edge var(--duration-fill) var(--ease-fill) calc(1000ms + var(--i) * 90ms) forwards; }
}
@keyframes hl-pen  { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
@keyframes hl-wipe { from { clip-path: inset(0); } to { clip-path: inset(0 0 0 100%); visibility: hidden; } }
@keyframes hl-edge { 0% { transform: translateX(0); opacity: 1; } 85% { opacity: 1; }
                     100% { transform: translateX(100%); opacity: 0; visibility: hidden; } }
/* --i = line index 0…3, set inline on each .hl-line */
```

Notes:
- **Remove the reveal layers** when H5 ends: the keyframes end at `visibility: hidden`, so the duplicates can't be selected, found with Ctrl+F or read. They're `aria-hidden="true"` and `user-select: none` throughout.
- **First paint is the solid text** under the cover, so the h1 is the LCP element at first paint (occlusion does not delay LCP). Never hide the real `.hl-text` with opacity, `visibility` or `clip-path`.
- One heavy effect per viewport: H1–H6 happen in the hero only; P1–P3 only while the process plate is on screen.
- If `data-step` jumps (fast scroll or an anchor jump), the plate goes straight to that step's cumulative state; layers that come in together share one 700 ms draw.
- Without JavaScript: the process plate shows its step 4 state and no step is highlighted; build and contact show their final states (`[data-inview]` styles apply only under `.js` on `<html>`, set by an inline script in `<head>`).

## Rules
- Animate `transform`, `opacity`, `clip-path` and `stroke-dashoffset` only. Never width, height, top, left or `background-position`.
- Every draw is one stroke in one direction; no element draws twice.
- Hover 120–200 ms. Focus rings appear instantly (no transition on `outline`).
- Nothing loops; nothing is ambient.
