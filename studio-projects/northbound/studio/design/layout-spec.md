# Layout spec · Northbound · A · Contour

Read with `direction.md`, `type.md`, `motion.md`, `tokens.css` and `assets/README.md`. Every size is a token or is given here as an exact value.

**Copy slots** use the keys of `content/copy.md` (`section.key`, with dots into nested yaml and `[]` for list items). Each slot has a **budget**: `chars per line × lines` for display text, or max characters for everything else. ✓ means the current copy fits; ⚠ means the Director needs to reconcile it (see the end of this file). **Data** items (batch numbers, times, temperatures, dates) come from `decisions.md` #4/#8 and `assets/contours-data.json`; they are not copy.

## Global

- **Grid:** sm (< 768) **4** columns · md (≥ 768) **8** columns · lg (≥ 1024) **12** columns · xl (≥ 1280) **12** columns. Gutter `--spacing-gutter` (16 → 24 px), side margin `--spacing-margin` (16 → 64 px), max width `--container-page` (1440). Container: `mx-auto max-w-(--container-page) px-(--spacing-margin)`; grid: `grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-(--spacing-gutter)`.
  - Reference column widths (content box, px): 375 → col 73, span-4 342 · 768 → col 68, span-6 541 · 1024 → col 56, span-4 295, span-7 534 · 1280 → col 75, span-4 373, span-7 670 · 1440 → col 87, span-4 421, span-7 755, span-8 867.
- **Planned breaks (the only full-bleed elements):** the hero terrain, the `roast-curve` stage (phase bar, strip, profile, time axis) and the shared temperature gridlines in `roasts`. Everything else sits on the grid.
- **Section rhythm** (top / bottom padding): `hero` fixed height → `roast-curve` `section-sm` / `section-xs` → `roasts` `section-xs` / `section-sm` → `how-it-works` `section-sm` / `section-sm` → **`proof` `section-lg` / `section-lg` (the valley)** → `subscribe` `section-md` / `section-md` → `footer` `section-sm` / 40 px. A tight data run (curve → roasts → schedule), one long breath, then the decision.
- **Section heads** (all sections except hero): eyebrow (`text-xs` map 600 caps, muted) → 16 px → `h2` title (`text-3xl md:text-4xl` wide 360, `text-wrap: balance`) → 24 px → lede (`text-base`, ink-soft, max `--container-prose`). Title span: sm 1–4 · md 1–7 · lg 1–9 · xl 1–8. A 1 px `--color-line` rule sits 24 px above every eyebrow, across the eyebrow's columns (the sheet's ruled header). **Title budget everywhere: 18 × 3** (fits 375 px at 33 px; usually 2 lines at lg).
- **Anchors:** `#top` (hero), `#roast-curve`, `#roasts`, `#how-it-works`, `#proof`, `#subscribe`. Every section has `scroll-margin-top: 64px`. Set `html { scroll-behavior: smooth }` only inside `prefers-reduced-motion: no-preference`.
- **Nav** (`nav`, `aria-label` = `microcopy.nav_label`; sticky): `position: sticky; top: 0; z-index: 50; height: 64px` (lg) / `56px` (sm, md). The background is always `--color-bg`: a solid map collar, so no contour runs under nav text. The bottom border goes from transparent to `--color-line` once `scrollY > 24` (motion N1).
  - Left: wordmark link to `#top`, `aria-label` "Northbound, home". It is inline `north-tick.svg` (height 0.95em, `currentColor`) + 8 px + `NORTHBOUND` (`footer.wordmark` in caps; `text-sm`, wide, 600, tracking 0.06em, ink).
  - lg+: right-aligned links `microcopy.nav[0..3].label` (`text-sm` 500, gap 32), then a 24 px gap and the button `microcopy.nav_cta` → `#subscribe` (height 40, padding-x 20, accent / accent-ink, `text-sm` 600).
  - md: wordmark · `microcopy.nav_cta` button · Menu button. sm: wordmark · Menu button only; the hero CTA is on screen, and the nav CTA moves inside the sheet. The Menu button uses `microcopy.menu_open` / `microcopy.menu_close`, a 44 × 44 hit area, `aria-expanded` and `aria-controls="menu"`. The sheet opens directly under the nav: full width, `--color-surface`, bottom border `--color-line`. It holds the 4 links as 56 px rows with hairline separators, in `text-2xl` wide 400. At sm it ends with a full-width `microcopy.nav_cta` button (height 52) inside 16 px padding. Esc or a link click closes it and returns focus to the Menu button.
  - Active section: its link gets `aria-current="true"` and turns accent with a 1 px accent underline.
  - Slots: `microcopy.nav[].label` **14** ✓ · `microcopy.nav_cta` **22** ✓ · `microcopy.menu_open` **6** ✓ · `microcopy.menu_close` **12** ✓ · `microcopy.nav_label` (aria) ✓.
- **Skip link:** the first focusable element, `microcopy.skip_link` (**22** ✓) → `#main`. It's visually hidden until focused, then fixed at top-left 12 px: ink background, bg-coloured text, `text-sm` 600, padding 10 × 16, z-index 100.
- **Main:** `<main id="main">` wraps all sections; the footer sits outside it.
- **Focus:** `:focus-visible` is a 2 px `--color-focus` outline with a 3 px offset (set in tokens). Round elements (waypoint pins) get a round outline via `border-radius` on the button.
- **Scheme:** follows the OS (`prefers-color-scheme`). There is no manual toggle in this spec, so `microcopy.theme_to_dark` / `theme_to_light` are not placed.

---

## `hero`
**Purpose:** State the concept in five seconds (the map is the roast) and put the subscription one click away.

Desktop (1280 × 800):
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ↑ NORTHBOUND     Roasts  The curve  How it works  Plans [Start a subscription] │ solid collar
│~~~~~~~~ contours ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│
│ ~~~ (clearing: no lines) ~~~~~~~~~~~~~~~~~~~~~~      ┌─────────────────┐ │
│  Every roast                                ~~~~~~~  │ CURRENT BATCH   │ │
│  is a climb.                               ~~~~~~~   │ 214             │ │
│  We send you the map.                      ~~~~~~    │ Guji, Ethiopia  │ │
│                                           ~~~~~~     │ ╰──────────── │ │
│  Every bag ships with its   [Start a subscription →] │ Roasted Tue 27… │ │
│  real roast curve and…      See current roasts ↓     │ Drop 10:40 · …  │ │
│                             Roasted Tuesday, at your │ Read this curve↓│ │
│        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 196°  ▲ 207° └─────────────────┘ │
│  ((A))  88° ─ ─ ─ ─ ─152°─ ─ ─ ─ ─ ─ ─ ─ ─ ─ •─ ─ ─ ─ ▲ ─ ─ ─ ─┤A′ ~~~~ │
│  ((()))   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SMALL-BATCH ROASTERS · …    │
│ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CONTOUR INTERVAL 4 °C · …   │
└──────────────────────────────────────────────────────────────────────────┘
```
Mobile (375):
```text
┌─────────────────────────────────┐
│ ↑ NORTHBOUND               Menu │
│                                 │
│ Every roast                     │  52px, 2 lines
│ is a climb.                     │
│ We send you                     │  33px, wraps to 2
│ the map.                        │
│ Every bag ships with its real   │  text-lg, ≤ 4 lines
│ roast curve and roast date…     │
│ [ Start a subscription      → ] │  full width
│ See current roasts ↓            │
│ Roasted Tuesday, at your door…  │
│░░ fades in ░░░░░░░░░░░░░░░░░░░░░│
│ ~~~~~~~~~~~ 196° ~~ ▲207° ~ A′  │  map window 19rem,
│ ─ ─ ─ ─ ─ ─ ─•─ ─ ─ ─▲─ ─ ─┤ ~~ │  cropped to the summit
│ ┌─────────────────────────────┐ │
│ │CURRENT BATCH     ╰────────  │ │  route card overlaps
│ │214  Guji, Ethiopia          │ │  the window by 56px
│ │Roasted Tue 27 Oct           │ │
│ │Drop 10:40 · 207 °C · DTR 17%│ │
│ └─────────────────────────────┘ │
│ SMALL-BATCH ROASTERS · MARQUETTE│  legend
│ CONTOUR INTERVAL 4 °C · HEIGHT… │
└─────────────────────────────────┘
```

**Structure and geometry (lg, xl).** These numbers were checked in a prototype at 1024×768, 1280×720, 1440×900 and 1920×1080, using the copy in `copy.md`.
- `section#top.hero`: `position: relative; overflow: hidden; container-type: inline-size; --hero-h: clamp(40rem, 100svh, 62.5rem); height: var(--hero-h)`. The sticky nav overlaps the hero's first 64 px.
- **Terrain box** (`div.terrain`, `role="img"`, `aria-label` = `hero.image_alt`; the inline SVG inside is `aria-hidden`): `position: absolute; bottom: 0; left: 50%; translate: -50% 0; width: max(100cqw, calc(var(--hero-h) * 1.6)); aspect-ratio: 8 / 5`. Inline `terrain-hero.svg` fills it (`position: absolute; inset: 0; width: 100%; height: 100%`). It's bottom-anchored, so wide screens crop the north and narrow screens crop both sides equally. Above 1920 px, cap `width` at `calc(var(--hero-h) * 1.92)` and add `mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)`.
- **Copy block** (`div.hero-copy`, a 12-col grid): `position: absolute; left/right: max(var(--spacing-margin), calc(50cqw - 45rem + var(--spacing-margin))); bottom: calc(max(100cqw, var(--hero-h) * 1.6) / 1.6 * 0.30 + 1rem)`. Its bottom edge sits 30 % of the terrain height above the hero bottom, which is always inside the computed clearing and above the ridge.
  - The `h1` holds the headline and the coda as two styled parts, so the whole sentence is the page's h1.
    - Part 1 (`hero.headline`, lines 1–2): cols 1–7. `font-size: clamp(3.25rem, min(8.4vw, 11.5svh), 7.5rem)`, which is the `--text-6xl` value plus an svh cap for short laptops. Wide, weight 340, tracking −0.03em, line-height 0.92, ink. Two `<span class="block">` lines: **"Every roast" / "is a *climb.*"**, with the italic word in `<em>` (Archivo italic 340).
    - Part 2 (`hero.headline`, lines 3–4, the coda): a `<span class="block">`, margin-top 16 px, `text-3xl` wide 340, ink: **"We send you the map."**, on one line at lg and 2 lines at sm.
  - `hero.subhead`: a `p` in cols 1–4, margin-top 24 px, `text-lg` 400, ink-soft.
  - CTA group: cols 5–7, margin-top 24 px, `align-self: end`, column flex, gap 12, items start.
    - `hero.cta` → `#subscribe`: height 52, padding-x 24, accent / accent-ink, `text-sm` 600, with an `aria-hidden` `→` 10 px after the label.
    - `hero.secondary_cta` → `#roasts`: `text-sm` 500 ink, 1 px underline at offset 5, `↓` (aria-hidden).
    - `hero.reassurance`: a `p`, `text-sm` 400 muted, margin-top 2. It wraps to 2 lines at lg.
- **Route card** (`aside`, `aria-labelledby` its label): `position: absolute; top: clamp(6rem, 16svh, 9rem); right: <container right edge>`, width 3 cols (cols 10–12), max 310 px. Surface, 1 px `--color-line` border, padding 20 px, radius 0, no shadow.
  - `hero.route_card.label` (eyebrow style, ink).
  - **data** `214` (`text-4xl` wide 300 `num`, ink). This is the number from `hero.route_card.batch` set large; the full "Batch 214" string is a visually hidden prefix for screen readers.
  - `hero.route_card.origin` (`text-lg` map italic 400, ink).
  - `mini-214.svg` box: height 56 px, margin 12 px 0, with a 5 px accent dot at the DROP point (`left: 88.9%; top: 8.1%`).
  - `hero.route_card.roasted`, then `hero.route_card.drop` + ` · ` + `hero.route_card.dtr` (`text-xs` map 500 caps `num`, ink).
  - `hero.route_card.link` → `#roast-curve` (`text-sm` 500, underline, `↓`), margin-top 12.
- **Section-line labels** (inside the terrain box, `aria-hidden`, positioned from `contours-data.json → hero`):
  - `A` at `sectionLine.A` and `A′` at `sectionLine.A2`: `text-sm` wide 600 ink, `translate: -50% calc(-100% - 10px)`.
  - Spot heights: a **data overlay, not copy**. Values and positions come from `contours-data.json → hero.spots` (`88°`, `152°`, `196°`, `▲ 207°`); there is no copy slot for them. Style: `text-xs` map 500 `num` ink, `translate: -50% calc(-100% - 6px)`, background `--color-bg` with 1 × 4 px padding. This map-label knockout keeps lines from crossing the numerals.
- **Legend** (a `p` at bottom-right, `right: <container edge>; bottom: 24px`): a surface label with a 1 px `--color-line` border, padding 8 × 12, right-aligned, eyebrow style (map 600 caps, muted). Line 1 is `hero.eyebrow` (the sheet's place name). Line 2 is `hero.legend` (contour interval · height = bean temperature · section A–A′, with an aria-hidden `↓`).

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| terrain | full-bleed (window on sm/md) | — | contour-minor, contour-index | `terrain-hero.svg` | — (static) | — |
| section line + spots | in terrain box | spots `text-xs` map | ink; summit accent | `#nb-section`, `#nb-spots` | H1, H2 | — |
| h1 part 1 | 1–4 / 1–8 / 1–7 / 1–7 | `text-6xl` (clamped) | ink | | none (LCP) | |
| h1 coda | 1–4 / 1–8 / 1–7 / 1–7 | `text-3xl` | ink | | none | |
| subhead | 1–4 / 1–5 / 1–4 / 1–4 | `text-lg` | ink-soft | | none | |
| CTA | 1–4 (full width) / 6–8 / 5–7 / 5–7 | `text-sm` 600 | accent / accent-ink | | — | hover, focus, pressed |
| secondary CTA | 1–4 / 6–8 / 5–7 / 5–7 | `text-sm` 500 | ink | | — | hover, focus, pressed |
| reassurance | 1–4 / 6–8 / 5–7 / 5–7 | `text-sm` | muted | | none | |
| route card | 1–4 / 1–5 / 10–12 / 10–12 | mixed (above) | surface, line | `mini-214.svg` | H3 | link: hover, focus |
| legend | 1–4 / 1–6 / 7–12 right / 7–12 right | `text-xs` map 600 | muted on surface | | H5 | — |

**Copy slots:**
- `hero.headline` **11 × 2 + 20 × 1** ⚠. This is copy.md's recommended option, re-broken with no word changes as "Every roast / is a *climb.*" + coda "We send you the map." (11 / 10 / 20 characters). The copy's suggested `\n` breaks give 14-character lines, which don't fit the wide cut at lg.
- `hero.subhead` **110** ✓ (109) · `hero.cta` **22** ✓ · `hero.secondary_cta` **20** ✓ · `hero.reassurance` **70** ✓ (63)
- `hero.route_card.label` **16** ✓ · `.batch` **10** ✓ · `.origin` **18** ✓ · `.roasted` **22** ✓ · `.drop` **22** ✓ · `.dtr` **10** ✓ · `.link` **18** ✓
- `hero.eyebrow` **44** ✓ (42; placed as line 1 of the legend)
- `hero.legend` **52** (new slot; the Copywriter is adding "Contour interval 4 °C · Height = bean temperature · Section A–A′").
- `hero.image_alt` **125** ✓
- `hero.cta_loading` is not used: the hero CTA is an anchor link.

**sm / md changes (recomposed, not stacked):** the hero becomes a column on paper with no terrain behind the text, and the map moves into a **window cropped to the summit**.
- `hero` height is `auto`, with padding-top 40 px below the nav. The headline is 52 px at sm and 64.5 px at md (from the clamp). Coda margin-top 16; subhead margin-top 20, max 30rem; CTA group margin-top 28.
- At sm, the primary CTA is full width (label left, arrow right, `justify-content: space-between`). At md, the subhead takes cols 1–5 and the CTA group cols 6–8, bottom-aligned as at lg.
- **Map window** (`div.terrain-window`; the terrain box inside keeps `role="img"`): margin-top 40 px, full-bleed, `position: relative; overflow: hidden; height: 19rem` (sm) / `25rem` (md). Add `mask-image: linear-gradient(180deg, transparent 0, #000 22%, #000 82%, transparent 100%)` so the map rises out of the paper. Inside is the same terrain box: `position: absolute; bottom: 0; aspect-ratio: 8/5; width: 1100px; left: calc(60% - 783px)` (sm) / `width: 1500px; left: calc(60% - 1068px)` (md). This puts ▲ 207° about 60 % across and 44 % down the window, with 196° and A′ in view. Hide `#nb-index-labels`, which would render under 8 px.
- **Route card:** full width at sm, cols 1–5 at md. It overlaps the window bottom by 56 px (`margin-top: -56px; position: relative`). Inside is a 2-column grid: the label, `214` at `text-3xl` and the origin on the left, the mini curve (height 64) on the right. The data rows and link below span both columns.
- **Legend:** in flow under the card, left-aligned, no box, padding 16 px 0 40 px.

---

## `roast-curve`
**Purpose:** Prove the differentiator: batch 214's real curve, built from the map and legible as data, with its roast date and what it means for brewing.

Desktop (1280): section head and curve card, then the sticky stage (shown in its final state).
```text
 ───────────────────────────────────────────────
 SECTION A–A′ · BATCH 214                              ┌──── card ─────┐
 Every bag carries                                     │ NORTHBOUND    │
 its own curve                                         │ The curve card│
 The contour lines in the hero are batch 214's bean    │ ╰──────────── │
 temperature, drawn as terrain. Cut along A–A′…        │ Batch 214 · … │
 Bean temperature in °C against time in the drum…      │ Roasted Tue … │
                                                       │ Drop 10:40 …  │
                                                       │ Peak window … │
                                                       │ Brew V60 …    │
                                                       │ Green price … │
                                                       └───────────────┘
                                                        Printed for your exact bag…
┌ STAGE (sticky, 100svh) ─────────────────────────────────────────────────────┐
│ BATCH 214 · GUJI, ETHIOPIA · WASHED · ROASTED TUE 27 OCT 2026  T 8:50 196.0°│
│ FC · The beans crack audibly as steam escapes. Development begins.          │ narration
│▓▓▓ DRYING 4:30 · 42% ▓▓▓▓│░░░ MAILLARD 4:20 · 41% ░░░│█ DEV 1:50 17% █│COOLING│ phase bar
│A ~~~~((((~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~))))~~~~~~~ A′│ strip
│ ─|||─|─|─ ─ ─|─ ─ ─|─ ─ ─ ─|─ ─ ─ ─ ─ ─|─ ─ ─ ─ ─ ─ ─|─ ─ ─ ─|─|─|─|──── │ ticks
│ CHARGE 0:00             :      │           :          │       DROP 10:40·207 °C│
│\  :                     :      │           :        __▲•─ ─ ─.          200°│
│ \ :                     :      │      __..•'      FC │       ` .         160°│
│  \:         DE 4:30·152 °C __..•''       8:50·196 °C│         `.        120°│
│   \__.•-''TP 1:05 · 88 °C                             │  Cooling  `.      80°│
│0:00  1:00  2:00  3:00  4:00  5:00  6:00  7:00  8:00  9:00  10:00  11:00 12:00│
│TIME IN DRUM (MIN:SEC)                                  BEAN TEMPERATURE (°C)│
└─────────────────────────────────────────────────────────────────────────────┘
 HOW TO READ IT
 ① Drying                  ② Maillard                  ③ Development
 Moisture leaves while…    Sugars brown and acids…     At 17% this one stays…
```
Mobile (375):
```text
 ─────────────────────────
 SECTION A–A′ · BATCH 214
 Every bag carries
 its own curve
 The contour lines in…
 ┌ card ┐  Printed for your
 │ 214  │  exact bag and…
 └──────┘
 BATCH 214 · 27 OCT
 T 8:50 · 196.0°
 FC · The beans crack…
 ▓42%▓▓▓▓▓│░41%░░░░│█17│ ·
 DRYING · MAILLARD · DEV
 A ~~((~~~~~~~~~~~~~)~~ A′  strip 4rem
 \ :   :    :    :  ▲.      profile 15rem
  \_.•'''''•''''''•'  `.
 0:00   4:00   8:00  12:00
 ① …  ② …  ③ …  (stacked)
```

**Section head (normal flow):** `roast-curve.eyebrow`; `roast-curve.title` (sm 1–4 · md 1–7 · lg 1–8 · xl 1–7); `roast-curve.lede` (`text-base` ink-soft; sm 1–4 · md 1–6 · lg 1–6 · xl 1–5). Then, 16 px below, `roast-curve.chart.definition` (`text-sm` ink-soft, same span): the plain-language definition, the OWID way.

**The curve card** (the physical card in every bag): lg cols 10–12 · md 6–8 · sm cols 1–2, with its caption beside it in 3–4. It's a `figure` with `aria-label` = `roast-curve.card.image_alt`: a 3 : 4 surface card with a 1 px `--color-line` border and 16 px padding. Inside, top to bottom: the wordmark (`text-xs` wide 600 caps); `roast-curve.card.title` (`text-sm` 600); `mini-214.svg` (height 64); a 1 px rule; then `roast-curve.card.lines[0..5]` as 6 rows (`text-xs` map 500 `num`, line-height 1.6; line 0 in map italic). The `figcaption` is `roast-curve.card.caption` (`text-sm` muted, 12 px below). Show the card flat, like a specimen: no rotation, no shadow.

**The stage** (`figure#section-a`, full-bleed, `aria-labelledby` the instrument line):
- md+: an outer `div.stage-track` with `height: 260svh`, and an inner `div.stage` with `position: sticky; top: 0; height: 100svh; display: grid; grid-template-rows: auto auto 2.5rem var(--strip-h) minmax(14rem, 26rem) auto; align-content: center; padding-block: 80px 24px`. sm: no track, `height: auto`, same rows.
- **Row 1, instrument line** (on the grid):
  - Left (cols 1–8): `roast-curve.chart.title` + ` · ` + `roast-curve.date_line` in eyebrow style. This is where the roast date is visible.
  - Right (cols 9–12, right-aligned): the **readout**, `T` + `m:ss` and `BT` + `000.0°`, in `text-2xl` map 400 `num` ink, with the `T`/`BT` labels muted. It's `aria-hidden` because the table duplicates it. Its final state is `roast-curve.chart.dtr_label` + **data** `Drop 10:40 · 207.0°`.
  - At sm the row stacks: the label on one line (shortened to the data `Batch 214 · 27 Oct`), then the readout at `text-xl`.
- **Row 2, narration** (cols 1–9, `text-sm` ink-soft, min-height 1 line, `aria-live="off"`): as the plumb cursor passes each event, this line shows `CODE · note` from `roast-curve.chart.events[].code` / `.note` (code in map 600 caps). The final state shows `roast-curve.chart.dtr_definition`. With reduced motion it shows only the DTR definition. Margin-bottom 16.
- **Row 3, phase bar** (full-bleed, x = t / 720; `role="img"`, `aria-label` = `roast-curve.chart.phases_title` + the three phases):
  - Absolute segments: drying `left 0, width 37.5%` in moss; Maillard `left 37.5%, width 36.1%` in sienna-tint; development `left 73.6%, width 15.3%` in accent. Cooling starts at `left 88.9%` with no fill, just a 2 px dashed lake rule at mid-height and its label.
  - Labels sit inside each segment, 8 px from its left edge: `roast-curve.chart.phases[i].name` + `time` + ` · ` + `share`, in `text-xs` map 600 caps `num`. Colours: ink on moss and sienna-tint, accent-ink on accent, muted for cooling (`roast-curve.chart.cooling_label`).
  - At sm the segments show only `share`. The names move to a caption row below the bar (eyebrow style, `·`-separated, prefixed by `phases_title`).
- **Row 4, strip** (`--strip-h`: sm 4rem · md 6rem · lg 7.5rem): inline `section-strip.svg`, stretched to the row with `preserveAspectRatio="none"`. Overlays:
  - `A` (left 8 px) and `A′` (right 8 px), `text-sm` wide 600, above the dashed line, with a bg knockout.
  - **Crossing ticks** from `strip.crossings` (77): 1 px ink, centred on the midline at `left: <left>%`, 6 px tall (minor) or 14 px (index). At lg+, index ticks also carry a `<T>°` label above them (`text-xs` map `num` muted, knockout).
  - A 1 px `--color-line` rule along the strip's top and bottom.
- **Row 5, profile** (`minmax(14rem, 26rem)`; sm 15rem; `role="img"`, `aria-label` = `roast-curve.image_alt`): inline `profile-a.svg` with `preserveAspectRatio="none"`. Wrap `#nb-ground` + `#nb-roast` and `#nb-cooling` in separate layers so each can be clipped on its own (motion RC4, RC8). Overlays, all `aria-hidden`:
  - **Projection lines** for the 16 index crossings: 1 px ink at `left: <left>%`, from `top: 0` to `top: (220 − T) / 160 × 100%`, ending in a 4 px ink dot. They rest at opacity 0.35.
  - **Y labels** `200°`, `160°`, `120°`, `80°` (every other gridline): `text-xs` map `num` muted, right-aligned 8 px from the right edge, 4 px above their gridline, knockout.
  - **Event waypoints** from `profile.events`: an 8 px accent dot with a 2 px bg ring, a 1 px ink leader, and a `text-xs` map label. The label is the event name `roast-curve.chart.events[].name` in 600 at md+ (the codes `CHG/TP/DE/FC/DROP` at sm), then `time` · `temp` in 500 `num`. Placement:
    - CHARGE (`0% / 12.5%`): label at the page margin, `top: 2%`, no leader. Its `temp` is empty in copy, so show the time only.
    - TP (`9% / 82.5%`): label centred under the dot, leader 12 px down.
    - DE (`37.5% / 42.5%`): label above-left, leader 24 px up, with the label's right edge on the leader.
    - FC (`73.6% / 15%`): label below-right, leader 24 px down, ground knockout.
    - DROP (`88.9% / 8.1%`): a 10 px accent `▲` instead of a dot; label above-left (right edge 8 px left of the ▲, bottom 10 px above it).
  - **Cooling label** `roast-curve.chart.cooling_label` at `left 93%; top 46%`, `text-xs` map muted, after a 12 px dashed lake rule.
  - **Plumb cursor** (motion RC5): a 1 px ink vertical line spanning strip and profile, with a 7 px accent dot riding the curve.
- **Row 6, time axis:** minute ticks, every 1:00 at md+ and every 2:00 at sm, in `text-xs` map `num` muted at `left: t/720`. `0:00` is left-aligned at 4 px and `12:00` right-aligned at 4 px; the rest are centred. Below the ticks, `roast-curve.chart.x_axis` sits at left and `roast-curve.chart.y_axis` at right (eyebrow style, muted), 8 px from the edges.
- **Accessible data:** inside the `figure`, a visually hidden `table` captioned with `roast-curve.chart.title`. Columns: Event / Time / Bean temperature / What happens (`events[].name`, `time`, `temp`, `note`). After the events come 3 phase rows (`phases[].name`, `time`, `share`).

**Notes row** (after the stage, on the grid, margin-top 48 px): `roast-curve.read_label` (eyebrow) on top, then the 3 notes from `roast-curve.annotations[0..2]`. Spans: sm 1–4 stacked (gap 32) · md 1–4 / 5–8 / 1–4 · lg 1–4, 5–8, 9–12. Each note has a 22 px numbered survey marker (1 px ink circle, `text-xs` map 600 `num` digit), the `title` (`text-xl` wide 400) and the `body` (`text-base` ink-soft). Note 3 is the brewing implication.

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| head + definition | see above | head tokens; `text-sm` | ink-soft | | none | |
| curve card | 1–2 / 6–8 / 10–12 / 10–12 | as above | surface, line | `mini-214.svg` | R1 (once in view) | — |
| instrument line + readout | 1–4 / 1–8 / 1–8 + 9–12 | `text-xs` / `text-2xl` map | muted / ink | | RC5, RC10 | — |
| narration | 1–4 / 1–8 / 1–9 | `text-sm` | ink-soft | | swaps with RC6 | — |
| phase bar | full-bleed | `text-xs` map 600 | moss, sienna-tint, accent, lake | | RC9 | — |
| strip + ticks | full-bleed | `text-xs` map | contour tokens, ink | `section-strip.svg` | RC1, RC2 | — |
| profile + overlays | full-bleed | `text-xs` map | accent, ground, line, lake, ink | `profile-a.svg` | RC3–RC8 | — |
| time axis | full-bleed | `text-xs` map | muted | | none | — |
| notes | as above | `text-xl` / `text-base` | ink / ink-soft | | none | — |

**Copy slots:**
- `roast-curve.eyebrow` **44** ✓ · `roast-curve.title` **18 × 3** ✓ ("Every bag carries / its own curve") · `roast-curve.lede` **200** ✓ · `roast-curve.date_line` **30** ✓
- `roast-curve.chart.title` **44** ✓ · `.definition` **120** ✓ · `.x_axis` **28** ✓ · `.y_axis` **28** ✓ · `.cooling_label` **12** ✓
- `roast-curve.chart.events[].name` **14** ✓ · `.note` **80** ✓ (`code`, `time` and `temp` are data)
- `roast-curve.chart.phases_title` **28** ✓ · `.phases[].name` **12** ✓ · `.dtr_label` **10** ✓ · `.dtr_definition` **100** ✓
- `roast-curve.image_alt` **125** ✓ · `roast-curve.read_label` **22** ✓
- `roast-curve.annotations[].title` **16** ✓ · `.body` **140** ✓
- `roast-curve.card.title` **22** ✓ · `.caption` **110** ✓ · `.lines[0..5]` **44** each ✓ · `.image_alt` **125** ✓

**Mobile changes:** there's no sticky stage; RC-sm plays once when the stage comes into view. The curve card shrinks to cols 1–2, with its caption beside it in cols 3–4. Event labels switch to codes. Phase names move under the bar. The y axis keeps only 200° and 120°. Index tick labels are hidden, and the time axis steps by 2 minutes. The narration line stays (1–2 lines). The notes stack.

---

## `roasts`
**Purpose:** Three current coffees, comparable at a glance: same fields, same order, one temperature axis, one roast-level scale. **Order is light to dark** (decisions #9): Nyeri 212, Guji 214, Huila 213.

Desktop (1280):
```text
 ────────────────────────────────
 CURRENT ROASTS · ROASTED TUE 27 OCT
 Three roasts, plotted
 on one scale
 Same temperature axis, same roast-level scale…
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│BATCH 212  ROASTED…  │ │BATCH 214  ROASTED…  │ │BATCH 213  ROASTED…  │
│Nyeri               │ │Guji                │ │Huila               │
│Kenya · 0.4°S       │ │Ethiopia · 5.9°N    │ │Colombia · 2.0°N    │
200°┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ← one set of
150°┄\┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  gridlines,
100°┄┄\__..-''┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\__..-''┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\__..-''┄┄┄┄┄┄┄┄┄┄┄  edge to edge
│ Drop 10:10 · 203 °C│ │ Drop 10:40 · 207 °C│ │ Drop 11:20 · 212 °C│
│ ROAST LEVEL  Light │ │ ROAST LEVEL Lt-med │ │ ROAST LEVEL Medium │
│ LIGHT ━▼──────DARK │ │ LIGHT ━━━▼────DARK │ │ LIGHT ━━━━━━▼─DARK │  shared scale
│ PRODUCER  Gikira…  │ │ PRODUCER  Wachu…   │ │ PRODUCER  Finca…   │
│ PROCESS   Washed   │ │ PROCESS   Washed   │ │ PROCESS   Honey    │
│ GROWN AT  1,800 m  │ │ …                  │ │ …                  │
│ FIRST CRACK 8:40…  │ │ …                  │ │ …                  │
│ TASTING NOTES a·b·c│ │ …                  │ │ …                  │
│ SUGGESTED BREW …   │ │ …                  │ │ …                  │
│ BAG  340 g · $26   │ │ BAG  340 g · $24   │ │ BAG  340 g · $22   │
└────────────────────┘ └────────────────────┘ └────────────────────┘
 Prices are for one-off bags. On a plan…                [Start a subscription →]
```
Mobile (375):
```text
 CURRENT ROASTS
 Three roasts,
 plotted on one
 scale
 ┌ comparison plate ───────────┐
 │200┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 213 Huila│
 │150┄\┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 214 Guji │
 │100┄┄\__..--'''''''  212 Nyeri│
 │ LIGHT ─▼212─▼214──▼213─ DARK │
 │ Placed by drop temperature…  │
 └─────────────────────────────┘
 ┌ BATCH 212 · TUE 27 OCT ─────┐
 │ Nyeri                       │
 │ Kenya · 0.4°S               │
 │ Light · 203 °C · DTR 15%    │
 │ PRODUCER … PROCESS … NOTES… │
 │ BAG 340 g · $26             │
 └─────────────────────────────┘
 (×3)
 Prices are for one-off bags…
 [ Start a subscription      → ]
```

**Card grid (lg+):** `div.roast-grid`, 12 cols. The cards (`article`, `aria-labelledby` the name) span 1–4, 5–8 and 9–12. **Row alignment:** the grid defines 8 rows (`grid-template-rows: repeat(8, auto)`), and each card is `grid-row: span 8; display: grid; grid-template-rows: subgrid`, so every field lines up across the three cards.
- Card: surface, 1 px `--color-line` border, padding 24 px, radius 0. Row gaps are 8 px, except 20 px above the mini and 24 px above the data list.
- **Row 1, header:** `roasts.items[].batch` (eyebrow style, ink) on the left; `roasts.labels.roasted` + ` ` + `items[].roasted` on the right (`text-xs` map `num` muted). A 1 px line below, 12 px padding-bottom.
- **Row 2, name:** `roasts.items[].name`, an `h3` in `text-2xl` wide 400. The place name *is* the coffee's name.
- **Row 3, place line:** `items[].country` + ` · ` + `items[].latitude`, `text-lg` map italic 400: lettered like a topo place name, with its latitude.
- **Row 4, mini profile:** height 7.5rem, `role="img"`, `aria-label` = `items[].mini_alt`. The inline `mini-<batch>.svg` fills the card's content width; x = t / 720 is the same scale in all three cards. A 6 px accent dot marks the drop at `minis[].drop.left / top`.
- **Shared gridlines:** a single `div.axis-band` placed in the *same grid row* as the minis: `grid-column: 1 / -1; grid-row: 4; z-index: 1; margin-inline: calc(-1 * max(var(--spacing-margin), (100vw - var(--container-page)) / 2 + var(--spacing-margin)))`, so it runs edge to edge.
  - It holds three 1 px `--color-line` lines at `top: 12.5%` (200°), `43.75%` (150°) and `75%` (100°).
  - Labels `200°` `150°` `100°` (`text-xs` map `num` muted) are right-aligned 8 px left of col 1, in the page margin.
  - Mini SVGs sit above it at `z-index: 2`, and card backgrounds stay below it. The gridlines visibly pass through the gutters: one axis.
- **Row 5, drop line:** `roasts.labels.drop` + ` ` + `items[].drop_time` + ` · ` + `items[].drop` + ` · ` + `roasts.labels.dtr` + ` ` + `items[].dtr` (`text-xs` map 500 `num` ink).
- **Row 6, roast level:**
  - A title line: `roasts.scale_label` (eyebrow, muted) on the left, `items[].roast_level` (`text-sm` 600 ink) on the right.
  - Under it the **scale**, identical in every card: a 1 px muted track with ticks at 198 / 203 / 208 / 213 / 218 °C, and `roasts.scale_min` / `roasts.scale_max` (`text-xs` map 600 caps muted) at its ends.
  - Marker: an 8 px accent ▼ above the track at `(drop − 198) / 20`, which gives 212 at 25 %, 214 at 45 % and 213 at 70 %. A 2 px accent fill runs from 0 to the marker (motion R2).
  - The scale is `role="img"` with `aria-label` "{scale_label}: {roast_level}, drop {drop}".
- **Row 7, data list** (`dl` in 2 columns, dt 8rem / dd 1fr; rows separated by a 1 px line, 8 px row padding): `labels.producer` → `items[].producer`; `labels.process` → `process`; `labels.elevation` → `elevation`; `labels.first_crack` → `first_crack`; `labels.notes` → `notes[0] · notes[1] · notes[2]`; `labels.brew` → `brew`. dt in eyebrow style; dd in `text-sm` ink (`num` where numeric).
- **Row 8, bag:** `roasts.labels.bag` (eyebrow) on the left; `items[].bag` on the right (`text-xl` wide 400 `num` ink).
- **Under the grid** (margin-top 32), on one row: `roasts.price_note` (`text-sm` muted, cols 1–6) and `roasts.cta` → `#subscribe` (the primary button, cols 10–12, right-aligned).

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| head | standard | head tokens | | | none | |
| comparison plate (sm, md only) | 1–4 / 1–8 / — / — | `text-xs` map | line, accent, ink, muted | `mini-212/214/213.svg` | R1 | — |
| cards | 1–4 / 1–8 (stack) / 1–4, 5–8, 9–12 / same | as above | surface, line, ink | `mini-<batch>.svg` | R1, R2 | — |
| axis band | — / — / full-bleed | `text-xs` map | line, muted | | none | — |
| price note + CTA | 1–4 / 1–8 / 1–6 + 10–12 | `text-sm` / button | muted / accent | | none | button: hover, focus, pressed |

**Copy slots** (all ✓ against copy.md):
- `roasts.eyebrow` **44** · `roasts.title` **18 × 3** · `roasts.lede` **160**
- `roasts.labels.*` **14** each (producer, process, elevation, first_crack, notes, roasted, brew, bag, drop, dtr, roast_level)
- `roasts.scale_label` **14** · `roasts.scale_min` / `scale_max` **8** · `roasts.scale_note` **60**. The note shows under the scale in the sm/md plate, and at lg it's the `aria-describedby` of each card's scale.
- `roasts.items[].batch` **10** · `.name` **12** · `.country` **12** · `.latitude` **8** · `.elevation` **14** · `.producer` **32** · `.process` **12** · `.roast_level` **14** · `.first_crack` **16** · `.notes[]` **16** each · `.roasted` **12** · `.brew` **36** · `.bag` **16** · `.mini_alt` **125** (`.drop`, `.drop_time` and `.dtr` are data)
- `roasts.price_note` **90** · `roasts.cta` **22**

**Mobile / md changes:**
- A **comparison plate** comes first: a surface box with a 1 px line and 16 px padding, holding a 12rem chart with the three minis overlaid on the same domain.
  - Curve styles: 214 accent 2.25 px; 213 ink 1.5 px; 212 muted 1.5 px dashed 4 3. Override them with scoped `.plate-<batch> .nb-roast` rules.
  - The chart leaves a 5.5rem right gutter for direct labels `213 Huila`, `214 Guji`, `212 Nyeri` (`text-xs` map `num`), ordered by drop temperature from top to bottom, 18 px apart. Each label connects to its drop point with a 1 px leader.
  - Below the chart, **one** roast-level scale carries all three ▼ markers, each labelled with its batch number, then `roasts.scale_note`.
- The cards stack below (gap 16) **without** their own mini or scale: header, name, place line, a one-line summary `{roast_level} · {drop} · DTR {dtr}`, the data list and the bag row.
- `price_note` and a full-width CTA close the section.

---

## `how-it-works`
**Purpose:** Remove the two reasons people cancel: stale coffee and rigid schedules. The section is a survey route of the next 12 weeks, and the reader can bend it.

Desktop (1280):
```text
 ─────────────────────
 ROUTE SCHEDULE
 Plot your route.
 Skip any stop.
 We roast on Tuesdays and ship within 24 hours…
 SUN  Your last call      ┌ panel: Route schedule ────────────────────────────────┐
 ┆    Until 23:59 ET…     │ DELIVER EVERY [1 week][■2 weeks■][3 weeks][4 weeks]   │
 TUE  We roast            │ YOUR NEXT DELIVERIES                                  │
 ┆    Your coffee goes…   │  Fri 6        Fri 20        ⊘Fri 4        Fri 18  …   │
 WED  We ship             │   ●─ ─ ─ ─ ─ ─ ●─ ─ ─ ─ ─ ─ ○─ ─ ─ ─ ─ ─ ●─ ─ ─ ─ ─ ●  │
 ┆    Packed and handed…  │ ─┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴─                  │
 FRI  At your door        │  3  10  17  24  1  8  15  22  29  5  12  19           │
      At most 3 days…     │ NOV          DEC                JAN                   │
                          │ ┴ Roast day, Tuesday  ● At your door, Friday  ○ Skipped│
 ┌ FRESHNESS PROMISE ──┐  │ ───────────────────────────────────────────────────── │
 │ At your door within │  │ 5 deliveries in the next 12 weeks. Next roast Tue 3 Nov.│
 │ 3 days of the roast…│  │ STOP 2 · Roasts Tue 17 Nov · At your door Fri 20 Nov ·  │
 └─────────────────────┘  │ Change until Sun 15 Nov, 23:59 ET                      │
                          │ Choose a rhythm, then tap a stop to skip it…  [Start →]│
                          └───────────────────────────────────────────────────────┘
```
Mobile (375):
```text
 ROUTE SCHEDULE
 Plot your route.
 Skip any stop.
 SUN Your last call · TUE We roast · …  (4 compact steps)
 ┌ FRESHNESS PROMISE ──────────┐
 └─────────────────────────────┘
 ┌ panel ──────────────────────┐
 │ DELIVER EVERY               │
 │ [1 wk][■2 wk][3 wk][4 wk]   │
 │ Tue 3 Nov  ●  At your door  │
 │            ┆  Fri 6 Nov  Skip│
 │ Tue 10     ┆                │
 │ Tue 17 Nov ○  Skipped       │
 │            ┆        Restore │
 │ Tue 24     ┆                │
 │ Tue 1 Dec  ●  Fri 4 Dec Skip│
 │ …                           │
 │ 5 deliveries in the next…   │
 └─────────────────────────────┘
```

**Layout (lg+):** the head spans cols 1–9 as standard. Below it, the **steps** and **promise** take cols 1–4 and the **panel** cols 6–12. At md: steps as a 2 × 2 grid in 1–8, then promise and panel in 1–8. At sm: steps, promise and panel in 1–4.
- **Steps** (`ol` of 4, in copy order Sun, Tue, Wed, Fri). Each item has `how-it-works.steps[].day` in a 48 px left column (eyebrow style, accent, 3 letters, `num`), and a right column with `steps[].title` (`text-xl` wide 400) and `steps[].body` (`text-base` ink-soft). A vertical 1 px dashed accent line connects the days: the same route. Gap 28.
- **Promise** (margin-top 40): a ruled box (1 px ink top border, 1 px line bottom border, padding 16 0) with `how-it-works.promise_label` (eyebrow, ink) and then `how-it-works.promise` (`text-lg` 400 ink).
- **Panel:** a `section` with `aria-labelledby` = `how-it-works.route.region_label` (eyebrow, visible at the top of the panel). Surface, 1 px line border, padding 32 (lg) / 20 (sm). The visually hidden `route.keyboard_hint` is linked via `aria-describedby`, and `route.noscript` sits in a `<noscript>` in place of the panel.
  1. **Cadence control:** `role="radiogroup"`, `aria-labelledby` = `route.cadence_legend` (eyebrow style).
     - Four equal-width segments, `route.cadence_options[].label`, each 44 px tall, joined by 1 px ink borders into one outlined bar.
     - Selected: ink background, bg-coloured text. Others: transparent with ink text; surface-2 on hover.
     - Arrow keys move the selection (roving tabindex). Default: 2 weeks.
     - The state is **shared** with the `subscribe` cadence field (one store).
  2. `route.window_label` (eyebrow, muted), margin-top 24.
  3. **The route** (lg/md horizontal, height 120 px):
     - 12 week stations at `left: (k + 0.5) / 12`.
     - A dashed accent route line (1.5 px, dash 6 4) at y = 48 px, from station 0 to station 11.
     - **Chainage** below: a 1 px ink baseline at y = 72 with an 8 px tick at each station. Under each tick goes the Tuesday roast date's day number (**data**, `text-xs` map `num` muted). The month (`NOV` `DEC` `JAN`) sits under the first station of each month, in eyebrow style.
  4. **Waypoints** at delivery weeks (`k % cadence === 0`):
     - Each is a `button` with a 32 × 32 hit area and a visible 14 px circle centred on the route line (accent fill, 2 px surface ring). The door date sits above it (`Fri 6`, **data**, `text-xs` map 500 `num` ink).
     - `aria-pressed` = skipped. `aria-label` = `route.skip_aria` or `route.restore_aria`, with `{roast}` filled in.
     - **Skipped:** the circle goes hollow (2 px accent ring, surface fill) with a 1 px diagonal ink strike. The date label is struck through (wiped in, motion W2) and muted, with `route.skipped_label` beneath it (`text-xs` muted).
     - **Holiday:** the stop whose door date would be Fri 25 Dec shows `Thu 24` with a small `*`. `route.holiday_note` appears in the detail line when it's focused.
     - **Locked:** a stop whose cutoff has passed shows `route.locked_label`, with the button disabled (`aria-disabled`) and `route.locked_note` in the detail line. With the demo's anchor date, no stop is locked.
     - Hover shows a 3 px ring; focus shows a round outline.
  5. **Legend row** (margin-top 12, `text-xs` map, muted): three keys with mini symbols, gap 24: `route.legend.roast` (tick), `route.legend.door` (filled pin), `route.legend.skipped` (hollow pin).
  6. **Readout** (1 px line above, padding-top 20, wrapped in `aria-live="polite"`):
     - Line 1: `route.summary` (or `route.summary_one`), in `text-lg` 400 ink `num`.
     - Line 2: the **stop detail** for the focused or hovered stop, defaulting to the first non-skipped stop. It reads `route.stop_label` · `route.stop_roast` · `route.stop_door` · `route.stop_cutoff`, in `text-sm` map 500 `num` ink-soft. After a skip or restore, this line shows `route.skipped_note` or `route.restored_note` for that stop.
     - Screen-reader announcements use `route.announce_cadence`, `announce_skipped`, `announce_restored` and `announce_paused`. Put them in a separate visually hidden live region so the visible lines don't announce twice.
  7. **Footer row:** `route.instructions` (`text-sm` ink-soft) on the left. On the right, the primary button with the CTA text (`hero.cta`) → `#subscribe`, height 44, carrying the chosen cadence.
- **Logic (deterministic demo):**
  - Week `k` runs 0…11. Roast date = Tue 3 Nov 2026 + 7k days. Door date = roast + 3 days (Fri), except Fri 25 Dec, which becomes Thu 24 Dec. Cutoff = roast − 2 days (Sun), 23:59 ET.
  - Deliveries fall in weeks where `k % cadence === 0`: cadence 1 gives 12, 2 gives 6, 3 gives 4, 4 gives 3.
  - "Next roast" is the first non-skipped delivery. Changing cadence clears all skips.
  - **Empty state** (every delivery skipped): the readout is replaced by `route.empty_title` (`text-xl` wide 400), `route.empty_body` and a text button `route.empty_action` that clears all skips. The route line turns muted and dotted.
  - **Loading / error:** the schedule is computed synchronously on the client, so `route.loading`, `route.error` and `route.error_action` never render. The Builder may keep them for completeness.

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| head | standard | head tokens | | | none | |
| steps | 1–4 / 1–8 (2 × 2) / 1–4 / 1–4 | eyebrow / `text-xl` / `text-base` | accent / ink / ink-soft | | none | — |
| promise | 1–4 / 1–8 / 1–4 / 1–4 | eyebrow / `text-lg` | ink | | none | — |
| panel | 1–4 / 1–8 / 6–12 / 6–12 | as above | surface, line | | W4 (route draws once) | noscript |
| cadence control | full panel | `text-sm` 600 | ink / bg | | — | hover, focus, selected, pressed |
| waypoints | stations | `text-xs` map | accent / ink | | W1, W2 | hover, focus, pressed (= skipped), locked, holiday |
| readout | full panel | `text-lg` / `text-sm` map | ink / ink-soft | | W3 | paused (empty) |

**Copy slots** (all ✓ against copy.md):
- `how-it-works.eyebrow` **44** · `.title` **18 × 3** ("Plot your route. / Skip any stop.") · `.lede` **160**
- `how-it-works.steps[].day` **3** · `.title` **22** · `.body` **100**
- `how-it-works.promise_label` **22** · `.promise` **90**
- `how-it-works.route.region_label` **28** · `.cadence_legend` **22** · `.cadence_options[].label` **10** · `.instructions` **90** · `.keyboard_hint` **90** · `.window_label` **28** · `.legend.*` **22** each
- `route.stop_label` / `stop_roast` / `stop_door` / `stop_cutoff`: templates, **≤ 110** combined on one line at lg (they wrap at sm)
- `route.skip_button` / `restore_button` **10** (mobile rows only) · `route.skip_aria` / `restore_aria` (aria) · `route.skipped_label` **10** · `route.skipped_note` / `restored_note` **80** · `route.locked_label` **10** · `route.locked_note` **80** · `route.holiday_note` **80**
- `route.summary` / `summary_one` **80** · `route.empty_title` **22** · `route.empty_body` **100** · `route.empty_action` **22** · `route.announce_*` (aria) · `route.noscript` **170**

**Mobile changes:** the route turns **vertical**, with one row per week (12 rows) in three columns:
- Left, 76 px: the roast date (`Tue 3 Nov`, `text-xs` map `num` muted). The month shows on row 0 and on the first row of each month.
- Centre, 32 px: the vertical dashed route line and the waypoint pin (decorative here).
- Right: `At your door` + `Fri 6 Nov` (`text-sm`), and a right-aligned text button with a 44 px hit area, `route.skip_button` / `route.restore_button`. On mobile, this button is the control.

Delivery rows are 56 px tall. Non-delivery rows collapse to 24 px with no label, so cadence 2 comes to about 480 px. The cadence control spans the full panel. The readout drops the stop detail (each row already shows it) and keeps only the summary line. Above the panel, the steps become a compact list: day and title on one line, the body below, gap 16.

---

## `proof`
**Purpose:** Earn trust with specifics. This is the valley: the longest stretch of open paper on the page, holding one voice, one relationship and one number.

Desktop (1280):
```text
            (section-lg of open paper above)
 ───────────────────
 ON THE RECORD
 From washing station
 to kettle
   “ Two other subscriptions went stale on me.        SOURCING
     This bag arrived three days off the roast,       Four harvests, one
     and the curve explained why my first cup…        washing station
     HANNAH LINDQVIST · DULUTH, MINNESOTA · V60 1:16  We've bought Guji from…
                                                      2.6 days ─────────┐
                                                      Average time from  │
                                                      roast to door…     │
            (section-lg of open paper below)
```
Mobile (375):
```text
 ON THE RECORD
 From washing station
 to kettle
 “ Two other subscriptions
   went stale on me…
   HANNAH LINDQVIST · DULUTH…
 SOURCING
 Four harvests, one washing station
 We've bought Guji from…
 2.6 days ──────────
 Average time from roast…
```
- **Head:** standard (`proof.eyebrow`, `proof.title`), but indented one column at lg+ (cols 2–9): the valley floor.
- **Quote** (`figure`; lg cols 2–8 · md 1–8 · sm 1–4; margin-top 48):
  - `proof.quote.label` is a visually hidden prefix in the `figcaption`.
  - The `blockquote` holds `proof.quote.text` in `text-2xl xl:text-3xl` semi 340, ink.
  - The opening `“` hangs in col 1 at lg+, in accent, `text-5xl` wide 300. At sm it sits inline.
  - Attribution, margin-top 24: `proof.quote.name` · `proof.quote.place` · `proof.quote.method` (eyebrow style, ink-soft).
- **Sourcing** (lg cols 9–12 · md 1–8 · sm 1–4; at lg it starts level with the quote's first line): `proof.sourcing.label` (eyebrow, muted), `proof.sourcing.headline` (`text-xl` wide 400, ink), `proof.sourcing.body` (`text-base` ink-soft), gap 12.
- **Stat** (same column, margin-top 40): `proof.stat.value` in `text-4xl xl:text-5xl` wide 300 `num`, ink. A 1 px accent leader runs from the value's right edge to the column's right edge, then turns down 24 px (motion P1). `proof.stat.label` (`text-sm` ink-soft) sits under it.
- No cards, avatars, stars or logos.

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| head | 1–4 / 1–8 / 2–9 / 2–9 | head tokens | | | none | |
| quote | 1–4 / 1–8 / 2–8 / 2–8 | `text-2xl` → `text-3xl` semi | ink; mark accent | | none | |
| attribution | 1–4 / 1–8 / 2–8 / 2–8 | `text-xs` map | ink-soft | | none | |
| sourcing | 1–4 / 1–8 / 9–12 / 9–12 | eyebrow / `text-xl` / `text-base` | muted / ink / ink-soft | | none | |
| stat | 1–4 / 1–8 / 9–12 / 9–12 | `text-4xl` → `text-5xl` / `text-sm` | ink, accent leader | | P1 | |

**Copy slots:** `proof.eyebrow` **44** ✓ · `proof.title` **18 × 3** ✓ · `proof.quote.label` **16** ✓ · `proof.quote.text` **180** ✓ (176 characters, about 6 lines at xl and 8 at sm; it's the valley's one voice, so length is fine) · `proof.quote.name` / `place` / `method` **24** each ✓ · `proof.sourcing.label` **16** ✓ · `.headline` **40** ✓ · `.body` **200** ✓ · `proof.stat.value` **8** ✓ · `proof.stat.label` **70** ✓

**Mobile changes:** the quote drops to `text-2xl` with the open quote inline. Sourcing and stat follow in order, 48 px apart, and the stat's leader runs horizontally only. The section keeps its `section-lg` padding: the breath matters most on a phone.

---

## `subscribe` (anchor `#subscribe`)
**Purpose:** Price it and close. One form holds the plan, rhythm, brew style, email and the decision.

Desktop (1280):
```text
 ─────────────────
 NEXT ROAST TUE 3 NOV · JOIN BY SUN 1 NOV
 From $19 a bag.            ┌ form panel ──────────────────────────────────┐
 Skip any week.             │ BAGS PER DELIVERY                             │
 Pick a bag count…          │ [ 1 bag     ] [■ 2 bags   ■] [ 4 bags    ]   │
                            │ [ $21       ] [■ $40      ■] [ $76       ]   │
 EVERY DELIVERY INCLUDES    │ [ $21 a bag ] [  $20 a bag ] [ $19 a bag ]   │
 ▲ A curve card for every…  │ [ ~18 brews ] [  ~36 brews ] [ ~72 brews ]   │
 ▲ A roast date no more…    │ Each bag is 340 g (12 oz)…                    │
 ▲ Shipping included…       │ DELIVER EVERY [1 wk][■2 wk][3 wk][4 wk]        │
 ▲ Skip, pause, swap…       │ WHAT DO YOU BREW WITH?                         │
                            │ [■ Filter ■ rotating single…] [ Espresso … ]  │
 Pause or skip anytime.     │ YOUR PLAN  2 bags every 2 weeks, filter. $40… │
                            │ EMAIL ADDRESS                                  │
 The next climb goes into   │ [ name@example.com                           ] │
 the drum Tuesday.          │ For your confirmation and a link to change…    │
                            │ [         Start a subscription →             ] │
                            │ Demo page: this form checks your email…        │
                            └────────────────────────────────────────────────┘
```
Mobile (375):
```text
 NEXT ROAST TUE 3 NOV · JOIN BY…
 From $19 a bag.
 Skip any week.
 Pick a bag count…
═════════════════════════════  panel full-bleed (top/bottom hairlines only)
 BAGS PER DELIVERY
 [■ 2 bags · $20 a bag    $40 ■]
 [  1 bag  · $21 a bag    $21  ]
 [  4 bags · $19 a bag    $76  ]
 DELIVER EVERY [1][■2][3][4]
 WHAT DO YOU BREW WITH? [■Filter][Espresso]
 YOUR PLAN 2 bags every 2 weeks…
 EMAIL ADDRESS [________________]
 [ Start a subscription       → ]
═════════════════════════════
 EVERY DELIVERY INCLUDES ▲ … (after the form)
 Pause or skip anytime.
 The next climb goes into the drum Tuesday.
```
- **Left column** (lg 1–5 · md 1–8 · sm 1–4), top to bottom:
  - The standard head: `subscribe.eyebrow`, `subscribe.title`, `subscribe.lede`.
  - `subscribe.included_title` (eyebrow, margin-top 40), then a `ul` of `subscribe.included[0..3]` (`text-base` ink-soft), each led by an 8 px accent ▲, gap 12.
  - `subscribe.reassurance` (`text-sm` 600 ink, margin-top 32).
  - `subscribe.closing` (`text-xl` wide 400 ink, margin-top 48). At lg it bottom-aligns with the panel.
- **Form panel** (`form`, `novalidate`, `aria-label` = `subscribe.title`; lg 7–12 · md 1–8 · sm full-bleed): surface, 1 px line border (top and bottom only at sm), padding 40 (lg) / 24 (md) / 20 + margin (sm). Each fieldset has a `legend` in eyebrow style, with 28 px between fieldsets.
  1. **Plan** (`subscribe.plans_legend`): a radio group of 3 cards (3 columns at lg/md, 1 column at sm).
     - Each card shows `plans[].name` (`text-base` 600), `plans[].price` (`text-3xl` wide 340 `num`), `plans[].price_unit` (`text-xs` muted), `plans[].per_bag` (`text-xs` map `num` ink) and `plans[].fit` (`text-xs` muted).
     - The default is the plan with `default: true` (2 bags). `subscribe.bag_note` sits under the group (`text-xs` muted).
     - **Radio-card states:** rest = surface with a 1 px line border; hover = 1 px muted border; **selected** = `--color-moss` fill, 1 px ink border, a 10 px accent ▲ top-right and the visually hidden `subscribe.selected_label` (motion S1); focus-visible = outline on the card (the native input is visually hidden but focusable); pressed = surface-2.
  2. **Cadence** (`subscribe.cadence_legend`): the same segmented control as `how-it-works`, sharing its state, labelled with `subscribe.cadence_options[].label`.
  3. **Brew style** (`subscribe.style_legend`): a radio group of 2 cards, 2 columns at every size. Each shows `styles[].label` (`text-base` 600) and `styles[].body` (`text-sm` muted). At sm, only the selected option's body shows, under the group. The default is `filter`. Selected styling matches the plans.
  4. **Summary** (`output`, `aria-live="polite"`, 1 px line above, padding-top 16): `subscribe.plan_summary_label` (eyebrow) + `subscribe.plan_summary` (`text-base` `num` ink, with tokens `{bags}`, `{cadence}`, `{style}`, `{price}`).
  5. **Email:** the `label` is `microcopy.form.email_label` (`text-sm` 600). The input is 52 px tall with a surface-2 fill, 1 px muted border, padding-x 16, `text-base`, `type="email"`, `autocomplete="email"`, and the placeholder `microcopy.form.email_placeholder` (muted). `microcopy.form.email_help` sits below it (`text-sm` muted, `aria-describedby`).
  6. **Submit:** a full-width accent button, 56 px tall: `microcopy.form.submit` + `→`. Below it, `microcopy.form.demo_note` (`text-xs` muted).
- **States** (client-side only):
  - *Empty / untouched:* as above. Submit is always enabled.
  - *Invalid:* submitting an empty or malformed email (`/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`) gives the input a 2 px danger border and `aria-invalid="true"`. The error `microcopy.form.email_error_empty` or `email_error_invalid` (`text-sm` 500 danger) replaces the help text and stays linked via `aria-describedby`. Focus moves to the input. The error clears on the next valid input.
  - *Loading:* the button reads `microcopy.form.submitting`, with `aria-busy="true"` and the plotted hairline running (motion S2). Inputs are `disabled`. The fake request takes 900 ms.
  - *Error (submit):* if the URL has `?fail`, the request rejects. A note with a 1 px danger border and `microcopy.form.error_submit` appears above the button, with a `microcopy.form.retry` text button. Form values are kept.
  - *Success:* the panel content is replaced (S3) by a 10 px accent ▲, `microcopy.form.success_title` (`h3`, `text-2xl` wide 400, `tabindex="-1"`, focused) and `microcopy.form.success` (`text-base` ink-soft, `{email}` filled in), then a `dl` of the chosen plan (the summary line).

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| head + included + closing | 1–4 / 1–8 / 1–5 / 1–5 | head tokens; `text-base`; `text-xl` | ink-soft, accent ▲ | | none | |
| form panel | full-bleed / 1–8 / 7–12 / 7–12 | as above | surface, line | | S3 | empty, invalid, loading, error, success |
| plan cards | 1 col / 3 / 3 / 3 | `text-base` 600, `text-3xl` | surface / moss when selected | | S1 | hover, focus, selected, pressed |
| style cards | 2 / 2 / 2 / 2 | `text-base` 600 | surface / moss when selected | | S1 | hover, focus, selected, pressed |
| summary | panel | `text-base` `num` | ink | | S4 | — |
| email | panel | `text-base` | ink on surface-2, muted border | | — | focus, invalid, disabled |
| submit | panel | `text-sm` 600 | accent / accent-ink | | S2 | hover, focus, pressed, loading |

**Copy slots** (all ✓ against copy.md):
- `subscribe.eyebrow` **44** · `.title` **18 × 3** ("From $19 a bag. / Skip any week.") · `.lede` **160**
- `subscribe.plans_legend` **22** · `.plans[].name` **12** · `.price` **6** · `.price_unit` **16** · `.per_bag` **16** · `.fit` **36** · `.bag_note` **80** · `.selected_label` **12** (hidden)
- `subscribe.cadence_legend` **22** · `.cadence_options[].label` **10**
- `subscribe.style_legend` **28** · `.styles[].label` **12** · `.styles[].body` **80**
- `subscribe.plan_summary_label` **16** · `.plan_summary` **80** (template)
- `subscribe.included_title` **28** · `.included[]` **60** each · `.reassurance` **28** · `.closing` **48**
- `microcopy.form.email_label` **22** · `.email_placeholder` **28** · `.email_help` **80** · `.email_error_empty` / `.email_error_invalid` **80** · `.submit` **22** · `.submitting` **22** · `.success_title` **28** · `.success` **160** · `.error_submit` **100** · `.retry` **16** · `.demo_note` **90**

**Mobile changes:** the form panel moves directly under the head and runs full-bleed, with only top and bottom hairlines. The included list, reassurance and closing line follow it. Plan cards become one-row radios (name · per-bag on the left, price on the right), with the default plan listed first. Style cards stay 2-up and compact.

---

## `footer`
**Purpose:** Close quietly and orient, like the collar of a map sheet.

Desktop (1280):
```text
──────────────────────────────────────────────────────────────────────
TERRAIN COMPUTED FROM THE BEAN-TEMPERATURE LOG OF BATCH 214, ROASTED…   (collar)
──────────────────────────────────────────────────────────────────────
↑ NORTHBOUND                                           46.5°N 87.4°W
Every roast is a climb.
THE ROASTERY         (SCHEDULE)            SAY HELLO        (ROUTE)
Marquette, Michigan  We roast on Tuesdays… hello@…          Roasts …
──────────────────────────────────────────────────────────────────────
© 2026 Northbound Coffee Roasters      Northbound is a fictional brand…
```
Mobile (375):
```text
TERRAIN COMPUTED FROM THE…
↑ NORTHBOUND
Every roast is a climb.
46.5°N 87.4°W
THE ROASTERY  Marquette, Michigan
We roast on Tuesdays…
SAY HELLO  hello@…
Roasts · The curve · How it works · Plans
© 2026 … · demo note
```
- The `footer` has a 1 px ink top rule: the sheet edge.
- **Collar row:** `footer.map_credit` in eyebrow style (muted) with 16 px padding, then a 1 px line.
- **Wordmark row:** `footer.wordmark` in caps (`text-3xl md:text-5xl` wide 300, tracking 0.02em, ink), with `north-tick.svg` before it at 0.8× cap height. Cols: sm 1–4 · md 1–8 · lg 1–9. `footer.tagline` sits below it (`text-lg` ink-soft; set "*climb*" in italic if the Copywriter marks it).
- **Coordinates:** `footer.coordinates` (`text-sm` map 500 `num`, ink), lg cols 10–12, right-aligned.
- **Info row** (margin-top 48): 4 columns at lg (1–3, 4–6, 7–9, 10–12), 2 × 2 at md, stacked at sm. Labels are eyebrow style; values are `text-sm` ink-soft.
  - `footer.location_label` / `footer.location`
  - `footer.schedule` (no label; a muted eyebrow spacer keeps the row aligned)
  - `footer.contact_label` / `footer.email` (`mailto:`)
  - the nav repeated (`microcopy.nav[].label`, `text-sm`, stacked)
- **Legal row** (margin-top 64, 1 px line above, padding-top 16): `microcopy.footer.legal` on the left, `footer.demo_note` on the right (`text-xs` muted; stacked at sm).
- Links: accent with underline on hover; outline on focus.

| Element | Columns (sm / md / lg / xl) | Type token | Color | Asset | Motion | States |
|---|---|---|---|---|---|---|
| collar | 1–4 / 1–8 / 1–12 / 1–12 | `text-xs` map 600 | muted | | none | |
| wordmark + tagline | 1–4 / 1–8 / 1–9 / 1–9 | `text-3xl` → `text-5xl` wide 300; `text-lg` | ink; ink-soft | `north-tick.svg` | none | |
| coordinates | 1–4 / 1–8 / 10–12 / 10–12 | `text-sm` map | ink | | none | |
| info | stacked / 2 × 2 / 4 × 3 cols | eyebrow + `text-sm` | muted / ink-soft | | none | links: hover, focus |
| legal | 1–4 / 1–8 / 1–12 | `text-xs` | muted | | none | |

**Copy slots** (all ✓): `footer.map_credit` **100** · `footer.wordmark` **12** · `footer.tagline` **32** · `footer.coordinates` **20** · `footer.location_label` **16** · `footer.location` **32** · `footer.schedule` **60** · `footer.contact_label` **16** · `footer.email` **32** · `footer.demo_note` **90** · `microcopy.footer.legal` **48**

---

## `not-found` (404 page, `app/not-found.tsx`)
- Same nav, then a hero-height section on paper.
- The terrain box is anchored as in the hero but shows only the land: no section line, no spot heights, no route card.
- A single `×` spot marker (ink, 10 px) sits at the clearing's centre (`left: 32.5%; top: 43%`): the "you are here" that isn't on any route.
- In the clearing: `microcopy.not_found.title` (`text-5xl` wide 340), `microcopy.not_found.body` (`text-lg` ink-soft, max 30rem) and `microcopy.not_found.link` → `/` (`text-sm` 500, underlined).
- Budgets: title **28** ✓ · body **100** ✓ · link **28** ✓.

---

## Metadata and assets checklist (Builder)
- `src/app/icon.svg` ← `assets/icon.svg`. `<title>` and the description come from `content/metadata.md`. The OG image composition is in `assets/README.md`.
- `::selection` is moss on ink (set in tokens), with `color-scheme: light dark`.
- Inline `terrain-hero.svg`, `section-strip.svg`, `profile-a.svg`, `mini-212/213/214.svg` and `north-tick.svg`. Import `contours-data.json`.
- Every SVG file is `aria-hidden="true" focusable="false"`. Meaning reaches assistive tech two ways: wrapper `role="img"` + `aria-label` (hero terrain, profile, minis, phase bar, level scales), and real text (route card, hidden events table, card fields).
- Performance: no raster images, only inline SVG (51.6 KB total, about 20 KB gzipped). Two font files are preloaded. The terrain is static markup with no JS. Only the `roast-curve` stage, the route schedule and the form hydrate.

## Reconciliation notes for the Director (⚠ items)
1. **`hero.headline`:** the words are unchanged; only the breaks differ. "Every roast / is a *climb.*" is the h1 display, and "We send you the map." is the coda inside the same h1. The copy's 14-character first line can't fit the wide display cut at lg.
2. **Demo data to log** (designer-invented and used by `contours.mjs`):
   - Batch 214's CHARGE probe reading of **200 °C**. It's drawn but not labelled, since the copy leaves the charge temperature blank.
   - Tray cooling to 12:00, drawn illustratively (τ = 110 s, no numbers shown).
   - CHARGE / TP / DE for batch 212: 198 °C, 1:02 / 87 °C, 4:25 / 151 °C.
   - CHARGE / TP / DE for batch 213: 202 °C, 1:08 / 89 °C, 4:40 / 153 °C.
