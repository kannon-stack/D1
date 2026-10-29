// Motion tokens and presets: replace the values with those in P/studio/design/motion.md.
import type { Transition, Variants } from "motion/react";

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
} as const;

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.4,
  slow: 0.7,
  cinematic: 1.2,
} as const;

export const spring = {
  snappy: { type: "spring", visualDuration: 0.35, bounce: 0.15 },
  soft: { type: "spring", visualDuration: 0.7, bounce: 0 },
} satisfies Record<string, Transition>;

// Entrance: pass a delay (seconds) through the `custom` prop.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.outExpo, delay },
  }),
};

// Masked line reveal: the child starts below its overflow-hidden parent.
export const lineUp: Variants = {
  hidden: { y: "110%" },
  visible: (delay: number = 0) => ({
    y: "0%",
    transition: { duration: duration.slow, ease: ease.outExpo, delay },
  }),
};

export const stagger = (step = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren } },
});
