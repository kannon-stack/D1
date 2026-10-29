"use client";

import { motion, useReducedMotion } from "motion/react";
import { lineUp } from "@/lib/motion";

type SplitLinesProps = {
  /** One string per visual line; the layout spec's line budget decides the breaks. */
  lines: readonly string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Seconds between lines. */
  step?: number;
  /** Animate on mount (hero) instead of when scrolled into view. */
  onMount?: boolean;
};

// Accessible masked line reveal: screen readers get the whole sentence from
// aria-label; the animated spans are hidden from them.
export function SplitLines({ lines, as = "h2", className, step = 0.08, onMount = false }: SplitLinesProps) {
  const reduce = useReducedMotion();
  const Heading = as;
  const label = lines.join(" ");
  return (
    <Heading className={className} aria-label={label}>
      {lines.map((line, i) => (
        <span key={i} aria-hidden="true" className="block overflow-hidden pb-[0.08em]">
          {reduce ? (
            <span className="block">{line}</span>
          ) : (
            <motion.span
              className="block will-change-transform"
              variants={lineUp}
              initial="hidden"
              {...(onMount ? { animate: "visible" } : { whileInView: "visible", viewport: { once: true, amount: 0.6 } })}
              custom={i * step}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </Heading>
  );
}
