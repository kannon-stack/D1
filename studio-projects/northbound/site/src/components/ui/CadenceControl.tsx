"use client";

import { useRef, type KeyboardEvent } from "react";
import { setCadence, useCadence } from "@/lib/cadence-store";

type Option = { value: number; label: string };

/** Segmented radiogroup (roving tabindex). Its state is shared by the route schedule and the form. */
export function CadenceControl({
  options,
  labelledBy,
  disabled = false,
  onChange,
}: {
  options: readonly Option[];
  labelledBy: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
}) {
  const cadence = useCadence();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (i: number, focus = false) => {
    const v = options[i].value;
    setCadence(v);
    onChange?.(v);
    if (focus) refs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = options.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      choose(next, true);
    }
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-disabled={disabled || undefined} className="segmented">
      {options.map((o, i) => {
        const checked = o.value === cadence;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            className="segment num"
            onClick={() => choose(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
