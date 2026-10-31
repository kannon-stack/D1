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
**Contact Agkbuilds / book a call.** Supplied by the user: email **agkbuilds@gmail.com** and phone **254-231-1149** (US number, dial link `tel:+12542311149`). The primary button "Start a conversation" opens an email to the address; the phone number is shown beside it as a second, equal way to reach Agkbuilds. There is no booking link. Contact person: **Dylan Borgen** (name only; no job title was given, so none is used).

## Personality
- Adjectives: **bold**, **futuristic**, **dependable** (the third is the Director's assumption, decisions #3)
- Never: **a generic corporate template**

## References
- Loves: none given yet (optional; the user may add sites they like).
- Hates: the generic software-company template: stock photos, handshake and circuit-board icons, and the same layout every software company uses.

## Must-have content
- What Agkbuilds is: a company that builds custom software for clients (stated plainly in the hero).
- **What we build** (supplied by the user, in their words: "a data recovery tool, a card game, a Discord bot"). Three items: **data recovery tools**, **card games**, **Discord bots**. Each gets a one-line description that says only what that kind of software is. No features, supported formats, success rates, player counts, users or "for clients" claims about these specific products, because the user gave none.
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
- [x] The concept (Agkbuilds builds custom software for clients) is clear within 5 seconds of landing on the hero.
- [x] A visitor reaches the contact action in ≤ 1 click from the hero, and it opens an email to agkbuilds@gmail.com; the phone number 254-231-1149 is visible and is a working `tel:` link on phones.
- [x] No sentence on the page names a client, project, result, number, award or team member that the user did not supply. The only supplied specifics are: the three kinds of software, the email, the phone number and the name Dylan Borgen.
- [x] The production build exports as a static folder of files (`output: "export"`), with no server code.
- [x] The page doesn't read as a generic corporate template: Originality ≥ 8 in the Critic's rubric and none of the banned patterns in `taste-guardrails` appear.
- [x] Critic gate passes: rubric average ≥ 8, no criterion < 7, 0 serious or critical axe issues, Lighthouse mobile Performance ≥ 90 and Accessibility = 100.

Checked against `qa/round-2.md` (round 2, PASS): concept clarity 9 and the facts rule clean in round 1 (every text node is copy from `copy.md` or computed data); both mailto links open an email to agkbuilds@gmail.com with a subject and the phone is a working `tel:` link; `npm run build` writes a plain-files `out/` folder with no server code; Originality 8 with none of the banned patterns; gate: average 8.6 (lowest 8), axe 0, Lighthouse Performance 99 and Accessibility 100 on the Critic's own median of 3.

Open at sign-off: R2-01 (minor, waived in decisions #24).
