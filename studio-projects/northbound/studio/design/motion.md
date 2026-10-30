# Motion

**Personality:** pen-plotter pace. Survey marks are plotted at an even, unhurried speed and pins settle without a bounce. The land is still; only the survey moves.

## Tokens
| Token | Value | CSS var | Use |
|---|---|---|---|
| instant | 120ms | `--duration-instant` | hover colour, press, toggle fill |
| fast | 200ms | `--duration-fast` | nav background, selected plan, skip state |
| base | 450ms | `--duration-base` | pins, small entrances, readout swaps |
| plot | 1100ms | `--duration-plot` | any line being drawn (mini curves, leader lines, scale fills) |
| survey | 1400ms | `--duration-survey` | the hero section line only |
| (scroll) | sticky range | — | the `roast-curve` signature: scroll is the clock |

**Easing**
- Lines being drawn: `--ease-plot` `cubic-bezier(0.45, 0, 0.55, 1)`, an even, symmetric pen.
- Pins, markers, entrances: `--ease-pin` `cubic-bezier(0.22, 0.7, 0.2, 1)`, which settles with no overshoot.
- Exits: `ease-in` at 0.8× the entrance duration.
- Scroll-linked: linear mapping of scroll progress (scroll is the easing). Smooth with `useSpring` on progress only for the plumb readout: `{ stiffness: 400, damping: 60 }`, which gives no overshoot.

**Springs (Motion):** used only for layout changes in the route schedule.
- `settle`: `{ type: "spring", visualDuration: 0.45, bounce: 0 }` for waypoints re-pinning and the skip-state layout.
- No bouncy springs anywhere (bounce is always 0).

**Implementation notes**
- Library: `motion` (`motion/react`): `useScroll`, `useTransform`, `useMotionValueEvent`, `animate`, `useInView`. CSS transitions handle hover, focus and press.
- Line "drawing" is a **clip-path wipe**, never `stroke-dashoffset`. The curves are monotonic in x (time), so a left-to-right `clip-path: inset(0 X% 0 0)` is exactly "plotting in time". It also works with `vector-effect: non-scaling-stroke` and dashed strokes.
- On SVG elements, `clip-path: inset()` resolves against the element's stroke box. On HTML wrappers it uses the border box. Prefer wrapping the inline SVG in a `div` and clipping the div when the whole SVG wipes.

## Choreography
| ID | Section | Element | Trigger | Property: from → to | Timing | Reduced motion |
|---|---|---|---|---|---|---|
| N1 | nav | bar background + bottom hairline | scroll-linked: `scrollY > 24px` (toggle) | background transparent → `--color-bg`; border-color transparent → `--color-line` | fast, ease-out | instant switch (no transition) |
| H1 | `hero` | section line A–A′ (`#nb-section` group) | load, after fonts ready or 300ms (whichever first) | `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` | survey 1400ms, ease-plot | line shown complete |
| H2 | `hero` | spot markers (`#nb-spots` children) + their HTML labels (88°, 152°, 196°, ▲ 207°) and "A", "A′" | load, each fires when H1's wipe passes it: delay = 300 + 1400 × (left − 6) / 73.4 ms | opacity 0 → 1, y −6px → 0 | base 450ms, ease-pin | all shown, no movement |
| H3 | `hero` | route card mini curve (`mini-214.svg` wrapper) | load, delay 500ms | clip-path inset right 100% → 0 | plot 1100ms, ease-plot | curve shown complete |
| H4 | `hero` | headline, coda, subhead, CTAs, terrain | — | none: static on first paint (LCP) | — | — |
| H5 | `hero` | hero legend line | load, delay 1700ms (after H1) | opacity 0 → 1 | base, ease-pin | shown |
| RC0 | `roast-curve` | sticky stage (lg+, md) | stage wrapper height **260svh**; inner `position: sticky; top: 0; height: 100svh`; `useScroll({ target: wrapper, offset: ["start start", "end end"] })` → `p` 0…1 | — | — | wrapper height `auto`, not sticky; every RC row shows its final state |
| RC1 | `roast-curve` | strip dashed line `#nb-strip-line` + "A" / "A′" labels | scroll-linked `p` [0.00, 0.10] | clip-path inset right 100% → 0; labels opacity 0 → 1 at p 0.02 / 0.10 | linear | complete |
| RC2 | `roast-curve` | crossing ticks (77, from `strip.crossings`) | scroll-linked; tick *i* shows when `p ≥ 0.08 + 0.20 × t/720` | opacity 0 → 1, scaleY 0 → 1 (origin centre) | each tick's own transition: fast 200ms, ease-pin (time-based once crossed) | all ticks shown |
| RC3 | `roast-curve` | projection lines (index crossings only, 16) | scroll-linked; line *i* starts at `p = 0.18 + 0.22 × t/720` | scaleY 0 → 1, origin top | base 450ms, ease-plot (time-based once triggered) | shown at 100% then rest opacity 0.35 |
| RC4 | `roast-curve` | profile curve `#nb-roast` + ground `#nb-ground` (one wrapper per layer) | scroll-linked `p` [0.30, 0.72] → head `h = (p − 0.30) / 0.42 × 640/720` | clip-path `inset(0 calc((1 − h) × 100%) 0 0)` | linear | complete curve and ground |
| RC5 | `roast-curve` | plumb cursor (1px ink vertical line + 7px accent dot on curve) + readout `T m:ss · BT 000.0°` | same as RC4; position `left = h × 100%`; readout from `btPerSecond[round(h × 720)]` | translateX (px from h × stage width); text swap | spring-smoothed progress | cursor hidden; readout shows final "DROP 10:40 · 207.0°" |
| RC6 | `roast-curve` | event waypoints (CHARGE, TP, DE, FC, DROP: dot, leader, label) | each fires when the head passes `t` (CHARGE at RC4 start) | dot scale 0 → 1; leader scaleY 0 → 1; label opacity 0 → 1, y 4px → 0 | base 450ms, ease-pin, label 80ms after dot | all shown |
| RC7 | `roast-curve` | projection lines settle | scroll-linked `p` [0.72, 0.78] | opacity 1 → 0.35 | linear | 0.35 |
| RC8 | `roast-curve` | cooling `#nb-cooling` + "Cooling" label | scroll-linked `p` [0.72, 0.80] | clip-path inset right → 0 (starts at x = 640/720) | linear | shown |
| RC9 | `roast-curve` | phase bar segments (drying, Maillard, development) | scroll-linked `p` [0.78, 0.92], sequential thirds | scaleX 0 → 1, origin left; label opacity 0 → 1 at segment end | linear | full bar |
| RC10 | `roast-curve` | readout final state | `p ≥ 0.92` | readout text → "Drop 10:40 · 207.0° · DTR 17%" | base, crossfade | final text |
| RC-sm | `roast-curve` | whole sequence on < 768px (no sticky) | `useInView(stage, { amount: 0.35, once: true })` | runs RC1–RC10 as a timeline: RC1 0–400ms; RC2 200–1000ms; RC3 600–1400ms; RC4/5/6 1000–3400ms; RC8 3400–3800; RC9 3800–4600 | ease-plot for wipes, ease-pin for pins | final state |
| R1 | `roasts` | mini curves in the three cards (and the mobile plate) | `in-view amount 0.35`, once | clip-path inset right 100% → 0 | plot 1100ms, ease-plot, stagger 120ms (212, 213, 214) | complete |
| R2 | `roasts` | roast-level fill (2px accent from scale start to the marker) + marker ▼ | after R1 of the same card | fill scaleX 0 → 1 (origin left); marker opacity 0 → 1, y −4 → 0 | fill plot 1100ms ease-plot; marker base, ease-pin | complete |
| W1 | `how-it-works` | delivery waypoints | cadence change (click/arrow keys) | leaving pins: opacity 1 → 0, y 0 → −6 (fast×0.8, ease-in); arriving pins: opacity 0 → 1, y −8 → 0 | base 450ms ease-pin, stagger 40ms left → right (top → bottom on mobile) | instant swap |
| W2 | `how-it-works` | a waypoint being skipped / restored | click / Enter / Space on the waypoint | pin fill accent → transparent (2px accent ring stays); date strike line clip-path wipe 0 → 100% | fast 200ms; strike plot-fast 300ms ease-plot | instant state change |
| W3 | `how-it-works` | readout values ("Next at your door", count) | state change | old value opacity 1 → 0, y 0 → −4; new value 0 → 1, 4 → 0 | fast 200ms, ease-pin | instant swap |
| W4 | `how-it-works` | route dashed line | `in-view amount 0.4`, once | clip-path wipe left → right (top → bottom on mobile) | plot 1100ms, ease-plot; pins (W1 arriving) follow, stagger 40ms | complete |
| P1 | `proof` | figure leader line (accent hairline from numeral to caption) | `in-view amount 0.5`, once | scaleX 0 → 1, origin left | plot 1100ms, ease-plot | shown |
| S1 | `subscribe` | plan / preference radio cards | select | background → `--color-moss` (light) / `--color-moss` (dark); border → ink; summit marker ▲ opacity 0 → 1 | fast 200ms | instant |
| S2 | `subscribe` | submit button, loading | submit (valid) | 2px accent-ink hairline at the button's bottom edge wipes left → right and repeats until resolved | plot 1100ms, ease-plot, loop **only while loading** | static label "Setting your route…" without the line |
| S3 | `subscribe` | form panel → success panel | resolved | form opacity 1 → 0 (fast×0.8, ease-in), then success opacity 0 → 1, y 8 → 0; ▲ marker pins last | base 450ms ease-pin | instant swap; focus moves to the success heading |
| S4 | `subscribe` | summary line ("$34 per delivery · …") | any plan/cadence change | same as W3 | fast | instant |

## Hover, focus and press (all sections)
| Element | Hover | Focus-visible | Pressed |
|---|---|---|---|
| Primary button (accent fill) | bg `accent` → `accent-hover`, arrow glyph translateX 0 → 3px; instant 120ms | 2px `--color-focus` outline, offset 3px; no transition | translateY 1px, bg `accent-hover` |
| Text link / secondary CTA | underline thickness 1px → 2px, `text-underline-offset` 5px (constant) | outline as above | colour → accent |
| Nav link | colour ink → accent; 1px accent rule under the link draws (scaleX 0 → 1) | outline | — |
| Waypoint button | ring grows 2px → 3px; tooltip-free: the date label underlines | outline round (outline-offset 3px; pins are circles) | scale 0.92 |
| Radio card (plan) | border `line` → `muted` | outline | bg `surface-2` |
| Segmented control option | bg transparent → `surface-2` | outline (inset −2px inside the group) | bg `surface-2` |

## Rules
- Animate transform, opacity and clip-path only. No filters. Never animate width, height, top or left (the plumb cursor uses translateX).
- One heavy effect per viewport: the `roast-curve` stage. While it's pinned, nothing else on screen animates.
- Nothing loops except S2 while a request is pending.
- Hover transitions are 120–200ms. Focus rings appear instantly (no transition on `outline`).
- **Reduced motion** (`prefers-reduced-motion: reduce`): the hero shows the finished survey. `roast-curve` is a still, fully constructed section (no sticky, ticks at full, projection lines at 0.35, curve, waypoints, phase bar and the final readout). Cards show complete curves and markers. The route schedule swaps state instantly. Everything stays fully usable; nothing is hidden waiting for an animation.
- Never gate content on animation: all text is in the DOM and visible to assistive tech from the start. Animated elements that start hidden are decorative (`aria-hidden`) or duplicated in the accessible data table.
