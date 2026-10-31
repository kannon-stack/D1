# Layout spec · Agkbuilds · A · Working Drawing

Read with `direction.md`, `type.md`, `motion.md`, `tokens.css` and `assets/README.md`. Every size is a token or an exact value given here.

**Copy slots** are keys in `content/copy.md` (`section.key`, `[]` for list items). Budgets are `chars per line × lines` for display text (uppercase is applied by CSS; count the source characters) or a max character count. **Data** (sheet numbers, the item count, balloon numerals, the © year) is computed by the Builder and is not copy. **Facts** come only from `decisions.md` #9–#13: the three items, `agkbuilds@gmail.com`, `254-231-1149` (href `tel:+12542311149`), `Dylan Borgen`. No absolute URL appears in any slot (#13).

## Global

- **Grid:** sm (< 768) **4** columns · md (≥ 768) **8** · lg (≥ 1024) **12** · xl (≥ 1280) **12**. Gutter `--spacing-gutter` (16 → 24 px), side margin `--spacing-margin` (16 @375 · 30 @768 · 48 @1280 · 64 cap), content max `--container-page` (1280). Container: `mx-auto max-w-[calc(var(--container-page)+2*var(--spacing-margin))] px-(--spacing-margin)`; inner `div.sheet` has `container-type: inline-size; position: relative` and holds a `grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-(--spacing-gutter)`. Set `--cols: 4 | 8 | 12` on `:root` per breakpoint (used by the guide patterns).
  - Reference content widths / column widths: 375 → 343 / 73.8 · 768 → 708 / 69 · 1024 → 946 / 56.8 · 1280 → 1184 / 76.7 · 1440 → 1280 / 84.7.
- **The sheet guides (visible grid).** One `div.sheet-guides` as the first child of `<body>`, `aria-hidden`, `position: fixed; inset: 0; z-index: 0; pointer-events: none`. Inside it the same container + `div.sheet` (height 100 %), whose `::before` is `position: absolute; top: 0; bottom: 0; left: 0; width: calc(100cqw + var(--spacing-gutter) + 1px); background: linear-gradient(90deg, var(--color-grid) 1px, transparent 1px) 0 0 / calc((100cqw + var(--spacing-gutter)) / var(--cols)) 100% repeat-x;`. That draws a hairline at the left edge of every column plus one a gutter past the last column. `header`, `main` and `footer` are `position: relative; z-index: 1` with transparent backgrounds. This background layer is the token `--sheet-cols` in `tokens.css` (with `--cols` switching 4 / 8 / 12 per breakpoint), so the hero cover reuses exactly the same pattern.
- **Planned breaks (the only ones):** the hero headline runs into the right margin (lg+); the hero construction circle is cropped by the right edge (sm/md); the hero row rules run full-bleed; the title block is pinned to cols 7–12 at the bottom of `contact`. Everything else starts on a column line.
- **Section rhythm** (top / bottom padding): `hero` 32 px (24 sm) / `section-sm` → `build` `section-sm` / `section-xs` → `process` `section-xs` / `section-md` → **`contact` `section-lg` / `section-sm`** (the breath before the title block) → `footer` 40 / 32 px. A tight run (hero → parts → method), one long breath, then the decision.
- **Sheet header** (top of `build`, `process`, `contact`): a 1 px `--color-line` rule across the full content width (cols 1–last), then 16 px, then the label row in `annotate` (muted): left `SHEET 0n / 04 · {section.sheet_title}`. The word "Sheet" is `microcopy.sheet`; the numbers are data (section order 01–04, total 04). The `hero` label row has no rule above it (the nav border is its rule).
- **Section titles (h2)** are display caps, `text-2xl` sm · `text-4xl` md+, one `<span class="block">` per line, ink. **Budget 14 × 2** everywhere (14 chars × 0.86 em × 27.6 px = 332 px fits 343 at 375).
- **Anchors:** `#top` (hero), `#build`, `#process`, `#contact`. `scroll-margin-top: 24px` (the nav is not sticky) on `#build`, `#process`, `#contact`. **`#top` is the exception (R1-05):** `section#top.hero { scroll-margin-top: var(--nav-h) }` with `--nav-h: 56px` (sm, md) / `72px` (lg+), the nav height (the nav sits at offset 0, static), so the wordmark and "Back to top" land at `scrollY` 0 with the whole nav visible. Don't move `id="top"` and don't add a scroll-margin larger than the nav to the other anchors. Smooth scrolling only under `prefers-reduced-motion: no-preference` (in tokens). Check every anchor lands within ±4 px at 375 and 1280, and on a direct load of each `/#id`.
- **Overflow:** `html, body { overflow-x: clip }` and `section.hero { overflow-x: clip }` (the circle and rules bleed on purpose). Never `overflow: hidden` on an ancestor of the sticky process plate.
- **Nav** (`header > nav`, `aria-label` = `microcopy.nav_label`). **Static, not sticky**: the page is four sheets and the hero CTA is on the first screen. Height 72 px (lg+) / 56 px (sm, md); 1 px `--color-line` bottom border across the content width (the sheet's top border).
  - Left: **wordmark** link to `#top`, `aria-label` = `microcopy.wordmark_label`. "AGK" in display 800, 22 px, tracking 0.02em, ink; under it, 4 px gap, the dimension bracket: a flex row `├─ BUILDS ─┤` built from CSS (1 px `--color-muted` end ticks 7 px tall, 1 px lines `flex: 1`, the word "builds" in mono 500, 10 px, tracking 0.12em, uppercase, muted, 6 px padding each side). The bracket is exactly as wide as "AGK" (`width: max-content` wrapper, bracket `width: 100%`). The wordmark is the brand name and is fixed, not a copy slot.
  - lg+: right-aligned index of sheets, gap 32: three links `02 {microcopy.nav[0]}` → `#build`, `03 {microcopy.nav[1]}` → `#process`, `04 {microcopy.nav[2]}` → `#contact` (`annotate`, colour ink-soft; numbers are data). Hover: ink + 1 px underline at offset 4; focus ring; pressed: `translateY(1px)`.
  - sm, md: right side shows only the last link, `04 {microcopy.nav[2]}` + ` ↓` (mono), with a 44 × 44 px hit area. No menu button (three anchors don't need one; the page is short).
  - Slots: `microcopy.nav_label` **24** · `microcopy.wordmark_label` **32** · `microcopy.nav[]` **14** each, exactly 3 · `microcopy.sheet` **6**.
- **Skip link:** first focusable element, `microcopy.skip_link` (**24**) → `#main`. Visually hidden until focused, then fixed top-left 12 px: ink background, bg-coloured text, `text-sm` 600, padding 10 × 16, z-index 100.
- **Main:** `<main id="main">` wraps the four sections; the footer sits outside it.
- **Focus:** 2 px `--color-focus` outline, 3 px offset, no transition (tokens). On the accent button the ring sits outside the orange with the 3 px gap, so it reads on both grounds.
- **Buttons (one style, used twice):** the primary CTA. Height 56 px (sm, md) / 60 px (lg+), padding-x 20 px, `display: flex; justify-content: space-between; align-items: center; gap: 24px`, background accent, label accent-ink `text-base` 600, then the arrow `→` in mono 500 (`aria-hidden`). Square corners, no shadow. Hover: `accent-hover` + arrow `translateX(4px)`; pressed: `accent-press` + `translateY(1px)`; focus: ring. Never narrower than 280 px; full width on sm.
- **Scheme:** follows the OS. Dark (graphite) is the home look; both are designed in `tokens.css`. No toggle.

---

## `hero`
**Purpose:** In five seconds: Agkbuilds builds custom software, planned first and then built. One click to start a conversation.

Desktop (1280 × 800):
```text
┊     ┊     ┊     ┊     ┊     ┊     ┊     ┊     ┊     ┊     ┊     ┊   ← column guides
AGK                                   02 WHAT WE BUILD  03 HOW WE WORK  04 CONTACT
├─BUILDS─┤
─────────────────────────────────────────────────────────────────────────────────── nav border
SHEET 01 / 04 · GENERAL ARRANGEMENT                       ─ ─ ┬ ─ ─ ─
═══════════════════════════════════════════════════  ╭─────┼─────╮ ═══ cap line
CUSTOM                                              ╱ ticks │  ╱    ╲
═══════════════════════════════════════════════════│  ╭──┼──╮      │══ baseline
SOFTWARE,                                     ─ ─ ─│─ ┼──●──┼─ ─ ─│─ ─ centre line
════════════════════════════════════════════════════│  ╰──┼──╯     │═
DRAWN TO FIT.                                        ╲    │      ╱
════════════════════════════════════════════════════  ╰───┼────●╮  DETAIL A
THEN BUILT.  (accent)                                     │      ╰──────
═══════════════════════════════════════════════════════════════════════════
├──────────────── FIG. 01 · CUSTOM SOFTWARE ─────────────────┤
                                                  
We plan and build software around the       [ Start a conversation      → ]
way your business works…                     OPENS YOUR EMAIL APP
```
Mobile (375 × 812):
```text
┊        ┊        ┊        ┊       ┊
AGK                     04 CONTACT ↓
├BUILDS┤
────────────────────────────────────
SHEET 01 / 04 · GENERAL ARRANGEMENT
════════════════════════════  ╭──── cap line (full-bleed)
CUSTOM                       ╱ │
SOFTWARE,              ─ ─ ─│─ ┼●─   circle centred on the
DRAWN                       │  │     right edge, half cropped
TO FIT.                      ╲ │
THEN BUILT.  (accent)         ╰────
├──── FIG. 01 · CUSTOM SOFTWARE ───┤

We plan and build software around
the way your business works…

[ Start a conversation          → ]
OPENS YOUR EMAIL APP
```

**Structure (all sizes).**
- `section#top.hero` (`aria-labelledby` the h1): `position: relative; overflow-x: clip; padding-top: 32px` (24 sm); padding-bottom `section-sm`.
- **Label row**: `p.annotate` muted, `SHEET 01 / 04 · {hero.sheet_title}`, cols 1–6 (sm 1–4).
- **`div.hl-block`** (`position: relative`, full content width), margin-top 24 px (16 sm). It contains, in order: `div.hl-rules`, `div.hc`, `h1.hl`, `div.dim`.
  - **`div.hl-rules`** (`aria-hidden`, z 0): the cap-line + baseline rules. `position: absolute; top: 0; height: <h1 height>` (make it a child of the h1 instead if simpler: `h1::before`), `left: -100vw; right: -100vw` (clipped by the hero), `font-size: var(--text-hero)`. Background, repeating every row:
    ```css
    background: linear-gradient(to bottom,
      transparent calc(var(--hl-cap) - 1px), var(--color-line) calc(var(--hl-cap) - 1px),
      var(--color-line) var(--hl-cap), transparent var(--hl-cap),
      transparent var(--hl-base), var(--color-line) var(--hl-base),
      var(--color-line) calc(var(--hl-base) + 1px), transparent calc(var(--hl-base) + 1px))
      0 0 / 100% var(--hl-row) repeat-y;
    ```
    This value is the token `--hl-rows` in `tokens.css`. The cap line sits on the top edge of the capitals and the baseline rule just under them, on every row, including rows created by wrapping on mobile.
  - **`div.hc`** (`aria-hidden`, z 0): inline `assets/hero-construction.svg`, `color` irrelevant (it uses token variables). `position: absolute; font-size: var(--text-hero); aspect-ratio: 1`.
    - lg+: `width: 4.25em; top: -0.382em; right: calc(-0.5 * var(--spacing-margin))`. This sizes the outer circle to exactly the distance from line 1's cap line to line 4's baseline (3.343 em), so the circle is tangent to both rules, and its tangent construction lines (`#hc-tangents`) land on them.
    - md: `width: 4.25em; top: -0.382em; right: -1.25em` (crop starts).
    - sm: `width: 6em; top: -0.382em; right: -3em` (centre on the screen edge, left half visible).
    - **`hero.drawing_label`** (lg+ only; `aria-hidden` like the drawing, as it is decorative): `annotate` muted, absolutely positioned inside `.hc` with `right: 1.33%` (= `100% − leaderEnd.leftPct`) and `bottom: calc(100% − 88.09% + 6px)` (from `drawing-data.json → hero.leaderEnd.topPct`), `text-align: right; white-space: nowrap`. It sits on the leader's horizontal run.
  - **`h1.hl`** (z 1): `font-family: var(--font-display); font-weight: 800; font-size: var(--text-hero); line-height: var(--text-hero--line-height); letter-spacing: var(--text-hero--letter-spacing); text-transform: uppercase;` lg+: `margin-right: calc(-1 * var(--spacing-margin))` (the planned bleed). It contains **4** `span.hl-line` (`display: block; width: fit-content; position: relative; text-wrap: balance`), each holding:
    1. `span.hl-text`: the real words (from `hero.headline` line n). Line 4 has `color: var(--color-accent)`; lines 1–3 ink.
    2. `span.hl-cover` (`aria-hidden`, empty, `position: absolute; inset: 0; z-index: 1; pointer-events: none`): `background: var(--hl-rows), var(--sheet-cols), var(--color-bg)` (the line box's left edge is column 1's edge, and `100cqw` resolves against `div.sheet`, so the cover's guides line up exactly with the fixed guides behind it).
    3. `span.hl-draw` (`aria-hidden`, `position: absolute; inset: 0; z-index: 2; user-select: none; pointer-events: none`): the same words again, `color: transparent; -webkit-text-stroke: 1px var(--color-ink)` (line 4: `var(--color-accent)`), `paint-order: stroke`.
    4. `span.hl-edge` (`aria-hidden`, `position: absolute; top: 0; bottom: 0; left: 0; width: 100%; border-left: 2px solid var(--color-accent); z-index: 3; pointer-events: none`).
    Items 2–4 are `display: none` unless `prefers-reduced-motion: no-preference` (see `motion.md` H4–H5b). The real text is painted, solid, at first paint underneath the cover.
  - **`div.dim`** (`aria-hidden`): the dimension line, as wide as the widest headline line (`div.hl-block` wraps the h1 and `.dim` in an inner `div` with `width: fit-content`, and `.dim` is `width: 100%`). Margin-top 20 px (16 sm). A flex row, `align-items: center; gap: 12px`: an end tick (1 × 14 px, `--color-draft`, `flex: none`), a line (`flex: 1 1 24px; min-width: 24px; height: 1px`, draft), the label `hero.fig_label` (`annotate`, muted, `flex: none; white-space: nowrap`), a line, an end tick. Motion H6.
    - **sm (< 768) (R1-03):** `.dim` is taken out of the fit-content wrapper's width and spans the **full content width** (343 px at 375: `width: 100%` of `div.hl-block`, not of the inner `fit-content` div; e.g. move `.dim` after the inner div at sm, or give the inner div `width: auto` below md). With the 25-character label (≈ 183 px) each line half is ≈ 67 px and both end ticks show; at the 28-character budget each half is still ≥ 56 px. The `min-width: 24px` on the lines guarantees both halves and ticks at any width. md+ is unchanged (dimension = widest headline line).
- **Copy row**: the grid, margin-top 40 px (lg+) / 32 (md) / 28 (sm), `align-items: end`.
  - `hero.subhead`: `p`, `text-lg` 400 ink-soft, max 34rem. Cols sm 1–4 · md 1–5 · lg 1–5 · xl 1–5.
  - CTA group: cols sm 1–4 (margin-top 24) · md 6–8 · lg 7–10 · xl 7–9 (min 280 px). The button `hero.cta` is `<a href="mailto:agkbuilds@gmail.com?subject={encodeURIComponent(contact.mail_subject)}">`. Under it, 10 px gap, `p#cta-hint.annotate` muted = `hero.cta_hint`; the link has `aria-describedby="cta-hint"`.

| Element | Columns (sm / md / lg / xl) | Type token | Colour | Asset | Motion | States |
|---|---|---|---|---|---|---|
| label row | 1–4 / 1–6 / 1–6 / 1–6 | `annotate` | muted | | — | — |
| row rules | full-bleed | — | line | (CSS) | H2 | — |
| construction | right edge (cropped) / right / 9–12 + margin / 9–12 + margin | — | draft, muted, accent dot | `hero-construction.svg` | H3–H3e | — |
| drawing label | hidden / hidden / in `.hc` / in `.hc` | `annotate` | muted | | H3e | — |
| h1 lines | 1–4 / 1–8 / 1–12 + right margin / same | `text-hero` | ink; line 4 accent | | H4, H5, H5b (layers only) | selectable |
| dimension line | 1–4 / fit h1 / fit h1 / fit h1 | `annotate` label | draft / muted | | H6 | — |
| subhead | 1–4 / 1–5 / 1–5 / 1–5 | `text-lg` | ink-soft | | — | — |
| CTA | 1–4 full / 6–8 / 7–10 / 7–9 | `text-base` 600 | accent / accent-ink | | — | hover, focus, pressed |
| CTA hint | under CTA | `annotate` | muted | | — | — |

**Copy slots:**
- `hero.sheet_title` **24**
- `hero.headline` **4 lines: line 1 ≤ 10 · line 2 ≤ 10 · line 3 ≤ 13 · line 4 ≤ 11**; no word longer than 9 characters (punctuation included); must say "custom software" in lines 1–2. Line 4 is the "built" beat and fills in orange. Lines 1–2 are kept short so the construction circle has room beside them. Write it as a 4-item list or with `\n` between lines. The directions' "Custom / software, / drawn to fit. / Then built." (6 / 9 / 13 / 11) fits exactly. At 1280 the widest allowed line (13 × 0.86 em × 110 px = 1230 px) fits the content box plus the right margin (1232 px).
- `hero.fig_label` **28** (the dimension label, e.g. "Fig. 01 · Custom software")
- `hero.drawing_label` **16** (the leader callout; decorative, lg+ only)
- `hero.subhead` **130** (3 lines at lg in cols 1–5, ≤ 5 lines at 375)
- `hero.cta` **22**
- `hero.cta_hint` **28** (honest mailto hint, e.g. "Opens your email app")

**sm / md changes (recomposed, not stacked):**
- The headline becomes a **tower**: at 40 px only line 3 wraps (balanced, e.g. "DRAWN / TO FIT."), giving 5 rows whose rules run edge to edge. Line 2 ("SOFTWARE," 7.66 em = 306 px) sets the width.
- The construction circle moves behind the tower, **centred on the right screen edge**, half cropped; its centre line runs across rows 2–3. The leader callout is hidden.
- Nav loses the index; only `04 Contact ↓` remains on the right.
- The CTA is full width, label left, arrow right; the hint sits under it. The CTA is above the fold at 375 × 812 (bottom ≈ 560 px).
- md (768): headline 70 px, 4 lines unwrapped; subhead cols 1–5, CTA cols 6–8 bottom-aligned as at lg.

---

## `build`
**Purpose:** Say plainly what kinds of software Agkbuilds builds, as a drawing's parts list (bill of materials). Ships with **3 items**; the layout is finished at 3, 4, 5 or 6.

Desktop (1280):
```text
────────────────────────────────────────────────────────────────────────────── sheet rule
SHEET 02 / 04 · PARTS LIST
WHAT WE BUILD                                       Every business works a little
                                                    differently, so we build to fit. (intro)

NO.   PART                                         DESCRIPTION
─────────────────────────────────────────────────────────────────────────────── ink rule
(1)   DATA RECOVERY TOOLS                          One line about what this kind
                                                   of software is, ≤ 120 chars.
─────────────────────────────────────────────────────────────────────────────── line
(2)   CARD GAMES                                   One line …
───────────────────────────────────────────────────────────────────────────────
(3)   DISCORD BOTS                                 One line …
═══════════════════════════════════════════════════════════════════════════════ double rule
03 PARTS                                                              END OF LIST
```
Mobile (375):
```text
────────────────────────────────────
SHEET 02 / 04 · PARTS LIST
WHAT WE BUILD
Every business works a little
differently, so we build to fit.

────────────────────────────────────
(1)  DATA RECOVERY
     TOOLS
     One line about what this kind
     of software is.
────────────────────────────────────
(2)  CARD GAMES
     One line …
────────────────────────────────────
(3)  DISCORD BOTS
     One line …
════════════════════════════════════
03 PARTS                 END OF LIST
```

**Structure.**
- `section#build` (`aria-labelledby` its h2). Sheet header (Global) with `build.sheet_title`.
- Head row (grid, margin-top 24): `h2` = `build.title`, cols sm 1–4 · md 1–5 · lg 1–7 · xl 1–7. `p` = `build.intro`, `text-lg` ink-soft, max 30rem, cols sm 1–4 (margin-top 20) · md 5–8 · lg 8–12 · xl 8–11, `align-self: end`.
- **Column heads** (md+ only, `aria-hidden` because each row says it all): margin-top `section-xs`; grid row in `annotate` muted: `build.col_no` at col 1, `build.col_part` at col 2, `build.col_description` at col 8 (md: col 5). Under it a 1 px **ink** rule across the full width (the table's head rule) (B1).
- **The list:** `ol.parts` (`list-style: none`), each `li.part` is a grid row with `padding-block: 32px` (lg+) / 28 (md) / 24 (sm), and a 1 px `--color-line` bottom rule drawn by a `::after` (B1). Row content:
  - **Balloon** (`span.balloon`, `aria-hidden`): 40 × 40 px (32 sm), inline `assets/balloon.svg` in `--color-ink` with the numeral (1-based index, data) centred over it in mono 500 `text-sm` `tnum`, ink. Col 1, `align-self: start`, `margin-top: 0.1em` so its centre meets the name's first cap line.
  - **Name** `h3` = `build.items[].name`: display 800 caps, `text-xl` sm · `text-2xl` md+, ink. Cols md 2–4 · lg 2–7 · xl 2–7.
  - **Line** `p` = `build.items[].line`: `text-base` ink-soft, max 30rem. Cols md 5–8 · lg 8–12 · xl 8–12, `align-self: start`, `padding-top: 0.2em` (aligns its first line to the name's cap height).
  - The screen-reader order is name then line; the balloon is decorative (the `ol` provides the numbering semantics).
- **End of list:** after the last row, a **double rule** (two 1 px ink lines 3 px apart) across the full width, then a row 12 px below in `annotate` muted: left `{count, 2 digits} {build.count_label}` (e.g. "03 parts"; the count is `items.length`, data), right `build.list_end`. This closing pair is what makes three rows read as a complete bill of materials rather than a short list.
- **Counts other than 3:** nothing changes but the number of rows. With 3 rows the section is ≈ 640 px tall at 1280 and reads as one composed sheet; at 6 rows ≈ 1000 px. No row ever gets an icon, a link or a hover state (rows are not interactive).

| Element | Columns (sm / md / lg / xl) | Type token | Colour | Asset | Motion | States |
|---|---|---|---|---|---|---|
| title | 1–4 / 1–5 / 1–7 / 1–7 | `text-2xl` / `text-4xl` | ink | | — | — |
| intro | 1–4 / 5–8 / 8–12 / 8–11 | `text-lg` | ink-soft | | — | — |
| column heads | hidden / 1, 2, 5 / 1, 2, 8 / 1, 2, 8 | `annotate` | muted; ink rule | | B1 | — |
| balloon | 1 (40 px fixed col) / 1 / 1 / 1 | `text-sm` mono | ink | `balloon.svg` | B2 | — |
| item name | 2–4 / 2–4 / 2–7 / 2–7 | `text-xl` / `text-2xl` | ink | | — | — |
| item line | 2–4 / 5–8 / 8–12 / 8–12 | `text-base` | ink-soft | | — | — |
| end rule + count | 1–4 / 1–8 / 1–12 / 1–12 | `annotate` | ink rules, muted text | | B3 | — |

**Copy slots:**
- `build.sheet_title` **24**
- `build.title` **14 × 2**
- `build.intro` **150** (general wording, no claims)
- `build.col_no` **4** · `build.col_part` **12** · `build.col_description` **14**
- `build.items[]`: exactly the 3 supplied kinds, in this order: data recovery tools, card games, Discord bots (decisions #9). `.name` **32** (2 lines max at every size; "Data recovery tools" = 19 is one line at md+ and two at 375) · `.line` **120** (says only what that kind of software is; no features, formats, rates or users).
- `build.count_label` **8** (e.g. "parts") · `build.list_end` **16** (e.g. "End of list")

**sm changes:** the row grid becomes `grid-template-columns: 32px 1fr; column-gap: 16px`; name and line stack in column 2 (line margin-top 8 px). The column heads are hidden; the intro moves under the title. The double rule and count row stay. Rules still run the full 343 px.

---

## `process`
**Purpose:** Show a non-technical buyer what working together looks like, as four passes over one drawing. Generic, no times, prices or promises.

Desktop (1280), step 2 active:
```text
────────────────────────────────────────────────────────────────────────────── sheet rule
SHEET 03 / 04 · METHOD
HOW WE WORK                         ┌──────────────────────── sticky plate ──┐
intro sentence (≤ 140)              │ ├───────────────────────────────────┤  │
                                    │ ┌──────────────┬────────┐            │  │
[01] STEP · LISTEN FIRST  (muted)   │ │   (layers 1–2 drawn)  │   ( )      │  │
     body …                         │ └──────────────┴────────┘            │  │
                                    │                                      │  │
[02] STEP · DRAW THE PLAN  ← active │ FIG. 03 · ONE DRAWING, FOUR PASSES   │  │
     body … (accent number box)     │ ▰▰▱▱  02 / 04                        │  │
                                    └──────────────────────────────────────┘
[03] STEP · BUILD IT
     body …
[04] STEP · HAND IT OVER
     body …
```
Mobile (375):
```text
────────────────────────────────────
SHEET 03 / 04 · METHOD
HOW WE WORK
intro sentence

┌────────┐ 01 · STEP
│ plate  │ LISTEN FIRST
│ step 1 │ body text, up to six
└────────┘ lines at 16px …
┌────────┐ 02 · STEP
│ step 2 │ DRAW THE PLAN
└────────┘ body …
 (… 03, 04; thumbnail 04 shows the solid plate)
```

**Structure.**
- `section#process[data-step]` (`aria-labelledby` its h2). Sheet header with `process.sheet_title`. Grid below, margin-top 24.
- **Left column** (cols sm 1–4 · md 1–8 · lg 1–5 · xl 1–5): `h2` = `process.title`, then `p` = `process.intro` (`text-lg` ink-soft, margin-top 20, max 30rem), then `ol.steps` margin-top `section-xs`.
  - Each `li.step` (lg+: `min-height: 56svh`, last one `min-height: auto`; padding-top 8 px; a 1 px `--color-line` rule on top):
    - **Step label** (`annotate`): a 28 × 20 px number box (`01`…`04`, data, 1 px ink border, centred) + 10 px + `process.step_label` (e.g. "Step"). Active (P4): box fills accent, numeral accent-ink, and the box gets `aria-hidden` (state is conveyed by `aria-current="step"` on the `li`).
    - `h3` = `process.steps[].title`: display caps `text-xl`, ink (inactive steps: ink-soft at lg+ while another step is active; all ink without JS or under sm).
    - `p` = `process.steps[].body`: `text-base` ink-soft, max 30rem, margin-top 12.
- **Right column, lg+ only** (cols 7–12; md/sm hidden): `figure.plate`, `position: sticky; top: max(32px, calc(50svh - 260px)); align-self: start`.
  - Inline `assets/process-plate.svg` (width 100 %, aspect 4 : 3), `aria-hidden`. The figure's layers follow `data-step` on the section (`[data-step="2"] #pl-2 { … drawn }`, cumulative; motion P1–P3). Without JS, all four layers are shown and `#pl-1, #pl-2` are at 0.45.
  - `figcaption` (margin-top 16, flex, `justify-content: space-between`): left `process.figure_caption` (`annotate` muted); right the **segmented bar**: 4 segments 24 × 4 px, gap 4, `--color-line`; segments ≤ active are `--color-accent`; then `0n / 04` (`annotate`, data). The bar is `aria-hidden`.
- **IntersectionObserver** (the one client island): observe the 4 `li.step`, `rootMargin: "-35% 0px -35% 0px"`, `threshold: 0`; the last intersecting step sets `section.dataset.step = n` and `aria-current="step"`. Default `data-step="1"` once JS runs.

| Element | Columns (sm / md / lg / xl) | Type token | Colour | Asset | Motion | States |
|---|---|---|---|---|---|---|
| title + intro | 1–4 / 1–6 / 1–5 / 1–5 | `text-2xl`/`text-4xl`; `text-lg` | ink; ink-soft | | — | — |
| step label | in step | `annotate` | ink box; accent when active | | P4 | active |
| step title | in step | `text-xl` | ink / ink-soft | | P4 | active |
| step body | in step | `text-base` | ink-soft | | — | — |
| plate | hidden / hidden / 7–12 sticky / 7–12 sticky | — | draft, ink, accent disc | `process-plate.svg` | P1–P3 | — |
| caption + bar | under plate | `annotate` | muted; accent segments | | P4 | — |
| step thumbnail | 112 px col / 160 px col / hidden / hidden | — | (embedded) | `process-step-n.svg` | — | — |

**Copy slots:**
- `process.sheet_title` **24**
- `process.title` **14 × 2**
- `process.intro` **140**
- `process.step_label` **6**
- `process.steps[]`: exactly **4**, in order (they map to the plate's four layers: measure → plan → build → solid). `.title` **20 × 2** (display caps; usually one line at lg) · `.body` **180** (1–2 sentences; no timeframes, prices, guarantees or numbers)
- `process.figure_caption` **36**

**sm / md changes (recomposed):** no sticky plate. Each step becomes a grid `112px 1fr` (md: `160px 1fr`), gap 16 (md 24): left an `<img src="/drawings/process-step-n.svg" alt="" width="640" height="480" loading="lazy" decoding="async">` (decorative; its own light/dark colours are embedded), with a 1 px `--color-line` border; right the step label, title and body. Steps are separated by `section-xs / 2` and a hairline. No active state, no observer below lg (the thumbnails *are* the progression, 1 → 4).

---

## `contact`
**Purpose:** Repeat the primary action and make it effortless: email (button + printed address with copy) and phone, with equal weight, and the name of the person who answers.

Desktop (1280):
```text
────────────────────────────────────────────────────────────────────────────── sheet rule
SHEET 04 / 04 · TITLE BLOCK


LET'S DRAW
YOURS.                                ┌──────────────────────────────────────┐
                                      │ [ Start a conversation            → ]│
One supporting sentence about         ├───────────────────┬──────────────────┤
starting a conversation.              │ EMAIL             │ PHONE            │
                                      │ agkbuilds@gmail.com│ 254-231-1149    │
                                      │ [COPY]            │ [COPY]           │
                                      ├────────────┬──────┴─────┬────────────┤
                                      │ CONTACT    │ DRAWN BY   │ SHEET      │
                                      │ Dylan Borgen│ Agkbuilds │ 04 / 04    │
                                      └────────────┴────────────┴────────────┘
```
Mobile (375):
```text
────────────────────────────────────
SHEET 04 / 04 · TITLE BLOCK

LET'S DRAW
YOURS.
One supporting sentence about
starting a conversation.
┌──────────────────────────────────┐
│[ Start a conversation          → ]│
├──────────────────────────────────┤
│ EMAIL                            │
│ agkbuilds@gmail.com      [COPY]  │
├──────────────────────────────────┤
│ PHONE                            │
│ 254-231-1149             [COPY]  │
├───────────┬───────────┬──────────┤
│ CONTACT   │ DRAWN BY  │ SHEET    │
│ Dylan     │ Agkbuilds │ 04 / 04  │
│ Borgen    │           │          │
└───────────┴───────────┴──────────┘
```

**Structure.**
- `section#contact` (`aria-labelledby` its h2), padding-top `section-lg`. Sheet header with `contact.sheet_title`, then the grid (margin-top `section-xs`), `align-items: end`.
- **Left** (cols sm 1–4 · md 1–8 · lg 1–6 · xl 1–6): `h2` = `contact.headline`, display caps `text-3xl` sm · `text-5xl` md+, ink, line spans. `p` = `contact.body`, `text-lg` ink-soft, margin-top 24, max 28rem.
- **Title block** (`div.title-block`, cols sm 1–4 (margin-top 40) · md 1–8 (margin-top 48) · lg 7–12 · xl 7–12; `align-self: end`): background `--color-surface`, 1 px **ink** outer frame, inner cell rules 1 px `--color-line`. CSS grid, 6 tracks (lg) so the rows can split 1 / 2 / 3:
  1. **CTA cell** (full width, padding 12): the primary button `contact.cta`, full width of the cell, `href="mailto:agkbuilds@gmail.com?subject=…"` (same as the hero). Motion C2: it draws as a 1 px accent outline with ink label, then fills.
  2. **Email cell** (half; full width at sm) and **Phone cell** (half; full at sm), each padding 16 px (20 lg), equal height, identical structure (this is what makes them equal):
     - label `annotate` muted: `contact.email_label` / `contact.phone_label`;
     - value, margin-top 6, mono 500 `text-base`, ink, `font-variant-ligatures: none`:
       - email: `span#email-value` with `contact.email` as plain selectable text (normal selection; no `user-select: all`);
       - phone: `a#phone-value href="tel:+12542311149"` with `contact.phone` as its text, ink, 1 px underline at offset 4 (hover 2 px, focus ring). Selectable like any text.
     - copy button, margin-top 12 (sm: on the value's line, right-aligned; `display: flex; justify-content: space-between; align-items: center`): `button.copy` height 32 px with a 44 × 44 hit area (`::before` inset −6 px), padding-x 12, 1 px `--color-line` border, background transparent, label `annotate` ink = `contact.copy`; `aria-label` = `contact.copy_email_aria` / `contact.copy_phone_aria`; `aria-describedby` → the value's id.
  3. **Meta row**: three cells (each 2 of 6 tracks; at sm three equal columns), padding 12 / 16: `contact.person_label` / `contact.person` · `contact.drawn_by_label` / `contact.drawn_by` · `microcopy.sheet` / `04 / 04` (data). Labels `annotate` muted; values `text-base` 600 ink (sheet value in mono `tnum`).
- **Copy behaviour** (client island, shared by both buttons):
  - Idle: label `contact.copy`.
  - Click → `navigator.clipboard.writeText(value)`. Success: label becomes `contact.copied` in accent; a polite live region (`div[aria-live="polite"].sr-only`, one per section) announces `contact.copied_email_announce` or `contact.copied_phone_announce`; after 2400 ms back to idle.
  - Failure (no clipboard API, permission denied, insecure context): select the value's text (`Range` + `Selection`) so ⌘C / Ctrl+C works, and show `contact.copy_failed` as a single `annotate` ink line under the value for 4000 ms (also announced in the live region). The button label stays `contact.copy`.
  - Hover: background `--color-surface-2`, border ink. Pressed: `translateY(1px)`. Focus: ring. Disabled: never.
  - **Without JS** the copy buttons are not rendered (render them from the client island only, or with `hidden` removed on mount), and the cells still show the values; the layout doesn't shift because the value row reserves no space for the button at sm and the button row at md+ is added below the value.

| Element | Columns (sm / md / lg / xl) | Type token | Colour | Asset | Motion | States |
|---|---|---|---|---|---|---|
| headline | 1–4 / 1–8 / 1–6 / 1–6 | `text-3xl` / `text-5xl` | ink | | — | — |
| body | 1–4 / 1–6 / 1–5 / 1–5 | `text-lg` | ink-soft | | — | — |
| title block | 1–4 / 1–8 / 7–12 / 7–12 | mixed | surface; ink frame; line cells | | C1 | — |
| CTA | full cell | `text-base` 600 | accent / accent-ink | | C2 | hover, focus, pressed |
| email value | half cell / full at sm | `text-base` mono | ink | | — | selectable |
| phone link | half cell / full at sm | `text-base` mono | ink | | — | hover, focus, pressed |
| copy buttons | in cell | `annotate` | ink; "Copied" accent | | U3 | idle, hover, focus, pressed, copied, failed |
| meta cells | 3 equal | `annotate` + `text-base` 600 | muted / ink | | — | — |

**Copy slots:**
- `contact.sheet_title` **24**
- `contact.headline` **10 × 3** (display caps; 10 × 0.86 em × 33 px = 284 px fits 375)
- `contact.body` **140**
- `contact.cta` **22** (same words as `hero.cta`)
- `contact.mail_subject` **60** (the subject line in both mailto links; not shown on the page)
- `contact.email_label` **10** · `contact.email` **32** (the fact: agkbuilds@gmail.com, 19)
- `contact.phone_label` **10** · `contact.phone` **16** (the fact: 254-231-1149, 12; href fixed as `tel:+12542311149`)
- `contact.copy` **8** · `contact.copied` **8** · `contact.copy_failed` **40** · `contact.copy_email_aria` **32** · `contact.copy_phone_aria` **32** · `contact.copied_email_announce` **40** · `contact.copied_phone_announce` **40**
- `contact.person_label` **10** · `contact.person` **24** (the fact: Dylan Borgen; no title)
- `contact.drawn_by_label` **10** · `contact.drawn_by` **16** (e.g. "Agkbuilds")

**sm changes:** the headline and body come first, then the title block full width. Email and phone become two full-width rows (value left, copy right), so neither is "the second column". The meta row stays three cells (the name wraps to 2 lines if needed). The CTA is 56 px tall. md: title block spans the full 8 columns under the text, email and phone side by side.

---

## `footer`
**Purpose:** Close the sheet: who, how to reach them, back to the top. Nothing invented.

Desktop (1280):
```text
───────────────────────────────────────────────────────────────────────────────
AGK                 Custom software, built for     Dylan Borgen          © 2026 Agkbuilds
├──BUILDS──┤        your business.                 agkbuilds@gmail.com   Back to top ↑
                                                   254-231-1149
```
Mobile (375):
```text
────────────────────────────────────
AGK                    Back to top ↑
├BUILDS┤
Custom software, built for your
business.
Dylan Borgen
agkbuilds@gmail.com
254-231-1149
© 2026 Agkbuilds
```

**Structure.** `footer` (outside `main`), 1 px `--color-line` top rule across the content width, padding 40 / 32 px, grid:
- Wordmark (cols sm 1–2 · md 1–3 · lg 1–3): "AGK" display 800 `text-3xl` (sm) / `text-5xl` (md+) + the dimension bracket with "builds" (`text-xs` mono). A link to `#top` with `microcopy.wordmark_label`.
- `footer.tagline` (cols sm 1–4 · md 4–8 · lg 4–7): `text-sm` ink-soft, max 22rem.
- Contact lines (cols sm 1–4 · md 1–4 (row 2) · lg 8–10): `footer.person` (`text-sm` 600 ink), then the email as a `mailto:` link and the phone as a `tel:+12542311149` link, both mono `text-sm` ink, underline on hover. The visible text of these two links is `contact.email` and `contact.phone` (same facts, not new slots).
- End (cols sm 3–4 row 1 for back-to-top / sm 1–4 last row for © · lg 11–12, right-aligned): `© {year} {footer.copyright}` (`annotate` muted; year computed at build) and `footer.back_to_top` → `#top` (`annotate` ink, `↑` in mono, hover underline, 44 px hit area).

**Copy slots:** `footer.tagline` **56** · `footer.person` **24** (Dylan Borgen) · `footer.copyright` **24** (e.g. "Agkbuilds") · `footer.back_to_top` **16**.

**sm changes:** wordmark and back-to-top share the first row (left/right), then tagline, contact lines and © stack in cols 1–4.

---

## Metadata and assets wiring (Builder)
- `src/app/icon.svg` ← `assets/icon.svg` (graphite tile, paper "A", orange dimension bracket; works on light and dark tabs).
- Open Graph 1200 × 630: `src/app/opengraph-image.tsx` with `export const dynamic = "force-static"` (static export), composition per `assets/og-sketch.svg` and `assets/README.md`. Fonts for `next/og`: fetch **TTF** static instances (Satori can't read woff2) of `Archivo:wdth,wght@125,800` and `JetBrains Mono:wght@500` at build time, or commit them under `src/app/og/`. No absolute URL in metadata (decisions #13): `metadataBase` comes from `NEXT_PUBLIC_SITE_URL` with a local fallback.
- `/public/drawings/process-step-{1..4}.svg` ← `assets/process-step-{1..4}.svg` (served as files for the mobile `<img>`s).
- Inline as components (server components, read at build time): `hero-construction.svg`, `process-plate.svg`, `balloon.svg`.
- **Weight budget:** fonts ≈ 45 KB, inline SVG ≈ 9 KB (+0.3 KB per balloon), thumbnails 13.7 KB lazy on mobile only, JS island < 2 KB. No images above the fold other than inline SVG.
