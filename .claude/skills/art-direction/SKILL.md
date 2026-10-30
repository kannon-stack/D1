---
name: art-direction
description: Designer pass A for the web studio. Research award-level references, then write 3 genuinely different visual directions plus a shared section outline into studio/design/directions.md. Use when a studio project has a brief but no chosen direction yet.
user-invocable: false
---

# Art direction (pass A)

**Input:** `P/studio/brief.md`
**Output:** `P/studio/research/references.md` with screenshots, and `P/studio/design/directions.md` (start from `.claude/skills/art-direction/templates/directions.md`).

## 1. Research (8–12 references)

Look for **techniques, not looks**. You are studying how good sites solve problems, not choosing one to copy.

**Where to look**
- awwwards.com (Sites of the Day), godly.website, siteinspire.com, land-book.com, minimal.gallery
- the 3–5 best sites in the brief's category, plus at least 2 from *outside* it
- non-web sources tied to the concept: print and editorial design, packaging, signage, maps, scientific plates, film titles

**How to capture**
1. Find candidates with WebSearch or `mcp__Firecrawl__firecrawl_search`.
2. Capture the first screen of each reference, either way:
   - `node .claude/studio-tools/scripts/screenshot.mjs --url <url> --out P/studio/research/<name> --widths 1440 --schemes light --fold-only`
   - or `mcp__Firecrawl__firecrawl_scrape` with `formats: ["screenshot"]`, then `curl -sL "<screenshot url>" -o P/studio/research/<name>.png`
3. **Read every screenshot.** Don't describe a site you haven't looked at.

`screenshot.mjs` can't reach many third-party sites from a cloud container, because the egress proxy denies hosts it hasn't allowed. In that case Firecrawl is the expected route, not a last resort. Keep the captures only as working material: the project's `.gitignore` leaves `studio/research/*.png` out of the repo, so `references.md` must carry everything that matters (URL, technique, what to avoid).

If a capture fails, note it and move on; never invent what a site looks like.

**Write `references.md`.** One entry per reference:
- image path and URL
- the technique worth borrowing, stated precisely, e.g. "sticky left column of oversized serif numerals while the right column scrolls", not "nice typography"
- what to avoid

## 2. Three directions

Each direction is a complete, distinct answer to the brief.

- **Divergence rule:** every pair of directions differs on at least **3 of 5 axes**: type, color, grid, motion, imagery. Three variations of one idea is a failure.
- **Useful archetypes to start from** (combine or invent freely):
  - editorial / typographic
  - immersive / motion-led
  - tactile / crafted
  - data-art / generative
  - structural / brutalist
  - cinematic / photographic
- **The concept comes first.** A one-line idea or metaphor rooted in something specific about *this* brand: a material, a process, a place, a number or a history. "Modern and clean" is not a concept.
- **Every direction must pass the "any company" test** from `taste-guardrails`.
- **Name the signature moment** for each: what it is, where it happens and why it expresses the concept.
- **Be honest about risk:** what could go wrong (performance, legibility, cliché, build effort).

### The preview block
The Director shows each direction to the user as a preview, so this block must stand alone. Write it as a fenced `text` block, at most **22 lines × 56 characters**, containing:
- an ASCII wireframe of the hero and one key section, with real proposed headline text
- palette: 4–5 named swatches with their OKLCH values
- type: display and text family names
- the signature moment in one line

## 3. Shared section outline

One outline serves all 3 directions, so the Copywriter can start before a direction is picked.
- Give each section a kebab-case ID (`hero`, `process`, `origins`, `subscribe`…), a purpose, its content needs, and the brief must-have it fulfils.
- The primary action appears in the hero and again near the end.
- 5–8 sections is typical for a landing page. Every section must earn its place.

## 4. Recommendation

End with the direction you'd choose and why, in 3 sentences at most. The Director or the user makes the final call.

## Done when
- [ ] `references.md` has 8 or more entries, each with an image you actually looked at.
- [ ] `directions.md` has 3 directions that satisfy the divergence rule, each with every template field filled.
- [ ] Each preview block fits within 22 × 56 characters.
- [ ] The section outline covers every must-have in the brief.
