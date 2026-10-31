import { Fragment, type CSSProperties } from "react";
import { copy } from "@/content/copy";
import { contactLines, sheetOf, telHref } from "@/lib/data";
import { CopyButton } from "@/components/client/CopyButton";
import { CtaLink } from "@/components/ui/CtaLink";
import { SheetHeader } from "@/components/ui/SheetHeader";

const i = (n: number) => ({ "--i": n }) as CSSProperties;
const Rule = ({ dir, n, className = "" }: { dir: "top" | "left"; n: number; className?: string }) => (
  <span aria-hidden="true" className={`tb-rule-${dir} ${className}`} style={i(n)} />
);

/**
 * Sheet 04, the title block: the CTA, email and phone as two equal cells (each with a copy
 * button once JS runs), then contact / drawn by / sheet.
 */
export function Contact() {
  const c = copy.contact;
  const valueRow = "mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 md:flex-col md:items-start md:gap-y-3";
  return (
    <section id="contact" aria-labelledby="contact-title" className="site-layer pt-section-lg pb-section-sm">
      <div className="wrap">
        <div className="sheet">
          <SheetHeader id="contact" title={c.sheet_title} />

          <div className="mt-section-xs grid grid-cols-4 items-end gap-x-gutter md:grid-cols-8 lg:grid-cols-12">
            <div className="col-span-4 md:col-span-8 lg:col-span-6">
              <h2 id="contact-title" className="text-3xl md:text-5xl">
                {contactLines.map((line, k) => (
                  <Fragment key={k}>
                    {k > 0 && " "}
                    <span className="block">{line}</span>
                  </Fragment>
                ))}
              </h2>
              <p className="mt-6 max-w-narrow text-lg text-ink-soft">{c.body}</p>
            </div>

            <div
              data-inview="0.4"
              className="title-block col-span-4 mt-10 self-end md:col-span-8 md:mt-12 lg:col-span-6 lg:col-start-7 lg:mt-0"
            >
              <div className="tb-cell col-span-6 p-3">
                <CtaLink label={c.cta} draw className="w-full" />
              </div>

              <div className="tb-cell col-span-6 p-4 md:col-span-3 lg:p-5">
                <Rule dir="top" n={1} />
                <p className="annotate text-muted">{c.email_label}</p>
                <div className={valueRow}>
                  <span id="email-value" className="tb-value text-base text-ink">
                    {c.email}
                  </span>
                  <CopyButton kind="email" valueId="email-value" regionId="copy-status" />
                </div>
              </div>

              <div className="tb-cell col-span-6 p-4 md:col-span-3 lg:p-5">
                <Rule dir="top" n={2} />
                <Rule dir="left" n={2} className="hidden md:block" />
                <p className="annotate text-muted">{c.phone_label}</p>
                <div className={valueRow}>
                  <a id="phone-value" href={telHref} className="tb-value phone-link text-base">
                    {c.phone}
                  </a>
                  <CopyButton kind="phone" valueId="phone-value" regionId="copy-status" />
                </div>
              </div>

              {[
                [c.person_label, c.person, ""],
                [c.drawn_by_label, c.drawn_by, ""],
                [copy.microcopy.sheet, sheetOf("contact"), "font-mono font-medium tabular-nums"],
              ].map(([label, value, extra], k) => (
                <div key={label} className="tb-cell col-span-2 px-3 py-3 md:px-4">
                  <Rule dir="top" n={3 + k} />
                  {k > 0 && <Rule dir="left" n={3 + k} />}
                  <p className="annotate text-muted">{label}</p>
                  <p className={`mt-1 text-base font-semibold text-ink ${extra}`}>{value}</p>
                </div>
              ))}

              <span className="tb-frame" aria-hidden="true" />
            </div>
          </div>
          <div id="copy-status" aria-live="polite" className="sr-only" />
        </div>
      </div>
    </section>
  );
}
