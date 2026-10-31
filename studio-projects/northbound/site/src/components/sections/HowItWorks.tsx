import { copy } from "@/content/copy";
import { SectionHead, sentenceLines } from "@/components/ui/SectionHead";
import { RouteSchedule } from "@/components/motion/RouteSchedule";

const hw = copy["how-it-works"];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="anchor py-section-sm">
      <div className="mx-auto grid max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
        <SectionHead id="how-title" eyebrow={hw.eyebrow} title={sentenceLines(hw.title)} lede={hw.lede} />

        <div className="col-span-4 mt-12 md:col-span-8 lg:col-span-4 lg:col-start-1 lg:row-start-2">
          <ol className="steps">
            {hw.steps.map((s) => (
              <li key={s.day} className="step">
                <span className="step-day">{s.day}</span>
                <div>
                  <h3 className="font-display width-wide text-xl font-normal">{s.title}</h3>
                  <p className="mt-1 text-base text-ink-soft md:mt-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 border-t border-b border-t-ink border-b-line py-4">
            <p className="eyebrow text-ink">{hw.promise_label}</p>
            <p className="mt-2 text-lg">{hw.promise}</p>
          </div>
        </div>

        <section
          aria-labelledby="route-region-label"
          aria-describedby="route-hint"
          className="route-panel col-span-4 mt-12 md:col-span-8 lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:self-start"
        >
          <noscript>
            <p className="text-base text-ink-soft">{hw.route.noscript}</p>
          </noscript>
          <RouteSchedule copy={hw.route} cta={copy.hero.cta} />
        </section>
      </div>
    </section>
  );
}
