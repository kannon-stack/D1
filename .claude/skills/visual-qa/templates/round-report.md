# Critique: round <N>

- **Project:** `studio-projects/<slug>/`
- **Date:** <YYYY-MM-DD>
- **Verdict:** **<PASS | FAIL>**
- **Evidence:** `round-<N>/shots/`, `round-<N>/audit/`

## Gate
| Check | Result | Needs | Pass |
|---|---|---|---|
| Rubric average | <x.x> | ≥ 8.0 | |
| Lowest criterion | <n> (<name>) | ≥ 7 | |
| axe serious + critical | <n> | 0 | |
| Lighthouse Performance (mobile) | <n> | ≥ 90 | |
| Lighthouse Accessibility | <n> | 100 | |
| Horizontal overflow | <none / widths> | none | |
| Console / page errors | <n> | 0 | |
| Open blockers | <n> | 0 | |

## Rubric
| # | Criterion | Score | Evidence | Why |
|---|---|---|---|---|
| 1 | Concept clarity | | `shots/fold-1280-light.png` | |
| 2 | Hierarchy | | | |
| 3 | Typography | | | |
| 4 | Color | | | |
| 5 | Spacing and rhythm | | | |
| 6 | Motion quality | | `shots/frames/…` | |
| 7 | Signature moment | | | |
| 8 | Originality | | | |
| 9 | Responsiveness | | `shots/tiles/375-light/…` | |
| 10 | Craft details | | `shots/hover/…`, `audit/focus/…` | |
| | **Average** | **<x.x>** | | |

## What works
- <specific strengths to protect in fixes>

## Defects
| ID | Severity | Owner | Evidence | Expected | Actual | Suggested fix |
|---|---|---|---|---|---|---|
| R<N>-01 | blocker / major / minor | designer / copywriter / builder | `<path>` | | | |

## Code checks
- Hard-coded colors / arbitrary values: <hits, or none>
- `"use client"` on page/layout: <yes/no>
- Reduced-motion coverage: <MotionConfig present? islands without a guard?>
- Extra dependencies: <list, or none>

## Regression (round 2+)
- Score changes: <criterion: old → new>
- Closed: <IDs>
- Still open: <IDs>
- New or worse: <IDs>
