import type { ReactNode } from "react";

type SectionHeadProps = {
  id: string;
  eyebrow: string;
  /** Explicit display lines (CLS guard, type.md); otherwise one balanced string. */
  title: string | readonly string[];
  lede?: string;
  /** Grid span classes for the whole head (default: sm 1–4 · md 1–7 · lg 1–9 · xl 1–8). */
  className?: string;
  ledeClassName?: string;
  children?: ReactNode;
};

/** Ruled sheet header: 1px rule → 24 → eyebrow → 16 → h2 → 24 → lede. */
export function SectionHead({
  id,
  eyebrow,
  title,
  lede,
  className = "col-span-4 md:col-span-7 lg:col-span-9 xl:col-span-8",
  ledeClassName = "max-w-prose",
  children,
}: SectionHeadProps) {
  const lines = typeof title === "string" ? [title] : title;
  return (
    <div className={className}>
      <p className="eyebrow border-t border-line pt-6 text-muted">{eyebrow}</p>
      <h2 id={id} className="section-title mt-4">
        {lines.map((line, i) => (
          <span key={i} className={lines.length > 1 ? "block" : undefined}>
            {line}
            {i < lines.length - 1 ? " " : null}
          </span>
        ))}
      </h2>
      {lede && <p className={`mt-6 text-base text-ink-soft ${ledeClassName}`}>{lede}</p>}
      {children}
    </div>
  );
}

/** Splits a two-sentence title after its first full stop ("Plot your route. / Skip any stop."). */
export const sentenceLines = (t: string) => t.split(/(?<=\.)\s+/);

/** Breaks a title after its first `n` words (line budgets in layout-spec.md). */
export const wordLines = (t: string, n: number) => {
  const words = t.split(" ");
  return [words.slice(0, n).join(" "), words.slice(n).join(" ")];
};
