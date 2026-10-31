# Brief: Northbound Coffee Roasters (subscription landing page)

- **Project folder:** `studio-projects/northbound/`
- **Date:** 2026-10-29
- **Request (verbatim):** "landing page for Northbound, a small-batch specialty coffee roaster"

> **Demo brand.** Northbound is fictional, used for the studio's sample run. Invented specifics (origins, roast data, prices, dates) are allowed if they're plausible, and are logged as demo content in `decisions.md`.

## Problem
Northbound roasts in small batches and wants home brewers to subscribe, not just buy a bag once. The page has to make its obsessive, data-driven roasting feel warm and tangible, and turn that curiosity into a subscription.

## Audience
Home-brewing enthusiasts, roughly 25–45. They own a burr grinder, a scale and a pour-over or espresso setup, and they read tasting notes. They distrust vague "artisan" claims, and they respond to specifics: origin, process, roast date, brew ratios. Many have tried a subscription before and cancelled because the coffee was stale or the schedule rigid.

## Primary action
**Start a subscription.** Secondary: browse the current roasts.

## Personality
- Adjectives: **precise**, **warm**, **outdoorsy**
- Never: **hipster** (no ironic mustaches, Edison bulbs, chalkboards or "craft" clichés)

## References
- Loves: field instruments and topographic maps; the clarity of scientific charts; outdoor gear brands that are technical yet human; well-set editorial print.
- Hates: generic "coffee shop" aesthetics (kraft paper, latte art photos, chalk fonts) and dark, moody stock photography of beans.

## Must-have content
- What makes Northbound different: each bag ships with its actual **roast curve** and roast date.
- The current roasts: 3 coffees with origin, process and tasting notes.
- How the subscription works: cadence, flexibility (pause or skip anytime), freshness promise.
- Pricing for the subscription.
- Proof: a short line on sourcing relationships or a customer quote (demo).
- A final call to action.

## Constraints
- Existing brand assets: none. Free to define the logo wordmark, colors and fonts.
- Schemes: light + dark.
- Other: a static page. The subscription CTA can point to `#subscribe` (no checkout backend).

## Draft section list
1. Hero
2. The roast curve (what's different)
3. Current roasts
4. How the subscription works
5. Pricing / subscribe
6. Proof
7. Footer

## Success criteria
Checked against `qa/round-3.md` (round 3, PASS).

- [x] The concept is clear within 5 seconds of landing on the hero. *Concept clarity 9; the fold shows "Every roast is a climb" over the section line with its spot heights (`fold-1280-light.png`, `fold-375-light.png`).*
- [x] A visitor can reach the primary action in ≤ 2 clicks from the hero. *One click on "Start a subscription" lands the plan picker exactly under the nav; the second click submits (`click-1280-smooth-top-subscribe.png`). 144 of 144 anchor cases land at 64 px.*
- [x] The roast curve shows up as real, legible data, not decoration. *Signature moment 9; the stage has labelled axes, a live readout and waypoints from the batch data.*
- [x] The 3 current roasts are comparable at a glance (origin, process, notes, roast level). *Field rows align across the three cards (R1-06 closed, `tiles/1280-light/tile-04.png`).*
- [x] Critic gate passes: rubric average ≥ 8, no criterion < 7, 0 serious or critical axe issues, Lighthouse mobile Performance ≥ 90 and Accessibility = 100. *Average 8.4, lowest 8; axe 0; Lighthouse Performance 93 and 94 (two medians of 3); Accessibility 100.*

Open at sign-off: R3-01 (minor, waived in decisions #17).
