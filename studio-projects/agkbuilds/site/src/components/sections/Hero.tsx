import { Fragment, type CSSProperties } from "react";
import { copy } from "@/content/copy";
import { headlineLines, sheetLabel } from "@/lib/data";
import { HeroConstruction } from "@/components/drawings/Drawings";
import { CtaLink } from "@/components/ui/CtaLink";

/**
 * Sheet 01, general arrangement. The headline is real, solid, selectable text from the first
 * paint; the cover, outline and pen-edge layers above it are aria-hidden and exist only under
 * prefers-reduced-motion: no-preference (motion H4–H5b, CSS only, no JS).
 */
export function Hero() {
  const h = copy.hero;
  return (
    <section id="top" aria-labelledby="hero-title" className="hero site-layer pt-6 pb-section-sm md:pt-8">
      <div className="wrap">
        <div className="sheet">
          <p className="annotate text-muted">{sheetLabel("top", h.sheet_title)}</p>

          <div className="hl-block mt-4 md:mt-6">
            <div className="hc" aria-hidden="true">
              <HeroConstruction className="hc-svg" />
              <span className="hc-label annotate hidden lg:block">{h.drawing_label}</span>
            </div>

            <div className="hl-fit">
              <h1 id="hero-title" className="hl">
                {headlineLines.map((line, i) => (
                  <Fragment key={i}>
                    {/* a plain space keeps the accessible name one sentence */}
                    {i > 0 && " "}
                    <span className="hl-line" style={{ "--i": i } as CSSProperties}>
                      <span className="hl-text">{line}</span>
                      <span className="hl-cover" aria-hidden="true" />
                      <span className="hl-draw" aria-hidden="true">
                        {line}
                      </span>
                      <span className="hl-edge" aria-hidden="true" />
                    </span>
                  </Fragment>
                ))}
              </h1>
              <div className="dim annotate" aria-hidden="true">
                <span className="dim-tick" />
                <span className="dim-line" />
                <span className="dim-label">{h.fig_label}</span>
                <span className="dim-line" />
                <span className="dim-tick" />
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-4 items-end gap-x-gutter md:mt-8 md:grid-cols-8 lg:mt-10 lg:grid-cols-12">
            <p className="col-span-4 max-w-[34rem] text-lg text-ink-soft md:col-span-5">{h.subhead}</p>
            {/* md: 3 columns are narrower than the 280 px minimum, so the group grows leftwards */}
            <div className="col-span-4 mt-6 md:col-span-3 md:col-start-6 md:mt-0 md:w-[max(100%,280px)] md:justify-self-end lg:col-span-4 lg:col-start-7 lg:justify-self-start xl:col-span-3">

              <CtaLink label={h.cta} describedBy="cta-hint" className="w-full" />
              <p id="cta-hint" className="annotate mt-2.5 text-muted">
                {h.cta_hint}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
