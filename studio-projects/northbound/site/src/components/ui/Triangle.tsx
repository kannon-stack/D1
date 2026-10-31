/**
 * Map markers ▲ (summit, selected, list bullet) and ▼ (roast-level). Archivo has no geometric
 * shapes, so the glyphs fell back to platform fonts (R2-03); this is one SVG, sized in em, filled
 * with currentColor, identical everywhere. Always decorative.
 */
export function Triangle({ dir = "up", className = "" }: { dir?: "up" | "down"; className?: string }) {
  return (
    <svg viewBox="0 0 10 9" aria-hidden="true" focusable="false" className={`tri ${className}`}>
      <path d={dir === "up" ? "M5 0L10 9H0z" : "M0 0H10L5 9z"} fill="currentColor" />
    </svg>
  );
}
