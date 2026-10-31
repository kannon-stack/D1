import { copy } from "@/content/copy";

/**
 * "AGK" over the dimension bracket ├─ BUILDS ─┤ (CSS borders, not box-drawing characters).
 * The wordmark is the brand name and is fixed, not a copy slot (layout-spec Nav); the link's
 * accessible name is microcopy.wordmark_label.
 */
export function Wordmark({ variant, href }: { variant: "nav" | "footer"; href: string }) {
  return (
    <a
      href={href}
      aria-label={copy.microcopy.wordmark_label}
      className={`wordmark wordmark-${variant} ${variant === "footer" ? "" : "py-1"}`}
    >
      <span className={`wordmark-agk ${variant === "footer" ? "text-3xl md:text-5xl" : ""}`} aria-hidden="true">
        AGK
      </span>
      <span className="bracket" aria-hidden="true">
        <span className="bracket-tick" />
        <span className="bracket-line" />
        <span className="bracket-word">builds</span>
        <span className="bracket-line" />
        <span className="bracket-tick" />
      </span>
    </a>
  );
}
