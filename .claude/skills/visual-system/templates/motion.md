# Motion

**Personality:** <one sentence, e.g. "unhurried and weighty: things arrive like a pour, settle, and stay">

## Tokens
| Token | Value | Use |
|---|---|---|
| instant | 120ms | hover color, press |
| fast | 200ms | small UI transitions |
| base | 400ms | entrances |
| slow | 700ms | large reveals |
| cinematic | 1200ms | signature moment only |

**Easing:** entrances use `--ease-out-expo`; exits use `ease-in` at 0.8× duration; scroll-linked motion is linear (scroll is the easing).

**Springs (Motion):**
- `snappy`: `{ type: "spring", visualDuration: 0.35, bounce: 0.15 }`
- `soft`: `{ type: "spring", visualDuration: 0.7, bounce: 0 }`

## Choreography
| ID | Section | Element | Trigger | Property: from → to | Timing | Reduced motion |
|---|---|---|---|---|---|---|
| M1 | `hero` | headline lines | load | y 32 → 0, opacity 0 → 1 | base, expo-out, stagger 80ms | final state, no movement |
| M2 | `hero` | <signature> | scroll-linked [0, 0.6] | <…> | linear | <still frame of the end state> |
| M3 | `…` | | in-view amount 0.3 | | | |

## Rules
- Animate transform, opacity and clip-path; use filter only sparingly. Never animate width, height, top or left.
- Only one heavy effect per viewport. Ambient loops pause when offscreen.
- Hover: 120–200ms. Focus rings appear instantly (no transition on the outline).
