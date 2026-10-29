---
name: visual-qa
description: Critic method for the web studio. Build and serve a studio site, capture screenshots and audits, look at every image, score the 10-criterion beauty rubric with evidence, check the pass gate, and file owner-tagged defects in studio/qa/round-N.md. Use for every studio critique round.
user-invocable: false
---

# Visual QA (one critique round)

**Inputs:** `P/site/`, `P/studio/brief.md`, `P/studio/design/*`, `P/studio/content/*`, and the previous `P/studio/qa/round-<N-1>.md` if there is one.
**Outputs:** `P/studio/qa/round-N/` (screenshots and audit evidence) and `P/studio/qa/round-N.md` (start from `.claude/skills/visual-qa/templates/round-report.md`).

You are the honest eye. Score like a demanding Awwwards juror. **You never edit site code or specs.** You report, and the owners fix. An 8 means genuinely good; don't inflate.

## 1. Build and serve
```bash
cd P/site && npm run build
```
If the build fails, write a report with one **blocker** defect (owner `builder`) quoting the error, mark it FAIL, and stop.

From the repo root:
```bash
node .claude/studio-tools/scripts/serve.mjs start --dir P/site
```
This waits until the site answers on port 3100. Don't use `pkill -f "next start…"`: the pattern matches your own shell and kills it.

## 2. Capture
```bash
node .claude/studio-tools/scripts/screenshot.mjs --url http://localhost:3100 --out P/studio/qa/round-N/shots
node .claude/studio-tools/scripts/audit.mjs --url http://localhost:3100 --out P/studio/qa/round-N/audit
```
Read `shots/manifest.json` (overflow, console errors) and `audit/summary.md`.

## 3. Look at everything
Use the Read tool on the images. **Never score from code.** At minimum, read:
- all 8 `fold-*.png` shots (4 widths × light and dark)
- every tile in `tiles/375-light/` and `tiles/1280-light/`, plus `tiles/1280-dark/`
- all `frames/frame-*.png`, to judge motion and the signature moment across the scroll
- `reduced-1280-light-full.png`: is all content visible and still designed?
- the `hover/` and `audit/focus/` crops

While you look, compare against:
- `direction.md`: is the concept legible? Is the signature moment there?
- `layout-spec.md`: spans, composition, the 375px recomposition
- `motion.md`: do the frames show the choreography?
- `copy.md`: is the text exactly what it should be, with no stray strings, and do the lines wrap within their budgets?
- the dark scheme: designed, or just inverted?

## 4. Code checks
Run these from the repo root and note the hits:
```bash
grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(" P/site/src --include=*.tsx --include=*.ts | grep -v opengraph-image
grep -rnE "(w|h|p[xytrbl]?|m[xytrbl]?|gap|text|top|left|right|bottom)-\[[^]]+\]" P/site/src --include=*.tsx
grep -ln '"use client"' P/site/src/app/page.tsx P/site/src/app/layout.tsx 2>/dev/null
grep -rn "MotionConfig" P/site/src
grep -rln "motion/react" P/site/src | xargs grep -L "useReducedMotion\|MotionConfig"
```
Hard-coded colors and arbitrary values are only defects where a token exists for the job. Also check `package.json` for dependencies beyond next, react, react-dom and motion (plus anything the spec justified).

## 5. Score the rubric
Score each criterion 1–10, citing the screenshot that justifies it (path). Anchors:

| # | Criterion | 5 | 7 | 9 |
|---|---|---|---|---|
| 1 | Concept clarity | a generic look; the concept only shows in the copy | the concept is visible but inconsistent across sections | you can state the concept 5 seconds into the hero, and every section expresses it |
| 2 | Hierarchy | competing focal points | a clear order with some noise | the eye lands headline → proof → action, every time |
| 3 | Typography | default-feeling pairing, flat scale | good pairing; some widows or awkward measure | characterful pairing, dramatic scale, perfect measure and rag |
| 4 | Color | arbitrary or muddy; dark mode inverted | restrained palette; dark mode decent | one accent doing all the work; both schemes designed |
| 5 | Spacing and rhythm | cramped or uniform | consistent scale | spacing from the scale, with rhythm that varies on purpose |
| 6 | Motion quality | missing, janky or everywhere | smooth but generic fades | purposeful, choreographed, eased, expressive of the concept; reduced motion designed |
| 7 | Signature moment | none | present but unremarkable | screenshot-and-share worthy, and tied to the concept |
| 8 | Originality | template patterns; fails the "any company" test | distinctive in places | could only be this brand; no banned patterns |
| 9 | Responsiveness | 375px is just stacked or broken | works everywhere | each breakpoint is composed; targets ≥ 44px |
| 10 | Craft details | missing states | most states present | hover, focus and pressed states, selection, favicon, OG image, empty and error states all done |

If a banned pattern from `taste-guardrails` appears, Originality is 6 at most. If the page fails the "any company" test, Concept and Originality are 6 at most.

## 6. Gate
PASS only if **all** of these hold:
- the rubric average is ≥ 8.0, with no criterion below 7
- axe serious + critical = 0
- Lighthouse mobile Performance ≥ 90 and Accessibility = 100
- no horizontal overflow at any width
- no console or page errors
- no open blocker defects

Lighthouse reports the median of 3 runs. Single runs are noisy, so don't fail the gate on one run. If Lighthouse errored, rerun the audit once. If it still fails, the gate is FAIL with a blocker for `builder` (or for the Director, if it's an environment problem).

## 7. Defects
Each defect gets an **ID** (`R<N>-<nn>`), a **severity**, an **owner**, the **evidence** (image path or audit file), **expected vs. actual**, and a **suggested fix**.
- **Severity:**
  - *blocker*: fails the gate, breaks the layout, makes content invisible or unreadable, or a build/runtime error
  - *major*: drags a rubric criterion below 7, or a visible defect at a breakpoint or in a scheme
  - *minor*: polish
- **Owner:** whoever owns the file that must change.
  - `designer`: composition, tokens, contrast values, type choices, motion spec, assets
  - `copywriter`: wording, length or wrapping caused by the copy, alt-text quality, metadata text
  - `builder`: the implementation doesn't match the spec, performance, a11y markup, bugs, states, responsive implementation
- Prefer a few precise defects over many vague ones. Every major or blocker must be fixable from its description alone.

## 8. Regression check (rounds 2+)
Compare against the previous round:
- score changes per criterion
- which defect IDs are now closed
- anything new that got worse

Any closed defect that reappears is a blocker.

## 9. Finish
Write `round-N.md`, then stop the server with `node .claude/studio-tools/scripts/serve.mjs stop`. Reply with the verdict (PASS or FAIL), the average score, the gate inputs, and the defect counts per owner.
