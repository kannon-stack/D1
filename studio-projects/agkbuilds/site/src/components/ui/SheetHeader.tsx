import { sheetLabel, type sheets } from "@/lib/data";

/** A 1 px rule across the content width, 16 px, then "SHEET 0n / 04 · {title}" (layout-spec Global). */
export function SheetHeader({ id, title }: { id: (typeof sheets)[number]; title: string }) {
  return (
    <div>
      <div className="sheet-rule" aria-hidden="true" />
      <p className="annotate mt-4 text-muted">{sheetLabel(id, title)}</p>
    </div>
  );
}
