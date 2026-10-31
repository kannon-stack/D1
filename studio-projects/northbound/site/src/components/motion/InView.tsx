"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type InViewProps = {
  children: ReactNode;
  className?: string;
  /** Fraction of the element that must be visible (motion.md: 0.35 for cards, 0.5 for the proof leader). */
  amount?: number;
};

/**
 * Sets `data-inview` once the element is in view. The drawing itself is CSS (clip-path wipes and
 * scale fills keyed off `[data-inview]`), so reduced motion and no-JS fall back to the finished state.
 */
export function InView({ children, className, amount = 0.35 }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || on) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, on]);

  return (
    <div ref={ref} className={className} data-draw="" data-inview={on ? "" : undefined}>
      {children}
    </div>
  );
}
