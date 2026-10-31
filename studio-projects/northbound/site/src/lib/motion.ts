// Motion tokens and presets from studio/design/motion.md ("pen-plotter pace").
import type { Transition } from "motion/react";

export const ease = {
  /** Lines being drawn: an even, symmetric pen. */
  plot: [0.45, 0, 0.55, 1],
  /** Pins, markers, entrances: settles with no overshoot. */
  pin: [0.22, 0.7, 0.2, 1],
  outExpo: [0.16, 1, 0.3, 1],
} as const;

/** Seconds. */
export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.45,
  plot: 1.1,
  survey: 1.4,
} as const;

export const spring = {
  /** Waypoints re-pinning and the skip-state layout. bounce is always 0. */
  settle: { type: "spring", visualDuration: 0.45, bounce: 0 },
} satisfies Record<string, Transition>;

/** Smoothing for the plumb readout only. */
export const readoutSpring = { stiffness: 400, damping: 60 } as const;

/** Exits run ease-in at 0.8× the entrance duration. */
export const exit = (d: number): Transition => ({ duration: d * 0.8, ease: "easeIn" });

export const pinIn: Transition = { duration: duration.base, ease: ease.pin };
