import { copy } from "@/content/copy";
import { pad2 } from "@/lib/data";
import { ProcessPlate } from "@/components/drawings/Drawings";
import { SheetHeader } from "@/components/ui/SheetHeader";

/**
 * Sheet 03, the method: one plate, four passes. The server HTML carries data-step="4" (the
 * finished plate, shown without JS and under reduced motion); the StepObserver island moves it
 * to the active step at lg+ and marks that step aria-current="step".
 */
export function Process() {
  const p = copy.process;
  const total = pad2(p.steps.length);
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      data-step={p.steps.length}
      className="process site-layer pt-section-xs pb-section-md"
    >
      <div className="wrap">
        <div className="sheet">
          <SheetHeader id="process" title={p.sheet_title} />

          <div className="mt-6 grid grid-cols-4 gap-x-gutter md:grid-cols-8 lg:grid-cols-12">
            <div className="col-span-4 md:col-span-8 lg:col-span-5">
              <h2 id="process-title" className="text-2xl md:text-4xl">
                <span className="block">{p.title}</span>
              </h2>
              <p className="mt-5 max-w-[30rem] text-lg text-ink-soft">{p.intro}</p>

              <ol className="steps mt-section-xs flex list-none flex-col gap-[calc(var(--spacing-section-xs)/2)] lg:gap-0" role="list">
                {p.steps.map((step, k) => (
                  <li
                    key={step.title}
                    className="step grid grid-cols-[112px_minmax(0,1fr)] gap-x-4 border-t border-line pt-6 md:grid-cols-[160px_minmax(0,1fr)] md:gap-x-6 lg:block lg:pt-2"
                  >
                    {/* sm/md: the plate frozen at this step (decorative; colours embedded). A plain
                        <img> by spec: a static export has no image optimiser and these are SVG. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/drawings/process-step-${k + 1}.svg`}
                      alt=""
                      width={640}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      className="block h-auto w-full self-start border border-line lg:hidden"
                    />
                    <div>
                      <p className="annotate flex items-center gap-2.5 text-muted">
                        <span className="step-box" aria-hidden="true">
                          {pad2(k + 1)}
                        </span>
                        <span>{p.step_label}</span>
                      </p>
                      <h3 className="step-title mt-3 text-xl">{step.title}</h3>
                      <p className="mt-3 max-w-[30rem] text-base text-ink-soft">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <figure className="plate hidden lg:col-span-6 lg:col-start-7 lg:block">
              <ProcessPlate className="plate-svg" />
              <figcaption className="mt-4 flex items-center justify-between gap-4">
                <span className="annotate text-muted">{p.figure_caption}</span>
                <span className="annotate flex items-center gap-3 text-muted" aria-hidden="true">
                  <span className="flex gap-1">
                    {p.steps.map((s) => (
                      <span key={s.title} className="seg" />
                    ))}
                  </span>
                  {p.steps.map((s, k) => (
                    <span key={s.title} className={`plate-n plate-n-${k + 1}`}>
                      {pad2(k + 1)} / {total}
                    </span>
                  ))}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
