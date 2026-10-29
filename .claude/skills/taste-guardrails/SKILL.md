---
name: taste-guardrails
description: The web studio's shared quality bar. These are the must-haves, banned patterns and craft checklist every studio bot (Director, Designer, Copywriter, Builder, Critic) applies to a webpage. Load it whenever designing, writing, building or judging a studio page.
user-invocable: false
---

# Taste guardrails

The studio makes pages people remember: award-level work with a clear idea, not a template with the logo swapped. Every decision has to be explainable by the page's concept. If you can't say why something looks the way it does, it is decoration, so cut it or rework it.

## The six must-haves

1. **A named concept.** A one-line idea or metaphor drives every choice. Examples: "the roast curve", "field notes", "a quiet gallery", "the departure board". Type, color, layout, motion and copy all express it.
2. **A deliberate grid.** Declare a column system (for example 12 columns with a 24px gutter, or a 6-column editorial grid). Every element sits on it. Break the grid on purpose, at a few chosen moments, never by accident.
3. **Real typographic hierarchy.** Use a fluid scale with dramatic contrast between display and text sizes (the display size is often 6–9× the body size). There is one clear reading order, and type does most of the design work.
4. **Generous, rhythmic whitespace.** Every gap comes from the spacing scale. Section padding varies on purpose to create rhythm, such as a tight run followed by a breath. Crowding is the most common way pages look cheap.
5. **At least one signature moment.** One thing someone would screenshot and send to a friend, tied to the concept: a scroll-linked reveal, a generative or illustrated hero, an unexpected layout, a crafted interaction or a typographic set piece.
6. **Real copy.** Written for this brand, in its voice, at the length the layout needs. Never lorem ipsum.

## Banned: these make a page look AI-generated

- A default purple-to-blue (or any rainbow) gradient as the main visual idea.
- Inter, Roboto, Arial or system-ui as the *only* typeface. A neutral sans is fine for text when paired with a display face that has character.
- The template stack: centered hero → three identical icon cards → testimonial carousel → centered CTA, as the whole page.
- Emoji used as icons, or generic outline-icon sets used as decoration.
- Glassmorphism, neon glows, floating blobs, noise overlays or "aurora" backgrounds with no concept behind them.
- Placeholder content: "Feature one", "Lorem ipsum", "John Doe, CEO", fake logos.
- Stock-photo clichés: handshakes, people pointing at laptops, abstract 3D shapes.
- Animating everything. Motion must reveal, guide, or express the concept. Fades on every element are noise.
- Everything centered. Use alignment to create tension and direction.
- Pure `#000` text on pure `#fff` with no tonal design. Choose the neutrals deliberately.

## The "any company" test

Cover the logo and read the headline. Could this page belong to any company in the category, or to a different category entirely? If it could, it isn't done. Make the concept more specific: a real material, a place, a process, a number, a history.

## Craft-detail checklist

Before calling anything finished, check:
- [ ] Hover, `focus-visible` and pressed states on every interactive element. Focus is always visible.
- [ ] Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`; no widows on key lines.
- [ ] Line length for body text is 60–75 characters.
- [ ] Numbers in data or prices use tabular figures (`font-variant-numeric: tabular-nums`).
- [ ] A custom `::selection` color in the brand palette.
- [ ] Favicon or `icon.svg`, an Open Graph image, and a page `<title>` and description.
- [ ] Light and dark schemes are both designed, not just inverted.
- [ ] `prefers-reduced-motion` gets a designed, still alternative, not a broken page.
- [ ] Every breakpoint is composed, not just stacked; the 375px view is designed too.
- [ ] Empty, loading and error states for any form or dynamic element.
- [ ] Images have meaningful alt text; decorative SVG is `aria-hidden`.

## Quality bar

The target is a page that would be credible on Awwwards or Godly. When torn between safe and specific, choose specific. When torn between more and less, choose less, but make what remains better.
