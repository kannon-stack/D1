# Brief: Agkbuilds (company website)

- **Project folder:** `studio-projects/agkbuilds/`
- **Date:** 2026-10-31
- **Request (verbatim):** "I want a static webpage for my company, Agkbuilds. Just start asking questions, and if i think they are unnecessary, i will let you know. But my company is a tech company, let me know what other data you need."

> **Real client.** Unlike the Northbound sample run, Agkbuilds is a real company. Nothing about it may be invented: no client names, projects, results, numbers, awards, testimonials or team members unless the user supplies them. Wording stays general.

## Problem
Agkbuilds builds custom software for clients and needs a one-page website that tells businesses what it does and makes it easy to start a conversation. No existing site, logo or brand was mentioned.

## Audience
Businesses that might hire Agkbuilds. Assumed (see decisions #2): owners and managers deciding whether to hire a custom-software builder, who aren't necessarily technical but will judge quality by how the page itself looks and reads. They have seen many look-alike software-company sites and distrust vague claims.

## Primary action
**Contact Agkbuilds / book a call.** The contact method (an email address or a booking link) is **pending from the user**; the Builder can't wire the button until it is supplied. No secondary action.

## Personality
- Adjectives: **bold**, **futuristic**, **dependable** (the third is the Director's assumption, decisions #3)
- Never: **a generic corporate template**

## References
- Loves: none given yet (optional; the user may add sites they like).
- Hates: the generic software-company template: stock photos, handshake and circuit-board icons, and the same layout every software company uses.

## Must-have content
- What Agkbuilds is: a company that builds custom software for clients (stated plainly in the hero).
- **What we build:** the kinds of software Agkbuilds makes. The list is **pending from the user** and must not be guessed.
- A short, generic "how we work" (no claims, numbers or promises that weren't supplied).
- The contact action.
- Facts policy: **general wording only**. No client names, results, numbers, team bios or testimonials.

## Constraints
- Existing brand assets: none. Free to define a wordmark, colors and fonts.
- Schemes: light + dark; dark is the home look (decisions #4).
- Other: a **static** page with no server code (it must export as plain files and be hostable anywhere). Hosting and domain aren't decided. Language: English (assumed).

## Draft section list
1. Hero
2. What we build
3. How we work
4. Contact
5. Footer

## Success criteria
- [ ] The concept (Agkbuilds builds custom software for clients) is clear within 5 seconds of landing on the hero.
- [ ] A visitor reaches the contact action in ≤ 1 click from the hero, and it opens a working email or booking link.
- [ ] No sentence on the page names a client, project, result, number, award or team member that the user did not supply.
- [ ] The production build exports as a static folder of files (`output: "export"`), with no server code.
- [ ] The page doesn't read as a generic corporate template: Originality ≥ 8 in the Critic's rubric and none of the banned patterns in `taste-guardrails` appear.
- [ ] Critic gate passes: rubric average ≥ 8, no criterion < 7, 0 serious or critical axe issues, Lighthouse mobile Performance ≥ 90 and Accessibility = 100.
