"use client";

import { useEffect } from "react";

/**
 * The page's one effects island (motion.md "Engine"), rendering nothing:
 * (a) adds .is-inview once to every [data-inview="<amount>"] element (build B1–B3, contact C1–C2);
 * (b) at lg+ only, sets data-step on #process from an IntersectionObserver over its four steps
 *     (rootMargin −35 % top and bottom) and marks the active step aria-current="step".
 * CSS does the rest; under reduced motion the CSS ignores both and shows finished states.
 */
export function PageEffects() {
  useEffect(() => {
    // (a) in-view, once
    const inview = Array.from(document.querySelectorAll<HTMLElement>("[data-inview]"));
    const observers = inview.map((el) => {
      const amount = Number(el.dataset.inview) || 0.2;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-inview");
              io.disconnect();
            }
          }
        },
        // tall blocks can never be 40 % visible on a short screen: fall back to any overlap
        { threshold: el.offsetHeight * amount > window.innerHeight ? 0 : amount },
      );
      io.observe(el);
      return io;
    });

    // (b) the process plate
    const section = document.getElementById("process");
    const steps = section ? Array.from(section.querySelectorAll<HTMLElement>("li.step")) : [];
    const mq = window.matchMedia("(width >= 64rem)");
    let stepIo: IntersectionObserver | null = null;

    const setStep = (n: number) => {
      if (!section) return;
      section.dataset.step = String(n);
      steps.forEach((li, k) => {
        if (k === n - 1) li.setAttribute("aria-current", "step");
        else li.removeAttribute("aria-current");
      });
    };
    const start = () => {
      if (!section || steps.length === 0) return;
      section.dataset.active = "";
      setStep(1);
      stepIo = new IntersectionObserver(
        (entries) => {
          let last = 0;
          for (const e of entries) if (e.isIntersecting) last = steps.indexOf(e.target as HTMLElement) + 1;
          if (last) setStep(last);
        },
        { rootMargin: "-35% 0px -35% 0px", threshold: 0 },
      );
      steps.forEach((li) => stepIo!.observe(li));
    };
    const stop = () => {
      stepIo?.disconnect();
      stepIo = null;
      if (!section) return;
      delete section.dataset.active;
      section.dataset.step = String(steps.length);
      steps.forEach((li) => li.removeAttribute("aria-current"));
    };
    const onChange = () => (mq.matches ? start() : stop());
    if (mq.matches) start();
    mq.addEventListener("change", onChange);

    return () => {
      observers.forEach((io) => io.disconnect());
      stepIo?.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return null;
}
