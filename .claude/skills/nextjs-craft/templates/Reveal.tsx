"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";

type Tag = "div" | "section" | "li" | "p" | "span" | "figure" | "article";

type RevealProps = {
  children: ReactNode;
  as?: Tag;
  variants?: Variants;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
  /** Delay in seconds, passed to the variant through `custom`. */
  delay?: number;
  className?: string;
};

export function Reveal({ children, as = "div", variants = fadeUp, amount = 0.3, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
      custom={delay}
    >
      {children}
    </MotionTag>
  );
}
