# References: Northbound Coffee Roasters

Pass A research for `../brief.md`. 12 references, each captured and looked at. Every entry names a **technique** to borrow and what to **avoid**. We borrow methods, never looks.

**How these were captured.** `screenshot.mjs` could not reach the web from this environment (`net::ERR_TUNNEL_CONNECTION_FAILED` through the proxy on the first site). So every image below is a Firecrawl first-screen capture: a 1440×900 viewport, except `sey.png`, which is 1920×1080. `artisan-roast-curve.png` is cropped from a full-page capture of the post.

## What the research says

- **The category's first screen is a fixed formula:** a full-bleed photo (cherries on a branch, or a cup next to a bag), a small headline, and an outlined button. Four of the five coffee sites below do exactly this. None of them shows any roast data above the fold. That is Northbound's opening: lead with the data, not with a photo.
- **The best data pages put their labels inside the picture.** Swisstopo writes names and heights along the features they describe, OWID labels each line at its end, and Artisan prints an event code and time at each point on the curve. None of them needs a legend.
- **Outdoor and technical brands get their warmth from small human touches inside a precise system:** one italic word (Tracksmith), lowercase labels with pictograms (teenage engineering), orange used only on small physical details. They don't get it from mood photography.

---

## In the category

### 1. SEY Coffee
- **Image:** `sey.png` · https://sey.coffee (redirects to seycoffee.com)
- **Seen:** A white bar with a widely tracked SEY wordmark and nav in tracked caps (Coffees, Subscriptions, About…). Below it, a full-bleed photo of red cherries on a branch with a hand. A left-aligned block starts about 20% in from the left edge: "DRINK BEAUTIFUL COFFEE" in tracked uppercase grotesk, a serif paragraph about 45ch wide, and an outlined "SHOP COFFEES" button.
- **Technique:** Two voices kept strictly apart. Labels and headlines are tracked uppercase grotesk, prose is a bookish serif set narrow. The copy block is left-aligned on a column, not centered.
- **Avoid:** The cherry-branch photo hero is the category default (Wendelboe uses almost the same shot). The headline has no display scale, so the type does no work.

### 2. Tim Wendelboe
- **Image:** `wendelboe.png` · https://timwendelboe.no
- **Seen:** A green three-message announcement bar and a centered monogram. Below them, a full-bleed still of a picker among coffee branches. At bottom left: the eyebrow "Ethiopia", then "Tatmara" in a large slab-serif, a sentence with the tasting notes (citrus, florals, stone fruit) and a white "Buy Tatmara" button.
- **Technique:** The origin is the eyebrow and the coffee's own name is the display headline, so the product itself is the hero. The tasting notes arrive in the first sentence.
- **Avoid:** The same picking photo, and the noise of a three-message announcement bar.

### 3. Ceremony Coffee Roasters (Awwwards Site of the Day)
- **Image:** `ceremony.png` · https://ceremonycoffee.com
- **Seen:** A black shipping bar, then a light nav with a centered, spaced CEREMONY wordmark. The hero is a warm photo of a cup and a bag on burlap with a magazine. Left text: the eyebrow "STAY STOCKED AT HOME", a serif headline "Subscribe and Save 10%", the line "No commitments or nonsense, just repeat coffee shipments at your convenience.", an outlined "GET STARTED" button, and carousel arrows.
- **Technique:** The subscription's flexibility promise sits right under the headline and before the CTA. It answers the main objection (rigid schedules) at the moment of decision.
- **Avoid:** Burlap-and-cup still life (the generic coffee-shop look the brief hates), carousel arrows on the hero, and a headline led by a discount.

### 4. Onyx Coffee Lab
- **Image:** `onyx.png` · https://onyxcoffeelab.com
- **Seen:** A black news ticker and a skull logo. The hero is a dark crimson field with a large white script "Onyx" wordmark centered over a two-line mission. One gold link reads "EXPLORE ADVENT 2026 →", with a "SCROLL" cue and a chat bubble below.
- **Technique:** A single small, high-chroma text link (gold on crimson) as the only call to action: one accent, used once.
- **Avoid:** This is the dark, moody, all-centered look the brief rejects. Also the script wordmark and the ticker plus chat-bubble clutter.

### 5. CoffeeTech (Awwwards Site of the Day, 2026)
- **Image:** `coffeetech.png` · https://www.coffee-tech.com/technology (the homepage timed out, so this is its Technology page)
- **Seen:** A near-black ground. A huge cream "Technology / Technology" headline is cropped at both edges, with grey slashes between the words. Below it, a rendered roaster where part of the body is swapped for white hairline wireframe, an "x-ray" mask. Small orange dots mark hotspots, and the "Products" button is orange.
- **Technique:** An x-ray mask: a solid object with one region swapped for hairline technical drawing, plus small accent-coloured dots as annotation anchors.
- **Avoid:** The looping marquee headline, and a heavy 3D/WebGL hero, which our Lighthouse mobile ≥ 90 budget rules out.

---

## Outside the category

### 6. teenage engineering
- **Image:** `teenage-engineering.png` · https://teenage.engineering
- **Seen:** A black ground. The nav is five blocks, each a thin-line pictogram, a large light lowercase label (products, store, latest, finder) and three small sub-links. There's a small Japanese mission paragraph and an outline logo. A grey modular device with orange buttons is lit like a studio object.
- **Technique:** Navigation as a row of pictogram + lowercase label + three sub-links, all in one light weight. The system is technical but still playful. Orange appears only on small physical details.
- **Avoid:** Its look: the dark product shot and the thin-line logo. Any pictogram we use must carry meaning, never decorate.

### 7. Tracksmith
- **Image:** `tracksmith.png` · https://www.tracksmith.com
- **Seen:** An autumn dirt road with a runner under a dark overlay. A centered serif headline reads "Built for Dirt *and* Gravel" with "and" in italic, above muted brown buttons. A cookie banner covers the bottom of the fold.
- **Technique:** One italic word inside an otherwise roman display line adds voice and warmth without a second family.
- **Avoid:** A darkened photo overlay that drags contrast down, a centered stack, and a banner over the fold.

### 8. Our World in Data, grapher
- **Image:** `owid-grapher.png` · https://ourworldindata.org/grapher/life-expectancy?tab=chart&country=JPN~USA~GBR~BRA~ETH~IND
- **Seen:** A line chart with each country labelled where its line ends, so there's no legend. Light dashed gridlines. A serif title with a one-sentence plain-language definition. A play button and a time slider showing the start and end years (1543 / 2023). A right-hand list of the selected countries with their values in a tabular column, and a data-source line.
- **Technique:** Labels at the ends of the lines, a definition sentence under the title, and a play/scrub control that shows start and end values. Together they make a chart a non-expert can read.
- **Avoid:** Dashboard chrome: chart-type tabs, download/share buttons, checkbox lists. Our curve is one story, not a tool.

---

## Print, maps and data (non-web sources tied to the concept)

### 9. Artisan roast profile (the real thing)
- **Image:** `artisan-roast-curve.png` · https://artisan-roasterscope.blogspot.com/2017/02/roast-phases-statistics-and-phases-lcds.html
- **Seen:** A real roast profile titled "P215 LAMPOCOY". The bean temperature (BT) rises in blue, the environment temperature (ET) is red, and there's a rate-of-rise (RoR) curve. Drying, Maillard and development are horizontal tinted bands. A statistic bar on top gives each phase's time and share (4:23 36% · 5:27 44% · 2:24 20%). Events (CHARGE, DE 4:23, FCs 9:51, FCE 11:33, 12:15) have leader lines. There are two axes (°C and C/min) and an xkcd-style hand font.
- **Technique:** The per-phase statistic bar (duration + % of the roast) set above the curve, and events labelled by code + time with leader lines. This is the roaster's own vocabulary, and it reads at a glance. It is also the factual model for what Northbound's curve card must show.
- **Avoid:** Four tints, two axes, three traces and a hand-drawn font at once is noise. We show BT (RoR optional) with one quiet tint per phase.

### 10. Swisstopo national map, 1:25 000
- **Image:** `swisstopo-map.png` · https://map.geo.admin.ch (Kandertal)
- **Seen:** Brown contour lines, with heavier index contours labelled inline along the line (1300, 1000). Spot heights (950, 1072, 1354) are tiny numerals with a dot. Place names (Wigglen, Riggis) are condensed italic, and the river name "Kander" is blue italic that follows the river's curve. Flat green forest tint, a hairline grey grid and a scale bar.
- **Technique:** Every 5th contour is heavier and labelled along its own path. Spot heights are tiny numerals. Names follow the features they describe. The data labels live *inside* the image.
- **Avoid:** Map UI chrome (menus, zoom buttons) and full polychrome. Take the contour brown and at most one tint.

### 11. Byrne's Euclid (Oliver Byrne, 1847; web edition by Nicholas Rougeux)
- **Image:** `byrne-euclid.png` · https://www.c82.net/euclid/
- **Seen:** A cream title card framed by coloured rules (red top, blue left, yellow right, black bottom), over a blurred spread of geometric diagrams in flat red, yellow, blue and black. An all-caps serif title hierarchy and an outlined "Explore" button.
- **Technique:** Data shown as flat colour fields with fine black linework (no gradients, no shadows), and a title card framed by coloured rules. It's print logic that holds up on screen.
- **Avoid:** The three-primary palette (we keep one accent) and the card-centered-over-background composition.

### 12. Stripe Press
- **Image:** `stripe-press.png` · https://press.stripe.com
- **Seen:** A very dark warm-brown ground. Top left, a small serif logotype with the italic "Ideas for progress". A stack of 3D books seen spine-on, each spine its own pattern. Down the left edge, a vertical stack of short tick marks serves as the page index, with the active tick longer and brighter.
- **Technique:** A tick-mark ruler as the page index: one tick per item, the active one extended. It's precise, quiet wayfinding that doubles as a scale.
- **Avoid:** The WebGL book stack (performance) and the dark-ground mood.

---

## Captured, looked at, and cut
- `snowpeak.com`: an outdoor-gear photo hero with a serif headline. It overlapped Tracksmith and taught less.
- `us.lacabra.com`: a "Join and get 10% off" modal blocked the first screen. The only lesson: no modal on the subscription page.
- `artisan-scope.org` (home and `/docs/curves`): neither showed a readable roast curve. Replaced by the blog capture in #9.
- `ourworldindata.org` (home): the grapher page (#8) shows the chart technique more clearly.
