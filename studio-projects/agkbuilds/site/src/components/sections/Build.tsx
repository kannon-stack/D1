import type { CSSProperties } from "react";
import { copy } from "@/content/copy";
import { pad2 } from "@/lib/data";
import { BalloonCircle } from "@/components/drawings/Drawings";
import { SheetHeader } from "@/components/ui/SheetHeader";

const i = (n: number, after?: string) => ({ "--i": n, ...(after ? { "--after": after } : {}) }) as CSSProperties;

/**
 * Sheet 02, the parts list (bill of materials). Rows are not interactive. Finished at any count:
 * the balloons, the count and the closing double rule are computed from items.length.
 */
export function Build() {
  const b = copy.build;
  const n = b.items.length;
  return (
    <section id="build" aria-labelledby="build-title" className="site-layer pt-section-sm pb-section-xs">
      <div className="wrap">
        <div className="sheet">
          <SheetHeader id="build" title={b.sheet_title} />

          <div className="mt-6 grid grid-cols-4 gap-x-gutter md:grid-cols-8 lg:grid-cols-12">
            <h2 id="build-title" className="col-span-4 text-2xl md:col-span-4 md:text-4xl lg:col-span-7">
              <span className="block">{b.title}</span>
            </h2>
            <p className="col-span-4 mt-5 max-w-[30rem] self-end text-lg text-ink-soft md:col-start-5 md:mt-0 lg:col-span-5 lg:col-start-8 xl:col-span-4">
              {b.intro}
            </p>
          </div>

          <div data-inview="0.4">
            <div aria-hidden="true" className="mt-section-xs hidden md:block">
              <div className="annotate grid grid-cols-8 gap-x-gutter pb-3 text-muted lg:grid-cols-12">
                <span>{b.col_no}</span>
                <span>{b.col_part}</span>
                <span className="col-start-5 lg:col-start-8">{b.col_description}</span>
              </div>
              <div className="head-rule draw-x" style={i(0)} />
            </div>

            <ol className="parts mt-section-xs list-none md:mt-0" role="list">
              {b.items.map((item, k) => (
                <li key={item.name} className="part" style={i(k + 1)}>
                  <span className="balloon" aria-hidden="true">
                    <BalloonCircle />
                    <span className="fade-on relative font-mono text-sm font-medium tabular-nums" style={i(k + 1, "520ms")}>
                      {k + 1}
                    </span>
                  </span>
                  <h3 className="col-start-2 text-xl md:col-span-3 md:text-2xl lg:col-span-6">{item.name}</h3>
                  <p className="col-start-2 mt-2 max-w-[30rem] text-base text-ink-soft md:col-span-4 md:col-start-5 md:mt-0 md:pt-[0.2em] lg:col-span-5 lg:col-start-8">
                    {item.line}
                  </p>
                </li>
              ))}
            </ol>

            <div className="double-rule draw-x" style={i(n + 1)} aria-hidden="true" />
            <p className="fade-on annotate mt-3 flex justify-between text-muted" style={i(n + 1, "400ms")}>
              <span>
                {pad2(n)} {b.count_label}
              </span>
              <span>{b.list_end}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
