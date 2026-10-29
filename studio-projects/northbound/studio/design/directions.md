# Directions: Northbound Coffee Roasters

Brief: `../brief.md` · References: `../research/references.md`

> **Demo data used in all three directions (Director: please log in `decisions.md`).** Current batch **#214, Guji, Ethiopia, washed**, roasted **Tue 27 Oct 2026**.
> - **Curve events:** Charge 0:00 · Turning point 1:05 / 88 °C · Dry end 4:30 / 152 °C · First crack 8:50 / 196 °C · Drop 10:40 / 207 °C.
> - **Phases:** drying 4:30 (42%) · Maillard 4:20 (41%) · development 1:50 (17%, the development time ratio, "DTR").
> - **Schedule:** we roast on Tuesday and ship within 24 h.
> - **Direction C only:** the roastery sits at **46.5°N** (proposed: Marquette, Michigan, on Lake Superior). Origin latitudes: Guji 5.9°N · Huila 2.0°N · Nyeri 0.4°S.

---

## Direction A · Contour

**Concept:** Every roast is a climb. Northbound reads temperature over time the way a hiker reads an elevation profile, and draws each batch's real data as terrain, so every bag comes with its map.

| Axis | Choice |
|---|---|
| Mood words | surveyed, airy, exploratory, exact, quiet |
| Type | **Display:** Archivo (variable): headlines at wdth 115–125, wght 300–400. Wide, calm letterforms, like the title of a survey sheet. **Text:** Archivo at wdth 100, wght 400. Map lettering uses the same family: origin names in Archivo condensed italic (wdth 75), spot temperatures and times in condensed with `tnum`. **No mono.** It's one family whose width axis carries the hierarchy, the way a topo sheet letters everything in one face at many widths. The warmth comes from colour and line, not from a second face. |
| Color | **paper** `oklch(0.97 0.011 85)` ground. **ink** `oklch(0.26 0.02 60)` survey ink for text. **contour** `oklch(0.55 0.13 45)` is the **accent**: every contour line, the roast curve, the CTA fill, the focus ring. **moss** `oklch(0.90 0.045 135)` is a vegetation tint, used only for the drying-phase band and the selected plan. **lake** `oklch(0.62 0.07 230)` is used only for the cooling segment after the drop. Dark scheme ("night survey"): ground `oklch(0.22 0.014 60)`, ink `oklch(0.93 0.015 85)`, contour lifted to `oklch(0.72 0.12 52)`, tints at half chroma. |
| Grid | **Base:** 12 columns, 24px gutter, 1440 max, 64px side margins. **The permanent, planned break:** the terrain field is full-bleed *under* the grid. Copy hugs cols 1–6, route cards sit in cols 10–12. **`roast-curve`:** the elevation profile breaks out edge to edge. **`roasts`:** three 4-col route cards drawn on **one shared temperature axis**, so the curves compare at a glance. **Rhythm:** tight data runs, then one long open "valley" before `subscribe`. **Mobile:** 4 columns; the map crops to the summit. |
| Imagery | Generative SVG only. The contour terrain is computed at build time from batch 214's bean-temperature (BT) curve: a heightfield → marching squares, about 40 levels. Every 5th line is an index line, heavier and labelled in °C along its path. Spot heights mark the event temperatures (152°, 196°, 207°). Each coffee gets a mini profile. No photography. |
| Motion personality | Pen-plotter pace. Lines draw at an even, unhurried speed (ease-in-out, 900–1400 ms) and nothing bounces. The land is still; only the survey moves. |
| Signature moment | **"Section A–A′."** In the hero, a dashed section line cuts across the contour map. Scrolling into `roast-curve` (scroll-linked), the cross-section along A–A′ unfolds below as an elevation profile, and that profile *is* batch 214's roast curve. Waypoints pin in order: Charge, Turning point 1:05, Dry end 4:30, First crack 8:50, Drop 10:40 / 207°, with the phase-split bar (42 / 41 / 17%) on top. It proves the terrain was data all along: the concept in one move. |
| Hero composition | **Field:** full-bleed hairline contours in contour-brown on paper, parting around a clearing in cols 1–6. **Headline:** in the clearing at display size: "Every roast is a *climb*. We send you the map." Then a one-line subhead, then the CTA pair (filled "Start a subscription", text link "See current roasts →"). **Summit:** right of centre, spot-height "▲ 207°". **Section line:** dashed A–A′ across the lower third. **Route card** (cols 10–12, hairline box): Batch 214 · Guji, Ethiopia · Roasted 27 Oct · 10:40 · DTR 17%. **Nav:** NORTHBOUND in Archivo wdth 125 caps with a small north tick; links right. |
| Borrowed techniques | **swisstopo-map:** index contour every 5th line, heavier and labelled inline; spot heights; italic names; one flat vegetation tint. **artisan-roast-curve:** event code + time with leader lines; per-phase duration bar above the curve. **owid-grapher:** direct labels at line ends, no legend; a plain-language definition under the chart title. **tracksmith:** one italic word in the display line ("a *climb*") for warmth. |
| Risk | **Risk:** topographic line patterns are common outdoor-brand wallpaper; if the lines aren't visibly data, they read as decoration. **Mitigation:** generate the terrain from the real curve, label the index lines in °C, and let A–A′ prove it. **Legibility:** every text block sits in a masked clearing (no lines under type). **Performance:** paths are precomputed (static SVG, about 40 paths, under 60 KB) and only `stroke-dashoffset` animates. **Reduced motion:** the map and the finished profile, shown still. |

**Preview**
```text
┌────────────────────────────────────────────────────┐
│ NORTHBOUND        Roasts  Curve  Plans [Subscribe] │
│  .-~~~~~~~~-.     .-~~~~~~~~~~~~~-.                │
│ (  .-~~~~-.  )   (   .-~~~~~~~-.   ) ┌ BATCH 214 ┐ │
│ (  ( 152° )  )   (  (  ▲ 207°   )  ) │ Guji, ETH │ │
│  `-~~~~~~~~-'  A ─ ─ ─ ─ ─ ─ ─ ─ ─ A′│27.10 · 17%│ │
│ Every roast is a climb.              └───────────┘ │
│ We send you the map.                               │
│ Each bag ships with its real curve and roast date. │
│ [ Start a subscription ]      See current roasts → │
├────────────────────────────────────────────────────┤
│ SECTION A–A′ · elevation = bean temp °C            │
│ CHARGE                           FC 8:50 •.-▲ 207° │
│  \                      __..--''''    DROP 10:40   │
│   \     DRY 4:30 •.--''''                          │
│    \__.--'' TP 1:05 · 88°                          │
└────────────────────────────────────────────────────┘
paper oklch(0.97 0.011 85)  ink oklch(0.26 0.02 60)
contour oklch(0.55 0.13 45) = accent: lines, curve, CTA
moss oklch(0.90 0.045 135)  lake oklch(0.62 0.07 230)
Type: Archivo (wide display, condensed map labels)
Signature: section A–A′ unfolds the map into the curve
```

---

## Direction B · Field Instrument

**Concept:** Built like field gear. Every bag carries a data plate (batch, roast date, the full curve), and the page is the instrument that reads it. You trust it the way you trust an altimeter: it shows its numbers.

| Axis | Choice |
|---|---|
| Mood words | engineered, candid, tactile, alert, rugged |
| Type | **Display:** Martian Mono (variable wdth 75–112.5, wght 100–800). Headlines in wide, light caps, like engraved bezel markings; readouts in condensed widths with `tnum`. **Text:** Instrument Sans (wdth 75–100, wght 400–600) for body and UI, so the human sentences sound human. The mono carries the precision and the grotesk carries the voice. |
| Color | **Dark-first.** **housing** `oklch(0.22 0.008 70)` warm graphite, never black. **panel** `oklch(0.27 0.01 70)`. **bone** `oklch(0.93 0.016 85)` ink. **dim** `oklch(0.70 0.014 80)` labels. **blaze** `oklch(0.70 0.19 45)` is the **accent**: the hunter/trail-marker orange of field gear, used for the CTA, the live trace, the active lamp and focus. Kept under 5% of any screen. Light "daylight" scheme: bone ground `oklch(0.95 0.01 85)`, graphite ink, blaze deepened to `oklch(0.60 0.19 42)`. |
| Grid | **Base:** a 6-column modular fascia on an 8px module, with visible 1px hairlines between modules, 0 radius and no shadows. Labels sit *on* the rules, like engraving on a panel. **Hero:** a 4-module headline panel beside a 2-module data plate. **`roast-curve`:** the scope breaks to full width. **`roasts`:** three modules with identical readout rows (origin, process, roast level, notes, roast date), so they compare line by line. **Planned break:** one vertical label strip (the rotated batch number) on the right edge. **Mobile:** 2-column modules. |
| Imagery | Hairline technical drawings: orthographic views plus one exploded view of the bag, degassing valve and the curve card that ships inside. Blaze-orange hotspot dots with leader lines annotate them. The live scope. No photos, no 3D. |
| Motion personality | Mechanical and exact: short, snappy, stepped. Digits roll like an odometer, needles snap with a slight overshoot, lamps switch on rather than fade. 120–240 ms; `steps()` for ticks. |
| Signature moment | **"Roast replay."** In `roast-curve`, a full-width scope replays batch 214's 10:40 roast in 10.7 s when it enters view. BT (and RoR) traces draw on a gridded scope while large tabular readouts tick (T 08:50 · BT 196.0 °C · RoR 6.1 °/min) and the event lamps light: DRY → FC → DROP. Drag the scrubber to read any second. It turns "data-driven" into something you can operate. |
| Hero composition | **Fascia:** warm-graphite, two modules. **Left module:** headline in wide, light mono caps, "ROASTED TO A READING, NOT A FEELING.", then one Instrument Sans sentence, a blaze-orange "Start a subscription" button and an outline "See current roasts". **Right module, the data plate:** dot-leader rows (Batch 214 · Guji, Ethiopia · Roasted 27.10.26 · Drop 10:40 @ 207° · DTR 17%), an engraved sparkline of the curve, screw dots in the corners. **Nav:** a strip of lowercase labels, each with a tiny meaningful pictogram. |
| Borrowed techniques | **teenage-engineering:** lowercase nav labels with line pictograms; orange kept to small details. **coffeetech:** the hairline "x-ray" mask over a solid object; accent hotspot dots as annotation anchors. **artisan-roast-curve:** BT/RoR traces, event codes (CHARGE, DE, FCs, DROP), per-phase stat bar. **owid-grapher:** play/scrub control with start and end values; value column in tabular figures. |
| Risk | **Risk 1:** it could tip into a cold "SaaS dashboard", or the moody dark the brief dislikes (see Onyx in the references). **Mitigation:** warm graphite and bone (no `#000`/`#fff`), human copy in Instrument Sans, scarce orange, and a fully designed daylight scheme. **Risk 2:** mono display runs wide fast. **Mitigation:** cap display lines at 18 characters. **Build:** the replay is the heaviest build (one SVG path plus a Motion time/scroll driver) but cheap at runtime. **Reduced motion:** the final frame with all lamps lit. |

**Preview**
```text
┌────────────────────────────────────────────────────┐
│ northbound   ◇roasts ◇curve ◇plans  [SUBSCRIBE ●]  │
├──────────────────────────────┬─────────────────────┤
│ ROASTED TO                   │ ○ DATA PLATE      ○ │
│ A READING,                   │ BATCH ......... 214 │
│ NOT A FEELING.               │ ORIGIN .. GUJI, ETH │
│ Every bag carries its batch, │ ROASTED .. 27.10.26 │
│ roast date and full curve.   │ DROP ... 10:40 207° │
│ [■ START A SUBSCRIPTION ]    │ DTR ........... 17% │
│ [  SEE CURRENT ROASTS   ]    │ ○ ._.-''''''''    ○ │
├──────────────────────────────┴─────────────────────┤
│ ▶ REPLAY · BATCH 214            T     08:50        │
│ 210┤                 __.-●      BT    196.0 °C     │
│    │        __..--'''           RoR     6.1 °/min  │
│  90┤\__..--''                   ■ DRY ■ FC □ DROP  │
│    └──┬───┬───┬───┬───┬───┬──  0:00 ──────── 10:40 │
└────────────────────────────────────────────────────┘
housing oklch(0.22 0.008 70)  panel oklch(0.27 0.01 70)
bone oklch(0.93 0.016 85)  dim oklch(0.70 0.014 80)
blaze oklch(0.70 0.19 45) = accent: CTA, live trace
Type: Martian Mono (display, readouts) / Instrument Sans
Signature: replay batch 214; readouts tick, lamps light
```

---

## Direction C · Almanac

**Concept:** The Northbound Almanac. Every roast is set down like a tide table (dates, coordinates and curves, in print), following the coffee north from the equator to a roastery at 46°N and on to your door.

| Axis | Choice |
|---|---|
| Mood words | printed, seasonal, generous, literate, steady |
| Type | **Display:** Newsreader (opsz 72, wght 300–500, true italics). A contemporary news serif with almanac gravity but no antique costume. **Text:** Newsreader (opsz 16, 400). **Data/UI:** Libre Franklin (tabular lining figures, tracked small-caps labels). It updates the Caslon-and-Franklin pairing of American almanac printing without turning it into a period costume. |
| Color | **paper** `oklch(0.96 0.022 88)` almanac cream. **spruce** `oklch(0.28 0.045 165)` ink: deep green-black like a printed map legend, warmer than black. **vermilion** `oklch(0.55 0.18 33)` is the **accent**, in the tradition of red-letter days: CTA, rubrics, delivery stamps, the curve line. **ochre** `oklch(0.80 0.11 80)` only for phase blocks on plates. **rule** `oklch(0.82 0.03 85)` hairlines. Dark scheme ("lamplight"): ground `oklch(0.23 0.03 165)`, paper-coloured ink, vermilion lifted to `oklch(0.70 0.16 38)`. |
| Grid | **Base:** a book grid of 12 columns, split asymmetrically: a 3-col margin for marginalia (coordinates, plate numbers, side notes in Franklin small caps), a 7-col text column at about 64ch, and 2 empty columns. **Planned breaks:** plates span the full measure (the roast curve as "Plate I"), and the calendar nests a 7-col Mon–Sun grid. **`roasts`:** an almanac table with one row per coffee (origin, coordinates, process, roast level, notes, roast date), comparable at a glance. **Mobile:** marginalia move inline above each paragraph. |
| Imagery | Printed plates in Byrne's manner: flat colour fields with fine linework. The curve plate shows its phase blocks at 42 / 41 / 17%; there are also roast-level bars and the latitude scale in the margin. Type-only elsewhere. No photography, textures or distress. |
| Motion personality | Still as paper. No scroll fades anywhere; the only motion is ink. Stamps press in (scale 1.04 → 1, 180 ms) when you set or skip a delivery, and the latitude marker slides along the margin rail. |
| Signature moment | **"The Roast Calendar."** In `how-it-works`, an almanac table of the next 8 weeks. Every Tuesday carries a roast mark ◆ and each delivery Friday a vermilion stamp ●. Choose a cadence (1/2/3/4 weeks) and the stamps re-ink across the grid. Tap a delivery to skip it: the row is struck through and the margin notes "Skipped. Next roast Tue 15 Dec." It turns freshness (roast to door in 3 days) and flexibility into a printed fact, not a promise, aimed at the audience's two reasons for cancelling. |
| Hero composition | An almanac title page. **Running head:** a thin double rule, "The Northbound Almanac · Autumn 2026" left, nav right. **Headline:** three lines flush-left in cols 4–10: "Grown at 6° North. / Roasted at 46° North. / Brewed at *yours*." **Margin column:** a latitude scale (46.5°N roastery at top; 5.9°N Guji, 2.0°N Huila, 0.4°S Nyeri at the foot) joined by one vermilion meridian line. **Below:** subhead, filled vermilion CTA and the "The roasts →" link, then a footnote-style line: "Every bag ships with its roast curve and roast date." |
| Borrowed techniques | **byrne-euclid:** data as flat colour fields with fine linework; a title page framed by coloured rules. **stripe-press:** a tick-mark ruler as a quiet margin index (here, the latitude rail). **wendelboe:** origin as eyebrow and the coffee's name as the headline in each table row. **sey:** tracked small-caps labels against a serif body. **ceremony:** the flexibility promise placed directly under the CTA. |
| Risk | **Risk 1:** almanac + serif can slide into old-timey "craft" costume, the hipster look the brief bans. **Mitigation:** a contemporary face, no ornaments, no distress, no "Est." badge; crisp tables and generous space. **Risk 2:** it's the quietest direction and could read as a nice blog. **Mitigation:** the plates and the calendar must be crafted to award level. **Build:** the calendar needs keyboard access (a grid of buttons) plus empty, loading and error states; moderate effort. |

**Preview**
```text
┌────────────────────────────────────────────────────┐
│ The Northbound Almanac   Roasts Curve Plans [Join] │
├─────────┬──────────────────────────────────────────┤
│    N    │ Grown at 6° North.                       │
│ 46.5°N ─│ Roasted at 46° North.                    │
│ roastery│ Brewed at yours.                         │
│     ┊   │                                          │
│ 5.9°N ● │ A subscription that records every roast: │
│ 2.0°N ● │ its date, its origin, its full curve.    │
│ 0.4°S ● │ [ Start a subscription ]    The roasts → │
├─────────┴──────────────────────────────────────────┤
│ THE ROAST CALENDAR · every 2 weeks ▾ M T W T F S S │
│ Nov  3  roast Tue · at your door Fri · ◆ · · ● · · │
│ Nov 17  roast Tue · at your door Fri · ◆ · · ● · · │
│ Dec  1  ─ skipped · tap to restore ─ · ◇ · · ○ · · │
│ Dec 15  roast Tue · at your door Fri · ◆ · · ● · · │
└────────────────────────────────────────────────────┘
paper oklch(0.96 0.022 88)  spruce oklch(0.28 0.045 165)
vermilion oklch(0.55 0.18 33) = accent: CTA, stamps
ochre oklch(0.80 0.11 80)  rule oklch(0.82 0.03 85)
Type: Newsreader (display, text) / Libre Franklin (data)
Signature: the roast calendar; set cadence, tap to skip
```

---

## Divergence check

| Axis | A · Contour | B · Field Instrument | C · Almanac |
|---|---|---|---|
| Type | One grotesk across its width axis (Archivo), no serif or mono | Mono display (Martian Mono) + grotesk text (Instrument Sans) | Serif display and text (Newsreader) + Libre Franklin for data |
| Color | Light map paper; contour-sienna accent; moss and lake tints | Dark-first warm graphite and bone; blaze-orange accent | Cream paper, spruce-green ink; vermilion accent, ochre plates |
| Grid | 12-col with a full-bleed generative field underneath; asymmetric | 6-col modular fascia with visible hairlines, 8px module | Book grid: margin column + 64ch text; nested 7-col calendar |
| Motion | Slow, scroll-linked line drawing (pen-plotter pace) | Snappy, stepped, mechanical; live replay | Nearly still; ink stamps on interaction only |
| Imagery | Generative contour terrain computed from the roast data | Hairline technical drawings + live scope | Flat-colour printed plates; otherwise type-only |

Every pair differs on all 5 axes. The roast curve gets a different treatment in each: terrain profile (A), live instrument trace (B), printed plate (C).

---

## Shared section outline

Same IDs for all three directions. The primary action, **Start a subscription → `#subscribe`**, appears in `hero` and closes the page in `subscribe`. The secondary action, **See current roasts → `#roasts`**, appears in `hero`. The order changes the brief's draft in one place: `proof` comes before `subscribe`, so the last full section is the decision itself.

| # | ID | Purpose | Content needs | Brief must-have |
|---|---|---|---|---|
| 1 | `hero` | State the concept within 5 seconds; offer the primary action one click away | Wordmark; nav (Roasts, The curve, How it works, Plans); headline; one-sentence subhead naming the roast curve and roast date; primary CTA → `#subscribe`; secondary link → `#roasts`; the current batch (number, origin, roast date) as one live data point; the direction's signature visual | Introduces "each bag ships with its actual roast curve and roast date"; primary action |
| 2 | `roast-curve` | Prove the differentiator with one real, legible curve | Batch 214's full curve (BT; RoR optional) on labelled axes; 5 events with time and temp; the phase-split bar (42 / 41 / 17%) with DTR; the roast date; at most 3 short "how to read it" annotations, including what it means for brewing (e.g. a short development reads brighter, so grind a touch finer); a depiction of the curve card that ships in the bag | **Roast curve + roast date** (the differentiator); success criterion "real, legible data" |
| 3 | `roasts` | Let brewers compare the 3 current coffees at a glance | Per coffee: name; region + country (latitude/elevation optional); producer or washing station; process; roast level on **one shared scale**; 3 tasting notes; roast date; mini curve; suggested brew (method + ratio); bag size and price. A "Browse all roasts" link (secondary action). Identical field order across all three | **3 current roasts with origin, process and tasting notes**; success criterion "comparable at a glance" |
| 4 | `how-it-works` | Remove the two reasons people cancel: stale coffee and rigid schedules | Cadence options (every 1, 2, 3 or 4 weeks); the roast → ship → door timeline (we roast Tuesday, ship within 24 h, at most N days from roast to door); pause, skip, swap or change size anytime before the cutoff (e.g. Sunday 23:59); 3–4 steps at most. In C this holds the Roast Calendar | **Cadence, flexibility (pause or skip anytime), freshness promise** |
| 5 | `proof` | Earn trust with specifics, not adjectives | One sourcing line with a real-feeling detail (e.g. years buying from a named washing station, and the price paid); one customer quote with name, city and brew method (demo); optionally one number (average days from roast to door) | **Proof: a sourcing line or customer quote (demo)** |
| 6 | `subscribe` (anchor `#subscribe`) | Price it and close | Plans (bag size × bags per delivery) with price per delivery and per bag; cadence picker; coffee preference (rotating single origin or espresso); what's included (curve card, roast date, shipping terms); email capture with client-side validation and **empty, loading, error and success** states; the reassurance line ("Pause or skip anytime"); the final CTA | **Pricing for the subscription; a final call to action** |
| 7 | `footer` | Close quietly and orient | Wordmark; roastery location (city + coordinates); roast schedule ("We roast on Tuesdays"); contact; small nav repeat; legal; a demo-brand note | Supports trust (no must-have of its own) |

---

## Recommendation

**I'd choose A · Contour**: it is the only direction where the name, the outdoorsy personality and the differentiator become one image: the map *is* the roast curve, and Section A–A′ proves it in a single scroll. It's light, warm and specific, with the lowest risk of reading as moody (B) or as costume (C). If the user wants more pull toward subscribing, C's Roast Calendar can become A's `how-it-works` interaction, restyled as a route schedule, without breaking the concept.
