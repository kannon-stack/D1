import { northTickInner } from "@/assets/tick";

/** north-tick.svg, inlined: the surveyor's north arrow before the wordmark (currentColor). */
export function NorthTick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 16"
      aria-hidden="true"
      focusable="false"
      className={className}
      dangerouslySetInnerHTML={{ __html: northTickInner }}
    />
  );
}

/** Decorative arrow glyph from Archivo (→ ↓), hidden from assistive tech. */
export function Arrow({ dir = "right" }: { dir?: "right" | "down" }) {
  return (
    <span aria-hidden="true" className="arrow">
      {dir === "right" ? "→" : "↓"}
    </span>
  );
}
