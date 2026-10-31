import { Fragment } from "react";

/** Renders copy with `*word*` markers: the marked word becomes an <em> (true Archivo italic). */
export function Emph({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i}>{part.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Strips `*` markers (for aria-labels and plain strings). */
export const plain = (text: string) => text.replace(/\*/g, "");

/** Fills `{token}` placeholders in a copy template. */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}
