# Directions: Agkbuilds

Brief: `../brief.md` · References: `../research/references.md` · Decisions: `../decisions.md`

Ground rules shared by all three directions:
- **Nothing invented.** No clients, results, numbers, team, location or services. The "What we build" list is **pending**, and every direction's design for it works for **any count from 3 to 6 items**, using only a name (≤ 32 chars) and one line (≤ 120 chars) per item.
- **Contact is pending.** The primary button is labelled **"Start a conversation"** so it fits both a `mailto:` link and a booking link. When it's an email, the address is also printed as selectable text beside the button.
- **Dark is the home look; light is designed too.** Each direction gives both. Every visual is SVG, CSS or a small script: no video, no 3D, no stock photos.

---

## Direction A · Working Drawing

**Concept:** Every build starts as a drawing. The page is an engineering sheet that turns into the real thing: lines first, then solid.

| Axis | Choice |
|---|---|
| Mood words | precise, drafted, confident, technical, calm |
| Type | Display: **Archivo** (variable, set at width 125 / weight 800, uppercase) gives a wide, engineered, heavy voice. Text: **Archivo** at width 100 / weight 400 for body. Mono: **JetBrains Mono** 500 for annotations ("FIG. 01", "SHEET 2/4", row codes). One family across two widths keeps it tightly engineered, and the mono is the "drafting hand". |
| Color | Dark (home): **graphite** `oklch(0.19 0.012 250)` background · **paper** `oklch(0.95 0.006 90)` ink · **pencil** `oklch(0.68 0.015 250)` muted text · **guide** `oklch(0.34 0.02 250)` hairlines and the grid · **signal orange** `oklch(0.72 0.18 45)` accent. Light: background becomes **drafting film** `oklch(0.96 0.008 90)`, ink becomes graphite, and the orange deepens to `oklch(0.58 0.19 42)` for contrast. The orange appears in only three places: the CTA, the "built" fill moment, and the active step. |
| Grid | 12 columns, 24px gutter, 1280 max width. The column guides are **visible** as faint hairlines behind the page, like the grid on a drawing sheet. Annotations sit in the gutters and margins. Planned breaks: the hero headline runs past column 12 into the margin, and the contact block is a "title block" pinned to the bottom-right corner of the sheet (columns 7–12). |
| Imagery | Hand-authored SVG technical linework only: construction circles, centre lines, dimension arrows, leader lines with hard 90° elbows, and mono callouts. All of it uses one 1px stroke in `currentColor`. No photos or icons. |
| Motion personality | Drafted, not animated: lines draw on at an even pen speed (stroke-dashoffset, linear-to-ease-out), then surfaces fill in one decisive move. Nothing bounces. |
| Signature moment | **Plan → built headline (hero, on load).** The construction geometry draws itself (guides, two circles, a dimension line spanning the headline) and the headline appears first as **outlined letters**, then fills solid in paper white from left to right. The wordmark's dimension line ends with the label "built". It shows "we plan it, then build it" in under two seconds, without words. Reduced motion shows the finished solid state with the drawing lines still. |
| Hero composition | Top: the wordmark at left and "Start a conversation" at right, with a mono "SHEET 1/4" label. The headline is huge and wide in 3 lines, left-aligned from column 1 and bleeding past column 12. A dimension line sits under it with a callout "FIG. 01: CUSTOM SOFTWARE". The subline (columns 1–6) and the CTA sit below. Construction circles live in columns 9–12. |
| Wordmark | **AGK** in Archivo Expanded Black, with a drafting dimension line under it, `├── builds ──┤`, in mono. The logo *is* a measured part. Favicon: "A" in a dimension bracket. |
| Section idea | **What we build = a parts list** (the "bill of materials" table on a drawing). Numbered rows 01–0n with a mono item code, the name in display caps and the line in text. It's a table, so 3 or 6 rows both look intentional. **How we work = drawing sheets**: each step is "SHEET n/N", and a scroll-linked drawing gains detail with every step until the last step shows it solid. **Contact = the title block** in the corner of the sheet ("DRAWN FOR: you · NEXT STEP: Start a conversation"). |
| Borrowed techniques | Grilli Type (construction geometry and mono labels inside the drawing, layered over display type) · Oxide ("FIG." callouts and elbowed leader lines as a precision signal) · Locomotive (text resolving in stages, recast as outline → solid instead of scramble) · Work & Co (the content column offset from the logo column) |
| Risk | *Blueprint cliché:* avoided by using no blue and no white-on-blue; graphite plus orange reads "engineering", not "blueprint". *Busy linework:* capped at one drawing per viewport, 1px strokes at low contrast. *Outline text legibility:* the outline state lasts ≤ 600ms and the text is real HTML (the SVG is decorative and `aria-hidden`). *Perf:* pure SVG and CSS, about 6 KB. |

**Preview**
```text
┌────────────────────────────────────────────────────┐
│ AGK               SHEET 1/4  [Start a conversation]│
│ ├─builds─┤                                         │
│ ┊     ┊     ┊     ┊     ┊     ┊     ┊     ┊     ┊  │
│ CUSTOM SOFTWARE,                   ╭───╮ FIG. 01   │
│ DRAWN TO FIT.                      │ + │──┐        │
│ THEN BUILT.                        ╰───╯  │        │
│ ├────────────── FIG. 01 ──────────────┤   │        │
│ We plan and build software around the  <- outline  │
│ way your business works.  [Start a conversation →] │
├────────────────────────────────────────────────────┤
│ PARTS LIST · WHAT WE BUILD                         │
│ 01  ITEM NAME ·········· one line about it         │
│ 02  ITEM NAME ·········· one line about it         │
│ 0n  (3 to 6 rows, list still to come)              │
└────────────────────────────────────────────────────┘
graphite oklch(0.19 0.012 250)
paper oklch(0.95 0.006 90)  pencil oklch(0.68 0.015 250)
guide oklch(0.34 0.02 250)  orange oklch(0.72 0.18 45)
Type: Archivo Expanded / Archivo + JetBrains Mono
Signature: the headline is drawn as outlines on a
grid, then fills in solid: the plan becomes built.
```

---

## Direction B · Load-Bearing

**Concept:** Software you can put weight on. The page is built like a structure: heavy slabs of type stacked floor by floor, and nothing floats.

| Axis | Choice |
|---|---|
| Mood words | heavy, upright, loud, solid, unshakeable |
| Type | Display: **Big Shoulders Display** at weight 900, uppercase, very condensed. It was drawn for Chicago's civic signage, so it has industrial weight with real dignity, and each line can be fitted to the full width like a structural beam. Text: **Instrument Sans** at 400/600, a clear and slightly narrow grotesk that keeps body copy calm and readable beside the shouting display. No mono. |
| Color | Dark (home): **night concrete** `oklch(0.17 0.006 80)` background · **chalk** `oklch(0.94 0.01 90)` ink · **cured concrete** `oklch(0.24 0.008 80)` slab surface · **form-work** `oklch(0.66 0.01 80)` muted text · **ultramarine** `oklch(0.50 0.22 264)` accent, used as *whole slabs of colour* with chalk text on them (the contact floor, the CTA), never as thin glowing lines. Light: **poured concrete** `oklch(0.91 0.006 80)` background, near-black **rebar** `oklch(0.2 0.01 80)` ink, and the same ultramarine. |
| Grid | 6 heavy columns with **no gutter at slab level**: slabs butt together, separated by 2px seams of background colour. Inside a slab, text sits on a 12-column subgrid with a 20px gutter. Planned break: the hero headline ignores the subgrid, and **every line is scaled to fill the full container width** (each "beam" is exactly as wide as the building). |
| Imagery | Type and flat colour only: no illustration, icons or photos. The "imagery" is mass: slabs, seams, and the stacked wordmark. |
| Motion personality | Gravity. Things arrive from above and **settle** with a short, heavy spring (a tiny 2px compression and no bounce-back wobble), the way a beam is lowered onto a column. Once placed, nothing moves again. |
| Signature moment | **The stack (What we build, scroll-linked).** Each item is a full-width floor slab. As you scroll, floors are lowered into place one by one on top of the previous one, each landing with a weighty settle. The floors are numbered **from the ground up** (01 at the bottom), so the list reads like a building. With 3 items it's a low building, with 6 a tower, and both look finished. The section header reads "FLOORS 01–0n". Reduced motion shows the finished stack. |
| Hero composition | The wordmark (a 2-storey block, below) sits top-left with a solid ultramarine "START A CONVERSATION" slab top-right. The headline is 3 fitted beams, "SOFTWARE / YOUR BUSINESS / CAN STAND ON.", each a separate slab line filling the width, with 2px seams between them. A short subline and the CTA sit in the lowest beam's right half. It's dense on purpose: the hero is a wall. |
| Wordmark | **AGK** stacked on **BUILDS** in Big Shoulders 900, with both lines optically fitted to the same width so the logo is a solid two-floor block. Favicon: the same block cropped to "AGK". |
| Section idea | **What we build = floors** (as above). **How we work = a section cut**: steps are columns of the building, left to right, each with a big condensed numeral and 2 lines of text, and on mobile they become floors. **Contact = the ground floor**: a full-bleed ultramarine slab, "LET'S BUILD ON IT.", with the button and the email in chalk. |
| Borrowed techniques | Swissted (wordmark and headline fitted edge to edge, so the type is the hero) · Standards Manual (display-size elements spread across the full width, one saturated accent used as a block) · Metalab (one phrase per line, each line its own structural unit) |
| Risk | *Shouting:* all caps at 900 weight can feel aggressive to a cautious buyer. Mitigation: body copy stays in calm sentence-case Instrument Sans, and there's generous breathing room between sections. *Fitted text:* needs JS or SVG `textLength` to fit lines; use CSS `font-size` in container units (`cqi`) per line with a measured factor, so there's no layout shift. *Construction-site cliché:* no hi-vis yellow, no hazard stripes, no cranes. |

**Preview**
```text
┌────────────────────────────────────────────────────┐
│ AGK                          ██████████████████████│
│ BUILDS                       █ START A CONVERSATION│
├════════════════════════════════════════════════════┤
│ SOFTWARE                                           │
├════════════════════════════════════════════════════┤
│ YOUR BUSINESS                                      │
├════════════════════════════════════════════════════┤
│ CAN STAND ON.        Custom software, built to     │
│                      carry real, everyday work.    │
├════════════════════════════════════════════════════┤
│ WHAT WE BUILD · FLOORS 01–0n                       │
│ ▓ 0n  ITEM NAME ······ (3 to 6 floors, to come)  ▓ │
│ ▓ 01  ITEM NAME ······ one line about it         ▓ │
└────────────────────────────────────────────────────┘
night concrete oklch(0.17 0.006 80)
chalk oklch(0.94 0.01 90)  slab oklch(0.24 0.008 80)
form-work oklch(0.66 0.01 80)
ultramarine oklch(0.50 0.22 264)
Type: Big Shoulders Display / Instrument Sans
Signature: each thing we build lands as a floor and
the stack rises as you scroll.
```

---

## Direction C · Made to Order

**Concept:** Software began on a loom. In 1804 Jacquard's loom read its patterns from punched cards, one card per row of cloth. Agkbuilds still makes software the same way: to order, to your pattern.

| Axis | Choice |
|---|---|
| Mood words | crafted, exact, rhythmic, warm, inventive |
| Type | Display: **Gloock**, a high-contrast, sharp-cut serif with heavy thick strokes. It reads bold and modern at large sizes and has a "made by hand, cut by machine" edge. Text: **Geist** 400/500, clean and contemporary. Mono: **Geist Mono** 400 for the punched-card row labels. The serif gives the human craft and the weave supplies the futurism. |
| Color | Dark (home): **loom black** `oklch(0.17 0.012 60)` background · **raw silk** `oklch(0.92 0.025 85)` ink and threads · **undyed** `oklch(0.66 0.02 80)` muted text · **heddle** `oklch(0.30 0.015 70)` lowered threads and lines · **saffron thread** `oklch(0.80 0.14 80)` accent, a single gold weft that runs through the page (the CTA and the woven "AGK" highlight). Light: **raw linen** `oklch(0.95 0.015 85)` background, **loom black** ink, and saffron darkened to `oklch(0.55 0.13 70)` for text use. |
| Grid | 8 columns, 32px gutter, plus a fixed narrow **selvedge column** (the woven edge of cloth) on the left: a 72px rail that holds the mono row counter for each section ("ROW 001"). Content sits in columns 2–8 and never centres. Planned break: the hero cloth runs full-bleed across the selvedge and both margins. |
| Imagery | **Generative woven SVG.** A plain-weave grid of warp (vertical) and weft (horizontal) threads, drawn as tiny rectangles. Where the punched-card pattern says "lift", the thread crosses over, and that's how letters and patterns appear in the cloth. Each "What we build" item gets its **own swatch whose pattern is generated from its name** (the name is hashed into a punched-card pattern), so whatever list the user sends, every item has a unique, deterministic piece of cloth and nothing needs to be drawn by hand. |
| Motion personality | Rhythmic and mechanical, like a shuttle: things build **row by row**, top to bottom, at an even beat (about 18ms per row). There's one beat per interaction, with no easing flourishes. |
| Signature moment | **The weaving hero (on load).** A full-width band of cloth weaves itself row by row in about 1.2s, and as the rows accumulate the letters **AGK** emerge in raw silk with a single saffron thread running through them. It's the actual mechanism of a Jacquard loom (one row of holes per row of cloth) turned into the logo reveal, so software's origin is shown, not told. It's a canvas or SVG drawn once with no loop. Reduced motion shows the finished cloth. |
| Hero composition | The selvedge rail on the left holds "ROW 001". The woven band takes the top 45% of the fold, full-bleed. Below it, the headline "Software, made to order." in Gloock, very large, columns 2–7. The subline tells the loom story in one sentence. "Start a conversation" sits on a saffron button aligned to column 2. |
| Wordmark | **agk** in Gloock lowercase, with **builds** in Geist Mono beside it, joined by a short woven 3×3 bitmap mark (a punched-card "knot"). Favicon: the 3×3 woven knot. |
| Section idea | **What we build = swatch book**: one woven swatch per item in a 2- or 3-column grid (3 items = 3 across, 4 = 2×2, 5 = 3+2 with a wider first swatch, 6 = 3×2), each with its name and a line. **How we work = the card chain**: steps are punched cards laced together in sequence. Each card shows its step number as holes (a readable mono numeral sits next to it). **Contact = "Bring your pattern."** A cloth strip with a saffron thread leads to the button. |
| Borrowed techniques | Jacquard machine (the real mechanism: punched-card rows and row-by-row building, and "produced to order") · Nothing (bitmap unit grid shared by logo, icons and texture) · Metalab (the headline stepping across the grid, never centred) · Teenage Engineering (drawings and type share one stroke and unit system) |
| Risk | *Craft over future:* a serif and a loom could read "artisanal" rather than "futuristic". Mitigation: crisp pixel-exact weave, dark home look, and a sharp modern serif, never a bookish one. *Story needs one line of explanation:* the Jacquard sentence must be in the hero subline. *Perf:* a 1440-wide weave is about 6,000 cells. Draw it on one `<canvas>` (or a pre-rendered SVG `<pattern>` plus a mask for the letters) and keep the script under 3 KB. *Historical accuracy:* only state the documented facts (Jacquard, 1804, punched cards controlled the pattern). |

**Preview**
```text
┌────────────────────────────────────────────────────┐
│ agk▦builds                    Start a conversation │
├────────────────────────────────────────────────────┤
│░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒│
│░▒░███▒░▒░████▒░▒█▒░█▒░▒░▒░▒ woven row by row ░▒░▒░▒│
│░▒█▒░▒█▒░█▒░▒░▒░▒██▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒│
│▓▓█████▓▓█▓▓██▓▓▓█▓█▓▓▓ saffron thread ▓▓▓▓▓▓▓▓▓▓▓▓▓│
│░▒█▒░▒█▒░▒████▒░▒█▒░█▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒░▒│
├────────────────────────────────────────────────────┤
│ROW │ Software,                                     │
│001 │ made to order.                                │
│    │ In 1804 a loom read its patterns from punched │
│    │ cards. We still make software to order.       │
│    │ [ Start a conversation ]                      │
└────────────────────────────────────────────────────┘
loom black oklch(0.17 0.012 60)
raw silk oklch(0.92 0.025 85)
undyed oklch(0.66 0.02 80)  heddle oklch(0.30 0.015 70)
saffron thread oklch(0.80 0.14 80)
Type: Gloock / Geist + Geist Mono
Signature: the hero cloth weaves itself row by row
and "AGK" appears in the weave.
```

---

## Divergence check

| Axis | A · Working Drawing | B · Load-Bearing | C · Made to Order |
|---|---|---|---|
| Type | Wide grotesk (Archivo Expanded) + mono annotations | Ultra-condensed uppercase (Big Shoulders) + calm sans | High-contrast serif (Gloock) + sans + mono |
| Color | Cool graphite, paper ink, signal orange as small marks | Warm concrete, chalk, ultramarine as whole slabs | Warm loom black, raw silk, one saffron thread |
| Grid | 12 col with visible guides; annotations in gutters | 6 gutterless slab columns; lines fitted to full width | 8 col + fixed left "selvedge" rail; asymmetric |
| Motion | Pen-speed line drawing, then a decisive fill | Gravity: drop and heavy settle, scroll-linked stack | Mechanical row-by-row weaving at an even beat |
| Imagery | SVG technical linework (circles, dimensions, leaders) | None: type mass and flat colour only | Generative woven SVG/canvas, a swatch per item |

All pairs differ on all 5 axes (A–B 5/5, A–C 5/5, B–C 5/5).

---

## Shared section outline

The section set follows decisions #5 (hero, what we build, how we work, contact, footer). The nav is a slim bar inside `hero`: wordmark + "Start a conversation" (an anchor to `#contact`, so it's one click from the hero).

| # | ID | Purpose | Content needs | Brief must-have |
|---|---|---|---|---|
| 1 | `hero` | Say in under 5 seconds that Agkbuilds builds custom software for businesses, and offer the primary action | headline (states "custom software" plainly), subline (1–2 sentences, plus the loom sentence if C), primary CTA "Start a conversation", signature visual (decorative, `aria-hidden`), wordmark | What Agkbuilds is (stated plainly); contact action in ≤ 1 click |
| 2 | `build` | Show the kinds of software Agkbuilds makes | section title, a one-sentence intro on why custom (general wording, no claims), **list of 3–6 items: name ≤ 32 chars + one line ≤ 120 chars each, PENDING from user**. The layout must look finished at 3, 4, 5 and 6 items. No icons. | "What we build" |
| 3 | `process` | Reassure a non-technical buyer about what working together looks like | section title, 4 steps (title ≤ 20 chars + 1–2 sentences each), generic: e.g. understand → plan → build → hand over. **No timeframes, prices, guarantees or numbers.** | Short generic "how we work"; "dependable" |
| 4 | `contact` | Repeat the primary action and make it effortless | headline, one supporting sentence, the CTA "Start a conversation" (**PENDING: `mailto:` or booking URL**). If email: the address shown as selectable text with a copy button (copied/failed states). If booking: the button opens the booking link in a new tab with an "opens in new tab" hint. | Contact action (primary action near the end) |
| 5 | `footer` | Close the page cleanly | wordmark, a one-line description ("Custom software, built for your business."), contact link repeated, © year (computed at build), back-to-top link. **No social links, address or legal entity unless the user supplies them.** | Facts policy (nothing invented) |

**Blocking for copy and build (from decisions #6):** the list of what Agkbuilds builds, and the contact method. Design doesn't depend on either, since every direction handles 3–6 items and either contact type.

---

## Recommendation

**Direction A · Working Drawing.** It hits all three adjectives at once: the scale of the wide type is bold, the drawn-then-built reveal feels futuristic, and the engineering-sheet discipline signals "dependable" to a non-technical owner without a single claim. It's also the lightest to build and the most forgiving of the pending content (a parts list reads right at any length), while B is the boldest but riskiest in tone and C is the most original story but leans craft over future.
