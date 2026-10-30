---
name: page-copy
description: Copywriter method for the web studio. Write the voice sheet, every word on the page (keyed by section and slot, within length budgets), microcopy, alt text and SEO metadata into studio/content/. Use when a studio project needs its copy written or fixed.
user-invocable: false
---

# Page copy

**Inputs:** `brief.md`, `design/directions.md` (section outline), `decisions.md`, and `design/layout-spec.md` once it exists (slot budgets).
**Outputs** (in `P/studio/content/`): `voice.md`, `copy.md`, `metadata.md`.
**Templates:** `.claude/skills/page-copy/templates/`

Words make the design make sense. Every heading must earn its size: if a headline is set at 120px, it has to be worth reading at 120px.

## 1. `voice.md`
- **3 voice traits.** Each gets a one-line definition and two "this, not that" pairs written in the brand's actual subject matter.
- **Words to use:** concrete nouns and verbs from the brand's world, e.g. "roast curve", "first crack", "drop temperature".
- **Words to avoid:** the banned list below, plus category clichés.
- **Grammar and rhythm:** sentence length, contractions, person ("we" / "you"), punctuation habits, capitalization of headings (sentence case unless the direction says otherwise).

## 2. `copy.md`: the copy contract
- **Format:** one fenced `yaml` block per section, keyed by the slot IDs from the outline or layout spec (`hero.headline` is written as `headline:` under `## hero`). The Builder converts this file mechanically into `src/content/copy.ts`, so keep the format strict. Use `|` for multi-line text and lists for repeated items.
- **Hero:** 3 headline options, each with a one-line rationale. Mark the chosen one `final: true` once the Director confirms it. Until then, mark your recommendation with `recommended: true`.
- **Budgets:** respect every `max chars per line × lines` budget from the layout spec. Count characters, including spaces, and include the count in a comment, e.g. `# 19/20`. If a budget forces bland copy, propose a change to the Director rather than breaking it.
- **Specific beats general:** use real numbers, names, places, processes and times. "Roasted Tuesday, at your door Thursday" beats "fresh coffee delivered fast".
- **CTAs:** a verb plus the outcome ("Start my subscription", not "Submit" or "Learn more"). Keep the primary CTA wording identical everywhere it appears.
- **Microcopy for every interactive element:**
  - button pressed and loading states ("Starting…")
  - form labels and placeholders (placeholders never replace labels)
  - helper text and validation errors (say what to do, never blame the user)
  - empty states and success messages
  - the 404 line, if there's a 404 page
- **Alt text** for every image or illustration slot: what it shows *and why it's there*, at most 125 characters. Decorative art gets `alt: ""` with a note.
- **Facts:** never invent statistics, awards, quotes or customer names. If the brief lacks proof points, write `[NEEDS FACT: …]` and flag it to the Director. For a fictional demo brand, invented specifics are fine but must be plausible and labelled as demo content in `decisions.md`.

## 3. `metadata.md`
- `<title>` of 60 characters or fewer, and a meta description of 155 characters or fewer, both containing the primary search intent.
- Open Graph title and description, plus the OG image text (at most 8 words, set in the display face).
- **JSON-LD:** choose the right schema.org type (`Organization`, `LocalBusiness`, `Product`, `SoftwareApplication`, `Event`…) and write the complete JSON object.
- **Heading outline:** exactly one `h1` (normally the hero headline), with the h2/h3 structure mirroring the sections and no skipped levels.

## Banned words and phrases
revolutionary, seamless(ly), unlock, elevate, leverage, cutting-edge, game-changer, next-level, world-class, best-in-class, innovative, empower, synergy, robust, journey (as a metaphor), "in today's fast-paced world", "look no further", "we're passionate about", "solutions" (used alone), and any exclamation mark in a headline.

## You have no shell
You can't run a parser, so write the YAML and JSON carefully: quote any string containing `:` or `#`, keep indentation consistent, and re-read each block once before you finish. The Director runs `node .claude/studio-tools/scripts/check-content.mjs` on your files. It reports YAML and JSON-LD syntax errors, slots the layout spec uses that have no copy, banned words, and counts in your `# used/budget` comments that don't match the text. Make those counts exact.

## Done when
- [ ] Every slot in `layout-spec.md` has copy within its budget (with counts shown).
- [ ] The hero has 3 options with rationales, one of them recommended.
- [ ] Every image slot has alt text; every interactive element has its states.
- [ ] `metadata.md` is complete, with valid JSON-LD.
- [ ] No banned words, no placeholders, and every `[NEEDS FACT]` flagged.
