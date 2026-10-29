---
name: visual-system
description: Designer pass B for the web studio. For the chosen direction, write the full visual system and the build spec in studio/design/ (direction, type, OKLCH tokens for Tailwind v4, motion language, layout spec, SVG assets) and verify contrast. Use after a studio direction has been picked.
user-invocable: false
---

# Visual system (pass B)

**Inputs:** `brief.md`, `design/directions.md`, `decisions.md` (the chosen direction and any user changes).
**Outputs** (in `P/studio/design/`): `direction.md`, `type.md`, `tokens.css`, `motion.md`, `layout-spec.md`, `assets/`.
**Templates:** `.claude/skills/visual-system/templates/`

The Builder implements exactly what you specify, so anything left vague will be built generic. Be precise: name the tokens, values, column spans and timings.

## 1. `direction.md`: the concept in depth
- Concept and the story behind it, in a short paragraph.
- 4–6 **composition principles**, e.g. "type is the image: no photography above the fold", "everything hangs from a single baseline at 38% of the viewport".
- **Do / Don't** list (6 or more of each), specific to this direction.
- **Signature moment for each section.** Most sections get a small detail; one section gets the big moment.

## 2. `type.md`: typography
- At most **2 families** plus an optional mono, all from Google Fonts or local files. Write each **exactly as the `next/font/google` export names it** (spaces become underscores, e.g. `Instrument_Serif`, `Inter_Tight`), with its weights or variable axes and `variable: "--font-<id>"`.
- **Roles:** display, text, and accent/mono if used.
- **Fluid scale:**
  1. Pick the base and ratio pair to suit the concept, e.g. editorial 1.25→1.414, quiet 1.2→1.25, dramatic 1.25→1.5.
  2. Generate it with `node .claude/studio-tools/scripts/type-scale.mjs --base 16:18 --ratio 1.2:1.333 --viewports 360:1440`.
  3. Paste the output into `tokens.css`, adjusting the line-heights and tracking where needed.
- **Usage map:** which `text-*` token, weight, tracking and case each element uses (hero headline, section titles, eyebrow, body, captions, buttons, nav, numerals).
- **Details:** 60–75ch measure; OpenType features to switch on (`ss01`, `onum`/`lnum`, `tnum` for numbers, `case` for uppercase); `text-wrap: balance` for headings.

## 3. `tokens.css`: Tailwind v4 theme
This is a CSS file the Builder pastes straight into `globals.css`. Use Tailwind v4 namespaces only.
- **Colors** in **OKLCH**. The required semantic names are `--color-bg`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-accent`, `--color-accent-ink` (text drawn on the accent) and `--color-line`. Optional: `--color-surface-2`, `--color-ink-soft`, `--color-accent-2`, `--color-focus`. No raw palette names (`blue-500`) in components.
- **Dark scheme:** override every color that changes inside `@media (prefers-color-scheme: dark) { :root { … } }`. Design dark on purpose; don't just invert. Usually that means slightly lower accent chroma, raised surfaces instead of shadows, and off-white ink.
- **Fonts:** `@theme inline { --font-display: var(--font-<id>), <fallback stack>; --font-text: …; }`. The `inline` keyword is required because next/font defines the variables at runtime.
- **Type:** the `--text-*` variables generated above.
- **Space and layout:** keep `--spacing: 0.25rem` as the base. Add named rhythm tokens (`--spacing-section-sm/md/lg`, `--spacing-gutter`) and container widths (`--container-page`, `--container-prose`).
- **Shape and depth:** `--radius-*` and `--shadow-*` only if the direction uses them. Many strong directions use `0` radius and no shadows.
- **Easing:** `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`, plus 1–2 custom curves named for the concept.
- **Extra contrast pairs** go in comments: `/* contrast: ink-soft/surface 4.5 */`.

Verify it, and keep fixing until it passes:
```bash
node .claude/studio-tools/scripts/contrast.mjs P/studio/design/tokens.css
```
Body text must reach at least 4.5:1, and large text or UI elements at least 3:1, in **both** schemes. Aim for APCA Lc ≥ 75 on body text.

## 4. `motion.md`: the motion language
- **Personality** in one sentence, taken from the direction.
- **Duration tokens:** e.g. `instant 120ms · fast 200ms · base 400ms · slow 700ms · cinematic 1200ms` (the cinematic duration is for the signature moment only).
- **Easing:** which token or curve for entrances, exits and scroll-linked motion.
- **Springs:** for Motion, as `{ type: "spring", visualDuration, bounce }`, e.g. `snappy { visualDuration: 0.35, bounce: 0.15 }` and `soft { visualDuration: 0.7, bounce: 0 }`.
- **Choreography table:** one row per animated element (row ID, section, element, trigger, property from → to, duration/ease/stagger, reduced-motion fallback). Triggers are `load`, `in-view amount 0.x` or `scroll-linked range [start, end]`.
- **Rules:**
  - Animate transform, opacity and clip-path; use filter only sparingly.
  - Entrance offsets of 12–40px, staggers of 40–90ms.
  - Only one heavy effect per viewport.
  - Nothing loops forever unless it is ambient and paused offscreen.
  - Every row has a reduced-motion fallback: the final state, shown still.

## 5. `layout-spec.md`: the build contract
- **Global:** grid columns per breakpoint (e.g. 4 / 8 / 12 at sm / md / lg), page max width, gutters, the section rhythm, and the specs for nav, footer and skip link.
- **For each section ID from the outline:**
  - purpose
  - ASCII sketches at desktop (1280) and mobile (375)
  - column spans at sm / md / lg / xl
  - type tokens per element
  - color usage
  - assets (with paths)
  - interaction states
  - motion row IDs
  - **copy slots**
- **Copy slots** are the contract with the Copywriter. Name each slot `section.slot` (e.g. `hero.headline`) and give its budget as `max chars per line × lines` (e.g. `22 × 2`) for display text, or as a max character count for body text.
- The 375px design is composed, not just stacked: say what changes.

## 6. `assets/`: the visual material
- **Prefer hand-authored SVG, CSS or generative art over stock photography.** Draw SVGs with a `viewBox` and `currentColor` (or CSS variables) so they follow the theme. Mark decorative ones `aria-hidden="true"`.
- **Generative pieces:** give the algorithm (inputs, parameters, how to seed it, how it reacts to scroll or pointer) clearly enough to implement, plus an SVG or PNG sketch of the target look.
- **Photography:** if you truly need it, specify the subject, crop, treatment and a licensed source (e.g. Unsplash URL and photographer), and its alt-text intent.
- Add an `icon.svg` favicon concept, and an OG image composition (1200×630) for the Builder.

## Done when
- [ ] Every section in the outline has a layout spec with spans, type tokens, motion rows and budgeted copy slots.
- [ ] `contrast.mjs` exits 0 for `tokens.css`.
- [ ] Every motion row has a reduced-motion fallback.
- [ ] The font names are valid `next/font/google` exports (or local files are provided).
- [ ] Assets referenced in the layout spec exist in `assets/`.
