import { copy } from "@/content/copy";

// Data, not copy (layout-spec): sheet numbers, counts, numerals, the © year and the contact hrefs.
export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Sections in sheet order; the sheet number is the 1-based position. */
export const sheets = ["top", "build", "process", "contact"] as const;
export const sheetTotal = pad2(sheets.length);
export const sheetNo = (id: (typeof sheets)[number]) => pad2(sheets.indexOf(id) + 1);

/** "SHEET 0n / 04 · {title}" (uppercased by the annotate utility). */
export const sheetLabel = (id: (typeof sheets)[number], title: string) =>
  `${copy.microcopy.sheet} ${sheetNo(id)} / ${sheetTotal} · ${title}`;

/** Same as `sheetLabel` without the title: "04 / 04". */
export const sheetOf = (id: (typeof sheets)[number]) => `${sheetNo(id)} / ${sheetTotal}`;

// Facts (decisions #10): the email comes from copy; the dial string is fixed by the layout spec.
export const mailtoHref = `mailto:${copy.contact.email}?subject=${encodeURIComponent(copy.contact.mail_subject)}`;
export const emailHref = `mailto:${copy.contact.email}`;
export const telHref = "tel:+12542311149";

export const year = process.env.BUILD_YEAR ?? "";

export const headlineLines = copy.hero.headline.split("\n");
export const contactLines = copy.contact.headline.split("\n");
