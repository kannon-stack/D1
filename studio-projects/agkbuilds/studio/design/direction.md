# Direction: A · Working Drawing

Read with `type.md`, `tokens.css`, `motion.md`, `layout-spec.md` and `assets/README.md`. Facts on the page are only those in `brief.md` and `decisions.md` #9–#13: three kinds of software (data recovery tools, card games, Discord bots), the email agkbuilds@gmail.com, the phone 254-231-1149 and the name Dylan Borgen.

## Concept
**Every build starts as a drawing.** Before a machinist cuts metal, someone draws the part on a sheet: construction circles, centre lines, dimensions, then committed outlines, then the solid. Custom software is made the same way, and Agkbuilds' name already says "builds". So the whole page is one engineering drawing set of four sheets: sheet 01 is the general arrangement (hero), 02 the parts list (what we build), 03 the method (how we work), 04 the title block (contact). The page performs the idea once, at the top: the headline is drafted as outlines on a ruled grid and then filled solid, and its last line ("then built") lands in signal orange. After that the drawing language stays quiet and exact, which is how the page earns "dependable": nothing on it is vague, and nothing is decorated without a reason a draughtsman would accept.

## Composition principles
1. **The sheet is visible.** The 12-column grid is drawn as faint hairlines behind the whole page (`--color-grid`), and every block starts on one of those lines. The grid is the drawing paper, not a hidden tool.
2. **Type is the image.** No photography, no icons, no illustrations of devices or people. The hero headline (Archivo wdth 125 / 800, uppercase) is the largest object on every screen it appears on; the drawings are 1 px linework that frames it.
3. **One stroke, one hand.** Every drawn line is 1 CSS px (`vector-effect: non-scaling-stroke`) in `--color-draft`, `--color-line` or `--color-muted`. The only heavier strokes are "built" outlines in the process plate (1.75 px, ink). Every label in a drawing is the mono "drafting hand" (`annotate` utility).
4. **Annotations live in the margins and gutters, never inside paragraphs.** Sheet numbers, FIG. labels, column heads, balloons and leader callouts sit on rules, beside rules or at line ends.
5. **Orange means built.** `--color-accent` appears only where something is finished or actionable: the "built" line of the headline, the primary button, the active process step and the one solid disc in the plate, the datum dot, focus rings and selection. Never as a background tint, never on a hairline.
6. **Left-hung, never centred.** Everything hangs from column 1's guide; the planned breaks are the hero headline running past column 12 into the right margin, the construction circle cropped by the right edge on mobile, and the title block pinned to columns 7–12 at the bottom of sheet 04.

## Do
- Draw the column guides as a single fixed background layer, aligned to the content grid at every breakpoint (4 / 8 / 12 columns).
- Set every display line in uppercase Archivo Wide 800 with author-controlled line spans; balance them.
- Use real drafting conventions exactly: dash-dot centre lines, filled arrowheads on dimension lines, 90° elbowed leaders ending in a dot, item balloons (circled numbers) in the parts list, a double rule to end a list, a title block with labelled cells.
- Keep labels short, in mono caps, `tabular-nums`, `--color-muted`.
- Keep the headline as real, selectable HTML text from the first paint; the outline and the cover are decorative layers above it.
- Design both schemes: graphite sheet (dark, home) and drafting film (light), each with its own accent value.
- Print the email and phone as selectable text with equal visual weight, each with a working copy button and honest copied / failed states.

## Don't
- No blue, no white-on-blue "blueprint" look, no cyan grid. Graphite and paper only.
- No glows, gradients (other than the hairline guide patterns), blur, glass, noise, shadows or rounded corners (balloons and the datum dot are the only circles).
- No icons, emoji, logos of platforms (no Discord logo, no playing-card suits, no disk icons). The three items are named in words only.
- No invented numbers dressed as drafting data: no fake dimensions ("560 mm"), scales ("1:1"), dates, revision letters, part codes, years, client names or counts other than the computed list count and sheet numbers.
- Never animate body text, never fade-in sections, never loop. Motion is a pen drawing or a fill, and it happens once.
- Never put a drawing line across body copy or the CTA; lines may pass behind display type only.
- Never use the accent on text smaller than `text-xs` 500, and never as a large tinted area except the button and the plate disc.

## Signature moments by section
| Section | Moment | Size |
|---|---|---|
| `hero` | **Plan → built headline.** Column guides and the cap/baseline rules draw in; the construction circle set piece draws itself at the right; the four headline lines appear as 1 px outlines, then a fill sweeps left to right behind a 2 px orange "pen edge" and leaves them solid, the last line in orange. The dimension line opens from its centre under the headline. ≤ 1.75 s, once, CSS only. | big |
| `build` | **Parts list.** Each row's rule draws left to right as it enters; rows are numbered with drafting balloons; the list closes with a double rule and a computed "03 parts · end of list" line, so three rows read as a complete bill of materials. | small |
| `process` | **One plate, four passes.** A sticky drawing plate gains a layer as each step becomes active: measure → plan → build (hatching, connectors) → solid (the disc fills orange). A segmented bar under it shows which pass you're on. On mobile each step carries its own frozen thumbnail of the plate. | medium |
| `contact` | **Title block.** The sheet's title block (CTA, email, phone, contact name, sheet number) pinned bottom-right; its cell rules draw in and the button repeats the hero grammar in miniature: outline, then fill. | small |
| `footer` | The wordmark's dimension bracket `├─ builds ─┤` closes the sheet. | small |
