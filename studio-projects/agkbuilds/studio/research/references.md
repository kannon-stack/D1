# References: Agkbuilds

Captured 2026-10-31 with Firecrawl (`screenshot.mjs` failed here because the proxy blocked it). All captures are 1920×1080, first screen only. The PNGs are working files and are git-ignored, so each entry below carries the URL, what the capture actually shows, the technique to borrow and what to avoid.

Category = studios and companies that design or build software (Oxide, Basement, Metalab, Work & Co, Planetary, Linear, Locomotive). Outside the category = industrial products, type foundries, design publishing, poster art, and the history of the Jacquard loom.

---

### 1. Oxide Computer
- **Image:** `oxide.png` · https://oxide.computer
- **What's on screen:** a near-black page with a hairline 1px rule under the nav. A product render sits on the right with a mono label, "FIG. 1 OXIDE CLOUD COMPUTER", in a small bordered box. A thin elbowed leader line links an empty terminal panel to the product. The headline is a quiet light grotesk anchored bottom-left. Nav and buttons are uppercase mono.
- **Technique to borrow:** **figure labelling as a trust signal.** Mono "FIG." callouts and leader lines with hard right-angle elbows make the page read like engineering documentation, which signals precision without any claims. Anchoring the headline bottom-left leaves the top of the fold to the visual.
- **Avoid:** the client-logo strip (we have no clients we can name), photographic hardware renders, and the green-on-black terminal palette, which reads as "hacker".

### 2. Teenage Engineering
- **Image:** `teenage-engineering.png` · https://teenage.engineering
- **What's on screen:** a black page. Each nav item has its own large thin-line pictogram (a pinwheel, a box, a frame, a magnifier). The lowercase labels are set at about 36px, with the sub-links stacked under them. The product is lit like a museum object, and a small block of Japanese text sits beside a big outline logo.
- **Technique to borrow:** **single-weight line drawings at the same stroke width as the type**, so drawings and letters feel like one system. Navigation is treated as an index with sub-items, not a row of tiny links.
- **Avoid:** product photography and the quirky consumer tone. Agkbuilds needs "dependable", not "toy".

### 3. Basement Studio
- **Image:** `basement.png` · https://basement.studio
- **What's on screen:** a full-screen real-time 3D room (a Halloween-dressed studio with a staircase, an arcade cabinet and CRTs), purple fog, and a "HUMAN / MACHINE" pill toggle at the bottom centre.
- **Technique to borrow:** the **two-state toggle** idea: one small control that changes how the page is read. Use it as a pattern only, e.g. a scheme toggle that feels like part of the concept.
- **Avoid:** heavy WebGL scenes (they break our Lighthouse ≥ 90 target), purple haze, neon signage. This is exactly the cyberpunk register the brief rules out.

### 4. Metalab
- **Image:** `metalab.png` · https://www.metalab.com
- **What's on screen:** a white page with three words, "We / Make / Interfaces", in a large light serif. Each word sits at a different column start and they step down and right across the fold. Tiny sans meta text ("EST. 2006", "9:35 EDT", "0 -> 1", "BC, CA") is pinned at the corners.
- **Technique to borrow:** **a headline broken across the grid as a staircase**, one word per line with each line starting on a different column. Short meta labels pinned to the edges of the fold give scale contrast.
- **Avoid:** the hairline serif on white. It is elegant but it isn't bold, and it would look washed out in dark mode. We also can't use facts like "EST." or a location until the user supplies them.

### 5. Locomotive
- **Image:** `locomotive.png` · https://locomotive.ca/en
- **What's on screen:** captured mid-intro. On a pure black screen, white text is "decoding": "Digital / Digital-First / Digital-First DesiC}" with scrambled glyphs, and the logo resolves letter by letter.
- **Technique to borrow:** **text that resolves in stages.** A word is built up over several frames, which shows "construction" in time. Worth adapting as *outline → solid* or *row by row* rather than random glyph scramble.
- **Avoid:** glyph-scramble "hacker decode". It is a familiar trope, it hurts readability for the first second, and screen readers stumble on it unless it is handled carefully.

### 6. Standards Manual
- **Image:** `standards-manual.png` · https://standardsmanual.com
- **What's on screen:** a black nav bar with oversized lowercase bold grotesk links ("titles", "shop", "visit", …) spread evenly across the full width. Under it, a hairline-ruled info row sits above a full-bleed photo of book covers. An orange "add to cart +" block sits flush right.
- **Technique to borrow:** **navigation set at display size and justified across the full width.** One saturated accent colour, used only for the action block. A hairline rule separates meta from content.
- **Avoid:** the multicolour Chermayeff & Geismar artwork (one accent only for us) and the mock-up photography.

### 7. Nothing
- **Image:** `nothing.png` · https://nothing.tech
- **What's on screen:** a store-locator modal covered the page during capture, so the homepage itself isn't visible. What is visible: a dot-matrix display face for "STORE LOCATOR", a dot-matrix pin icon, mono uppercase labels, and a solid black rectangular button on a light grey panel.
- **Technique to borrow:** **a bitmap (dot-grid) treatment as brand texture.** Icons and logo are built from the same unit grid as the type. This is relevant to a woven or punched-card bitmap idea.
- **Avoid:** the modal itself, and copying Nothing's dot-matrix font look outright. Limitation: we could only judge the modal UI, not the homepage layout.

### 8. Jacquard machine (Wikipedia / Science Museum portrait)
- **Image:** `jacquard-wikipedia.png` · https://en.wikipedia.org/wiki/Jacquard_machine
- **What's on screen:** the encyclopedia article and the woven silk portrait of J. M. Jacquard. The caption states it took 24,000 punched cards to weave, that it "was only produced to order", and that Babbage owned one, which inspired his use of punched cards in the Analytical Engine.
- **Technique to borrow (non-web source):** **the real story of software's origin.** Patterns were stored as rows of holes in cards, one card per row of the weave, and the cloth built up row by row. That gives a concrete material (warp, weft, punched card) and a process (row-by-row) that a page can perform. "Produced to order" is a direct parallel to custom software.
- **Avoid:** sepia nostalgia and museum pastiche. If used, the loom has to be rendered as crisp, contemporary geometry, not engravings.

### 9. Work & Co
- **Image:** `workco.png` · https://work.co
- **What's on screen:** a white page with a full-width red 8px rule along the top edge and a red square logo top-left. The headline, "We solve complex problems through design & technology", is a very large tight grotesk starting at column 5. A serif quote below it is followed by a red underlined "Learn more" link.
- **Technique to borrow:** **an offset text column.** The logo hangs in columns 1–4 and the content starts at column 5, which creates tension without centring. A thin brand-colour bar on the top edge works as a cheap, strong signature.
- **Avoid:** the press quote naming famous clients (forbidden for us) and the generic "complex problems / design & technology" phrasing. That is exactly the "any company" headline.

### 10. Linear
- **Image:** `linear.png` · https://linear.app
- **What's on screen:** a near-black page with a centred-left grotesk headline at about 64px and a grey subline. A large product UI screenshot sits below in a rounded frame with a faint top glow.
- **Technique to borrow:** very little. It is the baseline "dark software-company" look we must *not* resemble, kept here as an anti-reference: headline → subline → UI screenshot, grey on near-black, rounded panels.
- **Avoid:** all of it as a layout recipe. If a direction drifts towards this, it has failed the "any company" test.

### 11. Planetary
- **Image:** `planetary.png` · https://www.planetary.co
- **What's on screen:** a dark slate page with a large rounded geometric sans headline, "We are a digital impact agency made for evolving businesses". Red brush-stroke underlines mark "impact" and "evolving". A circular "Watch Reel" badge with rotating text sits bottom-right, and an outlined "Work With Us" button sits top-right.
- **Technique to borrow:** **marking up the headline**: a hand-drawn mark on one or two key words directs the eye. We'd translate it into a precise mark (a dimension line, a woven thread) instead of a brush.
- **Avoid:** the rotating circular text badge (overused), vague claims ("impact agency"), and the slate-grey-with-red default agency palette.

### 12. Grilli Type: GT Mechanik minisite
- **Image:** `grilli-type.png` · https://www.grillitype.com
- **What's on screen:** a light panel where giant pale-green letters "MCNK" sit under a hairline olive construction drawing: circles, crosshairs, a grid of guides, segmented progress bars (50%), a 0–100% ruler, and mono labels ("LOOKING FOR SIGNAL", "PLEASE STAND BY") placed inside the geometry. A pink outline traces the rounded frame.
- **Technique to borrow:** **construction geometry drawn over display letters.** Hairline circles, guides and rulers share one stroke weight and frame the type like a technical plate. Mono labels live *inside* the drawing, not around it. Segmented bars show progress without numbers that make claims.
- **Avoid:** the pastel olive/mint/pink palette and the TV test-card motif. Borrow the layering method, not the look.

### 13. Swissted
- **Image:** `swissted.png` · https://www.swissted.com
- **What's on screen:** a giant lowercase bold grotesk wordmark "swissted" fills the whole container width. Heavy black rules run above and below a bold nav, followed by a 5-up grid of flat-colour Swiss-style posters with small meta text in the top corners and bold names along the bottom.
- **Technique to borrow:** **a wordmark set edge to edge, fitted to the container width**, so the logo *is* the hero. Flat colour fields with tiny meta text in the corners, a poster grammar where the meta stays small and the type stays huge.
- **Avoid:** multicolour poster palettes and the dated e-commerce chrome. One accent colour only.

---

## What this research says for Agkbuilds
- The category default (Linear, Planetary, Work & Co) is a grotesk headline, a grey subline, a product screenshot or a client quote. We have no screenshots and no clients, so we *can't* fall back on it. The page has to win with a concept, type and one crafted visual.
- The strongest non-cliché sources of "futuristic + dependable" were **engineering documentation** (Oxide's FIG. labels, Grilli's construction geometry), **structural mass** (Swissted's fitted wordmark, Standards Manual's display-size nav) and **software's real origin in weaving** (Jacquard). Each one became a direction.
- Heavy WebGL (Basement) and glyph-scramble decoding (Locomotive) are the techniques to avoid on performance and readability grounds.
